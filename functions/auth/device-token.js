const CLIENT_ID = 'Ov23liy7HBaC03U3Svx1';

export async function onRequestPost(context) {
  const { device_code } = await context.request.json();
  const resp = await fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id: CLIENT_ID,
      device_code,
      grant_type: 'urn:ietf:params:oauth:grant-type:device_code',
    }),
  });
  const data = await resp.json();
  return Response.json(data, { headers: { 'Cache-Control': 'no-store' } });
}
