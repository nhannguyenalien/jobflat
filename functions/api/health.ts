export function onRequestGet(): Response {
  return Response.json({ ok: true, service: "jobflat-api", timestamp: new Date().toISOString() });
}
