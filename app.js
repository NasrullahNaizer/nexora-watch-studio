(() => {
'use strict';
const W = 720, H = 840, KEY = 'nexora.designs.v1';
const DEFAULTS = {name:'Untitled design',style:'digital',pos:'center',size:96,weight:'700',timeColor:'#ffffff',accent:'#4de3ff',bg1:'#0a1228',bg2:'#000000',showSec:true,showDate:true,dateFmt:'long',showMetrics:true,image:null,fit:'cover',zoom:100,ox:0,oy:0};
const $ = id => document.getElementById(id);
const cv = $('cv'), ctx = cv.getContext('2d');
let s = {...DEFAULTS}, img = null, dirty = false, currentId = null;
const fields = ['style','pos','size','weight','timeColor','accent','bg1','bg2','showSec','showDate','dateFmt','showMetrics','fit','zoom','ox','oy'];

function msg(t, err) { const m = $('msg'); m.textContent = t; m.className = err ? 'err' : ''; }
function setDirty(v) { dirty = v; $('dirty').hidden = !v; $('designName').textContent = s.name; }
function syncUI() { fields.forEach(k => { const e = $(k); e.type === 'checkbox' ? e.checked = s[k] : e.value = s[k]; }); $('saveName').value = s.name === DEFAULTS.name ? '' : s.name; setDirty(dirty); }
function loadImage(src) { return new Promise((ok, no) => { if (!src) return ok(null); const i = new Image(); i.onload = () => ok(i); i.onerror = () => no(new Error('Image could not be read')); i.src = src; }); }

function dateText(d) {
  if (s.dateFmt === 'iso') return d.toISOString().slice(0, 10);
  if (s.dateFmt === 'short') return String(d.getDate()).padStart(2, '0') + '/' + String(d.getMonth() + 1).padStart(2, '0');
  return d.toLocaleDateString('en-GB', {weekday:'short', day:'numeric', month:'short'});
}

function draw(c = ctx, w = W, h = H) {
  const k = w / W, d = new Date();
  c.save(); c.scale(k, k); c.clearRect(0, 0, W, H);
  const g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, s.bg1); g.addColorStop(1, s.bg2);
  c.fillStyle = g; c.fillRect(0, 0, W, H);
  if (img) {
    const z = s.zoom / 100; let dw, dh;
    if (s.fit === 'stretch') { dw = W * z; dh = H * z; }
    else { const r = (s.fit === 'cover' ? Math.max : Math.min)(W / img.width, H / img.height) * z; dw = img.width * r; dh = img.height * r; }
    c.drawImage(img, (W - dw) / 2 + s.ox * W / 200, (H - dh) / 2 + s.oy * H / 200, dw, dh);
    const o = c.createLinearGradient(0, 0, 0, H); o.addColorStop(0, 'rgba(0,0,0,.25)'); o.addColorStop(1, 'rgba(0,0,0,.45)');
    c.fillStyle = o; c.fillRect(0, 0, W, H);
  }
  const cy = {top: 250, center: 400, bottom: 560}[s.pos];
  c.textAlign = 'center'; c.textBaseline = 'middle';
  const hh = d.getHours(), mm = d.getMinutes(), ss = d.getSeconds();
  if (s.style === 'digital') {
    const t = String(hh).padStart(2, '0') + ':' + String(mm).padStart(2, '0');
    c.fillStyle = s.timeColor; c.font = `${s.weight} ${s.size * 1.5}px system-ui,sans-serif`;
    c.fillText(t, W / 2, cy);
    if (s.showSec) { c.fillStyle = s.accent; c.font = `600 ${s.size * .5}px system-ui,sans-serif`; c.fillText(String(ss).padStart(2, '0'), W / 2, cy + s.size * 1.0); }
    if (s.showDate) { c.fillStyle = s.accent; c.font = '600 38px system-ui,sans-serif'; c.fillText(dateText(d), W / 2, cy - s.size * .95); }
  } else {
    const R = 100 + s.size * 1.6, x = W / 2, y = cy; 
    c.strokeStyle = s.accent; c.lineWidth = 6; c.beginPath(); c.arc(x, y, R, 0, 7); c.stroke();
    c.fillStyle = s.timeColor;
    for (let i = 0; i < 12; i++) { const a = i * Math.PI / 6; c.fillRect(x + Math.sin(a) * R * .88 - 3, y - Math.cos(a) * R * .88 - 3, 6, 6); }
    const hand = (a, len, wd, col) => { c.strokeStyle = col; c.lineWidth = wd; c.lineCap = 'round'; c.beginPath(); c.moveTo(x, y); c.lineTo(x + Math.sin(a) * len, y - Math.cos(a) * len); c.stroke(); };
    hand(((hh % 12) + mm / 60) * Math.PI / 6, R * .5, 10, s.timeColor);
    hand((mm + ss / 60) * Math.PI / 30, R * .75, 7, s.timeColor);
    if (s.showSec) hand(ss * Math.PI / 30, R * .85, 3, s.accent);
    if (s.showDate) { c.fillStyle = s.accent; c.font = '600 34px system-ui,sans-serif'; c.fillText(dateText(d), x, y + R + 44); }
  }
  if (s.showMetrics) {
    c.font = '600 30px system-ui,sans-serif'; c.fillStyle = s.accent;
    c.fillText('♥ 72', W * .22, H - 60); c.fillText('♟ 6,420', W / 2, H - 60); c.fillText('▮ 85%', W * .8, H - 60);
    c.fillStyle = 'rgba(255,255,255,.55)'; c.font = '20px system-ui,sans-serif'; c.fillText('simulated values', W / 2, H - 28);
  }
  c.restore();
}

function update() { draw(); }
fields.forEach(k => { const e = $(k); e.addEventListener('input', () => { s[k] = e.type === 'checkbox' ? e.checked : (e.type === 'range' ? +e.value : e.value); setDirty(true); update(); }); });

$('pick').onclick = () => $('file').click();
$('file').onchange = async e => {
  const f = e.target.files[0]; e.target.value = ''; if (!f) return;
  if (!/^image\/(png|jpeg|webp)$/.test(f.type)) return msg('Unsupported file. Choose a PNG, JPEG or WebP image.', 1);
  const r = new FileReader();
  r.onerror = () => msg('The file could not be read.', 1);
  r.onload = async () => {
    try { // downscale to keep storage and export light
      const raw = await loadImage(r.result), m = Math.min(1, 1000 / Math.max(raw.width, raw.height));
      const t = document.createElement('canvas'); t.width = raw.width * m; t.height = raw.height * m; t.getContext('2d').drawImage(raw, 0, 0, t.width, t.height);
      s.image = t.toDataURL('image/jpeg', .85); img = await loadImage(s.image); setDirty(true); update(); msg('Photo added.');
    } catch (err) { msg(err.message, 1); }
  };
  r.readAsDataURL(f);
};
$('rmImg').onclick = () => { s.image = null; img = null; setDirty(true); update(); msg('Photo removed.'); };

function confirmDiscard() { return !dirty || confirm('You have unsaved changes. Discard them?'); }
async function apply(next, id) { s = {...DEFAULTS, ...next}; currentId = id; img = await loadImage(s.image).catch(() => null); dirty = false; syncUI(); update(); }
$('newBtn').onclick = () => { if (confirmDiscard()) apply({}, null).then(() => msg('New design started.')); };
$('resetBtn').onclick = async () => { if (!confirm('Reset all settings to defaults? The photo will be removed.')) return; const n = s.name; await apply({name: n}, currentId); setDirty(true); msg('Settings reset.'); };

const store = { get() { try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch { return []; } }, set(v) { localStorage.setItem(KEY, JSON.stringify(v)); } };
function renderLib() {
  const ul = $('lib'), list = store.get(); ul.innerHTML = '';
  if (!list.length) { ul.innerHTML = '<li class="empty">No saved designs yet. Name yours and press Save.</li>'; return; }
  list.forEach(d => {
    const li = document.createElement('li'), n = document.createElement('span'); n.textContent = d.name; li.append(n);
    [['Load', () => confirmDiscard() && apply(d, d.id).then(() => msg('Loaded “' + d.name + '”.'))],
     ['Rename', () => { const v = prompt('New name', d.name); if (v && v.trim()) { d.name = v.trim().slice(0, 40); store.set(list); if (d.id === currentId) { s.name = d.name; syncUI(); } renderLib(); } }],
     ['Delete', () => { if (confirm('Delete “' + d.name + '”? This cannot be undone.')) { store.set(list.filter(x => x.id !== d.id)); if (d.id === currentId) currentId = null; renderLib(); msg('Deleted.'); } }]
    ].forEach(([t, fn]) => { const b = document.createElement('button'); b.textContent = t; b.onclick = fn; li.append(b); });
    ul.append(li);
  });
}
$('saveBtn').onclick = () => {
  const name = $('saveName').value.trim(); if (!name) return msg('Enter a name before saving.', 1);
  s.name = name; const list = store.get(), id = currentId || String(Date.now()), rec = {...s, id};
  const i = list.findIndex(x => x.id === id); i >= 0 ? list[i] = rec : list.push(rec);
  try { store.set(list); } catch { return msg('Could not save: browser storage is full. Remove the photo or delete old designs.', 1); }
  currentId = id; setDirty(false); renderLib(); msg('Saved “' + name + '”.');
};

$('exportBtn').onclick = () => {
  try {
    const o = document.createElement('canvas'); o.width = W; o.height = H; draw(o.getContext('2d'), W, H);
    o.toBlob(b => {
      if (!b) return msg('Export failed: the browser could not create the image.', 1);
      const a = document.createElement('a'), slug = (s.name || 'watchface').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'watchface';
      a.href = URL.createObjectURL(b); a.download = `nexora-${slug}-${W}x${H}.png`; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 2000);
      msg('PNG downloaded. It is an image, not an installable watch face.');
    }, 'image/png');
  } catch (e) { msg('Export failed: ' + e.message, 1); }
};

// Bluetooth: capability check and device discovery only. No upload protocol is implemented.
let dev = null; const ble = $('ble');
$('connect').onclick = async () => {
  if (!navigator.bluetooth) return (ble.textContent = 'Web Bluetooth is not available here. Use Chrome or Edge on desktop or Android, over HTTPS.');
  if (dev && dev.gatt.connected) { dev.gatt.disconnect(); return; }
  try {
    ble.textContent = 'Choose your watch in the browser dialog…';
    dev = await navigator.bluetooth.requestDevice({acceptAllDevices: true});
    dev.addEventListener('gattserverdisconnected', () => { ble.textContent = 'Disconnected from ' + (dev.name || 'device') + '. Press Connect watch to reconnect.'; $('connect').textContent = 'Connect watch'; });
    ble.textContent = 'Connecting to ' + (dev.name || 'unnamed device') + '…';
    await dev.gatt.connect();
    ble.textContent = 'Connected to ' + (dev.name || 'unnamed device') + '. Uploading is not available: the watch-face transfer protocol is unverified.';
    $('connect').textContent = 'Disconnect';
  } catch (e) { ble.textContent = e.name === 'NotFoundError' ? 'Cancelled: no device selected.' : 'Connection failed: ' + e.message; }
};

setInterval(() => { $('clock').textContent = new Date().toLocaleTimeString(); update(); }, 1000);
renderLib(); syncUI(); update();
})();
