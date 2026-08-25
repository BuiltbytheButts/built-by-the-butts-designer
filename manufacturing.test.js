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


// v3.0.12 — the actual nearest whole crosscut drives both result and preview.
let plan=M.finishedDimensionCrosscutPlan({targetLength:18,finishedThickness:1.5,roughCrosscut:1.625,bladeKerf:0.125});
assertEq(plan.crosscutCount,12);
assertEq(plan.isBalanced,true);
assertClose(plan.achievableLength,18.0);
assertClose(plan.requiredBlankLength,20.875);

plan=M.finishedDimensionCrosscutPlan({targetLength:19.5,finishedThickness:1.5,roughCrosscut:1.625,bladeKerf:0.125});
assertEq(plan.crosscutCount,13);
assertEq(plan.isBalanced,false);
assertClose(plan.achievableLength,19.5);
assertClose(plan.requiredBlankLength,22.625);

plan=M.finishedDimensionCrosscutPlan({targetLength:20.8,finishedThickness:1.5,roughCrosscut:1.625,bladeKerf:0.125});
assertEq(plan.crosscutCount,14);
assertEq(plan.isBalanced,true);
console.log('ACTUAL-CROSSCUT ENGINEERING PASS');

(function testDerivedMasterBlankLength() {
  const plan = M.finishedDimensionCrosscutPlan({
    targetLength: 18,
    finishedThickness: 1.5,
    roughCrosscut: 1.625,
    bladeKerf: 0.125
  });
  assertEq(plan.crosscutCount, 12);
  assertClose(plan.requiredBlankLength, 20.875);
  assertClose(plan.recommendedMasterBlankLength, 20.875);
})();

(function testBladeKerfRemainsEditableAndDrivesBlankLength() {
  const plan = M.finishedDimensionCrosscutPlan({
    targetLength: 18,
    finishedThickness: 1.5,
    roughCrosscut: 1.625,
    bladeKerf: 0.100
  });
  assertClose(plan.requiredBlankLength, 20.6);
})();
