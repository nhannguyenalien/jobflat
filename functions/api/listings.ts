import { neon } from "@neondatabase/serverless";

interface Env { DATABASE_URL: string }
interface PagesContext { request: Request; env: Env }

export async function onRequestGet({ request, env }: PagesContext): Promise<Response> {
  if (!env.DATABASE_URL) return Response.json({ error: "DATABASE_URL is not configured" }, { status: 503 });
  const url = new URL(request.url);
  const kind = url.searchParams.get("type");
  const query = url.searchParams.get("q")?.trim();
  const id = url.searchParams.get("id");
  const slug = url.searchParams.get("slug");
  const sql = neon(env.DATABASE_URL);
  if (id || slug) {
    const rows = id
      ? await sql`SELECT * FROM profiles WHERE id::text = ${id} LIMIT 1`
      : await sql`SELECT * FROM profiles WHERE slug = ${slug} LIMIT 1`;
    return rows.length
      ? Response.json({ data: rows[0] })
      : Response.json({ error: "Profile not found" }, { status: 404 });
  }
  const rows = kind && query
    ? await sql`SELECT * FROM profiles WHERE kind::text = ${kind} AND (name ILIKE ${`%${query}%`} OR headline ILIKE ${`%${query}%`}) ORDER BY rating DESC LIMIT 30`
    : kind
      ? await sql`SELECT * FROM profiles WHERE kind::text = ${kind} ORDER BY rating DESC LIMIT 30`
      : query
        ? await sql`SELECT * FROM profiles WHERE name ILIKE ${`%${query}%`} OR headline ILIKE ${`%${query}%`} ORDER BY rating DESC LIMIT 30`
        : await sql`SELECT * FROM profiles ORDER BY rating DESC, completed_count DESC LIMIT 30`;
  return Response.json({ data: rows });
}
