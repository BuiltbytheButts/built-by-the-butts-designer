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

(function testStripTotalMustMatchRequiredLaminationSize() {
  let strips = M.stripScheduleLaminationPlan({ stripWidths: [0.8125, 0.125, 0.125, 0.125, 0.125, 0.8125], requiredLaminationSize: 2.125 });
  assertClose(strips.total, 2.125);
  assertClose(strips.difference, 0);
  assertEq(strips.matches, true);

  strips = M.stripScheduleLaminationPlan({ stripWidths: [0.5, 0.125, 0.125, 0.125, 0.5], requiredLaminationSize: 2.125 });
  assertClose(strips.total, 1.375);
  assertClose(strips.difference, -0.75);
  assertEq(strips.matches, false);

  strips = M.stripScheduleLaminationPlan({ stripWidths: [1, 1.25], requiredLaminationSize: 2.125 });
  assertClose(strips.total, 2.25);
  assertClose(strips.difference, 0.125);
  assertEq(strips.matches, false);
})();
console.log('PRE-45 LAMINATION STRIP-TOTAL VALIDATION PASS');

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

(function testMirroredBordersRemoveLaminatedRowsInPairs() {
  let border = M.mirroredBorderRowPlan({
    boardWidth: 12.875,
    moduleWidth: 1.5,
    requestedWidth: 1.3125,
    automaticRows: 8,
    bordersEnabled: true
  });
  assertEq(border.removedRowsPerEdge, 1);
  assertEq(border.rowsThatFit, 6);
  assertEq(border.selectedRows, 6);
  assertClose(border.diamondFieldWidth, 9);
  assertClose(border.requiredWidth, 1.9375);

  border = M.mirroredBorderRowPlan({
    boardWidth: 13,
    moduleWidth: 1.5,
    requestedWidth: 1.75,
    automaticRows: 8,
    bordersEnabled: true
  });
  assertEq(border.removedRowsPerEdge, 1);
  assertEq(border.selectedRows, 6);
  assertClose(border.requiredWidth, 2);

  border = M.mirroredBorderRowPlan({
    boardWidth: 13,
    moduleWidth: 1.5,
    requestedWidth: 3.5,
    automaticRows: 8,
    bordersEnabled: true
  });
  assertEq(border.removedRowsPerEdge, 2);
  assertEq(border.selectedRows, 4);
  assertClose(border.requiredWidth, 3.5);

  border = M.mirroredBorderRowPlan({
    boardWidth: 10,
    moduleWidth: 1.5,
    requestedWidth: 0.5,
    automaticRows: 6,
    bordersEnabled: false
  });
  assertEq(border.removedRowsPerEdge, 0);
  assertEq(border.selectedRows, 6);
  assertClose(border.diamondFieldWidth, 9);
  assertClose(border.requiredWidth, 0);
})();
console.log('MIRRORED BORDER-ROW ENGINEERING PASS');
