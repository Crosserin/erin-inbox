interface Env { GITHUB_PAT: string }

export const onRequestPost: PagesFunction<Env> = async (context) => {
  if (!context.env.GITHUB_PAT) return json({ error: 'GITHUB_PAT secret not configured' }, 503);

  const body: any = await context.request.json().catch(() => ({}));
  const title = (body.title || '').toString().trim();
  if (!title) return json({ error: 'title required' }, 400);
  if (title.length > 256) return json({ error: 'title too long' }, 400);

  const ghBody: any = { title };
  if (Array.isArray(body.labels) && body.labels.length) {
    ghBody.labels = body.labels.filter((l: any) => typeof l === 'string').slice(0, 6);
  }
  if (body.note && typeof body.note === 'string') {
    ghBody.body = body.note.slice(0, 4000);
  }

  const r = await fetch('https://api.github.com/repos/Crosserin/erin-inbox-data/issues', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${context.env.GITHUB_PAT}`,
      'User-Agent': 'erin-inbox',
      Accept: 'application/vnd.github+json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(ghBody),
  });
  if (!r.ok) return json({ error: `github ${r.status}`, detail: await r.text() }, 502);

  const issue: any = await r.json();
  return json({
    number: issue.number,
    title: issue.title,
    labels: issue.labels.map((l: any) => l.name),
    created_at: issue.created_at,
  }, 201);
};

function json(body: any, status = 200) {
  return new Response(JSON.stringify(body, null, 2), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8' },
  });
}