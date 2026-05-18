export async function onRequestGet(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state') || '';

  if (!code) {
    return Response.redirect(`${url.origin}/#auth_error=missing_code`, 302);
  }
  if (!env.GITHUB_CLIENT_ID || !env.GITHUB_CLIENT_SECRET) {
    return Response.redirect(`${url.origin}/#auth_error=server_not_configured`, 302);
  }

  try {
    const resp = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: env.GITHUB_CLIENT_ID,
        client_secret: env.GITHUB_CLIENT_SECRET,
        code,
      }),
    });

    const data = await resp.json();

    if (data.error || !data.access_token) {
      const msg = encodeURIComponent(data.error_description || data.error || 'unknown');
      return Response.redirect(`${url.origin}/#auth_error=${msg}`, 302);
    }

    const token = encodeURIComponent(data.access_token);
    return Response.redirect(`${url.origin}/#gh_token=${token}&gh_state=${encodeURIComponent(state)}`, 302);
  } catch (e) {
    return Response.redirect(`${url.origin}/#auth_error=${encodeURIComponent(e.message)}`, 302);
  }
}
