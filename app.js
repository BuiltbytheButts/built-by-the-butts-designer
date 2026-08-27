'use strict';

const VERSION = '3.0.57';
const ROUGH_RIP_EXTRA = 1 / 16;
const ROUGH_CROSSCUT_EXTRA = 1 / 8;
const STORAGE_KEY = 'diamond-end-grain-designer-v3';

const WOODS = {
  ash: { name: 'Ash', color: '#c7ad7f' },
  beech: { name: 'Beech', color: '#c89f72' },
  birch: { name: 'Birch', color: '#d8bd8b' },
  bloodwood: { name: 'Bloodwood', color: '#872d2b' },
  bubinga: { name: 'Bubinga', color: '#8b493e' },
  canarywood: { name: 'Canarywood', color: '#d2a244' },
  cherry: { name: 'Cherry', color: '#a75b3d' },
  ebony: { name: 'Ebony', color: '#241c19' },
  hickory: { name: 'Hickory', color: '#b39869' },
  ipe: { name: 'Ipe', color: '#583c2c' },
  jatoba: { name: 'Jatoba (Brazilian Cherry)', color: '#8f3f32' },
  mahogany: { name: 'Mahogany', color: '#8b4b38' },
  maple: { name: 'Hard Maple', color: '#e4ca96' },
  osageorange: { name: 'Osage Orange', color: '#d58b27' },
  padauk: { name: 'Padauk', color: '#bc4a28' },
  purpleheart: { name: 'Purpleheart', color: '#694064' },
  redoak: { name: 'Red Oak', color: '#b87950' },
  sapele: { name: 'Sapele', color: '#98513b' },
  teak: { name: 'Teak', color: '#9b6c41' },
  walnut: { name: 'Walnut', color: '#4b2d21' },
  wenge: { name: 'Wenge', color: '#392822' },
  whiteoak: { name: 'White Oak', color: '#b79a69' },
  yellowheart: { name: 'Yellowheart', color: '#d8b73d' },
  zebrawood: { name: 'Zebrawood', color: '#aa8a58' }
};

const BUILTIN_WOOD_KEYS = Object.freeze(Object.keys(WOODS));

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
  glueUpPhase: 0,
  includeBorders: false,
  borderBands: [{ width: 0.5, wood: 'maple' }],
  customWoods: {},
  nextCustomWoodId: 1,
  wastePercent: 40,
  wasteIsManual: false,
  woodPrices: Object.fromEntries(Object.keys(WOODS).map(key => [key, 0])),
  bladeKerf: 0.125,
  edgeInset: 0.5,
  edgeWood: 'walnut',
  strips: DEFAULT_STRIPS.map(strip => ({ ...strip }))
});

let state = defaultState();
let history = [];
let future = [];
let toastTimer = 0;
let highlightedStripIndices = [];

const $ = id => document.getElementById(id);
const number = value => Number.isFinite(Number(value)) ? Number(value) : 0;
const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
const round = (value, places = 4) => Number(number(value).toFixed(places));
const deepClone = value => JSON.parse(JSON.stringify(value));

function sanitizeWoodName(value, fallback = 'Custom Wood') {
  const cleaned = String(value || '').replace(/[<>&"\u0000-\u001f]/g, '').trim().slice(0, 40);
  return cleaned || fallback;
}

function validWoodColor(value, fallback = '#9b7653') {
  return /^#[0-9a-f]{6}$/i.test(String(value || '')) ? String(value).toLowerCase() : fallback;
}

function syncCustomWoods() {
  Object.keys(WOODS).filter(key => key.startsWith('custom-')).forEach(key => delete WOODS[key]);
  Object.entries(state.customWoods || {}).forEach(([key, wood]) => {
    if (!/^custom-\d+$/.test(key)) return;
    WOODS[key] = {
      name: sanitizeWoodName(wood?.name),
      color: validWoodColor(wood?.color)
    };
  });
}

function activeStrips() {
  return state.strips.filter(strip => strip.width > 0);
}

function stripOffsetLabel(index, count) {
  const pairNumber = Math.min(index, count - index - 1) + 1;
  if (count % 2 === 1 && index === Math.floor(count / 2)) return `${pairNumber}C`;
  return `${pairNumber}${index < count / 2 ? 'A' : 'B'}`;
}

function moduleWidth() {
  return activeStrips().reduce((sum, strip) => sum + number(strip.width), 0);
}

function finishedCellPitch() {
  return Math.max(0.125, number(state.finishedThickness));
}

function recommendedRoughRip(width) {
  return round(number(width) + ROUGH_RIP_EXTRA, 4);
}

function recommendedRoughCrosscut() {
  return round(number(state.finishedThickness) + ROUGH_CROSSCUT_EXTRA, 3);
}

function recommendedWastePercent() {
  return number(state.edgeInset) > 0 ? 40 : 35;
}

function applyAutomaticWasteRecommendation() {
  if (!state.wasteIsManual) state.wastePercent = recommendedWastePercent();
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
  const module = finishedCellPitch();
  const lengthSliceCount = crosscutEngineering().crosscutCount;
  // This ratio may be fractional. The frozen renderer uses it only to derive
  // the same physical scale on both axes; complete buildable rows are reported
  // separately by border engineering.
  const widthModuleCount = Math.max(1, number(state.boardWidth) / module);
  return { lengthSliceCount, widthModuleCount, module };
}

function automaticLaminatedRows() {
  return Math.max(1, Math.floor((number(state.boardWidth) + 1e-12) / finishedCellPitch()));
}

function borderEngineering() {
  const bands = state.borderBands.map(band => ({
    width: Math.max(0.0625, number(band.width)),
    wood: WOODS[band.wood] ? band.wood : 'maple'
  }));
  const requestedWidth = bands.reduce((sum, band) => sum + band.width, 0);
  const automaticRows = automaticLaminatedRows();
  const availableDiamondWidth = Math.max(0, number(state.boardWidth) - 2 * requestedWidth);
  const idealRows = availableDiamondWidth / finishedCellPitch();
  const rowPlan = DiamondManufacturing.mirroredBorderRowPlan({
    boardWidth: state.boardWidth,
    moduleWidth: finishedCellPitch(),
    requestedWidth,
    automaticRows,
    bordersEnabled: state.includeBorders
  });
  const { selectedRows, diamondFieldWidth, requiredWidth, removedRowsPerEdge } = rowPlan;
  const maximumWidth = Math.max(0, number(state.boardWidth) / 2 - 0.0625);
  const effectiveWidth = state.includeBorders ? Math.min(requestedWidth, maximumWidth) : 0;
  const difference = requestedWidth - requiredWidth;
  const borderVolume = state.includeBorders
    ? 2 * number(state.boardLength) * effectiveWidth * number(state.finishedThickness)
    : 0;
  const rowsFit = diamondFieldWidth <= number(state.boardWidth) + 0.0005;
  const scheduleMatches = Math.abs(difference) <= 0.0005;
  return { bands, automaticRows, availableDiamondWidth, idealRows, selectedRows, removedRowsPerEdge, requestedWidth, requiredWidth, difference, effectiveWidth, maximumWidth, diamondFieldWidth, borderVolume, rowsFit, scheduleMatches, valid: !state.includeBorders || (rowsFit && scheduleMatches) };
}

function actualBoardDimensions() {
  const crosscuts = crosscutEngineering();
  const border = borderEngineering();
  const length = crosscuts.achievableLength;
  const width = state.includeBorders
    ? border.diamondFieldWidth + 2 * border.requestedWidth
    : border.selectedRows * finishedCellPitch();
  const requestedLength = Math.max(0, number(state.boardLength));
  const requestedWidth = Math.max(0, number(state.boardWidth));
  const lengthDelta = length - requestedLength;
  const widthDelta = width - requestedWidth;
  return {
    length,
    width,
    thickness: number(state.finishedThickness),
    requestedLength,
    requestedWidth,
    lengthDelta,
    widthDelta,
    matchesRequested: Math.abs(lengthDelta) <= 0.0005 && Math.abs(widthDelta) <= 0.0005
  };
}

function materialQuantity() {
  const border = borderEngineering();
  const crosscuts = crosscutEngineering();
  const actual = actualBoardDimensions();
  return DiamondMaterial.materialQuantityPlan({
    boardLength: actual.length, boardWidth: actual.width,
    finishedThickness: state.finishedThickness,
    diamondFieldWidth: state.includeBorders ? border.diamondFieldWidth : actual.width,
    moduleWidth: moduleWidth(), strips: activeStrips(),
    includeBorders: state.includeBorders, borderBands: border.bands,
    edgeInset: state.edgeInset, edgeWood: state.edgeWood,
    crosscutCount: crosscuts.crosscutCount, roughCrosscut: crosscuts.roughCrosscut,
    bladeKerf: state.bladeKerf, wastePercent: state.wastePercent,
    prices: state.woodPrices
  });
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

function renderAlternateGlueUpBoard() {
  const svg = $('boardSvg');
  svg.innerHTML = '';
  addWoodPatterns(svg);

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
  const field = svgEl('g', {
    'clip-path': `url(#${clipId})`,
    'data-glue-up-phase': '1',
    'data-cell-size': String(cell)
  });
  for (let row = 0; row < renderRows; row += 1) {
    for (let col = 0; col < renderCols; col += 1) {
      const x = startX + col * cell;
      const y = startY + row * cell;
      const patternCol = col + 1;
      const rotate180 = patternCol % 2 === 1;
      const slope = (row + patternCol) % 2 === 0 ? 1 : -1;
      drawEndGrainCell(field, x, y, cell, slope, rotate180);
    }
  }
  svg.append(field);
}

function renderBorders(layout = null) {
  if (!state.includeBorders) return;
  const svg = $('boardSvg');
  const actual = actualBoardDimensions();
  let fieldX;
  let fieldY;
  let fieldW;
  let fieldH;
  let boardWidth;
  if (layout) {
    ({ fieldX, fieldY, fieldW, fieldH, boardWidth } = layout);
  } else {
    const boardW = 1116;
    const boardH = 676;
    const boardAspect = Math.max(0.15, actual.length / Math.max(0.15, actual.width));
    fieldW = boardW;
    fieldH = fieldW / boardAspect;
    if (fieldH > boardH) {
      fieldH = boardH;
      fieldW = fieldH * boardAspect;
    }
    fieldX = 600 - fieldW / 2;
    fieldY = 380 - fieldH / 2;
    boardWidth = actual.width;
  }
  const border = borderEngineering();
  let offsetPixels = 0;
  border.bands.forEach((band, index) => {
    const bandPixels = fieldH * band.width / Math.max(0.125, boardWidth);
    const fill = `url(#wood-${band.wood})`;
    [fieldY + offsetPixels, fieldY + fieldH - offsetPixels - bandPixels].forEach(y => {
      svg.append(svgEl('rect', {
        x: fieldX, y, width: fieldW, height: bandPixels,
        class: 'end-grain-border', 'data-border-index': String(index),
        fill, stroke: '#4d382d', 'stroke-width': '.8'
      }));
    });
    offsetPixels += bandPixels;
  });
}

function renderBorderedBoard() {
  const svg = $('boardSvg');
  svg.innerHTML = '';
  addWoodPatterns(svg);

  const boardW = 1116;
  const boardH = 676;
  const actual = actualBoardDimensions();
  const boardAspect = Math.max(0.15, actual.length / Math.max(0.15, actual.width));
  let fieldW = boardW;
  let fieldH = fieldW / boardAspect;
  if (fieldH > boardH) {
    fieldH = boardH;
    fieldW = fieldH * boardAspect;
  }
  const fieldX = 600 - fieldW / 2;
  const fieldY = 380 - fieldH / 2;
  svg.append(svgEl('rect', { x: fieldX - 3, y: fieldY - 3, width: fieldW + 6, height: fieldH + 6, rx: 8, fill: '#f6f0e9', stroke: '#917e70', 'stroke-width': '3' }));

  const border = borderEngineering();
  const rows = border.selectedRows;
  const cols = crosscutEngineering().crosscutCount;
  if (rows > 0 && cols > 0) {
    const diamondH = fieldH * border.diamondFieldWidth / Math.max(0.125, actual.width);
    const diamondY = fieldY + (fieldH - diamondH) / 2;
    // A laminated face is always rendered square. The complete row stack sets
    // the one uniform scale; any length overage is centered and clipped only at
    // the finished board ends instead of stretching diamonds into rectangles.
    const cell = diamondH / rows;
    const gridW = cols * cell;
    const gridX = fieldX + (fieldW - gridW) / 2;
    const clipId = 'bordered-diamond-field-clip';
    const defs = svgEl('defs');
    const clip = svgEl('clipPath', { id: clipId });
    clip.append(svgEl('rect', { x: fieldX, y: diamondY, width: fieldW, height: diamondH }));
    defs.append(clip);
    svg.append(defs);
    const diamondField = svgEl('g', {
      class: 'bordered-diamond-field',
      'data-laminated-rows': String(rows),
      'data-finished-cell-pitch': String(finishedCellPitch()),
      'data-glue-up-phase': String(state.glueUpPhase),
      'data-grid-x': String(gridX),
      'data-grid-width': String(gridW),
      'data-board-field-x': String(fieldX),
      'data-board-field-width': String(fieldW),
      'data-field-y': String(diamondY),
      'data-field-height': String(diamondH),
      'clip-path': `url(#${clipId})`
    });
    for (let row = 0; row < rows; row += 1) {
      for (let col = 0; col < cols; col += 1) {
        const cellGroup = svgEl('g', {
          class: 'bordered-diamond-cell',
          'data-row': String(row),
          'data-column': String(col),
          'data-cell-size': String(cell),
          transform: `translate(${gridX + col * cell} ${diamondY + row * cell}) scale(${cell / 100})`
        });
        const patternCol = col + (state.glueUpPhase === 1 ? 1 : 0);
        const rotate180 = patternCol % 2 === 1;
        const slope = (row + patternCol) % 2 === 0 ? 1 : -1;
        drawEndGrainCell(cellGroup, 0, 0, 100, slope, rotate180);
        diamondField.append(cellGroup);
      }
    }
    svg.append(diamondField);
  }

  renderBorders({ fieldX, fieldY, fieldW, fieldH, boardWidth: actual.width });
  svg.append(svgEl('rect', { x: fieldX, y: fieldY, width: fieldW, height: fieldH, rx: 5, fill: 'none', stroke: '#4d382d', 'stroke-width': '1.2' }));
}

function renderUnborderedActualBoard() {
  const actual = actualBoardDimensions();
  const requestedLength = state.boardLength;
  const requestedWidth = state.boardWidth;
  state.boardLength = actual.length;
  state.boardWidth = actual.width;
  try {
    if (state.glueUpPhase === 1) renderAlternateGlueUpBoard();
    else renderBoard();
    const field = $('boardSvg').querySelector('g[clip-path="url(#board-field-clip)"]');
    if (field) {
      const grid = previewGrid();
      const boardW = 1116;
      const boardH = 676;
      const boardAspect = Math.max(0.15, actual.length / Math.max(0.15, actual.width));
      let fieldW = boardW;
      let fieldH = fieldW / boardAspect;
      if (fieldH > boardH) {
        fieldH = boardH;
        fieldW = fieldH * boardAspect;
      }
      const cell = Math.max(fieldW / grid.lengthSliceCount, fieldH / grid.widthModuleCount);
      field.dataset.glueUpPhase = String(state.glueUpPhase);
      field.dataset.cellSize = String(cell);
    }
  } finally {
    state.boardLength = requestedLength;
    state.boardWidth = requestedWidth;
  }
}

function renderPreview() {
  if (state.includeBorders) renderBorderedBoard();
  else renderUnborderedActualBoard();
}

function woodOptions(selected) {
  const options = keys => keys.map(key => `<option value="${key}" ${key === selected ? 'selected' : ''}>${WOODS[key].name}</option>`).join('');
  const customKeys = Object.keys(state.customWoods || {}).filter(key => WOODS[key]);
  return `<optgroup label="Built-in woods">${options(BUILTIN_WOOD_KEYS)}</optgroup>${customKeys.length ? `<optgroup label="Your custom woods">${options(customKeys)}</optgroup>` : ''}`;
}

function customWoodIsUsed(key) {
  return state.edgeWood === key || state.strips.some(strip => strip.wood === key) || state.borderBands.some(band => band.wood === key);
}

function updateWoodSwatches(key) {
  document.querySelectorAll(`[data-wood-swatch="${key}"]`).forEach(swatch => {
    swatch.style.background = WOODS[key]?.color || '#999';
  });
}

function buildCustomWoodEditor() {
  const holder = $('customWoodEditor');
  holder.innerHTML = '';
  const entries = Object.entries(state.customWoods || {});
  $('customWoodEmpty').hidden = entries.length > 0;
  entries.forEach(([key, wood], index) => {
    const row = document.createElement('div');
    row.className = 'custom-wood-row';
    row.innerHTML = `
      <input class="wood-color" data-custom-color="${key}" type="color" value="${validWoodColor(wood.color)}" aria-label="${wood.name} preview color">
      <label>Custom wood ${index + 1}<input data-custom-name="${key}" type="text" maxlength="40" value="${wood.name}"></label>
      <button class="text-button custom-wood-remove" data-remove-custom="${key}" type="button">Remove</button>`;
    holder.append(row);
  });

  holder.querySelectorAll('[data-custom-name]').forEach(input => {
    input.addEventListener('input', event => {
      const key = event.target.dataset.customName;
      state.customWoods[key].name = sanitizeWoodName(event.target.value, `Custom Wood ${key.split('-').at(-1)}`);
      WOODS[key].name = state.customWoods[key].name;
      renderMaterial();
    });
    input.addEventListener('change', () => { buildStripEditor(); buildBorderEditor(); syncInputs(); renderWorkshopPlan(); commit(); });
  });
  holder.querySelectorAll('[data-custom-color]').forEach(input => {
    input.addEventListener('input', event => {
      const key = event.target.dataset.customColor;
      state.customWoods[key].color = validWoodColor(event.target.value);
      WOODS[key].color = state.customWoods[key].color;
      updateWoodSwatches(key);
      renderPreview(); renderMaterial();
    });
    input.addEventListener('change', () => { renderWorkshopPlan(); commit(); });
  });
  holder.querySelectorAll('[data-remove-custom]').forEach(button => {
    button.addEventListener('click', event => {
      const key = event.currentTarget.dataset.removeCustom;
      if (customWoodIsUsed(key)) return toast('Change every use of this wood before removing it');
      delete state.customWoods[key];
      delete state.woodPrices[key];
      delete WOODS[key];
      buildCustomWoodEditor(); buildStripEditor(); buildBorderEditor(); syncInputs(); commit();
    });
  });
}

function buildBorderEditor() {
  const holder = $('borderEditor');
  holder.innerHTML = '';
  state.borderBands.forEach((band, index) => {
    const row = document.createElement('div');
    row.className = 'border-row';
    row.innerHTML = `
      <span class="swatch" data-wood-swatch="${band.wood}" style="background:${WOODS[band.wood]?.color || '#999'}"></span>
      <label>Band ${index + 1}<input data-border-width="${index}" type="number" min="0.0625" max="6" step="0.0625" value="${number(band.width).toFixed(4)}"></label>
      <label>Wood<select data-border-wood="${index}">${woodOptions(band.wood)}</select></label>
      <button class="text-button border-remove" data-remove-border="${index}" type="button" aria-label="Remove border band ${index + 1}">Remove</button>`;
    holder.append(row);
  });
  holder.querySelectorAll('[data-border-width]').forEach(input => {
    input.addEventListener('input', event => {
      state.borderBands[Number(event.target.dataset.borderWidth)].width = Math.max(0.0625, number(event.target.value));
      renderPreview(); renderMetrics(); renderMaterial();
    });
    input.addEventListener('change', commit);
  });
  holder.querySelectorAll('[data-border-wood]').forEach(select => {
    select.addEventListener('change', event => {
      const index = Number(event.target.dataset.borderWood);
      state.borderBands[index].wood = event.target.value;
      buildBorderEditor(); renderPreview(); renderMaterial(); commit();
    });
  });
  holder.querySelectorAll('[data-remove-border]').forEach(button => {
    button.addEventListener('click', event => {
      const index = Number(event.currentTarget.dataset.removeBorder);
      state.borderBands.splice(index, 1);
      if (!state.borderBands.length) state.includeBorders = false;
      render(); commit();
    });
  });
}

function buildStripEditor() {
  const holder = $('stripEditor');
  holder.innerHTML = '';
  state.strips.forEach((strip, index) => {
    const pairOffset = Math.min(index, state.strips.length - index - 1);
    const pairName = state.strips.length % 2 === 1 && index === Math.floor(state.strips.length / 2)
      ? stripOffsetLabel(index, state.strips.length)
      : `${pairOffset + 1}A/${pairOffset + 1}B`;
    const row = document.createElement('div');
    row.className = `strip-row${highlightedStripIndices.includes(index) ? ' new-strip' : ''}`;
    row.dataset.stripPairOffset = String(pairOffset);
    row.innerHTML = `
      <span class="swatch" data-wood-swatch="${strip.wood}" style="background:${WOODS[strip.wood]?.color || '#999'}"></span>
      <label>Strip ${stripOffsetLabel(index, state.strips.length)}<input data-strip-width="${index}" type="number" min="0.03125" max="3" step="0.03125" value="${number(strip.width).toFixed(4)}"></label>
      <label>Wood<select data-strip-wood="${index}">${woodOptions(strip.wood)}</select></label>
      <div class="strip-meta"><span class="strip-rough-rip">Recommended rough rip: ~${recommendedRoughRip(strip.width).toFixed(4)} in</span><button class="text-button strip-pair-remove" data-remove-strip-pair="${pairOffset}" type="button">Remove ${pairName}</button></div>`;
    holder.append(row);
  });

  holder.querySelectorAll('[data-strip-width]').forEach(input => {
    input.addEventListener('input', event => {
      const index = Number(event.target.dataset.stripWidth);
      state.strips[index].width = Math.max(0.03125, number(event.target.value));
      const meta = event.target.closest('.strip-row')?.querySelector('.strip-rough-rip');
      if (meta) meta.textContent = `Recommended rough rip: ~${recommendedRoughRip(state.strips[index].width).toFixed(4)} in`;
      renderPreview();
      renderMetrics();
      renderMaterial();
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
      renderMaterial();
      commit();
    });
  });
  holder.querySelectorAll('[data-remove-strip-pair]').forEach(button => {
    const highlight = active => {
      holder.querySelectorAll(`[data-strip-pair-offset="${button.dataset.removeStripPair}"]`).forEach(row => row.classList.toggle('pair-remove-active', active));
    };
    button.addEventListener('mouseenter', () => highlight(true));
    button.addEventListener('mouseleave', () => highlight(false));
    button.addEventListener('focus', () => highlight(true));
    button.addEventListener('blur', () => highlight(false));
    button.addEventListener('click', event => removeStripPair(event.currentTarget.dataset.removeStripPair));
  });
  buildInlineStripPairControls();
}

function buildInlineStripPairControls() {
  const holder = $('stripEditor');
  const rows = [...holder.querySelectorAll('.strip-row')];
  if (!rows.length) return;
  for (let gap = rows.length; gap >= 0; gap -= 1) {
    const offset = Math.min(gap, rows.length - gap);
    const control = document.createElement('div');
    control.className = 'strip-insertion-control';
    control.dataset.pairOffset = String(offset);
    const pairName = `${offset + 1}A/${offset + 1}B`;
    control.innerHTML = `<button type="button" data-add-strip-pair="${offset}" aria-label="Add mirrored strip pair ${pairName} at this position">+ Add ${pairName}</button>`;
    holder.insertBefore(control, rows[gap] || null);
  }
  holder.querySelectorAll('.strip-insertion-control').forEach(control => {
    const highlight = active => {
      holder.querySelectorAll(`[data-pair-offset="${control.dataset.pairOffset}"]`).forEach(match => match.classList.toggle('pair-location-active', active));
    };
    control.addEventListener('mouseenter', () => highlight(true));
    control.addEventListener('mouseleave', () => highlight(false));
    control.querySelector('button').addEventListener('focus', () => highlight(true));
    control.querySelector('button').addEventListener('blur', () => highlight(false));
    control.querySelector('button').addEventListener('click', event => addStripPair(event.currentTarget.dataset.addStripPair));
  });
}

function addStripPair(offset) {
  const pair = [{ width: 0.125, wood: 'maple' }, { width: 0.125, wood: 'maple' }];
  const count = state.strips.length;
  const leftGap = clamp(Math.round(number(offset)), 0, Math.floor(count / 2));
  const rightGap = count - leftGap;
  state.strips.splice(rightGap, 0, pair[1]);
  state.strips.splice(leftGap, 0, pair[0]);
  highlightedStripIndices = [leftGap, rightGap + 1];
  render(); commit();
  setTimeout(() => {
    highlightedStripIndices = [];
    document.querySelectorAll('.strip-row.new-strip').forEach(row => row.classList.remove('new-strip'));
  }, 1600);
}

function removeStripPair(offset) {
  if (state.strips.length <= 2) return toast('Keep at least two strips');
  const left = clamp(Math.round(number(offset)), 0, Math.floor((state.strips.length - 1) / 2));
  const right = state.strips.length - left - 1;
  state.strips.splice(right, 1);
  if (left !== right) state.strips.splice(left, 1);
  render(); commit();
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
  const actual = actualBoardDimensions();
  $('moduleWidthMetric').textContent = `${lamination.recommended.toFixed(3)} in`;
  $('crosscutMetric').textContent = x.crosscutCount ? String(x.crosscutCount) : '—';
  $('laminatedRowMetric').textContent = String(borderEngineering().selectedRows);
  $('boardSizeMetric').textContent = `${actual.length.toFixed(3)} × ${actual.width.toFixed(3)} in`;
  const actualWarning = $('actualBoardWarning');
  actualWarning.hidden = actual.matchesRequested;
  actualWarning.textContent = actual.matchesRequested
    ? ''
    : `⚠ Requested ${actual.requestedLength.toFixed(3)} × ${actual.requestedWidth.toFixed(3)} in. Adjust rows, borders, or requested size.`;
  $('actualBoardMetricCard').classList.toggle('metric-has-warning', !actual.matchesRequested);
  $('thicknessMetric').textContent = `${number(state.finishedThickness).toFixed(3)} in`;
  $('edgeInsetLabel').textContent = `${number(state.edgeInset).toFixed(3)} in`;
  document.querySelectorAll('[data-inset]').forEach(button => button.classList.toggle('active', Math.abs(number(button.dataset.inset) - number(state.edgeInset)) < 1e-9));
  const border = borderEngineering();
  $('borderFields').hidden = !state.includeBorders;
  $('diamondFieldMetric').textContent = state.includeBorders
    ? `${actual.length.toFixed(3)} × ${border.diamondFieldWidth.toFixed(3)} in`
    : `${actual.length.toFixed(3)} × ${actual.width.toFixed(3)} in (full board)`;
  $('borderMaterialMetric').textContent = state.includeBorders
    ? `${border.bands.length} band${border.bands.length === 1 ? '' : 's'} per edge; ${border.effectiveWidth.toFixed(3)} in total per edge`
    : 'No border material required';
  $('requiredBorderMetric').textContent = state.includeBorders ? `${border.requiredWidth.toFixed(4)} in per edge` : 'Not applicable';
  $('borderDifferenceMetric').textContent = !state.includeBorders
    ? 'Borders off'
    : border.scheduleMatches
      ? 'Matched ✓'
      : `${Math.abs(border.difference).toFixed(4)} in ${border.difference < 0 ? 'still needed' : 'too wide'} per edge`;
  $('borderWarning').hidden = border.valid;
  $('borderWarning').textContent = !border.rowsFit
    ? `${border.selectedRows} laminated rows exceed the ${number(state.boardWidth).toFixed(3)} in finished width. Reduce the laminated-row count.`
    : `Adjust the border bands to total ${border.requiredWidth.toFixed(4)} in per edge.`;
}

function renderMaterial() {
  const plan = materialQuantity();
  const recommendedWaste = recommendedWastePercent();
  $('wasteRecommendation').textContent = `Recommended minimum for this design: ${recommendedWaste}% (${number(state.edgeInset) > 0 ? 'Edge Rip selected' : 'no Edge Rip'}).`;
  $('useRecommendedWasteBtn').hidden = !state.wasteIsManual && Math.abs(number(state.wastePercent) - recommendedWaste) < 1e-9;
  $('wasteWarning').hidden = number(state.wastePercent) >= recommendedWaste;
  $('wasteWarning').textContent = `Waste allowance is below the recommended ${recommendedWaste}% for this design.`;
  $('materialTableBody').innerHTML = plan.rows.map(row => {
    const parts = [];
    if (row.components.diamondLaminate) parts.push('Diamond laminate');
    if (row.components.edgeRip) parts.push('Edge Rip');
    if (row.components.borders) parts.push('Borders');
    return `<tr><td><strong>${WOODS[row.species]?.name || row.species}</strong><small>${parts.join(' + ')}</small></td><td>${row.finishedCubicInches.toFixed(2)}</td><td>${row.netBoardFeet.toFixed(3)}</td><td>${row.purchaseBoardFeet.toFixed(3)}</td><td><input class="price-input" data-wood-price="${row.species}" type="number" min="0" step="0.01" value="${row.pricePerBoardFoot.toFixed(2)}" aria-label="${WOODS[row.species]?.name || row.species} price per board foot"></td><td data-species-cost="${row.species}">$${row.estimatedCost.toFixed(2)}</td></tr>`;
  }).join('');
  $('materialNetMetric').textContent = `${plan.totalNetBoardFeet.toFixed(3)} bd ft`;
  $('materialPurchaseMetric').textContent = `${plan.totalPurchaseBoardFeet.toFixed(3)} bd ft`;
  $('materialCostMetric').textContent = `$${plan.totalEstimatedCost.toFixed(2)}`;
  $('materialVolumeHelp').textContent = `${plan.designedVolume.toFixed(2)} cu in in the actual buildable board.`;
  $('materialGapWarning').hidden = plan.unfilledVolume <= 0.01;
  $('materialGapWarning').textContent = `${plan.unfilledVolume.toFixed(2)} cu in remains unfilled within the actual buildable dimensions.`;
  document.querySelectorAll('[data-wood-price]').forEach(input => {
    input.addEventListener('input', event => {
      state.woodPrices[event.target.dataset.woodPrice] = Math.max(0, number(event.target.value));
      const updated = materialQuantity();
      updated.rows.forEach(row => {
        const cell = document.querySelector(`[data-species-cost="${row.species}"]`);
        if (cell) cell.textContent = `$${row.estimatedCost.toFixed(2)}`;
      });
      $('materialCostMetric').textContent = `$${updated.totalEstimatedCost.toFixed(2)}`;
    });
    input.addEventListener('change', commit);
  });
}

function guideWood(wood) {
  return WOODS[wood]?.color || '#b9aa98';
}

function guideArrow(x1, y1, x2, y2, label = '') {
  return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" class="guide-arrow" marker-end="url(#guide-arrowhead)"/>${label ? `<text x="${(x1 + x2) / 2}" y="${Math.min(y1, y2) - 7}" text-anchor="middle">${label}</text>` : ''}`;
}

function guideSvg(content, label) {
  return `<svg class="guide-svg" viewBox="0 0 420 190" role="img" aria-label="${label}"><defs><marker id="guide-arrowhead" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0 0 L8 4 L0 8 Z" fill="#8f431f"/></marker><pattern id="guide-kerf" width="8" height="8" patternUnits="userSpaceOnUse"><path d="M-2 8 L8 -2 M2 10 L10 2" stroke="#c23b22" stroke-width="2"/></pattern></defs>${content}</svg>`;
}

function buildGuideVisuals(crosscuts, border, lamination) {
  const strips = activeStrips();
  const actual = actualBoardDimensions();
  const firstCrosscutTurned = state.glueUpPhase === 1;
  const glueUpLabel = firstCrosscutTurned ? 'Crosscut 1 turned 180°' : 'Crosscut 1 kept as cut';
  const glueUpInstruction = firstCrosscutTurned
    ? 'Turn Crosscut 1 180°, keep Crosscut 2 as cut, then continue alternating.'
    : 'Keep Crosscut 1 as cut, turn Crosscut 2 180°, then continue alternating.';
  const total = Math.max(moduleWidth(), 0.001);
  let stripX = 40;
  const stripBlocks = strips.map((strip, index) => {
    const width = 340 * number(strip.width) / total;
    const block = `<rect x="${stripX.toFixed(2)}" y="58" width="${width.toFixed(2)}" height="74" fill="${guideWood(strip.wood)}"/><text x="${(stripX + width / 2).toFixed(2)}" y="150" text-anchor="middle">${stripOffsetLabel(index, strips.length)}</text>`;
    stripX += width;
    return block;
  }).join('');
  let squareStripX = 145;
  const squareStripBlocks = strips.map((strip, index) => {
    const width = 130 * number(strip.width) / total;
    const block = `<rect x="${squareStripX.toFixed(2)}" y="30" width="${width.toFixed(2)}" height="130" fill="${guideWood(strip.wood)}"/><text x="${(squareStripX + width / 2).toFixed(2)}" y="177" text-anchor="middle">${stripOffsetLabel(index, strips.length)}</text>`;
    squareStripX += width;
    return block;
  }).join('');
  const pieceCount = Math.min(crosscuts.crosscutCount, 12);
  const pieceWidth = 310 / Math.max(pieceCount, 1);
  const pieces = Array.from({ length: pieceCount }, (_, index) => `<rect x="${48 + index * pieceWidth}" y="65" width="${Math.max(5, pieceWidth - 3)}" height="62" fill="${index % 2 ? guideWood(state.edgeWood) : guideWood(strips[index % strips.length]?.wood)}"/><line x1="${48 + (index + 1) * pieceWidth - 1.5}" y1="54" x2="${48 + (index + 1) * pieceWidth - 1.5}" y2="138" class="guide-cut"/>`).join('');
  const diamonds = Array.from({ length: 8 }, (_, index) => {
    const col = index % 4;
    const row = Math.floor(index / 4);
    const cx = 90 + col * 80;
    const cy = 62 + row * 72;
    return `<polygon points="${cx},${cy - 30} ${cx + 36},${cy} ${cx},${cy + 30} ${cx - 36},${cy}" fill="${guideWood(strips[0]?.wood)}" stroke="${guideWood(state.edgeWood)}" stroke-width="9"/><polygon points="${cx},${cy - 15} ${cx + 18},${cy} ${cx},${cy + 15} ${cx - 18},${cy}" fill="${guideWood(strips[Math.floor(strips.length / 2)]?.wood)}"/>`;
  }).join('');
  const assignedCount = Math.max(0, crosscuts.crosscutCount);
  const assignedSize = Math.min(52, 340 / Math.max(assignedCount, 1));
  const assignedStart = 210 - assignedCount * assignedSize / 2;
  const assignedCrosscuts = Array.from({ length: assignedCount }, (_, index) => {
    const x = assignedStart + index * assignedSize;
    const center = x + assignedSize / 2;
    const cy = 94;
    const radius = assignedSize * 0.46;
    const inner = radius * 0.53;
    return `<polygon points="${center.toFixed(2)},${(cy - radius).toFixed(2)} ${(center + radius).toFixed(2)},${cy} ${center.toFixed(2)},${(cy + radius).toFixed(2)} ${(center - radius).toFixed(2)},${cy}" fill="${guideWood(strips[0]?.wood)}" stroke="${guideWood(strips.at(-1)?.wood)}" stroke-width="${Math.max(2, assignedSize * .12).toFixed(2)}"/><polygon points="${center.toFixed(2)},${(cy - inner).toFixed(2)} ${(center + inner).toFixed(2)},${cy} ${center.toFixed(2)},${(cy + inner).toFixed(2)} ${(center - inner).toFixed(2)},${cy}" fill="${guideWood(strips[Math.floor(strips.length / 2)]?.wood)}"/><text x="${center.toFixed(2)}" y="${(cy + 4).toFixed(2)}" text-anchor="middle">${index + 1}</text>`;
  }).join('');
  const edgeRipSelected = number(state.edgeInset) > 0.0005;
  const edgeRipSpecies = WOODS[state.edgeWood]?.name || state.edgeWood;
  const ripTargetWood = strips.some(strip => strip.wood === 'walnut') ? 'walnut' : strips[Math.floor(strips.length / 2)]?.wood;
  const ripTargetSpecies = WOODS[ripTargetWood]?.name || ripTargetWood;
  const edgeRipSteps = edgeRipSelected ? [{
    title: 'Cut the Edge Rip after the 45° cuts',
    text: `Use the completed 45° piece. Cut across the ${ripTargetSpecies} section to the selected ${number(state.edgeInset).toFixed(3)} in depth, creating the two angled shoulders shown below.`,
    svg: guideSvg(`<defs><clipPath id="guide-edge-octagon"><polygon points="155,20 265,20 305,60 305,130 265,170 155,170 115,130 115,60"/></clipPath></defs><g clip-path="url(#guide-edge-octagon)"><rect x="115" y="20" width="190" height="150" fill="${guideWood(strips[0]?.wood)}"/><rect x="115" y="55" width="190" height="24" fill="${guideWood(strips[1]?.wood)}"/><rect x="115" y="79" width="190" height="32" fill="${guideWood(ripTargetWood)}"/><rect x="115" y="111" width="190" height="24" fill="${guideWood(strips.at(-2)?.wood)}"/></g><polygon points="155,20 265,20 305,60 305,130 265,170 155,170 115,130 115,60" fill="none" stroke="#33261e" stroke-width="3"/><line x1="115" y1="79" x2="142" y2="95" class="guide-center-cut"/><line x1="278" y1="95" x2="305" y2="111" class="guide-center-cut"/><text x="72" y="72" class="guide-edge-label">CUT</text><path d="M92 76 L120 84" class="guide-arrow" marker-end="url(#guide-arrowhead)"/><text x="330" y="121" class="guide-edge-label">CUT</text><path d="M326 112 L300 105" class="guide-arrow" marker-end="url(#guide-arrowhead)"/>`, `Octagonal 45-degree piece with Edge Rip cuts across the ${ripTargetSpecies} section`)
  }, {
    title: `Glue the new 45° ${edgeRipSpecies} to the cut edges`,
    text: `Prepare matching 45° ${edgeRipSpecies} replacement pieces. Glue them directly to the freshly cut ${ripTargetSpecies} edges, keeping both mirrored assemblies aligned.`,
    svg: guideSvg(`<text x="95" y="22" text-anchor="middle">Two solid ${edgeRipSpecies} pieces</text><polygon points="28,62 82,95 28,128" fill="${guideWood(state.edgeWood)}" stroke="#6e5a4b" stroke-width="3"/><polygon points="162,62 108,95 162,128" fill="${guideWood(state.edgeWood)}" stroke="#6e5a4b" stroke-width="3"/><path d="M175 95 H205" class="guide-arrow" marker-end="url(#guide-arrowhead)"/><text x="303" y="22" text-anchor="middle">Finished square</text><rect x="225" y="30" width="150" height="130" fill="${guideWood(strips[0]?.wood)}"/><rect x="225" y="62" width="150" height="20" fill="${guideWood(strips[1]?.wood)}"/><rect x="250" y="82" width="100" height="36" fill="${guideWood(ripTargetWood)}"/><polygon points="225,82 250,100 225,118" fill="${guideWood(state.edgeWood)}" stroke="#6e5a4b" stroke-width="1"/><polygon points="375,82 350,100 375,118" fill="${guideWood(state.edgeWood)}" stroke="#6e5a4b" stroke-width="1"/><rect x="225" y="118" width="150" height="20" fill="${guideWood(strips.at(-2)?.wood)}"/><rect x="225" y="30" width="150" height="130" fill="none" stroke="#33261e" stroke-width="3"/><text x="300" y="181" text-anchor="middle">${edgeRipSpecies} + straight ${ripTargetSpecies} center</text>`, `Two solid ${edgeRipSpecies} pieces followed by a finished square with a straight ${ripTargetSpecies} center and one piece on each end`)
  }] : [];
  const borderTop = state.includeBorders ? border.bands.reduce((html, band, index) => html + `<rect x="45" y="${30 + index * 8}" width="330" height="8" fill="${guideWood(band.wood)}"/>`, '') : '';
  const borderBottom = state.includeBorders ? border.bands.reduce((html, band, index) => html + `<rect x="45" y="${152 - index * 8}" width="330" height="8" fill="${guideWood(band.wood)}"/>`, '') : '';
  const masterX = 125;
  const masterY = 20;
  const masterWidth = 170;
  const masterHeight = 150;
  const totalBoardWidth = Math.max(actual.width, 0.001);
  const visualBorderWidth = state.includeBorders ? masterWidth * border.effectiveWidth / totalBoardWidth : 0;
  const fieldX = masterX + visualBorderWidth;
  const fieldWidth = masterWidth - 2 * visualBorderWidth;
  let masterStripX = fieldX;
  const masterStrips = strips.map(strip => {
    const width = fieldWidth * number(strip.width) / total;
    const shape = `<rect x="${masterStripX.toFixed(2)}" y="${masterY}" width="${width.toFixed(2)}" height="${masterHeight}" fill="${guideWood(strip.wood)}"/>`;
    masterStripX += width;
    return shape;
  }).join('');
  const leftMasterBorders = state.includeBorders ? border.bands.reduce((html, band) => {
    const width = visualBorderWidth * band.width / Math.max(border.effectiveWidth, 0.001);
    const prior = Number((html.match(/data-used="([\d.]+)"/) || [])[1] || 0);
    return html.replace(/<meta data-used="[\d.]+">/, '') + `<rect x="${(masterX + prior).toFixed(2)}" y="${masterY}" width="${width.toFixed(2)}" height="${masterHeight}" fill="${guideWood(band.wood)}"/><meta data-used="${prior + width}">`;
  }, '<meta data-used="0">').replace(/<meta data-used="[\d.]+">/, '') : '';
  let rightBorderX = masterX + masterWidth - visualBorderWidth;
  const rightMasterBorders = state.includeBorders ? border.bands.map(band => {
    const width = visualBorderWidth * band.width / Math.max(border.effectiveWidth, 0.001);
    const shape = `<rect x="${rightBorderX.toFixed(2)}" y="${masterY}" width="${width.toFixed(2)}" height="${masterHeight}" fill="${guideWood(band.wood)}"/>`;
    rightBorderX += width;
    return shape;
  }).join('') : '';
  const masterBlankTop = `<rect x="${masterX}" y="${masterY}" width="${masterWidth}" height="${masterHeight}" fill="#eee"/>${leftMasterBorders}${masterStrips}${rightMasterBorders}<rect x="${masterX}" y="${masterY}" width="${masterWidth}" height="${masterHeight}" fill="none" stroke="#33261e" stroke-width="2"/>`;
  const shownCutCount = Math.max(1, crosscuts.crosscutCount);
  const cutGap = masterHeight / shownCutCount;
  const topCrosscutLines = Array.from({ length: shownCutCount - 1 }, (_, index) => `<line x1="${masterX}" y1="${(masterY + (index + 1) * cutGap).toFixed(2)}" x2="${masterX + masterWidth}" y2="${(masterY + (index + 1) * cutGap).toFixed(2)}" class="guide-center-cut"/>`).join('');
  const steps = [
    { title: 'Prepare the lumber', text: 'Mill the selected lumber square and straight, and make sure to include extra allowance for planing and sanding.', svg: guideSvg(`${strips.map((strip, i) => `<rect x="${43 + i * 55}" y="58" width="46" height="46" rx="3" fill="${guideWood(strip.wood)}"/><text x="${66 + i * 55}" y="124" text-anchor="middle">${stripOffsetLabel(i, strips.length)}</text>`).join('')}<text x="210" y="28" text-anchor="middle">Allow extra material for planing and sanding</text>`, 'Selected lumber milled square with extra planing and sanding allowance') },
    { title: 'Rip the laminate strips', text: `Rough-rip every strip about 1/16 in wider than its finished design width. Joint and plane consistently; the assembled blank must finish at least ${lamination.recommended.toFixed(3)} in before the 45° cuts.`, svg: guideSvg(`<rect x="48" y="62" width="324" height="66" fill="${guideWood(strips[0]?.wood)}"/>${[1,2,3,4,5].map(i => `<line x1="${48 + i * 54}" y1="48" x2="${48 + i * 54}" y2="142" class="guide-cut"/>`).join('')}<text x="210" y="32" text-anchor="middle">Rip oversize → finish to schedule</text>`, 'Rip lines through rough lumber') },
    { title: 'Dry-fit the strip order', text: 'Arrange the pieces in the exact A/B pair order shown below. Confirm the wood colors and symmetry before applying glue.', svg: guideSvg(`${squareStripBlocks}<rect x="145" y="30" width="130" height="130" fill="none" stroke="#222" stroke-width="2"/><text x="210" y="18" text-anchor="middle">Square laminate · ${total.toFixed(4)} in module</text>`, 'Color-coded square laminate strip order') },
    { title: 'Glue and flatten the laminated blank', text: `Apply glue evenly, clamp across the full blank, then flatten it. The finished blank must be a ${lamination.recommended.toFixed(3)} × ${lamination.recommended.toFixed(3)} in square before continuing.`, svg: guideSvg(`${squareStripBlocks}${guideArrow(112,95,148,95,'clamp')}${guideArrow(308,95,272,95,'clamp')}<rect x="145" y="30" width="130" height="130" fill="none" stroke="#222" stroke-width="2"/><path d="M145 19 H275 M134 30 V160" class="guide-dimension"/><text x="210" y="16" text-anchor="middle">${lamination.recommended.toFixed(3)} in</text><text x="123" y="99" text-anchor="middle" transform="rotate(-90 123 99)">${lamination.recommended.toFixed(3)} in</text>`, `Clamped ${lamination.recommended.toFixed(3)} inch square laminated blank`) },
    { title: 'Make the four 45° cuts', text: 'Mark the center of all four edges. Connect each center to the center of the next edge with a dotted line, then complete all four 45° cuts before beginning any Edge Rip operation.', svg: guideSvg(`${squareStripBlocks}<rect x="145" y="30" width="130" height="130" fill="none" stroke="#222" stroke-width="2"/><path d="M210 30 L275 95 L210 160 L145 95 Z" class="guide-center-cut" fill="none"/><circle cx="210" cy="30" r="4" class="guide-center-point"/><circle cx="275" cy="95" r="4" class="guide-center-point"/><circle cx="210" cy="160" r="4" class="guide-center-point"/><circle cx="145" cy="95" r="4" class="guide-center-point"/><text x="252" y="55">CUT</text><text x="250" y="139">CUT</text><text x="153" y="139">CUT</text><text x="151" y="55">CUT</text>`, 'Square laminate with four dotted 45-degree cuts') },
    ...edgeRipSteps,
    { title: 'Dry-fit the 45° cut pieces', text: 'Before crosscutting the long blanks, arrange the four 45° sections into two rows. Confirm that the angles, strip order, and mirrored faces meet cleanly.', svg: guideSvg(`${diamonds}<text x="210" y="178" text-anchor="middle">Two-row dry fit · check every joint before gluing</text>`, 'Two-row dry fit of the 45-degree cut pieces') },
    { title: state.includeBorders ? 'Glue the borders before crosscutting' : 'Prepare the full master blank', text: state.includeBorders ? `Glue the complete border schedule to both long outside edges of the master blank now. The borders must become part of the blank before any crosscuts are made.` : `Join the dry-fitted sections into the full master blank and verify at least ${crosscuts.requiredBlankLength.toFixed(3)} in of usable length before crosscutting.`, svg: guideSvg(`${masterBlankTop}<text x="210" y="187" text-anchor="middle">${state.includeBorders ? 'Borders glued to both long edges before crosscutting' : 'Full master blank ready for crosscut layout'}</text>`, state.includeBorders ? 'Top view of borders glued to the long master blank before crosscutting' : 'Top view of the full master blank before crosscutting') },
    { title: 'Mark the crosscuts from the top view', text: `With the completed master blank viewed from above, run each dotted cut line fully across its width. Mark ${crosscuts.crosscutCount} crosscuts at approximately ${crosscuts.roughCrosscut.toFixed(3)} in spacing, allowing for the editable ${crosscuts.bladeKerf.toFixed(3)} in blade kerf.`, svg: guideSvg(`${masterBlankTop}${topCrosscutLines}<path d="M305 ${masterY} V${(masterY + cutGap).toFixed(2)}" class="guide-dimension"/><text x="314" y="${(masterY + cutGap / 2 + 4).toFixed(2)}">${crosscuts.roughCrosscut.toFixed(3)} in</text>`, 'Top view of the completed master blank with dotted crosscut lines running across it') },
    { title: 'Lay out every assigned crosscut', text: `Keep the pieces in order. Lay out all ${assignedCount} crosscuts assigned to this build in one diamond row as shown below. ${glueUpInstruction} Mirror adjacent faces so the bands close into the selected diamond placement.`, svg: guideSvg(`<path d="M38 52 H382" stroke="${guideWood(state.edgeWood)}" stroke-width="10"/>${assignedCrosscuts}<path d="M38 136 H382" stroke="${guideWood(state.edgeWood)}" stroke-width="10"/><text x="210" y="20" text-anchor="middle">${assignedCount} crosscut${assignedCount === 1 ? '' : 's'} · ${glueUpLabel}</text>${guideArrow(115,166,185,166,'continue alternating')}`, `All assigned crosscuts with ${glueUpLabel.toLowerCase()}`) },
    { title: 'Flatten, trim, sand, and finish', text: `Flatten both faces, make only the cleanup cuts needed to square the board, ease the edges, sand, and apply a food-safe finish appropriate to your use. Actual buildable size: ${actual.length.toFixed(3)} × ${actual.width.toFixed(3)} × ${actual.thickness.toFixed(3)} in.`, svg: guideSvg(`<rect x="55" y="35" width="310" height="120" rx="7" fill="#b65c3d" stroke="#6e5a4b" stroke-width="5"/>${diamonds}<path d="M55 171 H365" class="guide-dimension"/><text x="210" y="186" text-anchor="middle">${actual.length.toFixed(3)} × ${actual.width.toFixed(3)} × ${actual.thickness.toFixed(3)} in actual</text>`, 'Finished cutting board with actual buildable dimensions') }
  ];
  return steps.map((step, index) => `<article class="guide-step"><div class="guide-step-number">${index + 1}</div><div class="guide-copy"><h3>${step.title}</h3><p>${step.text}</p></div>${step.svg}</article>`).join('');
}

function materialsText() {
  return materialQuantity().rows.map(row => WOODS[row.species]?.name || row.species).join(', ');
}

function finishedBoardReferenceSvg() {
  const clone = $('boardSvg').cloneNode(true);
  clone.removeAttribute('id');
  const idMap = new Map();
  clone.querySelectorAll('[id]').forEach((element, index) => {
    const original = element.id;
    const replacement = `print-board-${index}-${original}`;
    idMap.set(original, replacement);
    element.id = replacement;
  });
  clone.querySelectorAll('*').forEach(element => {
    const fill = element.getAttribute('fill');
    const woodMatch = fill?.match(/^url\(#wood-([^)]+)\)$/);
    if (woodMatch && WOODS[woodMatch[1]]) element.setAttribute('fill', WOODS[woodMatch[1]].color);
    [...element.attributes].forEach(attribute => {
      let value = attribute.value;
      idMap.forEach((replacement, original) => { value = value.replaceAll(`url(#${original})`, `url(#${replacement})`).replaceAll(`#${original}`, `#${replacement}`); });
      if (value !== attribute.value) element.setAttribute(attribute.name, value);
    });
    element.removeAttribute('class');
    [...element.attributes].filter(attribute => attribute.name.startsWith('data-')).forEach(attribute => element.removeAttribute(attribute.name));
  });
  clone.setAttribute('class', 'print-board-reference');
  clone.setAttribute('aria-label', 'Finished board reference generated from this design');
  return new XMLSerializer().serializeToString(clone);
}

function renderWorkshopPlan() {
  const crosscuts = crosscutEngineering();
  const border = borderEngineering();
  const actual = actualBoardDimensions();
  const lamination = laminationRequirement();
  const materials = materialQuantity();
  const active = activeStrips();
  const stripRows = active.map((strip, index) => `<tr><td>${stripOffsetLabel(index, active.length)}</td><td>${WOODS[strip.wood]?.name || strip.wood}</td><td>${number(strip.width).toFixed(4)} in</td><td>${recommendedRoughRip(strip.width).toFixed(4)} in</td><td>1 per laminated blank</td></tr>`).join('');
  const borderRows = state.includeBorders
    ? border.bands.map((band, index) => `<tr><td>${index + 1}</td><td>${WOODS[band.wood]?.name || band.wood}</td><td>${band.width.toFixed(4)} in</td><td>${actual.length.toFixed(3)} in</td><td>2</td></tr>`).join('')
    : '<tr><td colspan="5">No borders selected</td></tr>';
  const materialRows = materials.rows.map(row => `<tr><td>${WOODS[row.species]?.name || row.species}</td><td>${row.finishedCubicInches.toFixed(2)}</td><td>${row.netBoardFeet.toFixed(3)}</td><td>${row.purchaseBoardFeet.toFixed(3)}</td><td>$${row.pricePerBoardFoot.toFixed(2)}</td><td>$${row.estimatedCost.toFixed(2)}</td></tr>`).join('');
  const masterBlankStep = state.includeBorders
    ? `<li>Glue the complete entered ${border.requestedWidth.toFixed(4)} in border schedule to both long edges of the master blank before crosscutting.</li>`
    : '<li>Join the dry-fitted sections into the full-width master blank; no border preparation is required.</li>';
  const materialKey = materials.rows.map(row => `<span class="guide-key-item"><i style="background:${guideWood(row.species)}"></i>${WOODS[row.species]?.name || row.species}: ${row.purchaseBoardFeet.toFixed(3)} bd ft</span>`).join('');
  const illustratedSteps = buildGuideVisuals(crosscuts, border, lamination);
  const boardReference = finishedBoardReferenceSvg();
  const edgeRipTargetWood = activeStrips().some(strip => strip.wood === 'walnut') ? 'walnut' : activeStrips()[Math.floor(activeStrips().length / 2)]?.wood;
  const edgeRipTargetSpecies = WOODS[edgeRipTargetWood]?.name || edgeRipTargetWood;
  const edgeRipChecklist = number(state.edgeInset) > 0.0005
    ? `<li>After all four 45° cuts are complete, cut the ${number(state.edgeInset).toFixed(3)} in Edge Rip across the ${edgeRipTargetSpecies} section.</li><li>Glue the new 45° ${WOODS[state.edgeWood]?.name || state.edgeWood} replacement pieces onto the freshly cut ${edgeRipTargetSpecies} edges.</li>`
    : '';
  const edgeRipSection = number(state.edgeInset) > 0.0005
    ? `<section><h2>Edge Rip</h2><p>Cut depth: <strong>${number(state.edgeInset).toFixed(3)} in</strong> · Replacement: <strong>${WOODS[state.edgeWood]?.name || state.edgeWood}</strong></p></section>`
    : '';
  const glueUpLabel = state.glueUpPhase === 1 ? 'Crosscut 1 turned 180°' : 'Crosscut 1 kept as cut';
  const glueUpChecklist = state.glueUpPhase === 1
    ? 'Turn Crosscut 1 180°, keep Crosscut 2 as cut, and continue alternating.'
    : 'Keep Crosscut 1 as cut, turn Crosscut 2 180°, and continue alternating.';
  $('printPlan').innerHTML = `
    <header><p class="print-eyebrow">Built By The Butts</p><h1>Diamond End Grain Workshop Plan</h1><p>Designer v${VERSION}</p></header>
    <section class="print-summary"><h2>Finished Design</h2><p><strong>Actual Board Dimensions: ${actual.length.toFixed(3)} × ${actual.width.toFixed(3)} × ${actual.thickness.toFixed(3)} in</strong></p>${actual.matchesRequested ? '' : `<p class="print-dimension-warning"><strong>Warning:</strong> Requested ${actual.requestedLength.toFixed(3)} × ${actual.requestedWidth.toFixed(3)} × ${actual.thickness.toFixed(3)} in. The actual dimensions use complete crosscuts, complete laminated rows, and the entered borders.</p>`}<p>${crosscuts.crosscutCount} crosscuts · ${border.selectedRows} laminated rows · ${state.includeBorders ? `${border.bands.length} border band${border.bands.length === 1 ? '' : 's'} per edge` : 'No borders'} · ${glueUpLabel}</p></section>
    <section class="print-board-section"><h2>Finished Board Reference</h2><p class="print-note">Keep this image available throughout the build to confirm wood placement, borders, and orientation.</p>${boardReference}</section>
    <section><h2>Lamination Engineering</h2><p>Required size before 45° cuts: <strong>${lamination.recommended.toFixed(3)} in</strong> (mathematical minimum ${lamination.minimum.toFixed(3)} in).</p><table><thead><tr><th>Strip</th><th>Species</th><th>Finished width</th><th>Rough rip</th><th>Quantity</th></tr></thead><tbody>${stripRows}</tbody></table></section>
    <section><h2>Crosscut Engineering</h2><table><tbody><tr><th>Calculated crosscuts</th><td>${crosscuts.crosscutCount}${crosscuts.isBalanced ? ' — balanced' : ' — unbalanced warning'}</td></tr><tr><th>Recommended rough crosscut</th><td>${crosscuts.roughCrosscut.toFixed(3)} in</td></tr><tr><th>Blade kerf</th><td>${crosscuts.bladeKerf.toFixed(3)} in</td></tr><tr><th>Required master blank</th><td>${crosscuts.requiredBlankLength.toFixed(3)} in</td></tr><tr><th>Projected finished run</th><td>${crosscuts.achievableLength.toFixed(3)} in</td></tr></tbody></table></section>
    ${edgeRipSection}
    <section><h2>Border Schedule</h2><p>Entered total per edge: <strong>${state.includeBorders ? `${border.requestedWidth.toFixed(4)} in` : 'Not applicable'}</strong>${state.includeBorders ? ` · Requested board width would require ${border.requiredWidth.toFixed(4)} in per edge.` : ''}${state.includeBorders && !border.scheduleMatches ? ` · The actual board therefore differs by ${Math.abs(border.difference * 2).toFixed(4)} in overall width.` : ''}</p><table><thead><tr><th>Band</th><th>Species</th><th>Width</th><th>Finished length</th><th>Quantity</th></tr></thead><tbody>${borderRows}</tbody></table></section>
    <section><h2>Material Quantity (Estimate)</h2><p>Waste allowance: ${materials.wastePercent.toFixed(1)}% · Estimated purchase: ${materials.totalPurchaseBoardFeet.toFixed(3)} bd ft · Estimated Wood Cost: $${materials.totalEstimatedCost.toFixed(2)}</p><table><thead><tr><th>Species</th><th>Cu in</th><th>Net BF</th><th>Buy BF</th><th>$/BF</th><th>Cost</th></tr></thead><tbody>${materialRows}</tbody></table><p class="print-note">Actual material use varies with stock selection, milling, defects, and individual shop practices.</p></section>
    <section><h2>Illustrated Build Procedure</h2><p class="print-note">Diagrams are generated from this design. Wood colors are a guide; actual boards vary.</p><div class="guide-key">${materialKey}</div><div class="guide-steps">${illustratedSteps}</div></section>
    <section><h2>Workshop Sequence — Quick Checklist</h2><ol><li>Review the design and keep the finished-board reference available.</li><li>Mill stock and rough-rip the laminate strips according to the strip schedule.</li><li>Dry-fit the strip order and confirm the species and symmetry.</li><li>Glue, flatten, and mill the blank to ${lamination.recommended.toFixed(3)} × ${lamination.recommended.toFixed(3)} in.</li><li>Mark all four adjacent-edge-center lines and complete the four 45° cuts.</li>${edgeRipChecklist}<li>Dry-fit the 45° cut sections in two rows and check the joints.</li>${masterBlankStep}<li>From the top view, run ${crosscuts.crosscutCount} dotted cut lines across the completed blank at approximately ${crosscuts.roughCrosscut.toFixed(3)} in spacing, using a ${crosscuts.bladeKerf.toFixed(3)} in kerf.</li><li>Lay out all ${crosscuts.crosscutCount} assigned crosscuts. ${glueUpChecklist}</li><li>Flatten, make only the cleanup cuts needed to square the board, and finish to the actual ${actual.length.toFixed(3)} × ${actual.width.toFixed(3)} × ${actual.thickness.toFixed(3)} in dimensions.</li></ol></section>`;
}

function render() {
  syncCustomWoods();
  renderPreview();
  renderEngineering();
  renderMetrics();
  renderMaterial();
  renderWorkshopPlan();
  buildStripEditor();
  buildBorderEditor();
  buildCustomWoodEditor();
  syncInputs();
  updateHistoryButtons();
}

function syncInputs() {
  $('boardLength').value = state.boardLength;
  $('boardWidth').value = state.boardWidth;
  $('finishedThickness').value = state.finishedThickness;
  $('includeBorders').checked = state.includeBorders;
  $('wastePercent').value = state.wastePercent;
  $('bladeKerf').value = state.bladeKerf;
  $('edgeInset').value = state.edgeInset;
  $('edgeWood').innerHTML = woodOptions(state.edgeWood);
  document.querySelectorAll('.glue-up-phase-control [data-glue-up-phase]').forEach(button => {
    const active = Number(button.dataset.glueUpPhase) === state.glueUpPhase;
    button.classList.toggle('active', active);
    button.setAttribute('aria-pressed', String(active));
  });
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
  state.glueUpPhase = Number(parsed.glueUpPhase) === 1 ? 1 : 0;
  state.wasteIsManual = Object.prototype.hasOwnProperty.call(parsed, 'wasteIsManual')
    ? Boolean(parsed.wasteIsManual)
    : Object.prototype.hasOwnProperty.call(parsed, 'wastePercent');
  applyAutomaticWasteRecommendation();
  state.customWoods = Object.fromEntries(Object.entries(parsed.customWoods || {})
    .filter(([key]) => /^custom-\d+$/.test(key))
    .map(([key, wood]) => [key, { name: sanitizeWoodName(wood?.name), color: validWoodColor(wood?.color) }]));
  state.nextCustomWoodId = Math.max(1, number(parsed.nextCustomWoodId) || 1, ...Object.keys(state.customWoods).map(key => number(key.split('-').at(-1)) + 1));
  syncCustomWoods();
  state.strips = Array.isArray(parsed.strips) && parsed.strips.length ? parsed.strips.map(strip => ({ width: Math.max(0.03125, number(strip.width)), wood: WOODS[strip.wood] ? strip.wood : 'maple' })) : defaultState().strips;
  const legacyBand = parsed.borderWidth ? [{ width: parsed.borderWidth, wood: parsed.borderWood }] : null;
  state.borderBands = Array.isArray(parsed.borderBands) && parsed.borderBands.length
    ? parsed.borderBands.map(band => ({ width: Math.max(0.0625, number(band.width)), wood: WOODS[band.wood] ? band.wood : 'maple' }))
    : (legacyBand || defaultState().borderBands);
  state.woodPrices = { ...defaultState().woodPrices, ...(parsed.woodPrices || {}) };
  delete state.laminatedRows;
  delete state.borderWidth;
  delete state.borderWood;
  if (!WOODS[state.edgeWood]) state.edgeWood = 'walnut';
  render();
}

function updateHistoryButtons() {
  $('undoBtn').disabled = history.length <= 1;
  $('redoBtn').disabled = future.length === 0;
}

function toast(message, kind = 'success', duration = 5000) {
  const el = $('toast');
  el.textContent = message;
  el.className = kind;
  el.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), duration);
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
  input.addEventListener('input', () => { state[key] = number(input.value); renderPreview(); renderEngineering(); renderMetrics(); renderMaterial(); });
  input.addEventListener('change', commit);
}

function bindEvents() {
  bindNumberInput('boardLength', 'boardLength');
  bindNumberInput('boardWidth', 'boardWidth');
  bindNumberInput('finishedThickness', 'finishedThickness');
  bindNumberInput('bladeKerf', 'bladeKerf');
  document.querySelectorAll('.glue-up-phase-control [data-glue-up-phase]').forEach(button => {
    button.addEventListener('click', () => {
      state.glueUpPhase = Number(button.dataset.glueUpPhase) === 1 ? 1 : 0;
      render();
      commit();
    });
  });
  $('wastePercent').addEventListener('input', event => {
    state.wastePercent = Math.max(0, number(event.target.value));
    state.wasteIsManual = true;
    renderMaterial();
  });
  $('wastePercent').addEventListener('change', commit);
  $('useRecommendedWasteBtn').addEventListener('click', () => {
    state.wasteIsManual = false;
    applyAutomaticWasteRecommendation();
    $('wastePercent').value = state.wastePercent;
    renderMaterial(); commit();
  });

  $('includeBorders').addEventListener('change', event => { state.includeBorders = event.target.checked; render(); commit(); });
  $('addBorderBandBtn').addEventListener('click', () => {
    state.borderBands.push({ width: 0.125, wood: 'maple' });
    state.includeBorders = true;
    render(); commit();
  });

  $('addCustomWoodBtn').addEventListener('click', () => {
    const key = `custom-${state.nextCustomWoodId}`;
    state.nextCustomWoodId += 1;
    state.customWoods[key] = { name: `Custom Wood ${key.split('-').at(-1)}`, color: '#9b7653' };
    state.woodPrices[key] = 0;
    syncCustomWoods();
    buildCustomWoodEditor(); buildStripEditor(); buildBorderEditor(); syncInputs(); commit();
    const nameInput = document.querySelector(`[data-custom-name="${key}"]`);
    nameInput?.focus(); nameInput?.select();
  });

  $('edgeInset').addEventListener('input', event => {
    state.edgeInset = number(event.target.value);
    applyAutomaticWasteRecommendation();
    $('wastePercent').value = state.wastePercent;
    renderPreview(); renderMetrics(); renderMaterial();
  });
  $('edgeInset').addEventListener('change', commit);
  $('edgeWood').addEventListener('change', event => { state.edgeWood = event.target.value; renderPreview(); renderMaterial(); commit(); });

  document.addEventListener('click', event => {
    const button = event.target.closest('[data-inset]');
    if (!button) return;
    state.edgeInset = number(button.dataset.inset);
    applyAutomaticWasteRecommendation();
    $('edgeInset').value = state.edgeInset;
    $('wastePercent').value = state.wastePercent;
    renderPreview(); renderMetrics(); renderMaterial(); commit();
  });

  $('resetStripsBtn').addEventListener('click', () => { state.strips = defaultState().strips; render(); commit(); });

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

  $('saveProjectBtn').addEventListener('click', () => {
    const fileName = 'diamond-end-grain-design-v3.json';
    download(fileName, 'application/json', JSON.stringify(state, null, 2));
    toast(`Project saved to Downloads: ${fileName}`);
  });
  $('openProjectBtn').addEventListener('click', () => {
    $('openProjectInput').value = '';
    $('openProjectInput').click();
  });
  $('openProjectInput').addEventListener('change', async event => {
    const file = event.target.files[0];
    if (!file) return;
    try {
      const beforeOpen = snapshot();
      restore(await file.text());
      const matchesCurrentDesign = snapshot() === beforeOpen;
      history = [snapshot()];
      future = [];
      commit();
      toast(matchesCurrentDesign
        ? `Project opened: ${file.name}. It matches the design already on screen.`
        : `Project opened: ${file.name}`);
    } catch (error) {
      console.error('Project open failed', error);
      toast('That project file could not be opened. Choose a Diamond End Grain Designer JSON file.', 'error', 7000);
    }
    event.target.value = '';
  });
  $('exportSvgBtn').addEventListener('click', () => {
    const clone = $('boardSvg').cloneNode(true);
    clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    download('diamond-end-grain-board-v3.svg', 'image/svg+xml;charset=utf-8', `<?xml version="1.0" encoding="UTF-8"?>\n${new XMLSerializer().serializeToString(clone)}`);
  });
  $('printPlanBtn').addEventListener('click', () => { renderWorkshopPlan(); window.print(); });
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
