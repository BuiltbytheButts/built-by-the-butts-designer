const WOODS = {
  walnut: { name: 'Walnut', color: '#4b2d21' },
  purpleheart: { name: 'Purpleheart', color: '#694064' },
  cherry: { name: 'Cherry', color: '#a75b3d' },
  padauk: { name: 'Padauk', color: '#bc4a28' },
  maple: { name: 'Hard Maple', color: '#e4ca96' }
};

const DEFAULT_STRIPS = [
  { width: 0.500, wood: 'cherry', enabled: true },
  { width: 0.125, wood: 'maple', enabled: true },
  { width: 0.250, wood: 'walnut', enabled: true },
  { width: 0.125, wood: 'maple', enabled: true },
  { width: 0.500, wood: 'cherry', enabled: true }
];

let state = {
  version: '2.0.0', boardLength: 20, boardWidth: 12.75, columns: 8, rows: 5,
  layout: 'grid', orientation: '0', edgeInset: 0.500, spacing: 0,
  tipWood: 'walnut', showLines: true, showFrame: true, walnutPrice: 28, insetGoal: 'balanced', targetCenterPercent: 35,
  strips: structuredClone(DEFAULT_STRIPS)
};
let history = [];
let future = [];
let isRestoring = false;

const $ = id => document.getElementById(id);
const controls = ['boardLength','boardWidth','columns','rows','layout','orientation','edgeInset','spacing','tipWood','showLines','showFrame','walnutPrice','insetGoal','targetCenterPercent'];

function svgEl(name, attrs = {}) {
  const el = document.createElementNS('http://www.w3.org/2000/svg', name);
  for (const [k,v] of Object.entries(attrs)) el.setAttribute(k, v);
  return el;
}
function pts(a) { return a.map(([x,y]) => `${x},${y}`).join(' '); }
function activeStrips() { return state.strips.filter(x => x.enabled !== false); }
function totalWidth() { return activeStrips().reduce((s,x) => s + Number(x.width || 0), 0); }
function snapshot() { return JSON.stringify(state); }
function commit() {
  if (isRestoring) return;
  const current = snapshot();
  if (history.at(-1) !== current) history.push(current);
  if (history.length > 80) history.shift();
  future = [];
  updateUndoRedo();
  localStorage.setItem('bbtb-designer-autosave', current);
}
function restore(serialized) {
  isRestoring = true;
  state = JSON.parse(serialized);
  syncControls();
  buildStripEditor();
  render();
  isRestoring = false;
  localStorage.setItem('bbtb-designer-autosave', serialized);
}
function updateUndoRedo() {
  $('undoBtn').disabled = history.length <= 1;
  $('redoBtn').disabled = future.length === 0;
}
function toast(message) {
  const el = $('toast'); el.textContent = message; el.classList.add('show');
  clearTimeout(toast.t); toast.t = setTimeout(() => el.classList.remove('show'), 1800);
}

function woodOptions(selected) {
  return Object.entries(WOODS).map(([k,w]) => `<option value="${k}" ${k===selected?'selected':''}>${w.name}</option>`).join('');
}
function stripPairLabel(index) {
  const center = Math.floor(state.strips.length / 2);
  if (index === center && state.strips.length % 2 === 1) return 'C';
  const distance = Math.abs(index - center);
  return `P${distance || 1}`;
}

function buildStripEditor() {
  const holder = $('stripEditor');
  if (!holder) return;
  holder.innerHTML = '';
  state.strips.forEach((strip, i) => {
    if (strip.enabled === undefined) strip.enabled = true;
    const row = document.createElement('div');
    row.className = 'strip-row' + (strip.enabled ? '' : ' disabled');
    row.draggable = true;
    row.dataset.index = i;
    row.innerHTML = `
      <button class="drag-handle" type="button" title="Drag Strip ${i+1}" aria-label="Drag Strip ${i+1}">⋮⋮</button>
      <span class="swatch" style="background:${WOODS[strip.wood].color}"></span>
      <label class="strip-enable" title="Include Strip ${i+1}"><input data-enabled="${i}" type="checkbox" ${strip.enabled ? 'checked' : ''} aria-label="Use strip ${i+1}"></label>
      <label>Strip ${i+1}<input data-width="${i}" type="number" min="0.0625" max="3" step="0.0625" value="${Number(strip.width).toFixed(4)}"></label>
      <label>Wood<select data-wood="${i}">${woodOptions(strip.wood)}</select></label>`;
    holder.appendChild(row);
  });

  holder.querySelectorAll('[data-enabled]').forEach(el => el.addEventListener('change', e => {
    const idx = Number(e.target.dataset.enabled);
    state.strips[idx].enabled = e.target.checked;
    if (!activeStrips().length) state.strips[idx].enabled = true;
    buildStripEditor(); render(); commit();
  }));
  holder.querySelectorAll('[data-width]').forEach(el => el.addEventListener('input', e => {
    const idx = Number(e.target.dataset.width); const value = Number(e.target.value);
    if (value > 0) state.strips[idx].width = value;
    render();
  }));
  holder.querySelectorAll('[data-width]').forEach(el => el.addEventListener('change', () => { buildStripEditor(); render(); commit(); }));
  holder.querySelectorAll('[data-wood]').forEach(el => el.addEventListener('change', e => {
    state.strips[Number(e.target.dataset.wood)].wood = e.target.value;
    buildStripEditor(); render(); commit();
  }));

  let draggedIndex = null;
  holder.querySelectorAll('.strip-row').forEach(row => {
    row.addEventListener('dragstart', e => {
      draggedIndex = Number(row.dataset.index);
      row.classList.add('dragging');
      e.dataTransfer.effectAllowed = 'move';
    });
    row.addEventListener('dragend', () => {
      row.classList.remove('dragging');
      holder.querySelectorAll('.strip-row').forEach(r => r.classList.remove('drag-over'));
    });
    row.addEventListener('dragover', e => {
      e.preventDefault();
      row.classList.add('drag-over');
    });
    row.addEventListener('dragleave', () => row.classList.remove('drag-over'));
    row.addEventListener('drop', e => {
      e.preventDefault();
      const targetIndex = Number(row.dataset.index);
      if (draggedIndex === null || draggedIndex === targetIndex) return;
      const [moved] = state.strips.splice(draggedIndex, 1);
      state.strips.splice(targetIndex, 0, moved);
      buildStripEditor(); render(); commit(); toast('Strip order updated');
    });
  });
}

function addStripPair(position='outer') {
  const pair = [
    { width: 0.125, wood: 'maple', enabled: true },
    { width: 0.125, wood: 'maple', enabled: true }
  ];
  if (position === 'outer') {
    state.strips.unshift(pair[0]);
    state.strips.push(pair[1]);
  } else {
    const center = Math.floor(state.strips.length / 2);
    state.strips.splice(center, 0, pair[0]);
    state.strips.splice(center + 2, 0, pair[1]);
  }
  buildStripEditor(); render(); commit(); toast(`${position === 'outer' ? 'Outer' : 'Inner'} strip pair added`);
}

function removeStripPair() {
  if (state.strips.length <= 3) { toast('Keep at least 3 strips'); return; }
  state.strips.shift();
  state.strips.pop();
  buildStripEditor(); render(); commit(); toast('Outer strip pair removed');
}

function savedSchedules() {
  try { return JSON.parse(localStorage.getItem('bbtb-strip-schedules') || '{}'); }
  catch { return {}; }
}
function refreshSavedScheduleSelect(selected='') {
  const select = $('savedScheduleSelect'); if (!select) return;
  const names = Object.keys(savedSchedules()).sort();
  select.innerHTML = '<option value="">Choose a saved schedule</option>' + names.map(name => `<option value="${name.replace(/"/g,'&quot;')}">${name}</option>`).join('');
  if (selected) select.value = selected;
}
function saveCurrentSchedule() {
  const name = prompt('Name this strip schedule:');
  if (!name || !name.trim()) return;
  const schedules = savedSchedules();
  schedules[name.trim()] = structuredClone(state.strips);
  localStorage.setItem('bbtb-strip-schedules', JSON.stringify(schedules));
  refreshSavedScheduleSelect(name.trim()); toast('Strip schedule saved');
}
function loadSelectedSchedule() {
  const name = $('savedScheduleSelect')?.value; if (!name) { toast('Choose a saved schedule'); return; }
  const schedule = savedSchedules()[name]; if (!schedule) return;
  state.strips = structuredClone(schedule);
  buildStripEditor(); render(); commit(); toast(`Loaded ${name}`);
}
function deleteSelectedSchedule() {
  const name = $('savedScheduleSelect')?.value; if (!name) { toast('Choose a saved schedule'); return; }
  if (!confirm(`Delete “${name}”?`)) return;
  const schedules = savedSchedules(); delete schedules[name];
  localStorage.setItem('bbtb-strip-schedules', JSON.stringify(schedules));
  refreshSavedScheduleSelect(); toast('Saved schedule deleted');
}

function addPatterns(svg, prefix) {
  const defs = svgEl('defs');
  for (const [key,wood] of Object.entries(WOODS)) {
    const p = svgEl('pattern', { id:`${prefix}-${key}`, width:36, height:36, patternUnits:'userSpaceOnUse', patternTransform:'rotate(3)' });
    p.append(svgEl('rect',{width:36,height:36,fill:wood.color}));
    p.append(svgEl('path',{d:'M-5 9 C4 1 12 15 22 8 S34 4 42 12 M-6 27 C5 17 13 31 24 23 S36 19 43 29',fill:'none',stroke:'#fff','stroke-opacity':'.12','stroke-width':'1'}));
    p.append(svgEl('path',{d:'M5 0 C11 10 4 23 10 36 M24 0 C30 12 21 25 29 36',fill:'none',stroke:'#000','stroke-opacity':'.08','stroke-width':'1'}));
    defs.append(p);
  }
  svg.append(defs);
}

function drawModule(svg, cx, cy, size, angle, prefix) {
  const total = totalWidth(); if (!total) return;
  const h = size/2;
  const g = svgEl('g',{transform:`translate(${cx} ${cy}) rotate(${angle})`});
  let x = -h;
  activeStrips().forEach(strip => {
    const w = size * strip.width / total;
    const nx = x + w;
    const polygon = [[x,-h+Math.abs(x)],[nx,-h+Math.abs(nx)],[nx,h-Math.abs(nx)],[x,h-Math.abs(x)]];
    g.append(svgEl('polygon',{points:pts(polygon),fill:`url(#${prefix}-${strip.wood})`,stroke:state.showLines?'#241710':'none','stroke-width':state.showLines?'.55':'0'}));
    x = nx;
  });
  const insetRatio = Math.max(0.04, Math.min(0.46, Number(state.edgeInset || 0.5) / total));
  const inward = h * insetRatio;
  const base = Math.min(h*.48, inward + size*.075);
  const fill = `url(#${prefix}-${state.tipWood})`;
  g.append(svgEl('polygon',{points:pts([[0,-h],[base,-h+inward],[-base,-h+inward]]),fill,stroke:state.showLines?'#241710':'none','stroke-width':'.7'}));
  g.append(svgEl('polygon',{points:pts([[0,h],[-base,h-inward],[base,h-inward]]),fill,stroke:state.showLines?'#241710':'none','stroke-width':'.7'}));
  if (state.showLines) g.append(svgEl('polygon',{points:pts([[0,-h],[h,0],[0,h],[-h,0]]),fill:'none',stroke:'#241710','stroke-width':'1.25'}));
  svg.append(g);
}
function angleAt(r,c) {
  if (state.orientation === '45') return 45;
  if (state.orientation === '90') return 90;
  if (state.orientation === 'alternate') return (r+c)%2 ? -45 : 45;
  if (state.orientation === 'checker') return (r+c)%2 ? 90 : 0;
  return 0;
}
function renderBoard() {
  const svg = $('boardSvg'); svg.innerHTML = ''; addPatterns(svg,'board');
  if (state.showFrame) svg.append(svgEl('rect',{x:55,y:55,width:1090,height:650,rx:12,fill:'#f5efe7',stroke:'#9c8a7b','stroke-width':'3'}));
  const cols = Math.max(1,Number(state.columns));
  const rows = state.layout === 'single' ? 1 : Math.max(1,Number(state.rows));
  const spacing = state.spacing * 2.4;
  const size = Math.min(205, 1030/Math.max(cols*.71+.5,1), 600/Math.max(rows*.71+.5,1));
  const xStep = size*.707 + spacing, yStep = size*.707 + spacing;
  const tw = (cols-1)*xStep + size, th = (rows-1)*yStep + size;
  const sx = 600 - tw/2 + size/2, sy = 380 - th/2 + size/2;
  for (let r=0;r<rows;r++) for (let c=0;c<cols;c++) {
    let x = sx + c*xStep; if (state.layout==='stagger' && r%2) x += xStep/2;
    drawModule(svg,x,sy+r*yStep,size,angleAt(r,c),'board');
  }
}
function renderModule() { const svg=$('moduleSvg'); svg.innerHTML=''; addPatterns(svg,'module'); drawModule(svg,160,160,245,0,'module'); }
function renderSchedule() {
  const h=$('schedule'); h.innerHTML='';
  activeStrips().forEach((s,i)=>{
    const row=document.createElement('div'); row.className='schedule-row';
    row.innerHTML=`<div class="schedule-left"><span class="swatch" style="width:24px;height:24px;background:${WOODS[s.wood].color}"></span><div><strong>Strip ${i+1}</strong><br><small>${WOODS[s.wood].name}</small></div></div><span class="badge">${Number(s.width).toFixed(3)} in</span>`;
    h.append(row);
  });
  const tip=document.createElement('div'); tip.className='schedule-row'; tip.innerHTML=`<strong>Two outside tip fills</strong><span class="badge">${WOODS[state.tipWood].name}</span>`; h.append(tip);
}
function renderMetrics() {
  const rows = state.layout==='single'?1:Number(state.rows);
  $('moduleWidthMetric').textContent = `${totalWidth().toFixed(3)} in`;
  $('moduleCountMetric').textContent = String(Number(state.columns)*rows);
  $('boardSizeMetric').textContent = `${Number(state.boardLength).toFixed(3)} × ${Number(state.boardWidth).toFixed(3)} in`;
  $('edgeInsetLabel').textContent = `${Number(state.edgeInset || 0.5).toFixed(3)} in`;
  $('spacingLabel').textContent = `${(state.spacing/100).toFixed(3)} in`;
}
function render() { renderBoard(); renderModule(); renderSchedule(); renderMetrics(); renderEngineering(); updateUndoRedo(); }

function syncControls() {
  controls.forEach(id => { const el=$(id); if (el.type==='checkbox') el.checked=Boolean(state[id]); else el.value=state[id]; });
  $('tipWood').innerHTML = woodOptions(state.tipWood);
}
function pullControl(id) {
  const el=$(id); let v = el.type==='checkbox' ? el.checked : el.value;
  if (['boardLength','boardWidth','columns','rows','edgeInset','spacing','walnutPrice','targetCenterPercent'].includes(id)) v=Number(v);
  state[id]=v; render(); commit();
}

controls.forEach(id => $(id).addEventListener('change',()=>pullControl(id)));
['walnutPrice','targetCenterPercent'].forEach(id => $(id).addEventListener('input',()=>pullControl(id)));
$('insetGoal').addEventListener('input',()=>pullControl('insetGoal'));
$('edgeInset').addEventListener('input',()=>{ state.edgeInset=Number($('edgeInset').value); render(); });
$('spacing').addEventListener('input',()=>{ state.spacing=Number($('spacing').value); render(); });
$('edgeInset').addEventListener('change',commit); $('spacing').addEventListener('change',commit);
$('resetStripsBtn')?.addEventListener('click',()=>{ state.strips=structuredClone(DEFAULT_STRIPS); buildStripEditor(); render(); commit(); toast('Strip schedule reset'); });
$('addOuterPairBtn')?.addEventListener('click',()=>addStripPair('outer'));
$('addInnerPairBtn')?.addEventListener('click',()=>addStripPair('inner'));
$('removePairBtn')?.addEventListener('click',removeStripPair);
$('saveScheduleBtn')?.addEventListener('click',saveCurrentSchedule);
$('loadScheduleBtn')?.addEventListener('click',loadSelectedSchedule);
$('deleteScheduleBtn')?.addEventListener('click',deleteSelectedSchedule);
$('undoBtn').addEventListener('click',()=>{ if(history.length<=1)return; future.push(history.pop()); restore(history.at(-1)); updateUndoRedo(); });
$('redoBtn').addEventListener('click',()=>{ if(!future.length)return; const next=future.pop(); history.push(next); restore(next); updateUndoRedo(); });

function download(name,type,text) {
  const blob=new Blob([text],{type}); const url=URL.createObjectURL(blob); const a=document.createElement('a');
  a.href=url; a.download=name; document.body.append(a); a.click(); a.remove(); setTimeout(()=>URL.revokeObjectURL(url),1000);
}
$('saveProjectBtn').addEventListener('click',()=>download('built-by-the-butts-design.json','application/json',JSON.stringify(state,null,2)));
$('openProjectInput').addEventListener('change',async e=>{
  const file=e.target.files[0]; if(!file)return;
  try { const loaded=JSON.parse(await file.text()); restore(JSON.stringify(loaded)); history=[snapshot()]; future=[]; toast('Project opened'); }
  catch { alert('That project file could not be opened.'); }
  e.target.value='';
});
$('exportSvgBtn').addEventListener('click',()=>{
  const clone=$('boardSvg').cloneNode(true); clone.setAttribute('width','1200'); clone.setAttribute('height','760');
  clone.setAttribute('xmlns','http://www.w3.org/2000/svg');
  const source='<?xml version="1.0" encoding="UTF-8"?>\n'+new XMLSerializer().serializeToString(clone);
  download('built-by-the-butts-board.svg','image/svg+xml;charset=utf-8',source); toast('SVG exported');
});


function engineeringForInset(inset) {
  const total = totalWidth() || 1;
  const i = Math.max(0, Math.min(total/2 - 0.001, Number(inset)));
  const centerRemaining = Math.max(0, total - 2*i);
  const centerPercent = centerRemaining / total * 100;
  // Two 45-degree triangular additions: total cross-sectional area ~= inset².
  const addedBoardFeet = (i * i * Number(state.boardLength || 0)) / 144;
  const addedCost = addedBoardFeet * Number(state.walnutPrice || 0);
  const originalWalnut = activeStrips().filter(s=>s.wood==='walnut').reduce((sum,s)=>sum+Number(s.width||0),0) / total;
  const addedFaceShare = Math.min(.95, 2*i/total);
  const walnutShare = Math.min(1, originalWalnut*(1-addedFaceShare) + addedFaceShare) * 100;
  return { inset:i, centerRemaining, centerPercent, addedBoardFeet, addedCost, offcutBoardFeet:addedBoardFeet, walnutShare };
}

function snapInset(value) {
  const min=.125,max=.750,step=.0625;
  return Math.max(min,Math.min(max,Math.round((value-min)/step)*step+min));
}

function recommendedInset() {
  const total=totalWidth()||1;
  if(state.insetGoal==='economy') return .125;
  if(state.insetGoal==='bold') return .750;
  if(state.insetGoal==='target') return snapInset((total*(1-Number(state.targetCenterPercent||35)/100))/2);
  // Balanced: preserve roughly one-third center diamond while limiting added walnut.
  return snapInset(total/3);
}

function miniModuleSvg(inset) {
  const total=totalWidth()||1, size=108, h=size/2;
  let x=-h;
  let shapes='';
  activeStrips().forEach(strip=>{
    const w=size*Number(strip.width)/total, nx=x+w;
    const polygon=[[x,-h+Math.abs(x)],[nx,-h+Math.abs(nx)],[nx,h-Math.abs(nx)],[x,h-Math.abs(x)]].map(p=>p.join(',')).join(' ');
    shapes += `<polygon points="${polygon}" fill="${WOODS[strip.wood].color}" stroke="#241710" stroke-width=".5"/>`;
    x=nx;
  });
  const d=h*Math.max(.04,Math.min(.46,inset/total));
  const base=Math.min(h*.48,d+size*.075), fill=WOODS[state.tipWood].color;
  shapes += `<polygon points="0,${-h} ${base},${-h+d} ${-base},${-h+d}" fill="${fill}" stroke="#241710" stroke-width=".8"/>`;
  shapes += `<polygon points="0,${h} ${-base},${h-d} ${base},${h-d}" fill="${fill}" stroke="#241710" stroke-width=".8"/>`;
  return `<svg viewBox="-60 -60 120 120" aria-hidden="true"><g>${shapes}<polygon points="0,${-h} ${h},0 0,${h} ${-h},0" fill="none" stroke="#241710" stroke-width="1.2"/></g></svg>`;
}

function renderDesignExplorer() {
  const holder=$('designExplorer'); if(!holder) return;
  const values=[.125,.250,.375,.500,.625,.750];
  holder.innerHTML='';
  values.forEach(inset=>{
    const e=engineeringForInset(inset);
    const b=document.createElement('button'); b.type='button'; b.dataset.inset=String(inset); b.className='explorer-card'+(Math.abs(state.edgeInset-inset)<.001?' active':'');
    b.innerHTML=`${miniModuleSvg(inset)}<strong>${inset.toFixed(3)} in</strong><small>${e.centerPercent.toFixed(0)}% center · $${e.addedCost.toFixed(2)}</small>`;
    holder.append(b);
  });
  $('explorerRangeSummary').textContent=`$${engineeringForInset(.125).addedCost.toFixed(2)}–$${engineeringForInset(.750).addedCost.toFixed(2)} added walnut`;
}

function renderEngineering() {
  if(!$('centerDiamondMetric')) return;
  const e=engineeringForInset(state.edgeInset);
  const rec=recommendedInset();
  $('centerDiamondMetric').textContent=`${e.centerPercent.toFixed(1)}%`;
  $('centerDiamondDimension').textContent=`${e.centerRemaining.toFixed(3)} in remaining`;
  $('addedWalnutMetric').textContent=`${e.addedBoardFeet.toFixed(3)} bd ft`;
  $('addedWalnutCostMetric').textContent=`$${e.addedCost.toFixed(2)} estimated`;
  $('offcutMetric').textContent=`${e.offcutBoardFeet.toFixed(3)} bd ft`;
  $('walnutShareMetric').textContent=`${e.walnutShare.toFixed(1)}%`;
  $('recommendedInsetMetric').textContent=`${rec.toFixed(3)} in`;
  $('targetCenterLabel').textContent=`${Number(state.targetCenterPercent).toFixed(0)}%`;
  $('targetCenterWrap').style.display=state.insetGoal==='target'?'grid':'none';
  document.querySelectorAll('[data-inset]').forEach(b=>b.classList.toggle('active',Math.abs(Number(b.dataset.inset)-state.edgeInset)<.001));
  renderDesignExplorer();
}

$('applyRecommendedInsetBtn').addEventListener('click',()=>{
  state.edgeInset=recommendedInset(); $('edgeInset').value=state.edgeInset; render(); commit(); toast('Recommended inset applied');
});
document.addEventListener('click', e => {
  const b = e.target.closest('[data-inset]');
  if (!b) return;
  state.edgeInset = Number(b.dataset.inset);
  $('edgeInset').value = state.edgeInset;
  render(); commit(); toast(`Inset changed to ${state.edgeInset.toFixed(3)} in`);
});

const saved=localStorage.getItem('bbtb-designer-autosave');
if(saved) { try { state=JSON.parse(saved); } catch {} }
if (!Number.isFinite(Number(state.edgeInset))) state.edgeInset = 0.500;
delete state.cutDepth;
if (!Number.isFinite(Number(state.walnutPrice))) state.walnutPrice = 28;
if (!state.insetGoal) state.insetGoal = 'balanced';
if (!Number.isFinite(Number(state.targetCenterPercent))) state.targetCenterPercent = 35;
state.strips = (state.strips || structuredClone(DEFAULT_STRIPS)).map(s => ({...s, enabled: s.enabled !== false}));
state.version = '1.4.0';
syncControls(); buildStripEditor(); refreshSavedScheduleSelect(); render(); history=[snapshot()]; updateUndoRedo();

// ---------- Step-by-step machining timeline ----------
// ---------- Step-by-step machining timeline ----------
const TIMELINE_STEPS = [
  {
    title: 'Square laminated blank',
    short: 'Glue and square the full-length strip stack',
    description: 'Start with one straight, full-length square blank using the current strip schedule.',
    notes: '<strong>Shop check:</strong> Joint the mating faces, keep the stack square, and flatten the blank before shaping the outside faces.'
  },
  {
    title: 'Cut the blank to 45°',
    short: 'Form the long diamond-shaped blank',
    description: 'Cut the outside faces at 45° so the full-length square glue-up becomes a consistent diamond-shaped core.',
    notes: '<strong>Setup:</strong> Use safe workholding and make matching cuts so the original glue-up remains centered and symmetrical.'
  },
  {
    title: 'Mark the edge rips',
    short: 'Measure inward from both walnut tips',
    description: 'Measure the selected edge-rip inset inward from each tip where the center walnut reaches the outside edge.',
    notes: '<strong>Current inset:</strong> The dimension follows the Edge rip inset control. The default is 0.500 in from each outside tip.'
  },
  {
    title: 'Rip off both edges',
    short: 'Remove and save the two outside sections',
    description: 'Rip both marked edges from the long diamond blank, leaving a smaller center core with two parallel 45° glue faces.',
    notes: '<strong>Save the offcuts:</strong> These continuous laminated strips can be reused in coasters, accent boards, handles, or future pattern experiments.'
  },
  {
    title: 'Mill the walnut additions',
    short: 'Prepare two continuous 45° walnut pieces',
    description: 'Mill two full-length walnut pieces with mating 45° faces sized to rebuild the removed edges.',
    notes: '<strong>Continuous construction:</strong> Prepare the walnut additions as long strips, not individual module pieces.'
  },
  {
    title: 'Glue on the walnut edges',
    short: 'Attach, cure, and flatten both additions',
    description: 'Glue one walnut piece to each prepared face. After curing, flatten and true the reconstructed long blank.',
    notes: '<strong>Pattern result:</strong> The new walnut becomes the outside material while the original laminated glue-up reads as an inner square or diamond.'
  },
  {
    title: 'Crosscut the modules',
    short: 'Slice, rotate, and assemble the end grain',
    description: 'Crosscut the completed long blank into repeated sections, rotate them to end grain, and arrange the board pattern.',
    notes: '<strong>Final planning:</strong> Include blade kerf, flattening allowance, and the desired finished board thickness when calculating blank length and slice width.'
  }
];

let timelineStep = 0;
let timelineTimer = null;

function timelinePatterns(svg) {
  const defs = svgEl('defs');
  for (const [key, wood] of Object.entries(WOODS)) {
    const pattern = svgEl('pattern', { id:`timeline-${key}`, width:42, height:42, patternUnits:'userSpaceOnUse' });
    pattern.append(svgEl('rect', { width:42, height:42, fill:wood.color }));
    pattern.append(svgEl('path', { d:'M-8 11 C5 1 16 20 30 9 S45 7 51 16 M-7 31 C7 20 18 40 32 28 S45 26 52 35', fill:'none', stroke:'#fff', 'stroke-opacity':'.12', 'stroke-width':'1.2' }));
    defs.append(pattern);
  }
  const arrow = svgEl('marker', { id:'timeline-arrow', markerWidth:10, markerHeight:10, refX:8, refY:3, orient:'auto', markerUnits:'strokeWidth' });
  arrow.append(svgEl('path', { d:'M0,0 L0,6 L9,3 z', fill:'#6f3f24' }));
  defs.append(arrow);
  svg.append(defs);
}

function labelSvg(svg,text,x,y,opts={}) {
  const t=svgEl('text',{x,y,fill:opts.fill||'#5a4635','font-size':opts.size||16,'font-weight':opts.weight||700,'text-anchor':opts.anchor||'start'});
  t.textContent=text; svg.append(t); return t;
}

function stripBands(totalHeight, topY) {
  const total=totalWidth() || 1;
  let cursor=topY;
  return state.strips.map(strip=>{
    const height=totalHeight*Number(strip.width)/total;
    const band={...strip,y:cursor,h:height}; cursor+=height; return band;
  });
}

function drawSquareBlank(svg) {
  const x=150,y=140,w=800,h=220;
  for(const band of stripBands(h,y)) svg.append(svgEl('rect',{x,y:band.y,width:w,height:band.h,fill:`url(#timeline-${band.wood})`,stroke:state.showLines?'#241710':'none','stroke-width':'1'}));
  svg.append(svgEl('rect',{x,y,width:w,height:h,fill:'none',stroke:'#241710','stroke-width':'3'}));
  labelSvg(svg,'Full-length square laminated blank',550,405,{anchor:'middle',size:18});
}

function diamondGeometry() {
  const cx=550, cy=250, halfW=400, halfH=150;
  return {cx,cy,halfW,halfH,left:cx-halfW,right:cx+halfW,top:cy-halfH,bottom:cy+halfH};
}

function drawDiamondCore(svg, options={}) {
  const g=diamondGeometry();
  const total=totalWidth()||1;
  const clipId=`diamond-clip-${timelineStep}`;
  const defs=svg.querySelector('defs');
  const clip=svgEl('clipPath',{id:clipId});
  clip.append(svgEl('polygon',{points:pts([[g.left,g.cy],[g.cx,g.top],[g.right,g.cy],[g.cx,g.bottom]])}));
  defs.append(clip);

  const group=svgEl('g',{'clip-path':`url(#${clipId})`});
  let y=g.top;
  for(const strip of activeStrips()){
    const sh=(g.bottom-g.top)*Number(strip.width)/total;
    group.append(svgEl('rect',{x:g.left,y,width:g.right-g.left,height:sh,fill:`url(#timeline-${strip.wood})`,stroke:state.showLines?'#241710':'none','stroke-width':'1'}));
    y+=sh;
  }
  svg.append(group);
  svg.append(svgEl('polygon',{points:pts([[g.left,g.cy],[g.cx,g.top],[g.right,g.cy],[g.cx,g.bottom]]),fill:'none',stroke:'#241710','stroke-width':'3'}));

  const inset=Math.max(35,Math.min(150,(Number(state.edgeInset||.5)/(total||1))*300));
  const leftCutX=g.left+inset;
  const rightCutX=g.right-inset;
  const yOffset=g.halfH*(inset/g.halfW);
  const leftTop=g.cy-yOffset,leftBottom=g.cy+yOffset,rightTop=leftTop,rightBottom=leftBottom;

  if(options.marks || options.cut || options.filled){
    for(const [x,top,bottom] of [[leftCutX,leftTop,leftBottom],[rightCutX,rightTop,rightBottom]]){
      svg.append(svgEl('line',{x1:x,y1:top,x2:x,y2:bottom,stroke:'#c0392b','stroke-width':'5','stroke-dasharray':options.cut||options.filled?'0':'12 7'}));
    }
    svg.append(svgEl('line',{x1:g.left,y1:g.bottom+38,x2:leftCutX,y2:g.bottom+38,stroke:'#6f3f24','stroke-width':'3','marker-start':'url(#timeline-arrow)','marker-end':'url(#timeline-arrow)'}));
    labelSvg(svg,`${Number(state.edgeInset||.5).toFixed(3)} in`,(g.left+leftCutX)/2,g.bottom+66,{anchor:'middle',size:15});
  }

  if(options.cut){
    const leftOff=[[g.left,g.cy],[g.cx,g.top],[leftCutX,leftTop],[leftCutX,leftBottom],[g.cx,g.bottom]];
    const rightOff=[[g.right,g.cy],[g.cx,g.top],[rightCutX,rightTop],[rightCutX,rightBottom],[g.cx,g.bottom]];
    svg.append(svgEl('polygon',{points:pts(leftOff),fill:'#fff','fill-opacity':'.75',stroke:'#c0392b','stroke-width':'2'}));
    svg.append(svgEl('polygon',{points:pts(rightOff),fill:'#fff','fill-opacity':'.75',stroke:'#c0392b','stroke-width':'2'}));
    labelSvg(svg,'SAVE OFFCUT',245,250,{anchor:'middle',fill:'#9b2d20',size:15});
    labelSvg(svg,'SAVE OFFCUT',855,250,{anchor:'middle',fill:'#9b2d20',size:15});
  }

  if(options.separated){
    // overlay a clean reduced core and show reusable offcuts below
    svg.append(svgEl('rect',{x:0,y:0,width:1100,height:500,fill:'#f8f4ee'}));
    const corePts=[[leftCutX,leftTop],[g.cx,g.top],[rightCutX,rightTop],[rightCutX,rightBottom],[g.cx,g.bottom],[leftCutX,leftBottom]];
    const coreClip=svgEl('clipPath',{id:`core-clip-${timelineStep}`}); coreClip.append(svgEl('polygon',{points:pts(corePts)})); defs.append(coreClip);
    const coreGroup=svgEl('g',{'clip-path':`url(#core-clip-${timelineStep})`});
    y=g.top;
    for(const strip of activeStrips()){ const sh=(g.bottom-g.top)*Number(strip.width)/total; coreGroup.append(svgEl('rect',{x:g.left,y,width:g.right-g.left,height:sh,fill:`url(#timeline-${strip.wood})`,stroke:state.showLines?'#241710':'none','stroke-width':'1'})); y+=sh; }
    svg.append(coreGroup); svg.append(svgEl('polygon',{points:pts(corePts),fill:'none',stroke:'#241710','stroke-width':'3'}));
    svg.append(svgEl('polygon',{points:pts([[115,350],[230,307],[260,319],[145,362]]),fill:'url(#timeline-cherry)',stroke:'#241710','stroke-width':'2'}));
    svg.append(svgEl('polygon',{points:pts([[985,350],[870,307],[840,319],[955,362]]),fill:'url(#timeline-cherry)',stroke:'#241710','stroke-width':'2'}));
    labelSvg(svg,'Reusable laminated offcuts',550,440,{anchor:'middle',size:18});
  }

  if(options.walnutPieces){
    const fill=`url(#timeline-${state.tipWood})`;
    svg.append(svgEl('polygon',{points:pts([[90,250],[leftCutX-28,leftTop-10],[leftCutX-28,leftBottom+10]]),fill,stroke:'#241710','stroke-width':'2'}));
    svg.append(svgEl('polygon',{points:pts([[1010,250],[rightCutX+28,rightTop-10],[rightCutX+28,rightBottom+10]]),fill,stroke:'#241710','stroke-width':'2'}));
    svg.append(svgEl('path',{d:`M285 250 L${leftCutX-8} 250`,stroke:'#6f3f24','stroke-width':'4','marker-end':'url(#timeline-arrow)'}));
    svg.append(svgEl('path',{d:`M815 250 L${rightCutX+8} 250`,stroke:'#6f3f24','stroke-width':'4','marker-end':'url(#timeline-arrow)'}));
    labelSvg(svg,`${WOODS[state.tipWood].name} additions`,550,445,{anchor:'middle',size:18});
  }

  if(options.filled){
    const fill=`url(#timeline-${state.tipWood})`;
    svg.append(svgEl('polygon',{points:pts([[g.left,g.cy],[leftCutX,leftTop],[leftCutX,leftBottom]]),fill,stroke:'#241710','stroke-width':'2'}));
    svg.append(svgEl('polygon',{points:pts([[g.right,g.cy],[rightCutX,rightTop],[rightCutX,rightBottom]]),fill,stroke:'#241710','stroke-width':'2'}));
  }
  return {g,leftCutX,rightCutX,leftTop,leftBottom,rightTop,rightBottom};
}

function drawTimelineModule(svg,cx,cy,size) {
  const total=totalWidth() || 1, h=size/2;
  const g=svgEl('g',{transform:`translate(${cx} ${cy}) rotate(45)`});
  let x=-h;
  activeStrips().forEach(strip=>{
    const sw=size*Number(strip.width)/total;
    g.append(svgEl('rect',{x,y:-h,width:sw,height:size,fill:`url(#timeline-${strip.wood})`,stroke:'#241710','stroke-width':'1'}));
    x+=sw;
  });
  const insetRatio=Math.max(.05,Math.min(.42,Number(state.edgeInset||.5)/total));
  const d=h*insetRatio, fill=`url(#timeline-${state.tipWood})`;
  g.append(svgEl('polygon',{points:pts([[0,-h],[d,-h+d],[-d,-h+d]]),fill,stroke:'#241710','stroke-width':'2'}));
  g.append(svgEl('polygon',{points:pts([[0,h],[-d,h-d],[d,h-d]]),fill,stroke:'#241710','stroke-width':'2'}));
  g.append(svgEl('rect',{x:-h,y:-h,width:size,height:size,fill:'none',stroke:'#241710','stroke-width':'3'}));
  svg.append(g);
}

function renderTimeline() {
  const svg=$('timelineSvg'); if(!svg) return;
  svg.innerHTML=''; timelinePatterns(svg);
  svg.append(svgEl('rect',{x:0,y:0,width:1100,height:500,fill:'#f8f4ee'}));
  if(timelineStep===0) drawSquareBlank(svg);
  if(timelineStep===1) { drawDiamondCore(svg); labelSvg(svg,'Matching 45° outside faces',550,445,{anchor:'middle',size:18}); }
  if(timelineStep===2) drawDiamondCore(svg,{marks:true});
  if(timelineStep===3) drawDiamondCore(svg,{separated:true});
  if(timelineStep===4) drawDiamondCore(svg,{separated:true,walnutPieces:true});
  if(timelineStep===5) drawDiamondCore(svg,{filled:true});
  if(timelineStep===6) {
    drawDiamondCore(svg,{filled:true});
    for(let i=0;i<5;i++) svg.append(svgEl('line',{x1:330+i*110,y1:100,x2:330+i*110,y2:400,stroke:'#6f3f24','stroke-width':'3','stroke-dasharray':'10 7'}));
    svg.append(svgEl('path',{d:'M550 405 L550 435',stroke:'#6f3f24','stroke-width':'4','marker-end':'url(#timeline-arrow)'}));
    drawTimelineModule(svg,550,470,82);
  }

  const step=TIMELINE_STEPS[timelineStep];
  $('timelineDescription').textContent=step.description;
  $('timelineStepTitle').textContent=`Step ${timelineStep+1}: ${step.title}`;
  $('timelineShopNotes').innerHTML=step.notes;
  $('previousStepBtn').disabled=timelineStep===0;
  $('nextStepBtn').disabled=timelineStep===TIMELINE_STEPS.length-1;
  document.querySelectorAll('.timeline-step').forEach((button,i)=>{
    button.classList.toggle('active',i===timelineStep);
    button.classList.toggle('complete',i<timelineStep);
    button.setAttribute('aria-current',i===timelineStep?'step':'false');
  });
}

function buildTimelineButtons() {
  const holder=$('timelineSteps'); if(!holder) return;
  holder.innerHTML='';
  TIMELINE_STEPS.forEach((step,i)=>{
    const b=document.createElement('button'); b.type='button'; b.className='timeline-step';
    b.innerHTML=`<span>Step ${i+1}</span><strong>${step.title}</strong>`;
    b.addEventListener('click',()=>{ stopTimeline(); timelineStep=i; renderTimeline(); });
    holder.append(b);
  });
}
function stopTimeline(){ if(timelineTimer){ clearInterval(timelineTimer); timelineTimer=null; } if($('playTimelineBtn')) $('playTimelineBtn').textContent='Play'; }
function playTimeline(){
  if(timelineTimer){ stopTimeline(); return; }
  $('playTimelineBtn').textContent='Pause';
  timelineTimer=setInterval(()=>{ if(timelineStep>=TIMELINE_STEPS.length-1){ stopTimeline(); return; } timelineStep++; renderTimeline(); },1500);
}

buildTimelineButtons();
$('previousStepBtn').addEventListener('click',()=>{ stopTimeline(); timelineStep=Math.max(0,timelineStep-1); renderTimeline(); });
$('nextStepBtn').addEventListener('click',()=>{ stopTimeline(); timelineStep=Math.min(TIMELINE_STEPS.length-1,timelineStep+1); renderTimeline(); });
$('playTimelineBtn').addEventListener('click',playTimeline);
renderTimeline();

const originalRender = render;
render = function(){ originalRender(); renderTimeline(); };

renderEngineering();
