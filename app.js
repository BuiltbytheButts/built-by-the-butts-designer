const WOODS = {
  walnut: { name: 'Walnut', color: '#4b2d21' },
  purpleheart: { name: 'Purpleheart', color: '#694064' },
  cherry: { name: 'Cherry', color: '#a75b3d' },
  padauk: { name: 'Padauk', color: '#bc4a28' },
  maple: { name: 'Hard Maple', color: '#e4ca96' }
};

const DEFAULT_STRIPS = [
  { width: 0.500, wood: 'cherry' },
  { width: 0.125, wood: 'maple' },
  { width: 0.250, wood: 'walnut' },
  { width: 0.125, wood: 'maple' },
  { width: 0.500, wood: 'cherry' }
];

let state = {
  version: '1.1.0', boardLength: 20, boardWidth: 12.75, columns: 8, rows: 5,
  layout: 'grid', orientation: '0', cutDepth: 12, spacing: 0,
  tipWood: 'walnut', showLines: true, showFrame: true,
  strips: structuredClone(DEFAULT_STRIPS)
};
let history = [];
let future = [];
let isRestoring = false;

const $ = id => document.getElementById(id);
const controls = ['boardLength','boardWidth','columns','rows','layout','orientation','cutDepth','spacing','tipWood','showLines','showFrame'];

function svgEl(name, attrs = {}) {
  const el = document.createElementNS('http://www.w3.org/2000/svg', name);
  for (const [k,v] of Object.entries(attrs)) el.setAttribute(k, v);
  return el;
}
function pts(a) { return a.map(([x,y]) => `${x},${y}`).join(' '); }
function totalWidth() { return state.strips.reduce((s,x) => s + Number(x.width || 0), 0); }
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
function buildStripEditor() {
  const holder = $('stripEditor'); holder.innerHTML = '';
  state.strips.forEach((strip, i) => {
    const row = document.createElement('div'); row.className = 'strip-row';
    row.innerHTML = `
      <span class="swatch" style="background:${WOODS[strip.wood].color}"></span>
      <label>Strip ${i+1}<input data-width="${i}" type="number" min="0.0625" max="3" step="0.0625" value="${Number(strip.width).toFixed(4)}"></label>
      <label>Wood<select data-wood="${i}">${woodOptions(strip.wood)}</select></label>`;
    holder.appendChild(row);
  });
  holder.querySelectorAll('[data-width]').forEach(el => el.addEventListener('change', e => {
    const i = Number(e.target.dataset.width); const v = Number(e.target.value);
    if (v > 0) state.strips[i].width = v;
    buildStripEditor(); render(); commit();
  }));
  holder.querySelectorAll('[data-wood]').forEach(el => el.addEventListener('change', e => {
    state.strips[Number(e.target.dataset.wood)].wood = e.target.value;
    buildStripEditor(); render(); commit();
  }));
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
  state.strips.forEach(strip => {
    const w = size * strip.width / total;
    const nx = x + w;
    const polygon = [[x,-h+Math.abs(x)],[nx,-h+Math.abs(nx)],[nx,h-Math.abs(nx)],[x,h-Math.abs(x)]];
    g.append(svgEl('polygon',{points:pts(polygon),fill:`url(#${prefix}-${strip.wood})`,stroke:state.showLines?'#241710':'none','stroke-width':state.showLines?'.55':'0'}));
    x = nx;
  });
  const inward = h * state.cutDepth/100;
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
  state.strips.forEach((s,i)=>{
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
  $('cutDepthLabel').textContent = `${(totalWidth()*state.cutDepth/100).toFixed(3)} in`;
  $('spacingLabel').textContent = `${(state.spacing/100).toFixed(3)} in`;
}
function render() { renderBoard(); renderModule(); renderSchedule(); renderMetrics(); updateUndoRedo(); }

function syncControls() {
  controls.forEach(id => { const el=$(id); if (el.type==='checkbox') el.checked=Boolean(state[id]); else el.value=state[id]; });
  $('tipWood').innerHTML = woodOptions(state.tipWood);
}
function pullControl(id) {
  const el=$(id); let v = el.type==='checkbox' ? el.checked : el.value;
  if (['boardLength','boardWidth','columns','rows','cutDepth','spacing'].includes(id)) v=Number(v);
  state[id]=v; render(); commit();
}

controls.forEach(id => $(id).addEventListener('change',()=>pullControl(id)));
$('cutDepth').addEventListener('input',()=>{ state.cutDepth=Number($('cutDepth').value); render(); });
$('spacing').addEventListener('input',()=>{ state.spacing=Number($('spacing').value); render(); });
$('cutDepth').addEventListener('change',commit); $('spacing').addEventListener('change',commit);
$('resetStripsBtn').addEventListener('click',()=>{ state.strips=structuredClone(DEFAULT_STRIPS); buildStripEditor(); render(); commit(); toast('Strip schedule reset'); });
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

const saved=localStorage.getItem('bbtb-designer-autosave');
if(saved) { try { state=JSON.parse(saved); } catch {} }
syncControls(); buildStripEditor(); render(); history=[snapshot()]; updateUndoRedo();

// ---------- Step-by-step machining timeline ----------
const TIMELINE_STEPS = [
  {
    title: 'Laminated blank',
    short: 'Glue the full-length strip stack',
    description: 'Start with one straight, full-length laminated blank using the current strip schedule.',
    notes: '<strong>Shop check:</strong> Joint the mating faces, keep the strip stack square, and flatten the blank before the angled operations.'
  },
  {
    title: 'Reference the glue lines',
    short: 'Identify both maple/walnut references',
    description: 'Use the two maple-to-walnut glue lines as the reference points for the inward 45° cuts.',
    notes: '<strong>Current references:</strong> The simulator highlights the two glue lines bordering the center strip. These should be confirmed against the actual blank.'
  },
  {
    title: 'First 45° cut',
    short: 'Cut inward from the first reference',
    description: 'Make the first angled cut so the cut moves inward and does not place cherry or maple outside the walnut tip.',
    notes: '<strong>Current design intent:</strong> Walnut remains the outside tip material. The highlighted waste area is removed from one end of the long blank.'
  },
  {
    title: 'Glue the first fill',
    short: 'Install one continuous tip-fill strip',
    description: 'Glue the selected tip-fill wood into the first full-length angled cut, then flatten the repair.',
    notes: '<strong>Tip-fill wood:</strong> The selected species is applied continuously along the long blank before modules are crosscut.'
  },
  {
    title: 'Second 45° cut',
    short: 'Mirror the operation at the other tip',
    description: 'Make the matching inward cut from the opposite maple/walnut reference line.',
    notes: '<strong>Alignment:</strong> Match the second operation to the first so the finished module remains balanced around the center strip.'
  },
  {
    title: 'Glue the second fill',
    short: 'Complete both outside walnut tips',
    description: 'Glue and flatten the second continuous fill. The long blank now contains the complete tip geometry.',
    notes: '<strong>Before crosscutting:</strong> Confirm both fills are fully seated, cured, and flattened with no material extending beyond the intended outside tips.'
  },
  {
    title: 'Crosscut the modules',
    short: 'Slice, rotate, and assemble the end grain',
    description: 'Crosscut the completed long blank into repeated modules, rotate them to end grain, and arrange the board pattern.',
    notes: '<strong>Final planning:</strong> Add blade kerf and flattening allowance when calculating the crosscut thickness and total blank length.'
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

function drawBlank(svg, opts={}) {
  const x=150, y=145, w=800, h=210;
  const total=totalWidth() || 1;
  let cy=y;
  const boundaries=[];
  state.strips.forEach((strip,i)=>{
    const sh=h*Number(strip.width)/total;
    svg.append(svgEl('rect',{x,y:cy,width:w,height:sh,fill:`url(#timeline-${strip.wood})`,stroke:state.showLines?'#241710':'none','stroke-width':'1'}));
    cy+=sh;
    if(i < state.strips.length-1) boundaries.push(cy);
  });
  svg.append(svgEl('rect',{x,y,width:w,height:h,fill:'none',stroke:'#241710','stroke-width':'3',rx:'2'}));

  // The two boundaries bordering the center strip are the intended references.
  const centerIndex=Math.floor(state.strips.length/2);
  const topRef=boundaries[Math.max(0,centerIndex-1)] ?? y+h*.42;
  const bottomRef=boundaries[Math.min(boundaries.length-1,centerIndex)] ?? y+h*.58;

  if(opts.references){
    [topRef,bottomRef].forEach((ry,idx)=>{
      svg.append(svgEl('line',{x1:x-28,y1:ry,x2:x+w+28,y2:ry,stroke:'#f4d03f','stroke-width':'5','stroke-dasharray':'12 7'}));
      const label=svgEl('text',{x:x+w+38,y:ry+5,fill:'#5a4635','font-size':'17','font-weight':'700'});
      label.textContent=`Reference ${idx+1}`; svg.append(label);
    });
  }

  const depth=Math.max(35, Math.min(125, h*state.cutDepth/38));
  const fill=`url(#timeline-${state.tipWood})`;
  const leftCut=[[x,topRef],[x+depth,bottomRef],[x,bottomRef]];
  const rightCut=[[x+w, bottomRef],[x+w-depth,topRef],[x+w,topRef]];

  if(opts.firstCut || opts.firstFill || opts.secondCut || opts.secondFill){
    svg.append(svgEl('line',{x1:x,y1:topRef,x2:x+depth,y2:bottomRef,stroke:'#c0392b','stroke-width':'5','stroke-dasharray':opts.firstFill?'0':'12 7'}));
    if(opts.firstFill) svg.append(svgEl('polygon',{points:pts(leftCut),fill,stroke:'#241710','stroke-width':'2'}));
    else {
      svg.append(svgEl('polygon',{points:pts(leftCut),fill:'#fff','fill-opacity':'.72',stroke:'#c0392b','stroke-width':'2'}));
      const waste=svgEl('text',{x:x+18,y:(topRef+bottomRef)/2+5,fill:'#9b2d20','font-size':'15','font-weight':'700'}); waste.textContent='WASTE'; svg.append(waste);
    }
  }
  if(opts.secondCut || opts.secondFill){
    svg.append(svgEl('line',{x1:x+w,y1:bottomRef,x2:x+w-depth,y2:topRef,stroke:'#c0392b','stroke-width':'5','stroke-dasharray':opts.secondFill?'0':'12 7'}));
    if(opts.secondFill) svg.append(svgEl('polygon',{points:pts(rightCut),fill,stroke:'#241710','stroke-width':'2'}));
    else {
      svg.append(svgEl('polygon',{points:pts(rightCut),fill:'#fff','fill-opacity':'.72',stroke:'#c0392b','stroke-width':'2'}));
      const waste=svgEl('text',{x:x+w-82,y:(topRef+bottomRef)/2+5,fill:'#9b2d20','font-size':'15','font-weight':'700'}); waste.textContent='WASTE'; svg.append(waste);
    }
  }
  return {x,y,w,h,topRef,bottomRef,depth};
}

function drawTimelineModule(svg,cx,cy,size) {
  const total=totalWidth() || 1, h=size/2;
  const g=svgEl('g',{transform:`translate(${cx} ${cy}) rotate(45)`});
  let x=-h;
  state.strips.forEach(strip=>{
    const sw=size*Number(strip.width)/total, nx=x+sw;
    g.append(svgEl('rect',{x,y:-h,width:sw,height:size,fill:`url(#timeline-${strip.wood})`,stroke:'#241710','stroke-width':'1'}));
    x=nx;
  });
  const inward=Math.max(18,h*state.cutDepth/100);
  const base=Math.min(h*.52,inward+size*.08), fill=`url(#timeline-${state.tipWood})`;
  g.append(svgEl('polygon',{points:pts([[0,-h],[base,-h+inward],[-base,-h+inward]]),fill,stroke:'#241710','stroke-width':'2'}));
  g.append(svgEl('polygon',{points:pts([[0,h],[-base,h-inward],[base,h-inward]]),fill,stroke:'#241710','stroke-width':'2'}));
  g.append(svgEl('rect',{x:-h,y:-h,width:size,height:size,fill:'none',stroke:'#241710','stroke-width':'3'}));
  svg.append(g);
}

function renderTimeline() {
  const svg=$('timelineSvg');
  if(!svg) return;
  svg.innerHTML=''; timelinePatterns(svg);
  svg.append(svgEl('rect',{x:0,y:0,width:1100,height:500,fill:'#f8f4ee'}));

  if(timelineStep===0) drawBlank(svg);
  if(timelineStep===1) drawBlank(svg,{references:true});
  if(timelineStep===2) drawBlank(svg,{references:true,firstCut:true});
  if(timelineStep===3) drawBlank(svg,{references:true,firstFill:true});
  if(timelineStep===4) drawBlank(svg,{references:true,firstFill:true,secondCut:true});
  if(timelineStep===5) drawBlank(svg,{references:true,firstFill:true,secondFill:true});
  if(timelineStep===6) {
    drawBlank(svg,{firstFill:true,secondFill:true});
    for(let i=0;i<5;i++) svg.append(svgEl('line',{x1:315+i*105,y1:135,x2:315+i*105,y2:365,stroke:'#6f3f24','stroke-width':'3','stroke-dasharray':'10 7'}));
    svg.append(svgEl('path',{d:'M550 390 L550 430',stroke:'#6f3f24','stroke-width':'4','marker-end':'url(#timeline-arrow)'}));
    drawTimelineModule(svg,550,465,105);
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
  const holder=$('timelineSteps');
  if(!holder) return;
  holder.innerHTML='';
  TIMELINE_STEPS.forEach((step,i)=>{
    const b=document.createElement('button');
    b.type='button'; b.className='timeline-step';
    b.innerHTML=`<span>Step ${i+1}</span><strong>${step.title}</strong>`;
    b.addEventListener('click',()=>{ stopTimeline(); timelineStep=i; renderTimeline(); });
    holder.append(b);
  });
}
function stopTimeline(){
  if(timelineTimer){ clearInterval(timelineTimer); timelineTimer=null; }
  if($('playTimelineBtn')) $('playTimelineBtn').textContent='Play';
}
function playTimeline(){
  if(timelineTimer){ stopTimeline(); return; }
  $('playTimelineBtn').textContent='Pause';
  timelineTimer=setInterval(()=>{
    if(timelineStep>=TIMELINE_STEPS.length-1){ stopTimeline(); return; }
    timelineStep++; renderTimeline();
  },1500);
}

buildTimelineButtons();
$('previousStepBtn').addEventListener('click',()=>{ stopTimeline(); timelineStep=Math.max(0,timelineStep-1); renderTimeline(); });
$('nextStepBtn').addEventListener('click',()=>{ stopTimeline(); timelineStep=Math.min(TIMELINE_STEPS.length-1,timelineStep+1); renderTimeline(); });
$('playTimelineBtn').addEventListener('click',playTimeline);
renderTimeline();

// Keep the machining illustration synchronized with design changes.
const originalRender = render;
render = function(){ originalRender(); renderTimeline(); };
