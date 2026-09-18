import { neon } from "@neondatabase/serverless";
import { z } from "zod";
import { AppEnv, requireUser } from "../lib/auth";

interface Context {
  request: Request;
  env: AppEnv;
}
const Id = z.string().uuid();
const Action = z.object({ action: z.string().min(1) }).passthrough();

async function context(request: Request, env: AppEnv) {
  const user = await requireUser(request, env);
  if (!user) return null;
  return { user, sql: neon(env.DATABASE_URL) };
}

export async function onRequestGet({ request, env }: Context) {
  const auth = await context(request, env);
  if (!auth) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const { user, sql } = auth;
  const orders =
    user.role === "provider"
      ? await sql`SELECT o.*, s.slug service_slug, a.full_name client_name FROM marketplace_orders o LEFT JOIN service_offerings s ON s.id=o.service_id JOIN accounts a ON a.id=o.client_id WHERE o.provider_id=${user.id} OR (o.provider_id IS NULL AND o.status='requested') OR EXISTS (SELECT 1 FROM offers mine WHERE mine.order_id=o.id AND mine.provider_id=${user.id}) ORDER BY o.updated_at DESC`
      : await sql`SELECT o.*, s.slug service_slug, COALESCE(p.display_name,a.full_name) provider_name FROM marketplace_orders o LEFT JOIN service_offerings s ON s.id=o.service_id LEFT JOIN accounts a ON a.id=o.provider_id LEFT JOIN provider_accounts p ON p.account_id=o.provider_id WHERE o.client_id=${user.id} ORDER BY o.updated_at DESC`;
  const orderIds = orders.map((order) => order.id);
  const offers = orderIds.length
    ? await sql`SELECT f.*, a.full_name provider_name FROM offers f JOIN accounts a ON a.id=f.provider_id WHERE f.order_id = ANY(${orderIds}::uuid[]) ORDER BY f.created_at DESC`
    : [];
  const contracts = orderIds.length
    ? await sql`SELECT * FROM contracts WHERE order_id = ANY(${orderIds}::uuid[]) ORDER BY created_at DESC`
    : [];
  const contractIds = contracts.map((contract) => contract.id);
  const milestones = contractIds.length
    ? await sql`SELECT * FROM milestones WHERE contract_id = ANY(${contractIds}::uuid[]) ORDER BY position, due_at`
    : [];
  const messages = orderIds.length
    ? await sql`SELECT m.*, a.full_name sender_name FROM workspace_messages m JOIN accounts a ON a.id=m.sender_id WHERE m.order_id = ANY(${orderIds}::uuid[]) ORDER BY m.created_at`
    : [];
  const notifications =
    await sql`SELECT * FROM notifications WHERE account_id=${user.id} ORDER BY created_at DESC LIMIT 30`;
  const transactions = orderIds.length
    ? await sql`SELECT * FROM escrow_transactions WHERE order_id = ANY(${orderIds}::uuid[]) ORDER BY created_at DESC`
    : [];
  const reviews = orderIds.length
    ? await sql`SELECT * FROM reviews WHERE order_id = ANY(${orderIds}::uuid[])`
    : [];
  const provider =
    user.role === "provider"
      ? (
          await sql`SELECT * FROM provider_accounts WHERE account_id=${user.id} LIMIT 1`
        )[0]
      : null;
  const services =
    user.role === "provider"
      ? await sql`SELECT * FROM service_offerings WHERE provider_id=${user.id} ORDER BY created_at DESC`
      : [];
  return Response.json({
    data: {
      user,
      provider,
      services,
      orders,
      offers,
      contracts,
      milestones,
      messages,
      notifications,
      transactions,
      reviews,
    },
  });
}

export async function onRequestPost({ request, env }: Context) {
  const auth = await context(request, env);
  if (!auth) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const body = Action.safeParse(await request.json().catch(() => null));
  if (!body.success)
    return Response.json({ error: "Invalid action" }, { status: 400 });
  const { user, sql } = auth;
  const input = body.data;
  try {
    if (input.action === "onboard_provider") {
      if (user.role !== "provider") throw new Error("Provider only");
      const data = z
        .object({
          displayName: z.string().min(2).max(100),
          headline: z.string().min(5).max(160),
          bio: z.string().min(20).max(1200),
          skills: z.array(z.string().min(1)).max(12),
        })
        .parse(input);
      await sql`INSERT INTO provider_accounts (account_id,display_name,headline,bio,skills,onboarding_complete) VALUES (${user.id},${data.displayName},${data.headline},${data.bio},${data.skills},true) ON CONFLICT(account_id) DO UPDATE SET display_name=EXCLUDED.display_name,headline=EXCLUDED.headline,bio=EXCLUDED.bio,skills=EXCLUDED.skills,onboarding_complete=true`;
    } else if (input.action === "create_service") {
      if (user.role !== "provider") throw new Error("Provider only");
      const data = z
        .object({
          title: z.string().min(5).max(140),
          description: z.string().min(20).max(1200),
          category: z.string().min(2).max(80),
          deliveryMode: z.enum(["human", "agent", "hybrid"]),
          price: z.coerce.number().positive(),
          deliveryDays: z.coerce.number().int().positive().max(365),
        })
        .parse(input);
      const slug = `${data.title
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "")}-${crypto.randomUUID().slice(0, 6)}`;
      await sql`INSERT INTO service_offerings(slug,title,description,category,delivery_mode,provider_name,provider_id,price_amount,delivery_days) VALUES(${slug},${data.title},${data.description},${data.category},${data.deliveryMode},${user.full_name},${user.id},${data.price},${data.deliveryDays})`;
    } else if (input.action === "create_order") {
      if (user.role !== "client") throw new Error("Client only");
      const data = z
        .object({
          serviceId: Id.optional(),
          title: z.string().min(5).max(160),
          brief: z.string().min(15).max(3000),
          amount: z.coerce.number().nonnegative(),
        })
        .parse(input);
      let providerId: string | null = null;
      if (data.serviceId) {
        const service = (
          await sql`SELECT provider_id FROM service_offerings WHERE id=${data.serviceId} LIMIT 1`
        )[0];
        providerId = service?.provider_id || null;
      }
      await sql`INSERT INTO marketplace_orders(service_id,client_id,provider_id,title,brief,amount) VALUES(${data.serviceId || null},${user.id},${providerId},${data.title},${data.brief},${data.amount})`;
      if (providerId)
        await sql`INSERT INTO notifications(account_id,title,body) VALUES(${providerId},'Yêu cầu mới',${`${user.full_name} vừa tạo yêu cầu: ${data.title}`})`;
    } else if (input.action === "send_offer") {
      if (user.role !== "provider") throw new Error("Provider only");
      const data = z
        .object({
          orderId: Id,
          amount: z.coerce.number().positive(),
          deliveryDays: z.coerce.number().int().positive(),
          note: z.string().min(10).max(1500),
        })
        .parse(input);
      const order = (
        await sql`SELECT client_id,title FROM marketplace_orders WHERE id=${data.orderId} AND (provider_id IS NULL OR provider_id=${user.id}) AND status IN ('requested','offered') LIMIT 1`
      )[0];
      if (!order) throw new Error("Order not available");
      await sql`INSERT INTO offers(order_id,provider_id,amount,delivery_days,note) VALUES(${data.orderId},${user.id},${data.amount},${data.deliveryDays},${data.note})`;
      await sql`UPDATE marketplace_orders SET status='offered',updated_at=NOW() WHERE id=${data.orderId}`;
      await sql`INSERT INTO notifications(account_id,title,body) VALUES(${order.client_id},'Offer mới',${`${user.full_name} đã gửi offer cho “${order.title}”`})`;
    } else if (input.action === "accept_offer") {
      const data = z.object({ offerId: Id }).parse(input);
      const offer = (
        await sql`SELECT f.* FROM offers f JOIN marketplace_orders o ON o.id=f.order_id WHERE f.id=${data.offerId} AND o.client_id=${user.id} LIMIT 1`
      )[0];
      if (!offer) throw new Error("Offer not found");
      await sql`UPDATE offers SET status='accepted' WHERE id=${offer.id}`;
      await sql`UPDATE offers SET status='declined' WHERE order_id=${offer.order_id} AND id<>${offer.id}`;
      await sql`UPDATE marketplace_orders SET provider_id=${offer.provider_id},amount=${offer.amount},status='active',updated_at=NOW() WHERE id=${offer.order_id}`;
      const [contract] =
        await sql`INSERT INTO contracts(order_id,terms,amount,status,accepted_at) VALUES(${offer.order_id},${offer.note},${offer.amount},'active',NOW()) RETURNING id`;
      await sql`INSERT INTO milestones(contract_id,title,amount,status,position) VALUES(${contract.id},'Bàn giao dự án',${offer.amount},'pending',1)`;
      await sql`INSERT INTO notifications(account_id,title,body) VALUES(${offer.provider_id},'Offer đã được chấp nhận','Hợp đồng và milestone đầu tiên đã được tạo.')`;
    } else if (input.action === "milestone") {
      const data = z
        .object({
          milestoneId: Id,
          status: z.enum(["funded", "submitted", "approved", "released"]),
        })
        .parse(input);
      const milestone = (
        await sql`SELECT m.*,c.order_id,o.client_id,o.provider_id FROM milestones m JOIN contracts c ON c.id=m.contract_id JOIN marketplace_orders o ON o.id=c.order_id WHERE m.id=${data.milestoneId} AND (${user.id}=o.client_id OR ${user.id}=o.provider_id) LIMIT 1`
      )[0];
      if (!milestone) throw new Error("Milestone not found");
      const clientActions = ["funded", "approved", "released"],
        providerActions = ["submitted"];
      if (
        (clientActions.includes(data.status) &&
          milestone.client_id !== user.id) ||
        (providerActions.includes(data.status) &&
          milestone.provider_id !== user.id)
      )
        throw new Error("Not allowed");
      await sql`UPDATE milestones SET status=${data.status} WHERE id=${data.milestoneId}`;
      if (data.status === "funded")
        await sql`INSERT INTO escrow_transactions(order_id,milestone_id,account_id,type,amount) VALUES(${milestone.order_id},${data.milestoneId},${user.id},'fund',${milestone.amount})`;
      if (data.status === "released") {
        await sql`INSERT INTO escrow_transactions(order_id,milestone_id,account_id,type,amount) VALUES(${milestone.order_id},${data.milestoneId},${user.id},'release',${milestone.amount})`;
        await sql`UPDATE marketplace_orders SET status='completed',updated_at=NOW() WHERE id=${milestone.order_id}`;
        await sql`UPDATE contracts SET status='completed' WHERE id=${milestone.contract_id}`;
      }
      const milestoneRecipient =
        user.id === milestone.client_id
          ? milestone.provider_id
          : milestone.client_id;
      if (milestoneRecipient)
        await sql`INSERT INTO notifications(account_id,title,body) VALUES(${milestoneRecipient},'Milestone được cập nhật',${`Trạng thái mới: ${data.status}`})`;
    } else if (input.action === "message") {
      const data = z
        .object({ orderId: Id, body: z.string().min(1).max(2000) })
        .parse(input);
      const allowed =
        await sql`SELECT id,client_id,provider_id,title FROM marketplace_orders WHERE id=${data.orderId} AND (client_id=${user.id} OR provider_id=${user.id})`;
      if (!allowed.length) throw new Error("Not allowed");
      await sql`INSERT INTO workspace_messages(order_id,sender_id,body) VALUES(${data.orderId},${user.id},${data.body})`;
      const recipient =
        user.id === allowed[0].client_id
          ? allowed[0].provider_id
          : allowed[0].client_id;
      if (recipient)
        await sql`INSERT INTO notifications(account_id,title,body) VALUES(${recipient},'Tin nhắn mới',${`${user.full_name}: ${data.body.slice(0, 90)}`})`;
    } else if (input.action === "review") {
      const data = z
        .object({
          orderId: Id,
          rating: z.coerce.number().int().min(1).max(5),
          comment: z.string().min(5).max(1000),
        })
        .parse(input);
      const order = (
        await sql`SELECT * FROM marketplace_orders WHERE id=${data.orderId} AND client_id=${user.id} AND status='completed' LIMIT 1`
      )[0];
      if (!order?.provider_id) throw new Error("Order not ready");
      await sql`INSERT INTO reviews(order_id,reviewer_id,reviewee_id,rating,comment) VALUES(${data.orderId},${user.id},${order.provider_id},${data.rating},${data.comment})`;
      await sql`INSERT INTO notifications(account_id,title,body) VALUES(${order.provider_id},'Đánh giá mới',${`${user.full_name} đã đánh giá ${data.rating}/5 sao.`})`;
    } else if (input.action === "read_notifications") {
      await sql`UPDATE notifications SET is_read=true WHERE account_id=${user.id}`;
    } else throw new Error("Unsupported action");
    return Response.json({ data: { ok: true } });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Action failed" },
      { status: 400 },
    );
  }
}
