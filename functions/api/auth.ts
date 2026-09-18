import { neon } from "@neondatabase/serverless";
import { z } from "zod";
import { AppEnv, createToken, hashPassword, requireUser } from "../lib/auth";

interface Context {
  request: Request;
  env: AppEnv;
}
const Input = z.object({
  action: z.enum(["signup", "login"]),
  email: z.string().email().max(200),
  password: z.string().min(8).max(100),
  fullName: z.string().min(2).max(100).optional(),
  role: z.enum(["client", "provider"]).optional(),
});

export async function onRequestGet({ request, env }: Context) {
  const user = await requireUser(request, env);
  return user
    ? Response.json({ data: user })
    : Response.json({ error: "Unauthorized" }, { status: 401 });
}

export async function onRequestPost({ request, env }: Context) {
  if (!env.DATABASE_URL)
    return Response.json(
      { error: "Database is not configured" },
      { status: 503 },
    );
  const parsed = Input.safeParse(await request.json().catch(() => null));
  if (!parsed.success)
    return Response.json(
      { error: "Thông tin đăng nhập không hợp lệ" },
      { status: 400 },
    );
  const input = parsed.data;
  const sql = neon(env.DATABASE_URL);
  if (input.action === "signup") {
    if (!input.fullName)
      return Response.json({ error: "Vui lòng nhập họ tên" }, { status: 400 });
    const existing =
      await sql`SELECT id FROM accounts WHERE lower(email) = lower(${input.email}) LIMIT 1`;
    if (existing.length)
      return Response.json({ error: "Email đã được sử dụng" }, { status: 409 });
    const password = await hashPassword(input.password);
    const [user] =
      await sql`INSERT INTO accounts (email, password_hash, password_salt, full_name, role) VALUES (lower(${input.email}), ${password.hash}, ${password.salt}, ${input.fullName}, ${input.role || "client"}) RETURNING id, email, full_name, role`;
    if (user.role === "provider")
      await sql`INSERT INTO provider_accounts (account_id, display_name, headline, bio) VALUES (${user.id}, ${user.full_name}, 'Nhà cung cấp mới', 'Hãy hoàn thiện hồ sơ để bắt đầu.')`;
    return Response.json(
      {
        data: {
          user,
          token: await createToken(
            user as { id: string; email: string; role: string },
            env,
          ),
        },
      },
      { status: 201 },
    );
  }
  const rows =
    await sql`SELECT id, email, full_name, role, password_hash, password_salt FROM accounts WHERE lower(email) = lower(${input.email}) LIMIT 1`;
  const user = rows[0];
  if (
    !user ||
    (await hashPassword(input.password, String(user.password_salt))).hash !==
      user.password_hash
  )
    return Response.json(
      { error: "Email hoặc mật khẩu không đúng" },
      { status: 401 },
    );
  const safe = {
    id: user.id,
    email: user.email,
    full_name: user.full_name,
    role: user.role,
  };
  return Response.json({
    data: {
      user: safe,
      token: await createToken(
        safe as { id: string; email: string; role: string },
        env,
      ),
    },
  });
}
