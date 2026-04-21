interface Env { GITHUB_PAT: string }

export const onRequestPost: PagesFunction<Env> = async (context) => {
  if (!context.env.GITHUB_PAT) return json({ error: 'GITHUB_PAT secret not configured' }, 503);

  const num = parseInt(String(context.params.number), 10);
  if (!num || num < 1) return json({ error: 'bad number' }, 400);

  const r = await fetch(`https://api.github.com/repos/Crosserin/erin-inbox-data/issues/${num}`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${context.env.GITHUB_PAT}`,
      'User-Agent': 'erin-inbox',
      Accept: 'application/vnd.github+json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ state: 'closed', state_reason: 'completed' }),
  });
  if (!r.ok) return json({ error: `github ${r.status}`, detail: await r.text() }, 502);

  const issue: any = await r.json();
  return json({ number: issue.number, state: issue.state, closed_at: issue.closed_at });
};

function json(body: any, status = 200) {
  return new Response(JSON.stringify(body, null, 2), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8' },
  });
}