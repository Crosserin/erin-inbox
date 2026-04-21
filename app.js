// Directive Stream · LAPD Record Intake · client
const CONTEXTS = ['home', 'homelab', 'kids', 'consulting', 'self'];

const state = { directives: [], closed: [], filter: 'all', selectedLabels: [] };

const dom = {
  list: document.getElementById('list'),
  closedList: document.getElementById('closedList'),
  statusLine: document.getElementById('statusLine'),
  qaTitle: document.getElementById('qaTitle'),
  qaSubmit: document.getElementById('qaSubmit'),
  qaLabels: document.getElementById('qaLabels'),
  filterBar: document.getElementById('filterBar'),
  count: document.getElementById('count'),
};

init();

async function init() {
  buildLabelPicker();
  buildFilterBar();
  await refresh();
}

async function refresh() {
  setStatus('scanning...');
  try {
    const openResp = await fetch('/api/directives?state=open');
    if (!openResp.ok) throw new Error(`open ${openResp.status}: ${await openResp.text()}`);
    state.directives = (await openResp.json()).directives || [];

    const closedResp = await fetch('/api/directives?state=closed');
    if (closedResp.ok) state.closed = ((await closedResp.json()).directives || []).slice(0, 8);

    render();
    setStatus(`${state.directives.length} active · last scan ${new Date().toLocaleTimeString()}`);
  } catch (e) {
    setStatus(`uplink failure: ${e.message}`);
    dom.list.innerHTML = `<div class="err">Can't reach the stream.<br>Runtime PAT may not be configured.<br><code>${escapeHtml(e.message)}</code></div>`;
  }
}

function render() {
  const items = state.filter === 'all'
    ? state.directives
    : state.directives.filter(d => d.labels.some(l => l.name === state.filter));

  dom.count.textContent = items.length;

  if (items.length === 0) {
    dom.list.innerHTML = '<div class="empty">inbox zero. go touch grass.</div>';
  } else {
    dom.list.innerHTML = items.map(d => directiveHtml(d, false)).join('');
    attachDoneHandlers();
  }

  if (state.closed.length) {
    dom.closedList.innerHTML = state.closed.map(d => directiveHtml(d, true)).join('');
  }
}

function directiveHtml(d, closed) {
  const labels = d.labels.map(l => `<span class="lbl lbl-${escapeAttr(l.name)}">${escapeHtml(l.name)}</span>`).join('');
  const timeAgo = ago(closed ? d.closed_at : d.created_at);
  const doneBtn = closed ? '' : `<button class="done-btn" data-num="${d.number}" title="mark done">✓</button>`;
  return `
    <div class="directive ${closed ? 'closed' : ''}" data-num="${d.number}">
      ${doneBtn}
      <div class="d-main">
        <div class="d-title">${escapeHtml(d.title)}</div>
        <div class="d-meta">
          <span class="labels">${labels}</span>
          <span class="time">${timeAgo}</span>
        </div>
      </div>
    </div>`;
}

function attachDoneHandlers() {
  document.querySelectorAll('.done-btn').forEach(btn => {
    btn.onclick = async (e) => {
      const num = e.currentTarget.dataset.num;
      const el = document.querySelector(`.directive[data-num="${num}"]`);
      el.classList.add('closing');
      try {
        const r = await fetch(`/api/directive/${num}/done`, { method: 'POST' });
        if (!r.ok) throw new Error(`${r.status}`);
        setTimeout(() => refresh(), 250);
      } catch (err) {
        el.classList.remove('closing');
        setStatus(`close failed: ${err.message}`);
      }
    };
  });
}

function buildLabelPicker() {
  dom.qaLabels.innerHTML = CONTEXTS.map(c =>
    `<label class="lbl-choice"><input type="checkbox" value="${c}"> <span>${c}</span></label>`
  ).join('');
}

function buildFilterBar() {
  const tabs = ['all', ...CONTEXTS];
  dom.filterBar.innerHTML = tabs.map(t =>
    `<button class="tab ${t === state.filter ? 'active' : ''}" data-filter="${t}">${t}</button>`
  ).join('');
  dom.filterBar.querySelectorAll('.tab').forEach(b => {
    b.onclick = (e) => {
      state.filter = e.currentTarget.dataset.filter;
      dom.filterBar.querySelectorAll('.tab').forEach(x => x.classList.toggle('active', x.dataset.filter === state.filter));
      render();
    };
  });
}

dom.qaSubmit.onclick = async () => {
  const title = dom.qaTitle.value.trim();
  if (!title) { dom.qaTitle.focus(); return; }
  const labels = [...dom.qaLabels.querySelectorAll('input:checked')].map(i => i.value);

  dom.qaSubmit.disabled = true;
  dom.qaSubmit.textContent = 'transmitting...';
  try {
    const r = await fetch('/api/directive', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, labels }),
    });
    if (!r.ok) throw new Error(`${r.status}: ${await r.text()}`);
    dom.qaTitle.value = '';
    dom.qaLabels.querySelectorAll('input:checked').forEach(i => i.checked = false);
    await refresh();
  } catch (e) {
    setStatus(`create failed: ${e.message}`);
  } finally {
    dom.qaSubmit.disabled = false;
    dom.qaSubmit.textContent = 'TRANSMIT';
  }
};

dom.qaTitle.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) dom.qaSubmit.click();
});

function ago(iso) {
  const d = new Date(iso); const s = (Date.now() - d.getTime()) / 1000;
  if (s < 60) return `${Math.floor(s)}s ago`;
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}
function setStatus(t) { dom.statusLine.textContent = t; }
function escapeHtml(s) { return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
function escapeAttr(s) { return String(s).replace(/[^a-zA-Z0-9-]/g, ''); }