interface Env { GITHUB_PAT: string }

export const onRequestGet: PagesFunction<Env> = async (context) => {
  if (!context.env.GITHUB_PAT) return json({ error: 'GITHUB_PAT secret not configured' }, 503);

  const url = new URL(context.request.url);
  const state = url.searchParams.get('state') || 'open';
  const label = url.searchParams.get('label');

  let ghUrl = `https://api.github.com/repos/Crosserin/erin-inbox-data/issues?state=${state}&per_page=50&sort=updated&direction=desc`;
  if (label) ghUrl += `&labels=${encodeURIComponent(label)}`;

  const r = await fetch(ghUrl, {
    headers: {
      Authorization: `Bearer ${context.env.GITHUB_PAT}`,
      'User-Agent': 'erin-inbox',
      Accept: 'application/vnd.github+json',
    },
  });
  if (!r.ok) return json({ error: `github ${r.status}`, detail: await r.text() }, 502);

  const issues: any[] = await r.json();
  const directives = issues
    .filter(i => !i.pull_request)
    .map(i => ({
      number: i.number,
      title: i.title,
      body: i.body,
      labels: i.labels.map((l: any) => ({ name: l.name, color: l.color })),
      created_at: i.created_at,
      updated_at: i.updated_at,
      closed_at: i.closed_at,
      state: i.state,
    }));

  return json({ directives, count: directives.length });
};

function json(body: any, status = 200) {
  return new Response(JSON.stringify(body, null, 2), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
  });
}