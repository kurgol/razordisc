// ==========================================
//  RazorDisc — Team Builder  |  app.js
// ==========================================

const BUDGET_TOTAL = 1500;
const STORAGE_KEY  = 'razordisc_roster';

// ── Position definitions ──────────────────
const POSITIONS = [
  {
    id:   'striker',
    name: 'Striker',
    icon: '⚡',
    cost: 400,
    desc: 'Offensive powerhouse — scores from impossible angles',
  },
  {
    id:   'goalkeeper',
    name: 'Goalkeeper',
    icon: '🛡️',
    cost: 350,
    desc: 'Last line of defense — reads the disc like a machine',
  },
  {
    id:   'defender',
    name: 'Defender',
    icon: '🔒',
    cost: 300,
    desc: 'Defensive anchor — shuts down rival strikers cold',
  },
  {
    id:   'midfielder',
    name: 'Midfielder',
    icon: '🔄',
    cost: 250,
    desc: 'Versatile all-rounder — controls the tempo of play',
  },
  {
    id:   'utility',
    name: 'Utility',
    icon: '🔧',
    cost: 200,
    desc: 'Flexible support role — fills any gap in the formation',
  },
];

// ── State ─────────────────────────────────
let roster = []; // array of { id, name, icon, cost }
let nextId  = 1; // unique entry id for each roster slot

// ── DOM refs (populated after DOMContentLoaded) ─
let budgetRemainingEl, budgetBarEl;
let rosterListEl, rosterEmptyEl;
let statPlayersEl, statSpentEl, statSavedEl;

// ── Init ──────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  budgetRemainingEl = document.getElementById('budget-remaining');
  budgetBarEl       = document.getElementById('budget-bar');
  rosterListEl      = document.getElementById('roster-list');
  rosterEmptyEl     = document.getElementById('roster-empty');
  statPlayersEl     = document.getElementById('stat-players');
  statSpentEl       = document.getElementById('stat-spent');
  statSavedEl       = document.getElementById('stat-saved');

  buildPositionCards();
  loadRoster();
  renderAll();

  // Wire up header buttons
  document.getElementById('btn-export').addEventListener('click', exportRoster);
  document.getElementById('btn-import').addEventListener('click', () =>
    document.getElementById('import-file').click()
  );
  document.getElementById('import-file').addEventListener('change', importRoster);
  document.getElementById('btn-clear').addEventListener('click', clearRoster);
});

// ── Build position cards dynamically ─────
function buildPositionCards() {
  const container = document.getElementById('positions-container');

  POSITIONS.forEach(pos => {
    const card = document.createElement('div');
    card.className = 'position-card';
    card.dataset.posId = pos.id;
    card.innerHTML = `
      <div class="position-icon">${pos.icon}</div>
      <div class="position-info">
        <div class="position-name">${pos.name}</div>
        <div class="position-desc">${pos.desc}</div>
      </div>
      <div class="position-cost">
        ${pos.cost} CR
        <small>per player</small>
      </div>
      <button
        class="btn btn-primary btn-sm position-add-btn"
        data-pos-id="${pos.id}"
        title="Add ${pos.name} to roster"
      >+ Add</button>
    `;
    card.querySelector('.position-add-btn').addEventListener('click', () => addPlayer(pos));
    container.appendChild(card);
  });
}

// ── Budget helpers ────────────────────────
function calcSpent() {
  return roster.reduce((sum, p) => sum + p.cost, 0);
}

function calcRemaining() {
  return BUDGET_TOTAL - calcSpent();
}

// ── Render everything ─────────────────────
function renderAll() {
  renderBudget();
  renderRoster();
  renderPositionCards();
  renderStats();
}

function renderBudget() {
  const remaining = calcRemaining();
  const pct       = Math.max(0, (remaining / BUDGET_TOTAL) * 100);

  budgetRemainingEl.textContent = `${remaining} CR`;
  budgetBarEl.style.width       = `${pct}%`;

  budgetBarEl.classList.remove('warn', 'danger');
  if (pct <= 20) {
    budgetBarEl.classList.add('danger');
  } else if (pct <= 40) {
    budgetBarEl.classList.add('warn');
  }
}

function renderPositionCards() {
  const remaining = calcRemaining();
  POSITIONS.forEach(pos => {
    const card = document.querySelector(`.position-card[data-pos-id="${pos.id}"]`);
    const btn  = card?.querySelector('.position-add-btn');
    if (!card || !btn) return;
    const canAfford = remaining >= pos.cost;
    btn.disabled = !canAfford;
    card.classList.toggle('insufficient', !canAfford);
  });
}

function renderRoster() {
  rosterListEl.innerHTML = '';

  if (roster.length === 0) {
    rosterListEl.appendChild(rosterEmptyEl);
    rosterEmptyEl.style.display = '';
    return;
  }

  rosterEmptyEl.style.display = 'none';

  roster.forEach(entry => {
    const item = document.createElement('div');
    item.className = 'roster-item';
    item.dataset.entryId = entry.entryId;
    item.innerHTML = `
      <span class="roster-item-icon">${entry.icon}</span>
      <div class="roster-item-info">
        <div class="roster-item-name">${entry.name}</div>
        <div class="roster-item-cost">${entry.cost} CR</div>
      </div>
      <button class="roster-item-remove" title="Remove from roster">✕</button>
    `;
    item.querySelector('.roster-item-remove').addEventListener('click', () => removePlayer(entry.entryId));
    rosterListEl.appendChild(item);
  });
}

function renderStats() {
  const spent = calcSpent();
  statPlayersEl.textContent = roster.length;
  statSpentEl.textContent   = `${spent} CR`;
  statSavedEl.textContent   = `${calcRemaining()} CR`;
}

// ── Add / Remove players ──────────────────
function addPlayer(pos) {
  const remaining = calcRemaining();
  if (remaining < pos.cost) {
    toast('Not enough CR!', 'danger', '⛔');
    return;
  }
  roster.push({ entryId: nextId++, id: pos.id, name: pos.name, icon: pos.icon, cost: pos.cost });
  saveRoster();
  renderAll();
}

function removePlayer(entryId) {
  roster = roster.filter(p => p.entryId !== entryId);
  saveRoster();
  renderAll();
}

function clearRoster() {
  if (roster.length === 0) return;
  if (!confirm('Clear the entire roster?')) return;
  roster = [];
  saveRoster();
  renderAll();
  toast('Roster cleared.', 'info', '🗑️');
}

// ── Persistence (localStorage → cookie fallback) ─
function saveRoster() {
  const data = JSON.stringify({ roster, nextId });
  try {
    localStorage.setItem(STORAGE_KEY, data);
  } catch {
    // localStorage unavailable — fall back to cookie
    const expires = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toUTCString();
    document.cookie = `${STORAGE_KEY}=${encodeURIComponent(data)}; expires=${expires}; path=/; SameSite=Lax`;
  }
}

function loadRoster() {
  let raw = null;

  // Try localStorage first
  try {
    raw = localStorage.getItem(STORAGE_KEY);
  } catch { /* ignore */ }

  // Cookie fallback
  if (!raw) {
    const match = document.cookie
      .split('; ')
      .find(row => row.startsWith(`${STORAGE_KEY}=`));
    if (match) raw = decodeURIComponent(match.split('=').slice(1).join('='));
  }

  if (!raw) return;

  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed.roster)) {
      roster = parsed.roster;
      nextId = (parsed.nextId ?? 1);
    }
  } catch {
    // corrupted data — start fresh
    roster = [];
    nextId  = 1;
  }
}

// ── Export ────────────────────────────────
function exportRoster() {
  const payload = {
    version:   1,
    app:       'RazorDisc Team Builder',
    exportedAt: new Date().toISOString(),
    budget: {
      total:     BUDGET_TOTAL,
      spent:     calcSpent(),
      remaining: calcRemaining(),
    },
    roster: roster.map(({ id, name, icon, cost }) => ({ id, name, icon, cost })),
  };

  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = `razordisc-team-${Date.now()}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  toast('Roster exported!', 'success', '📥');
}

// ── Import ────────────────────────────────
function importRoster(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = e => {
    try {
      const payload = JSON.parse(e.target.result);

      if (!Array.isArray(payload.roster)) {
        throw new Error('Invalid roster format');
      }

      // Validate each entry
      const valid = payload.roster.every(
        p => typeof p.id   === 'string' &&
             typeof p.name === 'string' &&
             typeof p.cost === 'number' &&
             p.cost > 0
      );
      if (!valid) throw new Error('Roster contains invalid entries');

      // Check budget
      const totalCost = payload.roster.reduce((s, p) => s + p.cost, 0);
      if (totalCost > BUDGET_TOTAL) {
        toast(`Import failed: roster costs ${totalCost} CR (limit ${BUDGET_TOTAL} CR).`, 'danger', '⛔');
        return;
      }

      // Restore, assigning fresh entryIds
      nextId = 1;
      roster = payload.roster.map(p => {
        // Resolve icon from POSITIONS or fall back to saved icon
        const pos = POSITIONS.find(d => d.id === p.id);
        return {
          entryId: nextId++,
          id:      p.id,
          name:    p.name,
          icon:    pos ? pos.icon : (p.icon ?? '❓'),
          cost:    p.cost,
        };
      });

      saveRoster();
      renderAll();
      toast('Roster imported!', 'success', '📤');
    } catch (err) {
      toast(`Import error: ${err.message}`, 'danger', '⚠️');
    }

    // Reset file input so the same file can be re-imported
    event.target.value = '';
  };
  reader.readAsText(file);
}

// ── Toast notifications ───────────────────
function toast(message, type = 'info', icon = 'ℹ️') {
  const container = document.getElementById('toast-container');
  const el = document.createElement('div');
  el.className = `toast ${type}`;
  el.innerHTML = `<span>${icon}</span> ${message}`;
  container.appendChild(el);

  setTimeout(() => {
    el.classList.add('hide');
    el.addEventListener('animationend', () => el.remove(), { once: true });
  }, 3200);
}
