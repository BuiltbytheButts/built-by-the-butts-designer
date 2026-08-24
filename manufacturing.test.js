'use strict';
const M=require('./manufacturing.js');
function assertClose(a,b,eps=1e-9){if(Math.abs(a-b)>eps) throw new Error(`${a} != ${b}`);}
function assertEq(a,b){if(a!==b) throw new Error(`${a} != ${b}`);}
let x=M.requiredLaminationSize(1.5);
assertClose(x.minimum,1.5*Math.SQRT2);
assertEq(x.recommended,2.125);
x=M.requiredLaminationSize(1.375);
assertClose(x.minimum,1.375*Math.SQRT2);
assertEq(x.recommended,2.0);
x=M.requiredLaminationSize(0);
assertEq(x.minimum,0); assertEq(x.recommended,0);
console.log('MANUFACTURING ENGINEERING PASS');
console.log('1.500 target ->', M.requiredLaminationSize(1.5));


// Change #17 — finished-dimension-driven crosscut engineering.
let plan=M.finishedDimensionCrosscutPlan({targetLength:18.625,finishedThickness:1.5,roughCrosscut:1.625,bladeKerf:0.125,masterBlankLength:24});
assertEq(plan.balancedCount,12);
assertClose(plan.achievableLength,18.0);
assertClose(plan.requiredBlankLength,20.875);
assertClose(plan.blankDelta,3.125);
assertEq(plan.alternateCount,14);
assertClose(plan.alternateFinishedLength,21.0);
assertClose(plan.alternateRequiredBlankLength,24.375);
assertClose(plan.alternateBlankDelta,-0.375);

plan=M.finishedDimensionCrosscutPlan({targetLength:20,finishedThickness:1.5,roughCrosscut:1.625,bladeKerf:0.125,masterBlankLength:30});
assertEq(plan.balancedCount,14); // 21 is closer to 20 than 18.
assertClose(plan.achievableLength,21.0);

plan=M.finishedDimensionCrosscutPlan({targetLength:18,finishedThickness:1.5,roughCrosscut:1.625,bladeKerf:0.125,masterBlankLength:24});
assertEq(plan.balancedCount,12);
assertClose(plan.dimensionDelta,0);

plan=M.finishedDimensionCrosscutPlan({targetLength:19.5,finishedThickness:1.5,roughCrosscut:1.625,bladeKerf:0.125,masterBlankLength:30});
assertEq(plan.balancedCount,12); // Exact tie between 18 and 21: conserve material.
console.log('FINISHED-DIMENSION CROSSCUT ENGINEERING PASS');

(function testTotalCrosscutsAvailable() {
  const availabilityPlan = M.finishedDimensionCrosscutPlan({
    targetLength: 18.625,
    finishedThickness: 1.5,
    roughCrosscut: 1.625,
    bladeKerf: 0.125,
    masterBlankLength: 24
  });
  assertEq(availabilityPlan.totalCrosscutsAvailable, 13);
  assertEq(availabilityPlan.balancedCount, 12);
})();
