const CLIENT_ID = 'Ov23liy7HBaC03U3Svx1';

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === '/auth/config' && request.method === 'GET') {
      return Response.json({ clientId: CLIENT_ID }, { headers: { 'Cache-Control': 'no-store' } });
    }

    if (url.pathname === '/auth/device-code' && request.method === 'POST') {
      const resp = await fetch('https://github.com/login/device/code', {
        method: 'POST',
        headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify({ client_id: CLIENT_ID, scope: 'gist' }),
      });
      const data = await resp.json();
      return Response.json(data, { headers: { 'Cache-Control': 'no-store' } });
    }

    if (url.pathname === '/auth/device-token' && request.method === 'POST') {
      const { device_code } = await request.json();
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

    return env.ASSETS.fetch(request);
  },
};
