
'use strict';

(function attachDiamondGeometry(root) {
  const EPS = 1e-9;

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  function clipAgainstBoundary(polygon, inside, intersect) {
    const output = [];
    if (!polygon.length) return output;
    let previous = polygon[polygon.length - 1];
    let previousInside = inside(previous);
    for (const current of polygon) {
      const currentInside = inside(current);
      if (currentInside) {
        if (!previousInside) output.push(intersect(previous, current));
        output.push(current);
      } else if (previousInside) {
        output.push(intersect(previous, current));
      }
      previous = current;
      previousInside = currentInside;
    }
    return output;
  }

  function clipPolygonToRect(polygon, x, y, width, height) {
    const left=x, right=x+width, top=y, bottom=y+height;
    let out = polygon;
    out = clipAgainstBoundary(out, p => p[0] >= left-EPS, (a,b) => {
      const t=(left-a[0])/(b[0]-a[0]); return [left, a[1]+t*(b[1]-a[1])];
    });
    out = clipAgainstBoundary(out, p => p[0] <= right+EPS, (a,b) => {
      const t=(right-a[0])/(b[0]-a[0]); return [right, a[1]+t*(b[1]-a[1])];
    });
    out = clipAgainstBoundary(out, p => p[1] >= top-EPS, (a,b) => {
      const t=(top-a[1])/(b[1]-a[1]); return [a[0]+t*(b[0]-a[0]), top];
    });
    out = clipAgainstBoundary(out, p => p[1] <= bottom+EPS, (a,b) => {
      const t=(bottom-a[1])/(b[1]-a[1]); return [a[0]+t*(b[0]-a[0]), bottom];
    });
    return out;
  }

  function laminateBands({x,y,size,strips,angleDeg}) {
    const total = strips.reduce((sum,s) => sum + Number(s.width||0), 0);
    if (!(total>0)) return [];
    const cx=x+size/2, cy=y+size/2;
    const angle=angleDeg*Math.PI/180;
    const nx=Math.cos(angle), ny=Math.sin(angle);
    const tx=-ny, ty=nx;
    const halfSpan=size/Math.SQRT2;
    const tangentExtent=size*2;
    let cursor=-halfSpan;
    return strips.map((strip,index) => {
      const bandWidth=(size*Math.SQRT2)*(Number(strip.width||0)/total);
      const u0=cursor, u1=cursor+bandWidth;
      cursor=u1;
      const raw=[
        [cx+nx*u0+tx*tangentExtent, cy+ny*u0+ty*tangentExtent],
        [cx+nx*u1+tx*tangentExtent, cy+ny*u1+ty*tangentExtent],
        [cx+nx*u1-tx*tangentExtent, cy+ny*u1-ty*tangentExtent],
        [cx+nx*u0-tx*tangentExtent, cy+ny*u0-ty*tangentExtent]
      ];
      return {index, wood:strip.wood, polygon:clipPolygonToRect(raw,x,y,size,size)};
    }).filter(b => b.polygon.length>=3);
  }

  function edgeCutTriangles({x,y,size,slope,cutDepth,moduleWidth}) {
    const physicalWidth=Math.max(0.001,Number(moduleWidth)||0.001);
    const depth=clamp(Number(cutDepth)||0,0,physicalWidth);
    const leg=clamp((depth/physicalWidth)*size,0,size);
    if (leg<=EPS) return {leg:0, triangles:[]};
    if (slope>=0) {
      return {leg,triangles:[
        [[x+size,y],[x+size-leg,y],[x+size,y+leg]],
        [[x,y+size],[x+leg,y+size],[x,y+size-leg]]
      ]};
    }
    return {leg,triangles:[
      [[x,y],[x+leg,y],[x,y+leg]],
      [[x+size,y+size],[x+size-leg,y+size],[x+size,y+size-leg]]
    ]};
  }

  const api={clamp,clipPolygonToRect,laminateBands,edgeCutTriangles};
  if (typeof module!=='undefined' && module.exports) module.exports=api;
  root.DiamondGeometry=api;
})(typeof globalThis!=='undefined'?globalThis:this);
