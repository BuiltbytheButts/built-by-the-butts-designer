'use strict';

const VERSION = '3.0.13';
const ROUGH_RIP_EXTRA = 1 / 16;
const ROUGH_CROSSCUT_EXTRA = 1 / 8;
const STORAGE_KEY = 'diamond-end-grain-designer-v3';

const WOODS = Object.freeze({
  walnut: { name: 'Walnut', color: '#4b2d21' },
  cherry: { name: 'Cherry', color: '#a75b3d' },
  padauk: { name: 'Padauk', color: '#bc4a28' },
  maple: { name: 'Hard Maple', color: '#e4ca96' },
  purpleheart: { name: 'Purpleheart', color: '#694064' }
});

const DEFAULT_STRIPS = Object.freeze([
  { width: 0.5000, wood: 'cherry' },
  { width: 0.1250, wood: 'maple' },
  { width: 0.1250, wood: 'walnut' },
  { width: 0.1250, wood: 'walnut' },
  { width: 0.1250, wood: 'maple' },
  { width: 0.5000, wood: 'cherry' }
]);

const defaultState = () => ({
  version: VERSION,
  boardLength: 18.625,
  boardWidth: 11.625,
  finishedThickness: 1.5,
  includeBorders: false,
  borderWidth: 0.5,
  borderWood: 'maple',
  bladeKerf: 0.125,
  edgeInset: 0.5,
  edgeWood: 'walnut',
  strips: DEFAULT_STRIPS.map(strip => ({ ...strip }))
});

let state = defaultState();
let history = [];
let future = [];
let toastTimer = 0;

const $ = id => document.getElementById(id);
const number = value => Number.isFinite(Number(value)) ? Number(value) : 0;
const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
const round = (value, places = 4) => Number(number(value).toFixed(places));
const deepClone = value => JSON.parse(JSON.stringify(value));

function activeStrips() {
  return state.strips.filter(strip => strip.width > 0);
}

function moduleWidth() {
  return activeStrips().reduce((sum, strip) => sum + number(strip.width), 0);
}

function recommendedRoughRip(width) {
  return round(number(width) + ROUGH_RIP_EXTRA, 4);
}

function recommendedRoughCrosscut() {
  return round(number(state.finishedThickness) + ROUGH_CROSSCUT_EXTRA, 3);
}

function laminationRequirement() {
  return DiamondManufacturing.requiredLaminationSize(state.finishedThickness);
}

function crosscutEngineering() {
  return DiamondManufacturing.finishedDimensionCrosscutPlan({
    targetLength: state.boardLength,
    finishedThickness: state.finishedThickness,
    roughCrosscut: recommendedRoughCrosscut(),
    bladeKerf: state.bladeKerf
  });
}

function previewGrid() {
  const module = Math.max(0.125, moduleWidth());
  const lengthSliceCount = crosscutEngineering().crosscutCount;
  const widthModuleCount = Math.max(2, Math.ceil(number(state.boardWidth) / module));
  return { lengthSliceCount, widthModuleCount, module };
}

function borderEngineering() {
  const requestedWidth = Math.max(0, number(state.borderWidth));
  const maximumWidth = Math.max(0, number(state.boardWidth) / 2 - 0.0625);
  const effectiveWidth = state.includeBorders ? Math.min(requestedWidth, maximumWidth) : 0;
  const diamondFieldWidth = Math.max(0.125, number(state.boardWidth) - 2 * effectiveWidth);
  const borderVolume = state.includeBorders
    ? 2 * number(state.boardLength) * effectiveWidth * number(state.finishedThickness)
    : 0;
  return { requestedWidth, effectiveWidth, maximumWidth, diamondFieldWidth, borderVolume, valid: !state.includeBorders || requestedWidth <= maximumWidth };
}

function svgEl(name, attrs = {}) {
  const el = document.createElementNS('http://www.w3.org/2000/svg', name);
  Object.entries(attrs).forEach(([key, value]) => el.setAttribute(key, value));
  return el;
}

function points(list) {
  return list.map(([x, y]) => `${x},${y}`).join(' ');
}

function addWoodPatterns(svg) {
  const defs = svgEl('defs');
  Object.entries(WOODS).forEach(([key, wood]) => {
    const pattern = svgEl('pattern', { id: `wood-${key}`, width: 32, height: 32, patternUnits: 'userSpaceOnUse', patternTransform: 'rotate(2)' });
    pattern.append(svgEl('rect', { width: 32, height: 32, fill: wood.color }));
    pattern.append(svgEl('path', { d: 'M-5 8 C4 0 13 15 23 8 S35 3 42 12 M-5 25 C5 17 13 30 24 23 S35 18 42 28', fill: 'none', stroke: '#fff', 'stroke-opacity': '.10', 'stroke-width': '1' }));
    pattern.append(svgEl('path', { d: 'M7 0 C12 10 5 22 11 32 M24 0 C30 12 21 23 28 32', fill: 'none', stroke: '#000', 'stroke-opacity': '.07', 'stroke-width': '1' }));
    defs.append(pattern);
  });
  svg.append(defs);
}

function edgeCutGeometry(x, y, size, slope) {
  return DiamondGeometry.edgeCutTriangles({
    x, y, size, slope,
    cutDepth: number(state.edgeInset),
    moduleWidth: moduleWidth()
  });
}

function drawEndGrainCell(svg, x, y, size, slope, rotate180 = false) {
  const strips = activeStrips();
  if (!strips.length || moduleWidth() <= 0) return;

  // Exact laminate geometry: each strip becomes a clipped polygon inside the
  // square crosscut face. There is no fallback/background species, so changing
  // an outside strip can affect only the physical band created by that strip.
  const baseAngle = slope >= 0 ? 45 : -45;
  const angleDeg = baseAngle + (rotate180 ? 180 : 0);
  const bands = DiamondGeometry.laminateBands({ x, y, size, strips, angleDeg });
  bands.forEach(band => {
    svg.append(svgEl('polygon', {
      points: points(band.polygon),
      class: 'laminate-band',
      'data-strip-index': String(band.index),
      fill: `url(#wood-${band.wood})`,
      stroke: 'none'
    }));
  });

  // Edge Rip is an overlay of replacement stock only over the physically cut
  // corner triangles. The original laminate geometry never resizes or changes.
  const cut = edgeCutGeometry(x, y, size, slope);
  if (cut.triangles.length && WOODS[state.edgeWood]) {
    const fill = `url(#wood-${state.edgeWood})`;
    cut.triangles.forEach(triangle => {
      svg.append(svgEl('polygon', {
        points: points(triangle),
        class: 'edge-replacement',
        fill,
        stroke: '#241710',
        'stroke-width': '.55'
      }));
    });
  }

  svg.append(svgEl('rect', {
    x, y, width: size, height: size,
    fill: 'none',
    stroke: '#4d382d',
    'stroke-opacity': '.45',
    'stroke-width': '.7'
  }));
}

function renderBoard() {
  const svg = $('boardSvg');
  svg.innerHTML = '';
  addWoodPatterns(svg);

  const boardX = 42;
  const boardY = 42;
  const boardW = 1116;
  const boardH = 676;
  const boardAspect = Math.max(0.15, number(state.boardLength) / Math.max(0.15, number(state.boardWidth)));
  let fieldW = boardW;
  let fieldH = fieldW / boardAspect;
  if (fieldH > boardH) {
    fieldH = boardH;
    fieldW = fieldH * boardAspect;
  }
  const fieldX = 600 - fieldW / 2;
  const fieldY = 380 - fieldH / 2;

  svg.append(svgEl('rect', { x: fieldX - 3, y: fieldY - 3, width: fieldW + 6, height: fieldH + 6, rx: 8, fill: '#f6f0e9', stroke: '#917e70', 'stroke-width': '3' }));

  const grid = previewGrid();
  const cellW = fieldW / grid.lengthSliceCount;
  const cellH = fieldH / grid.widthModuleCount;
  const cell = Math.max(cellW, cellH);
  const renderCols = Math.ceil(fieldW / cell) + 2;
  const renderRows = Math.ceil(fieldH / cell) + 2;
  const startX = fieldX - cell;
  const startY = fieldY - cell;

  const clipId = 'board-field-clip';
  const defs = svgEl('defs');
  const clip = svgEl('clipPath', { id: clipId });
  clip.append(svgEl('rect', { x: fieldX, y: fieldY, width: fieldW, height: fieldH, rx: 5 }));
  defs.append(clip);
  svg.append(defs);
  const field = svgEl('g', { 'clip-path': `url(#${clipId})` });

  for (let row = 0; row < renderRows; row += 1) {
    for (let col = 0; col < renderCols; col += 1) {
      const x = startX + col * cell;
      const y = startY + row * cell;
      const rotate180 = col % 2 === 1;
      const slope = (row + col) % 2 === 0 ? 1 : -1;
      drawEndGrainCell(field, x, y, cell, slope, rotate180);
    }
  }
  svg.append(field);
}

function renderBorders() {
  if (!state.includeBorders || !WOODS[state.borderWood]) return;
  const svg = $('boardSvg');
  const boardX = 42;
  const boardY = 42;
  const boardW = 1116;
  const boardH = 676;
  const boardAspect = Math.max(0.15, number(state.boardLength) / Math.max(0.15, number(state.boardWidth)));
  let fieldW = boardW;
  let fieldH = fieldW / boardAspect;
  if (fieldH > boardH) {
    fieldH = boardH;
    fieldW = fieldH * boardAspect;
  }
  const fieldX = 600 - fieldW / 2;
  const fieldY = 380 - fieldH / 2;
  const border = borderEngineering();
  const borderPixels = fieldH * border.effectiveWidth / Math.max(0.125, number(state.boardWidth));
  const fill = `url(#wood-${state.borderWood})`;
  [fieldY, fieldY + fieldH - borderPixels].forEach(y => {
    svg.append(svgEl('rect', {
      x: fieldX, y, width: fieldW, height: borderPixels,
      class: 'end-grain-border', fill, stroke: '#4d382d', 'stroke-width': '.8'
    }));
  });
}

function renderPreview() {
  renderBoard();
  renderBorders();
}

function woodOptions(selected) {
  return Object.entries(WOODS).map(([key, wood]) => `<option value="${key}" ${key === selected ? 'selected' : ''}>${wood.name}</option>`).join('');
}

function buildStripEditor() {
  const holder = $('stripEditor');
  holder.innerHTML = '';
  state.strips.forEach((strip, index) => {
    const row = document.createElement('div');
    row.className = 'strip-row';
    row.innerHTML = `
      <span class="swatch" style="background:${WOODS[strip.wood]?.color || '#999'}"></span>
      <label>Strip ${index + 1}<input data-strip-width="${index}" type="number" min="0.03125" max="3" step="0.03125" value="${number(strip.width).toFixed(4)}"></label>
      <label>Wood<select data-strip-wood="${index}">${woodOptions(strip.wood)}</select></label>
      <div class="strip-meta">Recommended rough rip: ~${recommendedRoughRip(strip.width).toFixed(4)} in</div>`;
    holder.append(row);
  });

  holder.querySelectorAll('[data-strip-width]').forEach(input => {
    input.addEventListener('input', event => {
      const index = Number(event.target.dataset.stripWidth);
      state.strips[index].width = Math.max(0.03125, number(event.target.value));
      const meta = event.target.closest('.strip-row')?.querySelector('.strip-meta');
      if (meta) meta.textContent = `Recommended rough rip: ~${recommendedRoughRip(state.strips[index].width).toFixed(4)} in`;
      renderPreview();
      renderMetrics();
    });
    input.addEventListener('change', commit);
  });
  holder.querySelectorAll('[data-strip-wood]').forEach(select => {
    select.addEventListener('change', event => {
      const index = Number(event.target.dataset.stripWood);
      state.strips[index].wood = event.target.value;
      const swatch = event.target.closest('.strip-row')?.querySelector('.swatch');
      if (swatch) swatch.style.background = WOODS[state.strips[index].wood].color;
      renderPreview();
      commit();
    });
  });
}

function addStripPair(location) {
  const pair = [{ width: 0.125, wood: 'maple' }, { width: 0.125, wood: 'maple' }];
  if (location === 'outer') {
    state.strips = [pair[0], ...state.strips, pair[1]];
  } else {
    const middle = Math.floor(state.strips.length / 2);
    state.strips.splice(middle, 0, ...pair);
  }
  buildStripEditor(); render(); commit();
}

function removeStripPair(location) {
  if (state.strips.length <= 2) return toast('Keep at least two strips');
  if (location === 'outer') {
    state.strips = state.strips.slice(1, -1);
  } else {
    const left = Math.floor((state.strips.length - 2) / 2);
    state.strips.splice(left, 2);
  }
  buildStripEditor(); render(); commit();
}

function renderEngineering() {
  const x = crosscutEngineering();
  $('roughCrosscutMetric').textContent = `${x.roughCrosscut.toFixed(3)} in`;
  $('roughCrosscutHelp').textContent = `Finished target ${x.finishedThickness.toFixed(3)} in + approx. 1/8 in cleanup guidance.`;

  $('crosscutCountMetric').textContent = `${x.crosscutCount} crosscuts`;
  $('crosscutCountHelp').textContent = `Approx. ${x.achievableLength.toFixed(3)} in finished; requires approx. ${x.requiredBlankLength.toFixed(3)} in rough blank.`;
  const warning = $('crosscutWarning');
  warning.hidden = x.isBalanced;
  warning.textContent = `⚠ ${x.crosscutCount} crosscuts produces an unbalanced pattern. Adjust finished length or finished thickness to produce an even crosscut count.`;
}

function renderMetrics() {
  const x = crosscutEngineering();
  const lamination = laminationRequirement();
  $('moduleWidthMetric').textContent = `${lamination.recommended.toFixed(3)} in`;
  $('laminationMinimumMetric').textContent = `Minimum ${lamination.minimum.toFixed(3)} in = ${lamination.target.toFixed(3)} × √2; rounded up to nearest 1/8 in.`;
  $('crosscutMetric').textContent = x.crosscutCount ? String(x.crosscutCount) : '—';
  $('boardSizeMetric').textContent = `${number(state.boardLength).toFixed(3)} × ${number(state.boardWidth).toFixed(3)} in`;
  $('thicknessMetric').textContent = `${number(state.finishedThickness).toFixed(3)} in`;
  $('edgeInsetLabel').textContent = `${number(state.edgeInset).toFixed(3)} in`;
  document.querySelectorAll('[data-inset]').forEach(button => button.classList.toggle('active', Math.abs(number(button.dataset.inset) - number(state.edgeInset)) < 1e-9));
  const border = borderEngineering();
  $('borderFields').hidden = !state.includeBorders;
  $('diamondFieldMetric').textContent = state.includeBorders
    ? `${number(state.boardLength).toFixed(3)} × ${border.diamondFieldWidth.toFixed(3)} in`
    : `${number(state.boardLength).toFixed(3)} × ${number(state.boardWidth).toFixed(3)} in (full board)`;
  $('borderMaterialMetric').textContent = state.includeBorders
    ? `2 × ${number(state.boardLength).toFixed(3)} × ${border.effectiveWidth.toFixed(3)} × ${number(state.finishedThickness).toFixed(3)} in`
    : 'No border material required';
  $('borderWarning').hidden = border.valid;
  $('borderWarning').textContent = `Border width must be less than half the finished board width (maximum ${border.maximumWidth.toFixed(3)} in).`;
}

function render() {
  renderPreview();
  renderEngineering();
  renderMetrics();
  buildStripEditor();
  syncInputs();
  updateHistoryButtons();
}

function syncInputs() {
  $('boardLength').value = state.boardLength;
  $('boardWidth').value = state.boardWidth;
  $('finishedThickness').value = state.finishedThickness;
  $('includeBorders').checked = state.includeBorders;
  $('borderWidth').value = state.borderWidth;
  $('borderWood').innerHTML = woodOptions(state.borderWood);
  $('bladeKerf').value = state.bladeKerf;
  $('edgeInset').value = state.edgeInset;
  $('edgeWood').innerHTML = woodOptions(state.edgeWood);
}

function snapshot() {
  return JSON.stringify(state);
}

function commit() {
  state.version = VERSION;
  const snap = snapshot();
  if (history.at(-1) !== snap) history.push(snap);
  if (history.length > 100) history.shift();
  future = [];
  localStorage.setItem(STORAGE_KEY, snap);
  updateHistoryButtons();
}

function restore(serialized) {
  const parsed = JSON.parse(serialized);
  state = { ...defaultState(), ...parsed, version: VERSION };
  state.strips = Array.isArray(parsed.strips) && parsed.strips.length ? parsed.strips.map(strip => ({ width: Math.max(0.03125, number(strip.width)), wood: WOODS[strip.wood] ? strip.wood : 'maple' })) : defaultState().strips;
  if (!WOODS[state.edgeWood]) state.edgeWood = 'walnut';
  if (!WOODS[state.borderWood]) state.borderWood = 'maple';
  render();
}

function updateHistoryButtons() {
  $('undoBtn').disabled = history.length <= 1;
  $('redoBtn').disabled = future.length === 0;
}

function toast(message) {
  const el = $('toast');
  el.textContent = message;
  el.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), 1800);
}

function download(name, type, text) {
  const blob = new Blob([text], { type });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = name;
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function bindNumberInput(id, key) {
  const input = $(id);
  input.addEventListener('input', () => { state[key] = number(input.value); renderPreview(); renderEngineering(); renderMetrics(); });
  input.addEventListener('change', commit);
}

function bindEvents() {
  bindNumberInput('boardLength', 'boardLength');
  bindNumberInput('boardWidth', 'boardWidth');
  bindNumberInput('finishedThickness', 'finishedThickness');
  bindNumberInput('borderWidth', 'borderWidth');
  bindNumberInput('bladeKerf', 'bladeKerf');

  $('includeBorders').addEventListener('change', event => { state.includeBorders = event.target.checked; render(); commit(); });
  $('borderWood').addEventListener('change', event => { state.borderWood = event.target.value; renderPreview(); commit(); });

  $('edgeInset').addEventListener('input', event => { state.edgeInset = number(event.target.value); renderPreview(); renderMetrics(); });
  $('edgeInset').addEventListener('change', commit);
  $('edgeWood').addEventListener('change', event => { state.edgeWood = event.target.value; renderPreview(); commit(); });

  document.addEventListener('click', event => {
    const button = event.target.closest('[data-inset]');
    if (!button) return;
    state.edgeInset = number(button.dataset.inset);
    $('edgeInset').value = state.edgeInset;
    renderPreview(); renderMetrics(); commit();
  });

  $('resetStripsBtn').addEventListener('click', () => { state.strips = defaultState().strips; render(); commit(); });
  $('addOuterPairBtn').addEventListener('click', () => addStripPair('outer'));
  $('addInnerPairBtn').addEventListener('click', () => addStripPair('inner'));
  $('removeOuterPairBtn').addEventListener('click', () => removeStripPair('outer'));
  $('removeInnerPairBtn').addEventListener('click', () => removeStripPair('inner'));

  $('undoBtn').addEventListener('click', () => {
    if (history.length <= 1) return;
    future.push(history.pop());
    restore(history.at(-1));
    updateHistoryButtons();
  });
  $('redoBtn').addEventListener('click', () => {
    if (!future.length) return;
    const snap = future.pop();
    history.push(snap);
    restore(snap);
    updateHistoryButtons();
  });

  $('saveProjectBtn').addEventListener('click', () => download('diamond-end-grain-design-v3.json', 'application/json', JSON.stringify(state, null, 2)));
  $('openProjectInput').addEventListener('change', async event => {
    const file = event.target.files[0];
    if (!file) return;
    try {
      restore(await file.text());
      history = [snapshot()];
      future = [];
      commit();
      toast('Project opened');
    } catch {
      alert('That project file could not be opened.');
    }
    event.target.value = '';
  });
  $('exportSvgBtn').addEventListener('click', () => {
    const clone = $('boardSvg').cloneNode(true);
    clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    download('diamond-end-grain-board-v3.svg', 'image/svg+xml;charset=utf-8', `<?xml version="1.0" encoding="UTF-8"?>\n${new XMLSerializer().serializeToString(clone)}`);
  });
}

function initialize() {
  console.info(`Diamond End Grain Designer v${VERSION}`);
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try { restore(saved); } catch { state = defaultState(); }
  }
  bindEvents();
  history = [snapshot()];
  render();
}

initialize();
