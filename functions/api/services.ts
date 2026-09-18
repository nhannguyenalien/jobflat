import { neon } from "@neondatabase/serverless";

interface Env {
  DATABASE_URL: string;
}
interface PagesContext {
  request: Request;
  env: Env;
}

export async function onRequestGet({
  request,
  env,
}: PagesContext): Promise<Response> {
  if (!env.DATABASE_URL)
    return Response.json(
      { error: "DATABASE_URL is not configured" },
      { status: 503 },
    );
  const url = new URL(request.url);
  const query = url.searchParams.get("q")?.trim();
  const mode = url.searchParams.get("mode")?.trim();
  const slug = url.searchParams.get("slug")?.trim();
  const sql = neon(env.DATABASE_URL);

  if (slug) {
    const rows =
      await sql`SELECT * FROM service_offerings WHERE slug = ${slug} AND is_active = TRUE LIMIT 1`;
    return rows.length
      ? Response.json({ data: rows[0] })
      : Response.json({ error: "Service not found" }, { status: 404 });
  }

  const rows =
    query && mode
      ? await sql`SELECT * FROM service_offerings WHERE is_active = TRUE AND delivery_mode::text = ${mode} AND (title ILIKE ${`%${query}%`} OR description ILIKE ${`%${query}%`} OR category ILIKE ${`%${query}%`}) ORDER BY rating DESC, order_count DESC LIMIT 30`
      : query
        ? await sql`SELECT * FROM service_offerings WHERE is_active = TRUE AND (title ILIKE ${`%${query}%`} OR description ILIKE ${`%${query}%`} OR category ILIKE ${`%${query}%`}) ORDER BY rating DESC, order_count DESC LIMIT 30`
        : mode
          ? await sql`SELECT * FROM service_offerings WHERE is_active = TRUE AND delivery_mode::text = ${mode} ORDER BY rating DESC, order_count DESC LIMIT 30`
          : await sql`SELECT * FROM service_offerings WHERE is_active = TRUE ORDER BY rating DESC, order_count DESC LIMIT 30`;
  return Response.json({ data: rows });
}
