import { neon } from "@neondatabase/serverless";
import { z } from "zod";

interface Env {
  DATABASE_URL: string;
}
interface PagesContext {
  request: Request;
  env: Env;
}

const IntentInput = z.object({
  need: z.string().trim().min(15).max(2000),
  budgetAmount: z.number().nonnegative().optional(),
  budgetCurrency: z.enum(["USD", "VND"]).default("USD"),
  email: z.string().trim().email().max(200).optional(),
});

export async function onRequestPost({
  request,
  env,
}: PagesContext): Promise<Response> {
  if (!env.DATABASE_URL)
    return Response.json(
      { error: "DATABASE_URL is not configured" },
      { status: 503 },
    );
  const parsed = IntentInput.safeParse(await request.json().catch(() => null));
  if (!parsed.success)
    return Response.json(
      { error: "Invalid request data", details: parsed.error.flatten() },
      { status: 400 },
    );
  const input = parsed.data;
  const sql = neon(env.DATABASE_URL);
  const [created] =
    await sql`INSERT INTO intent_requests (need, budget_amount, budget_currency, email)
    VALUES (${input.need}, ${input.budgetAmount ?? null}, ${input.budgetCurrency}, ${input.email ?? null})
    RETURNING id, status, created_at`;

  const searchWords = input.need
    .toLowerCase()
    .split(/\s+/)
    .filter((word) => word.length >= 4)
    .slice(0, 6);
  const pattern = `%${searchWords.join("%") || input.need}%`;
  let services =
    await sql`SELECT id, slug, title AS name, description, delivery_mode AS kind, provider_name,
    price_amount, price_unit, rating, delivery_days, 'service' AS source
    FROM service_offerings WHERE is_active = TRUE AND (title ILIKE ${pattern} OR description ILIKE ${pattern} OR category ILIKE ${pattern})
    ORDER BY rating DESC, order_count DESC LIMIT 4`;
  if (!services.length)
    services =
      await sql`SELECT id, slug, title AS name, description, delivery_mode AS kind, provider_name,
    price_amount, price_unit, rating, delivery_days, 'service' AS source
    FROM service_offerings WHERE is_active = TRUE ORDER BY rating DESC, order_count DESC LIMIT 4`;
  const profiles =
    await sql`SELECT id, slug, name, description, kind, name AS provider_name, price_amount, price_unit,
    rating, NULL::integer AS delivery_days, 'profile' AS source FROM profiles ORDER BY rating DESC, completed_count DESC LIMIT 3`;

  return Response.json(
    {
      data: {
        request: created,
        solutions: [...services, ...profiles].slice(0, 6),
      },
    },
    { status: 201 },
  );
}
