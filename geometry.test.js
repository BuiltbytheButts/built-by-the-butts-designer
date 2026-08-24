
'use strict';
const G=require('./geometry.js');

function pointInPolygon(point, polygon) {
  const [x,y]=point; let inside=false;
  for(let i=0,j=polygon.length-1;i<polygon.length;j=i++){
    const [xi,yi]=polygon[i], [xj,yj]=polygon[j];
    const hit=((yi>y)!==(yj>y)) && (x < (xj-xi)*(y-yi)/(yj-yi)+xi);
    if(hit) inside=!inside;
  }
  return inside;
}
function polySignature(poly){return poly.map(([x,y])=>`${x.toFixed(6)},${y.toFixed(6)}`).join('|');}
function bandsSignature(bands){return bands.map(b=>polySignature(b.polygon)).join('||');}
function assert(ok,msg){if(!ok) throw new Error(msg);}

const strips=[
 {width:.375,wood:'cherry'}, {width:.25,wood:'padauk'}, {width:.1875,wood:'cherry'},
 {width:.1875,wood:'cherry'}, {width:.25,wood:'padauk'}, {width:.375,wood:'cherry'}
];
const size=100;
for(const angle of [45,-45,225,135]){
  const bands=G.laminateBands({x:0,y:0,size,strips,angleDeg:angle});
  // Dense interior sample: exactly one production laminate polygon must cover
  // every point. This rejects both white gaps and overlapping filler geometry.
  for(let iy=1;iy<100;iy++) for(let ix=1;ix<100;ix++){
    const p=[ix+.123,iy+.321];
    const count=bands.reduce((n,b)=>n+(pointInPolygon(p,b.polygon)?1:0),0);
    assert(count===1,`coverage ${count} at ${p} angle ${angle}`);
  }
}

// Species changes may recolor bands but may never alter their geometry.
const bandsA=G.laminateBands({x:0,y:0,size,strips,angleDeg:45});
const recolored=strips.map((s,i)=>({...s,wood:(i===0||i===strips.length-1)?'maple':s.wood}));
const bandsB=G.laminateBands({x:0,y:0,size,strips:recolored,angleDeg:45});
assert(bandsSignature(bandsA)===bandsSignature(bandsB),'outside species changed geometry');

// Every preset must have a strictly increasing physical cut leg at this module width.
const moduleWidth=strips.reduce((s,x)=>s+x.width,0);
const presets=[0,.125,.25,.375,.5,.625,.75,.875,1];
let prev=-1;
for(const depth of presets){
  const cut=G.edgeCutTriangles({x:0,y:0,size,slope:1,cutDepth:depth,moduleWidth});
  assert(cut.leg>prev,`cut depth ${depth} did not increase: ${cut.leg} <= ${prev}`);
  prev=cut.leg;
}
console.log('GEOMETRY REGRESSION PASS');
console.log(`moduleWidth=${moduleWidth.toFixed(3)}; final 1in leg=${prev.toFixed(3)}px of ${size}px`);
