// One scene unit is one metre. Room enlarged visually at the user's request;
// original plan: 6.90 × 5.80 m. Package sizes preserve the supplied scale.
export const ROOM = Object.freeze({ width: 7.9, depth: 8.4, back: -5.0, front: 3.4, centerZ: -.8, outerWidth: 8.2, outerDepth: 8.71, wall: .15, height: 2.8, annexWidth: 3.88, annexDepth: 1.89, upperDepth: 6.36, corridorWidth: 3.87 });
export const RACK = Object.freeze({ shiftX: -.5, z: -2.53, depth: 1.16, pickAisleZ: -1.35 });
export const RACK_BAYS = [
  { x: -2.81 + RACK.shiftX, width: 1.03, levels: [.17, .77, 1.40, 1.99], height: 2.68 },
  { x: -1.66 + RACK.shiftX, width: 1.12, levels: [.17, .77, 1.40, 1.99], height: 2.68 },
  { x: -.25 + RACK.shiftX, width: 1.38, levels: [.1725, 1.1825, 1.7025, 2.0125], height: 2.72 },
  { x: 1.17 + RACK.shiftX, width: 1.38, levels: [.1725, 1.7425], height: 2.72 },
].map((bay, index) => ({ ...bay, width: bay.width + .15, x: bay.x + index * .15 + .075 }));
export const REAR_RACK = Object.freeze({ z: RACK.z - RACK.depth - .12, aisle: .61 });
// Both rows gain one 60 cm floor tile toward the right, keeping their left edge.
export const REAR_RACK_BAYS = RACK_BAYS.map((bay, index) => ({
  ...bay,
  levels: index === 2 ? [.1725, 1.1825, 1.4225, 1.6925, 2.3325] : [...bay.levels],
}));
export const DEPTHS = ['FRENTE', 'MEIO', 'FUNDO'];
export const PACKAGES = Object.freeze({
  ZD230: { width: .24, depth: .34, height: .28, confirmed: true },
  ZQ521: { width: .185, depth: .28, height: .09, confirmed: true },
  ZT421: { width: .34, depth: .40, height: .1425, confirmed: false },
  ZT230: { width: .34, depth: .40, height: .1425, confirmed: false },
});
export const UNIT_DIMENSIONS = Object.freeze({
  ZD230: { width: .19, depth: .26, height: .165 },
  ZQ521: { width: .155, depth: .158, height: .075 },
});
// Two joined desks run along the outside face of the annex's side wall.
export const PREPARATION = Object.freeze({ x: -ROOM.width / 2 + ROOM.annexWidth + ROOM.wall + .30, y: .78, z: ROOM.front - 1.85 * 1.5, width: .6, length: 1.85 });
export const EXIT = Object.freeze({ x: ROOM.width / 2, y: .82, z: 1.67 });
export const DOOR_DESK = Object.freeze({ x: ROOM.width / 2 - .35, width: .62, start: ROOM.back + .035, end: EXIT.z - 1.30 / 2 - .035 });

// Areas share two physical rack bays. Secundária stacks three cartons without intermediate boards.
const mainRackWidth = RACK_BAYS[3].width - .04;
const secondaryRackWidth = RACK_BAYS[2].width - .04;
export const demoShelves = [
  // These first three areas keep their established geometry and depth mapping.
  { id: 'principal', name: 'Principal', rows: 5, cols: 5, depths: DEPTHS, x: RACK_BAYS[3].x, z: RACK.z, base: .19, rowPitch: .28, width: mainRackWidth, model: 'ZD230' },
  { id: 'principal-cima', name: 'Principal Teto', rows: 3, cols: 6, depths: DEPTHS, x: RACK_BAYS[3].x, z: RACK.z, base: 1.76, rowPitch: .28, width: mainRackWidth, model: 'ZD230' },
  { id: 'secundaria', name: 'Secundária', rows: 3, cols: 6, depths: ['FRENTE', 'FUNDO'], x: RACK_BAYS[2].x, z: RACK.z, base: .19, rowPitch: .28, width: secondaryRackWidth, model: 'ZD230' },
  { id: 'zd230-sem-caixa', name: 'ZD230 sem caixa', signName: 'UNIDADE · SEM FONTE', rows: 1, cols: 5, depths: ['FRENTE', 'FUNDO'], x: RACK_BAYS[2].x, z: RACK.z, base: 1.20, rowPitch: .18, width: secondaryRackWidth, model: 'ZD230', renderMode: 'unit', depthNames: { FRENTE: 'ZD230 USAR SOMENTE UNIDADE', FUNDO: 'ZD230 funcionando (Sem fonte)' } },
  { id: 'zq521', name: 'ZQs521', signName: 'ZQ521', rows: 3, cols: 6, depths: ['FRENTE'], x: RACK_BAYS[2].x, z: RACK.z, base: 1.72, rowPitch: .09, width: secondaryRackWidth, model: 'ZQ521' },
  { id: 'zd230-teto', name: 'Secundária Teto', rows: 2, cols: 4, depths: ['FRENTE', 'FUNDO'], x: RACK_BAYS[2].x - .22, z: RACK.z, base: 2.04, rowPitch: .28, width: 1.05, model: 'ZD230' },
  { id: 'zt-cima-teto', name: 'ZT Cima-Teto', signName: 'ZT', rows: 4, cols: 1, depths: ['FRENTE'], x: RACK_BAYS[2].x + .58, z: RACK.z, base: 2.03, rowPitch: .1425, width: .34, model: 'ZT421' },
];

// Portfólio: só ocupação ilustrativa, sem códigos reais de patrimônio.
export const STOCK_LAYOUT = {};

export function createDemoItems() {
  let index = 0;
  return demoShelves.flatMap((shelf, si) => shelf.depths.flatMap((depth, di) => {
    const explicitRows = STOCK_LAYOUT[shelf.id]?.[depth];
    if (explicitRows) return explicitRows.flatMap((values, row) => values.flatMap((cell, col) => cell ? [{
      id: 'demo-' + shelf.id + '-' + di + '-' + row + '-' + col,
      selb: typeof cell === 'string' ? cell : cell.selb,
      model: typeof cell === 'string' ? shelf.model : cell.model || shelf.model,
      shelfId: shelf.id, row, col, depth, renderMode: shelf.renderMode,
      locationName: shelf.depthNames?.[depth],
    }] : []));
    const items = [];
    for (let row = 0; row < shelf.rows; row++) for (let col = 0; col < shelf.cols; col++) {
      // Illustrative occupancy only. Never seed or read real stock in this preview.
      const emptyTopRows = shelf.rows > 1 ? (col + di + si) % Math.min(3, shelf.rows) : ((col + di + si) % 5 === 0 ? 1 : 0);
      if (row < emptyTopRows) continue;
      const number = index++;
      items.push({ id: 'demo-' + shelf.id + '-' + di + '-' + row + '-' + col, selb: (shelf.model === 'ZQ521' ? 'Q' : 'D') + String(number + 1).padStart(3, '0'), model: shelf.model, shelfId: shelf.id, row, col, depth, renderMode: shelf.renderMode, locationName: shelf.depthNames?.[depth] });
    }
    return items;
  }));
}

export function itemCoordinates(item, shelves = demoShelves) {
  const shelf = shelves.find(s => s.id === item.shelfId);
  if (!shelf) throw new Error('Unknown shelf: ' + item.shelfId);
  const depthIndex = DEPTHS.indexOf(item.depth);
  if (depthIndex < 0) throw new Error('Unknown depth: ' + item.depth);
  return { x: shelf.x - shelf.width / 2 + (item.col + .5) * shelf.width / shelf.cols, y: shelf.base + (shelf.rows - 1 - item.row) * shelf.rowPitch, z: shelf.z + .37 - depthIndex * .37 };
}

export const SHIPMENT_PHASES = [
  { key: 'approaching', label: 'Caminhando até a prateleira', short: 'Coleta', duration: 3.0 },
  { key: 'picking', label: 'Retirando a caixa da prateleira', short: 'Retirada', duration: 6.8 },
  { key: 'opening', label: 'Abrindo a caixa na mesa', short: 'Abertura', duration: 1.8 },
  { key: 'supplies', label: 'Colocando ribbon e etiquetas', short: 'Insumos', duration: 2.4 },
  { key: 'closing', label: 'Fechando a caixa', short: 'Fechamento', duration: 1.5 },
  { key: 'labeling', label: 'Colando a etiqueta de rastreio', short: 'Rastreio', duration: 2.2 },
  { key: 'leaving', label: 'Levando a caixa até a saída', short: 'Saída', duration: 6.0 },
];
export const SHIPMENT_DURATION = SHIPMENT_PHASES.reduce((sum, phase) => sum + phase.duration, 0);
export function shipmentFrame(elapsed) {
  const safe = Math.max(0, Number.isFinite(elapsed) ? elapsed : 0);
  let start = 0;
  for (let index = 0; index < SHIPMENT_PHASES.length; index++) {
    const phase = SHIPMENT_PHASES[index];
    if (safe < start + phase.duration) return { ...phase, index, progress: (safe - start) / phase.duration, totalProgress: safe / SHIPMENT_DURATION, done: false };
    start += phase.duration;
  }
  return { key: 'done', label: 'Caixa chegou à porta de saída', short: 'Concluído', index: SHIPMENT_PHASES.length, progress: 1, totalProgress: 1, done: true };
}
export function locationLabel(item, shelves = demoShelves) {
  const shelf = shelves.find(s => s.id === item.shelfId);
  return (shelf?.name || 'Prateleira') + ' · nível ' + ((shelf?.rows || 1) - item.row) + ' · ' + String.fromCharCode(65 + item.col) + (item.col + 1) + ' · ' + item.depth;
}
