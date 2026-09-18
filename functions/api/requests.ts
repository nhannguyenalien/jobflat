import { neon } from "@neondatabase/serverless";
import { z } from "zod";

interface Env { DATABASE_URL: string }
interface PagesContext { request: Request; env: Env }

const RequestInput = z.object({
  targetType: z.enum(["profile", "job"]),
  targetId: z.string().uuid(),
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().email().max(200),
  message: z.string().trim().min(10).max(3000),
});

export async function onRequestPost({ request, env }: PagesContext): Promise<Response> {
  if (!env.DATABASE_URL) return Response.json({ error: "DATABASE_URL is not configured" }, { status: 503 });
  const parsed = RequestInput.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "Invalid request data", details: parsed.error.flatten() }, { status: 400 });
  const input = parsed.data;
  const sql = neon(env.DATABASE_URL);
  await sql`CREATE TABLE IF NOT EXISTS contact_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    target_type TEXT NOT NULL CHECK (target_type IN ('profile', 'job')),
    target_id UUID NOT NULL,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    message TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'new',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )`;
  await sql`CREATE INDEX IF NOT EXISTS contact_requests_target_idx ON contact_requests(target_type, target_id, created_at DESC)`;
  const [created] = await sql`INSERT INTO contact_requests (target_type, target_id, name, email, message)
    VALUES (${input.targetType}, ${input.targetId}, ${input.name}, ${input.email}, ${input.message})
    RETURNING id, status, created_at`;
  return Response.json({ data: created }, { status: 201 });
}
