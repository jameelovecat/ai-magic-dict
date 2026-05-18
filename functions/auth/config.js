export async function onRequestGet({ env }) {
  return Response.json(
    { clientId: env.GITHUB_CLIENT_ID || '' },
    { headers: { 'Cache-Control': 'no-store' } }
  );
}
