export async function onRequestGet() {
  return Response.json(
    { clientId: 'Ov23liy7HBaC03U3Svx1' },
    { headers: { 'Cache-Control': 'no-store' } }
  );
}
