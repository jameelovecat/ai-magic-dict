const CLIENT_ID = 'Ov23liy7HBaC03U3Svx1';

export async function onRequestPost() {
  const resp = await fetch('https://github.com/login/device/code', {
    method: 'POST',
    headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
    body: JSON.stringify({ client_id: CLIENT_ID, scope: 'gist' }),
  });
  const data = await resp.json();
  return Response.json(data, { headers: { 'Cache-Control': 'no-store' } });
}
