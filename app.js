'use strict';

const VERSION = '3.0.23';
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
  borderBands: [{ width: 0.5, wood: 'maple' }],
  wastePercent: 15,
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
  const widthModuleCount = Math.max(1, Math.round(number(state.boardWidth) / module));
  return { lengthSliceCount, widthModuleCount, module };
}

function automaticLaminatedRows() {
  return Math.max(1, Math.round(number(state.boardWidth) / Math.max(0.125, moduleWidth())));
}

function borderEngineering() {
  const bands = state.borderBands.map(band => ({
    width: Math.max(0.0625, number(band.width)),
    wood: WOODS[band.wood] ? band.wood : 'maple'
  }));
  const requestedWidth = bands.reduce((sum, band) => sum + band.width, 0);
  const automaticRows = automaticLaminatedRows();
  const availableDiamondWidth = Math.max(0, number(state.boardWidth) - 2 * requestedWidth);
  const idealRows = availableDiamondWidth / Math.max(0.125, moduleWidth());
  const selectedRows = state.includeBorders
    ? Math.max(0, Math.floor(idealRows + 1e-12))
    : automaticRows;
  const diamondFieldWidth = selectedRows * Math.max(0.125, moduleWidth());
  const requiredWidth = state.includeBorders ? Math.max(0, (number(state.boardWidth) - diamondFieldWidth) / 2) : 0;
  const maximumWidth = Math.max(0, number(state.boardWidth) / 2 - 0.0625);
  const effectiveWidth = state.includeBorders ? Math.min(requestedWidth, maximumWidth) : 0;
  const difference = requestedWidth - requiredWidth;
  const borderVolume = state.includeBorders
    ? 2 * number(state.boardLength) * effectiveWidth * number(state.finishedThickness)
    : 0;
  const rowsFit = diamondFieldWidth <= number(state.boardWidth) + 0.0005;
  const scheduleMatches = Math.abs(difference) <= 0.0005;
  return { bands, automaticRows, availableDiamondWidth, idealRows, selectedRows, requestedWidth, requiredWidth, difference, effectiveWidth, maximumWidth, diamondFieldWidth, borderVolume, rowsFit, scheduleMatches, valid: !state.includeBorders || (rowsFit && scheduleMatches) };
}

function materialQuantity() {
  const border = borderEngineering();
  const crosscuts = crosscutEngineering();
  return DiamondMaterial.materialQuantityPlan({
    boardLength: state.boardLength, boardWidth: state.boardWidth,
    finishedThickness: state.finishedThickness,
    diamondFieldWidth: state.includeBorders ? border.diamondFieldWidth : state.boardWidth,
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

function renderBorders() {
  if (!state.includeBorders) return;
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
  let offsetPixels = 0;
  border.bands.forEach((band, index) => {
    const bandPixels = fieldH * band.width / Math.max(0.125, number(state.boardWidth));
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

  const border = borderEngineering();
  const rows = border.selectedRows;
  const cols = crosscutEngineering().crosscutCount;
  if (rows > 0 && cols > 0) {
    const diamondH = fieldH * border.diamondFieldWidth / Math.max(0.125, number(state.boardWidth));
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
        const rotate180 = col % 2 === 1;
        const slope = (row + col) % 2 === 0 ? 1 : -1;
        drawEndGrainCell(cellGroup, 0, 0, 100, slope, rotate180);
        diamondField.append(cellGroup);
      }
    }
    svg.append(diamondField);
  }

  renderBorders();
  svg.append(svgEl('rect', { x: fieldX, y: fieldY, width: fieldW, height: fieldH, rx: 5, fill: 'none', stroke: '#4d382d', 'stroke-width': '1.2' }));
}

function renderPreview() {
  if (state.includeBorders) renderBorderedBoard();
  else renderBoard();
}

function woodOptions(selected) {
  return Object.entries(WOODS).map(([key, wood]) => `<option value="${key}" ${key === selected ? 'selected' : ''}>${wood.name}</option>`).join('');
}

function buildBorderEditor() {
  const holder = $('borderEditor');
  holder.innerHTML = '';
  state.borderBands.forEach((band, index) => {
    const row = document.createElement('div');
    row.className = 'border-row';
    row.innerHTML = `
      <span class="swatch" style="background:${WOODS[band.wood]?.color || '#999'}"></span>
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
  $('laminatedRowMetric').textContent = String(borderEngineering().selectedRows);
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
  $('materialVolumeHelp').textContent = `${plan.designedVolume.toFixed(2)} cu in designed of ${plan.targetVolume.toFixed(2)} cu in target.`;
  $('materialGapWarning').hidden = plan.unfilledVolume <= 0.01;
  $('materialGapWarning').textContent = `${plan.unfilledVolume.toFixed(2)} cu in remains unfilled. Match the border schedule before using purchase totals.`;
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

function renderWorkshopPlan() {
  const crosscuts = crosscutEngineering();
  const border = borderEngineering();
  const lamination = laminationRequirement();
  const materials = materialQuantity();
  const stripRows = activeStrips().map((strip, index) => `<tr><td>${index + 1}</td><td>${WOODS[strip.wood]?.name || strip.wood}</td><td>${number(strip.width).toFixed(4)} in</td><td>${recommendedRoughRip(strip.width).toFixed(4)} in</td><td>1 per laminated blank</td></tr>`).join('');
  const borderRows = state.includeBorders
    ? border.bands.map((band, index) => `<tr><td>${index + 1}</td><td>${WOODS[band.wood]?.name || band.wood}</td><td>${band.width.toFixed(4)} in</td><td>${number(state.boardLength).toFixed(3)} in</td><td>2</td></tr>`).join('')
    : '<tr><td colspan="5">No borders selected</td></tr>';
  const materialRows = materials.rows.map(row => `<tr><td>${WOODS[row.species]?.name || row.species}</td><td>${row.finishedCubicInches.toFixed(2)}</td><td>${row.netBoardFeet.toFixed(3)}</td><td>${row.purchaseBoardFeet.toFixed(3)}</td><td>$${row.pricePerBoardFoot.toFixed(2)}</td><td>$${row.estimatedCost.toFixed(2)}</td></tr>`).join('');
  const borderStep = state.includeBorders
    ? `<li>Prepare two mirrored border schedules totaling ${border.requiredWidth.toFixed(4)} in per edge, then attach them to the complete diamond field.</li>`
    : '<li>Continue with the full-width diamond field; no border preparation is required.</li>';
  $('printPlan').innerHTML = `
    <header><p class="print-eyebrow">Built By The Butts</p><h1>Diamond End Grain Workshop Plan</h1><p>Designer v${VERSION}</p></header>
    <section class="print-summary"><h2>Finished Design</h2><p><strong>${number(state.boardLength).toFixed(3)} × ${number(state.boardWidth).toFixed(3)} × ${number(state.finishedThickness).toFixed(3)} in</strong></p><p>${crosscuts.crosscutCount} crosscuts · ${border.selectedRows} laminated rows · ${state.includeBorders ? `${border.bands.length} border band${border.bands.length === 1 ? '' : 's'} per edge` : 'No borders'}</p></section>
    <section><h2>Lamination Engineering</h2><p>Required size before 45° cuts: <strong>${lamination.recommended.toFixed(3)} in</strong> (mathematical minimum ${lamination.minimum.toFixed(3)} in).</p><table><thead><tr><th>Strip</th><th>Species</th><th>Finished width</th><th>Rough rip</th><th>Quantity</th></tr></thead><tbody>${stripRows}</tbody></table></section>
    <section><h2>Crosscut Engineering</h2><table><tbody><tr><th>Calculated crosscuts</th><td>${crosscuts.crosscutCount}${crosscuts.isBalanced ? ' — balanced' : ' — unbalanced warning'}</td></tr><tr><th>Recommended rough crosscut</th><td>${crosscuts.roughCrosscut.toFixed(3)} in</td></tr><tr><th>Blade kerf</th><td>${crosscuts.bladeKerf.toFixed(3)} in</td></tr><tr><th>Required master blank</th><td>${crosscuts.requiredBlankLength.toFixed(3)} in</td></tr><tr><th>Projected finished run</th><td>${crosscuts.achievableLength.toFixed(3)} in</td></tr></tbody></table></section>
    <section><h2>Edge Rip</h2><p>Cut depth: <strong>${number(state.edgeInset).toFixed(3)} in</strong> · Replacement: <strong>${WOODS[state.edgeWood]?.name || state.edgeWood}</strong></p></section>
    <section><h2>Border Schedule</h2><p>Required total per edge: <strong>${state.includeBorders ? `${border.requiredWidth.toFixed(4)} in` : 'Not applicable'}</strong>${state.includeBorders && !border.scheduleMatches ? ` · Current schedule needs adjustment by ${Math.abs(border.difference).toFixed(4)} in per edge.` : ''}</p><table><thead><tr><th>Band</th><th>Species</th><th>Width</th><th>Finished length</th><th>Quantity</th></tr></thead><tbody>${borderRows}</tbody></table></section>
    <section><h2>Material Quantity (Estimate)</h2><p>Waste allowance: ${materials.wastePercent.toFixed(1)}% · Estimated purchase: ${materials.totalPurchaseBoardFeet.toFixed(3)} bd ft · Estimated cost: $${materials.totalEstimatedCost.toFixed(2)}</p><table><thead><tr><th>Species</th><th>Cu in</th><th>Net BF</th><th>Buy BF</th><th>$/BF</th><th>Cost</th></tr></thead><tbody>${materialRows}</tbody></table><p class="print-note">Actual material use varies with stock selection, milling, defects, and individual shop practices.</p></section>
    <section><h2>Workshop Sequence</h2><ol><li>Review the complete design and confirm that all warnings are cleared or intentionally accepted.</li><li>Mill stock and rough-rip the laminate strips according to the strip schedule.</li><li>Glue the laminated blank and mill it to the required pre-45° size.</li><li>Make the validated 45° cuts, then complete the Edge Rip and replacement-stock operation.</li><li>Prepare at least ${crosscuts.requiredBlankLength.toFixed(3)} in of master blank and cut ${crosscuts.crosscutCount} pieces at approximately ${crosscuts.roughCrosscut.toFixed(3)} in using a ${crosscuts.bladeKerf.toFixed(3)} in kerf.</li><li>Rotate and mirror the crosscuts into ${border.selectedRows} complete laminated rows and glue the diamond field.</li>${borderStep}<li>Flatten, trim, and finish to ${number(state.boardLength).toFixed(3)} × ${number(state.boardWidth).toFixed(3)} × ${number(state.finishedThickness).toFixed(3)} in.</li></ol></section>`;
}

function render() {
  renderPreview();
  renderEngineering();
  renderMetrics();
  renderMaterial();
  renderWorkshopPlan();
  buildStripEditor();
  buildBorderEditor();
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
  input.addEventListener('input', () => { state[key] = number(input.value); renderPreview(); renderEngineering(); renderMetrics(); renderMaterial(); });
  input.addEventListener('change', commit);
}

function bindEvents() {
  bindNumberInput('boardLength', 'boardLength');
  bindNumberInput('boardWidth', 'boardWidth');
  bindNumberInput('finishedThickness', 'finishedThickness');
  bindNumberInput('bladeKerf', 'bladeKerf');
  bindNumberInput('wastePercent', 'wastePercent');

  $('includeBorders').addEventListener('change', event => { state.includeBorders = event.target.checked; render(); commit(); });
  $('addBorderBandBtn').addEventListener('click', () => {
    state.borderBands.push({ width: 0.125, wood: 'maple' });
    state.includeBorders = true;
    render(); commit();
  });

  $('edgeInset').addEventListener('input', event => { state.edgeInset = number(event.target.value); renderPreview(); renderMetrics(); renderMaterial(); });
  $('edgeInset').addEventListener('change', commit);
  $('edgeWood').addEventListener('change', event => { state.edgeWood = event.target.value; renderPreview(); renderMaterial(); commit(); });

  document.addEventListener('click', event => {
    const button = event.target.closest('[data-inset]');
    if (!button) return;
    state.edgeInset = number(button.dataset.inset);
    $('edgeInset').value = state.edgeInset;
    renderPreview(); renderMetrics(); renderMaterial(); commit();
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
