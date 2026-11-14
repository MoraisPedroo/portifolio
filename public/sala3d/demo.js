// Sala 3D do EstoqueNTO em modo demonstração para o site da DP Systems.
// Sem login e sem Firebase: só ocupação ilustrativa (data.js).
import { createDemoItems, demoShelves, locationLabel } from './data.js?v=44';

const $ = id => document.getElementById(id);
let items = createDemoItems();
let selectedId = items[0]?.id ?? null;
let busy = false;
let scene = null;
let introPlayed = false;
let visible = false;
let paused = false;

function select(id) {
  if (busy) return;
  const item = items.find(candidate => candidate.id === id);
  if (!item) return;
  selectedId = id;
  scene?.select(id);
  $('selected').textContent = `${item.model} · ${item.selb} · ${locationLabel(item)}`;
  $('ship').disabled = !scene;
}

function setView(view) {
  scene?.setView(view);
  document.querySelectorAll('[data-view]').forEach(el => {
    const active = el.dataset.view === view;
    el.classList.toggle('active', active);
    el.setAttribute('aria-pressed', String(active));
  });
}

function setBusy(value) {
  busy = value;
  $('ship').disabled = value || !scene || !selectedId;
  $('ship').textContent = value ? 'Envio em andamento…' : 'Simular envio';
  document.querySelectorAll('[data-view]').forEach(el => { el.disabled = value; });
}

function onProgress(phase) {
  $('phase').textContent = phase.label;
  const percent = Math.round(phase.totalProgress * 100);
  $('percent').textContent = `${percent}%`;
  $('bar').style.width = `${percent}%`;
}

function onComplete(item) {
  setBusy(false);
  $('phase').textContent = 'Caixa chegou à porta de saída';
  setTimeout(() => {
    $('progress').hidden = true;
    // Repõe a caixa para a demonstração poder rodar de novo.
    items = createDemoItems();
    scene?.setItems(items);
    select(item.id);
    setView('iso');
  }, 1800);
}

function ship() {
  if (busy || !scene || !selectedId) return;
  setBusy(true);
  $('progress').hidden = false;
  setView('iso');
  if (!scene.startShipment(selectedId)) {
    setBusy(false);
    $('progress').hidden = true;
  }
}

// Só desenha quando a sala está na tela: economiza GPU no resto do site.
function pause() {
  if (!scene || paused) return;
  cancelAnimationFrame(scene.frameId);
  paused = true;
}
function resume() {
  if (!scene || !paused) return;
  paused = false;
  scene.lastTime = performance.now();
  scene.dirty = true;
  scene.frameId = requestAnimationFrame(scene.tick);
}

function playIntroOnce() {
  if (introPlayed || !scene || busy) return;
  introPlayed = true;
  setView('iso');
  scene.playIntro();
}

new IntersectionObserver(entries => {
  visible = entries.some(entry => entry.isIntersecting);
  if (visible) { resume(); playIntroOnce(); } else pause();
}, { threshold: 0.25 }).observe($('viewport'));

document.querySelectorAll('[data-view]').forEach(button => button.addEventListener('click', () => setView(button.dataset.view)));
$('ship').addEventListener('click', ship);

try {
  const { WarehouseScene } = await import('./warehouse.js?v=44');
  scene = new WarehouseScene($('viewport'), {
    shelves: demoShelves,
    items,
    onSelect: item => select(item.id),
    onProgress,
    onComplete,
    onError: () => { $('error').hidden = false; },
  });
  // A roda do mouse rola o site em vez de aproximar a sala.
  scene.controls.enableZoom = false;
  await scene.workerReady;
  $('loading').hidden = true;
  // Começa por uma caixa da prateleira principal, perto da mesa.
  select(items.find(item => item.shelfId === 'principal' && item.depth === 'FRENTE')?.id ?? selectedId);
  if (visible) playIntroOnce();
  else pause();
} catch (error) {
  console.error('Sala 3D:', error);
  $('loading').hidden = true;
  $('error').hidden = false;
}

addEventListener('pagehide', () => scene?.dispose());
