import { neon } from "@neondatabase/serverless";
import { z } from "zod";

interface Env { DATABASE_URL: string }
interface PagesContext { request: Request; env: Env }
const JobInput = z.object({
  title: z.string().min(8).max(160), description: z.string().min(20).max(5000),
  category: z.string().min(2).max(80), budgetMin: z.number().nonnegative().optional(),
  budgetMax: z.number().nonnegative().optional(), budgetUnit: z.enum(["project", "hour", "month"]).default("project"),
  location: z.string().max(100).default("Remote"),
});

export async function onRequestGet({ request, env }: PagesContext): Promise<Response> {
  if (!env.DATABASE_URL) return Response.json({ error: "DATABASE_URL is not configured" }, { status: 503 });
  const sql = neon(env.DATABASE_URL);
  const id = new URL(request.url).searchParams.get("id");
  if (id) {
    const rows = await sql`SELECT * FROM jobs WHERE id::text = ${id} LIMIT 1`;
    return rows.length
      ? Response.json({ data: rows[0] })
      : Response.json({ error: "Job not found" }, { status: 404 });
  }
  const rows = await sql`SELECT * FROM jobs WHERE status = 'open' ORDER BY created_at DESC LIMIT 50`;
  return Response.json({ data: rows });
}

export async function onRequestPost({ request, env }: PagesContext): Promise<Response> {
  if (!env.DATABASE_URL) return Response.json({ error: "DATABASE_URL is not configured" }, { status: 503 });
  const parsed = JobInput.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "Invalid job data", details: parsed.error.flatten() }, { status: 400 });
  const job = parsed.data;
  const sql = neon(env.DATABASE_URL);
  const [created] = await sql`INSERT INTO jobs (title, description, category, budget_min, budget_max, budget_unit, location) VALUES (${job.title}, ${job.description}, ${job.category}, ${job.budgetMin ?? null}, ${job.budgetMax ?? null}, ${job.budgetUnit}, ${job.location}) RETURNING *`;
  return Response.json({ data: created }, { status: 201 });
}
