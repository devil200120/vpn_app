const API_BASE = 'https://shieldvpn.onrender.com/api';

let state = {
  token: null,
  user: null,
  servers: [],
  selectedServer: null,
  connected: false,
  connectedServer: null,
  isConnecting: false,
};

// DOM refs
const loginView    = document.getElementById('loginView');
const mainView     = document.getElementById('mainView');
const loginBtn     = document.getElementById('loginBtn');
const loginError   = document.getElementById('loginError');
const emailInput   = document.getElementById('emailInput');
const passwordInput= document.getElementById('passwordInput');
const tierBadge    = document.getElementById('tierBadge');
const statusCard   = document.getElementById('statusCard');
const statusIndicator = document.getElementById('statusIndicator');
const statusText   = document.getElementById('statusText');
const statusSub    = document.getElementById('statusSub');
const serverList   = document.getElementById('serverList');
const connectBtn   = document.getElementById('connectBtn');
const logoutBtn    = document.getElementById('logoutBtn');
const userEmail    = document.getElementById('userEmail');

// ── Init ──────────────────────────────────────────────────────────────
async function init() {
  const stored = await chrome.storage.local.get(['token', 'user', 'connectedServer']);
  if (stored.token) {
    state.token          = stored.token;
    state.user           = stored.user;
    state.connectedServer= stored.connectedServer || null;
    state.connected      = !!stored.connectedServer;
    showMainView();
  } else {
    showLoginView();
  }
}

function showLoginView() {
  loginView.style.display = 'block';
  mainView.style.display  = 'none';
}

async function showMainView() {
  loginView.style.display = 'none';
  mainView.style.display  = 'block';

  if (state.user) {
    const tier = state.user.subscription?.tier || 'free';
    const tierMap = {
      free:    ['rgba(124,58,237,0.15)', '#a78bfa', 'rgba(124,58,237,0.3)'],
      basic:   ['rgba(59,130,246,0.15)', '#60a5fa', 'rgba(59,130,246,0.3)'],
      premium: ['rgba(245,158,11,0.15)', '#fbbf24', 'rgba(245,158,11,0.3)'],
    };
    const [bg, color, border] = tierMap[tier] || tierMap.free;
    tierBadge.textContent        = tier.toUpperCase();
    tierBadge.style.background   = bg;
    tierBadge.style.color        = color;
    tierBadge.style.border       = `1px solid ${border}`;
    userEmail.textContent        = state.user.email;
  }

  updateStatusUI();
  await loadServers();
}

// ── Status UI ─────────────────────────────────────────────────────────
function updateStatusUI() {
  if (state.connected && state.connectedServer) {
    statusCard.classList.add('connected');
    statusIndicator.classList.add('connected');
    statusIndicator.textContent = '🛡️';
    statusText.textContent      = `Connected · ${state.connectedServer.name}`;
    statusSub.textContent       = `${state.connectedServer.flag || ''} ${state.connectedServer.country}`;
    connectBtn.textContent      = '⏹ Disconnect';
    connectBtn.classList.add('connected');
  } else {
    statusCard.classList.remove('connected');
    statusIndicator.classList.remove('connected');
    statusIndicator.textContent = '🔒';
    statusText.textContent      = 'Unprotected';
    statusSub.textContent       = 'Select a server and connect';
    connectBtn.textContent      = '🔒 Connect';
    connectBtn.classList.remove('connected');
  }
}

// ── Load servers ──────────────────────────────────────────────────────
async function loadServers() {
  try {
    const res = await apiFetch('/servers');
    if (!res) return;
    state.servers = await res.json();

    // Auto-select
    if (state.connectedServer) {
      state.selectedServer = state.servers.find(s => s._id === state.connectedServer._id);
    }
    if (!state.selectedServer) {
      state.selectedServer = state.servers.find(s => s.accessible) || state.servers[0];
    }
    renderServers();
  } catch {
    serverList.innerHTML = '<div class="loading-text">Failed to load servers</div>';
  }
}

function renderServers() {
  if (!state.servers.length) {
    serverList.innerHTML = '<div class="loading-text">No servers available</div>';
    return;
  }

  serverList.innerHTML = state.servers.map(server => {
    const selected = state.selectedServer?._id === server._id;
    const locked   = !server.accessible;
    return `
      <div class="server-item ${selected ? 'selected' : ''} ${locked ? 'locked' : ''}"
           data-id="${server._id}" data-locked="${locked}">
        <span class="server-flag">${server.flag || '🌐'}</span>
        <div class="server-info">
          <div class="server-name">${server.name}</div>
          <div class="server-detail">${server.city} · ${server.latency}ms</div>
        </div>
        ${locked
          ? '<span style="font-size:11px;opacity:.5">🔒 Upgrade</span>'
          : `<span class="server-meta">${server.load}% load</span>`}
      </div>`;
  }).join('');

  serverList.querySelectorAll('.server-item:not(.locked)').forEach(item => {
    item.addEventListener('click', () => {
      state.selectedServer = state.servers.find(s => s._id === item.dataset.id);
      renderServers();
    });
  });

  serverList.querySelectorAll('.server-item.locked').forEach(item => {
    item.addEventListener('click', () => {
      chrome.tabs.create({ url: 'https://shieldvpn.onrender.com/subscription' });
    });
  });
}

// ── Login ─────────────────────────────────────────────────────────────
loginBtn.addEventListener('click', async () => {
  const email    = emailInput.value.trim();
  const password = passwordInput.value;
  loginError.textContent = '';
  if (!email || !password) { loginError.textContent = 'Please fill in all fields'; return; }

  loginBtn.disabled     = true;
  loginBtn.textContent  = 'Signing in…';

  try {
    const res  = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Login failed');

    state.token = data.accessToken;
    state.user  = data.user;
    await chrome.storage.local.set({ token: data.accessToken, user: data.user });
    showMainView();
  } catch (e) {
    loginError.textContent = e.message;
  } finally {
    loginBtn.disabled    = false;
    loginBtn.textContent = 'Sign In';
  }
});

passwordInput.addEventListener('keydown', e => { if (e.key === 'Enter') loginBtn.click(); });

// ── Connect / Disconnect ──────────────────────────────────────────────
connectBtn.addEventListener('click', async () => {
  if (state.isConnecting) return;

  if (state.connected) {
    state.isConnecting   = true;
    connectBtn.disabled  = true;
    connectBtn.textContent = 'Disconnecting…';

    chrome.runtime.sendMessage({ action: 'disconnect' }, () => {
      state.connected       = false;
      state.connectedServer = null;
      chrome.storage.local.remove('connectedServer');
      updateStatusUI();
      state.isConnecting  = false;
      connectBtn.disabled = false;
    });
    return;
  }

  if (!state.selectedServer) return;

  state.isConnecting   = true;
  connectBtn.disabled  = true;
  connectBtn.textContent = 'Connecting…';

  try {
    const res = await apiFetch(`/vpn/proxy-credentials/${state.selectedServer._id}`);
    if (!res) { state.isConnecting = false; connectBtn.disabled = false; connectBtn.textContent = '🔒 Connect'; return; }
    if (!res.ok) { const e = await res.json(); throw new Error(e.message || 'Failed'); }

    const creds = await res.json();
    const serverWithCreds = { ...state.selectedServer, ...creds };

    chrome.runtime.sendMessage({ action: 'connect', server: serverWithCreds }, response => {
      if (response?.success) {
        state.connected       = true;
        state.connectedServer = state.selectedServer;
        chrome.storage.local.set({ connectedServer: state.selectedServer });
        updateStatusUI();
      } else {
        alert(response?.error || 'Failed to set proxy');
        connectBtn.textContent = '🔒 Connect';
      }
      state.isConnecting  = false;
      connectBtn.disabled = false;
    });
  } catch (e) {
    alert(e.message);
    state.isConnecting   = false;
    connectBtn.disabled  = false;
    connectBtn.textContent = '🔒 Connect';
  }
});

// ── Logout ────────────────────────────────────────────────────────────
logoutBtn.addEventListener('click', async () => {
  if (state.connected) chrome.runtime.sendMessage({ action: 'disconnect' });
  await chrome.storage.local.clear();
  state = { token:null, user:null, servers:[], selectedServer:null, connected:false, connectedServer:null, isConnecting:false };
  emailInput.value    = '';
  passwordInput.value = '';
  showLoginView();
});

// ── Helper ────────────────────────────────────────────────────────────
async function apiFetch(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${state.token}`,
      ...(options.headers || {}),
    },
  });
  if (res.status === 401) { await logout_silent(); return null; }
  return res;
}

async function logout_silent() {
  await chrome.storage.local.clear();
  state.token = null;
  showLoginView();
}

init();
