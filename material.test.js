'use strict';
const M = require('./material.js');
function close(a,b,e=1e-9){if(Math.abs(a-b)>e)throw new Error(`${a} != ${b}`);}
function eq(a,b){if(a!==b)throw new Error(`${a} != ${b}`);}

const plan = M.materialQuantityPlan({
  finishedThickness: 1.5, requiredLaminationSize: 2.125, laminatedRows: 4,
  moduleWidth: 1.5, stripRoughAllowance: .0625, borderRoughAllowance: .0625,
  strips: [{width:1,wood:'maple'},{width:.5,wood:'walnut'}],
  includeBorders: true, borderBands: [{width:1,wood:'cherry'}],
  edgeInset: 0, edgeWood: 'purpleheart', crosscutCount: 12,
  roughCrosscut: 1.625, bladeKerf: .125, wastePercent: 10,
  prices: { maple: 8, walnut: 12, cherry: 10 }
});
const requiredLength = 12 * 1.625 + 11 * .125;
close(plan.requiredBlankLength, requiredLength);
close(plan.requiredLaminationSize, 2.125);
eq(plan.laminatedRows, 4);
close(plan.crosscutFactor, requiredLength / 18);
eq(plan.rows.length, 3);
const maple = plan.rows.find(row=>row.species==='maple');
const walnut = plan.rows.find(row=>row.species==='walnut');
const cherry = plan.rows.find(row=>row.species==='cherry');
close(maple.roughCubicInches, (1 + .0625) * 2.125 * requiredLength * 4);
close(walnut.roughCubicInches, (.5 + .0625) * 2.125 * requiredLength * 4);
close(cherry.roughCubicInches, 2 * (1 + .0625) * 2.125 * requiredLength);
close(cherry.estimatedCost, cherry.purchaseBoardFeet * 10);
close(plan.totalEstimatedCost, plan.rows.reduce((sum,row)=>sum+row.purchaseBoardFeet*row.pricePerBoardFoot,0));

const longerPlan = M.materialQuantityPlan({
  finishedThickness: 1.5, requiredLaminationSize: 2.125, laminatedRows: 4,
  moduleWidth: 1.5, stripRoughAllowance: .0625, borderRoughAllowance: .0625,
  strips: [{width:1,wood:'maple'},{width:.5,wood:'walnut'}],
  includeBorders: true, borderBands: [{width:1,wood:'cherry'}],
  edgeInset: 0, edgeWood: 'purpleheart', crosscutCount: 16,
  roughCrosscut: 1.625, bladeKerf: .125, wastePercent: 10,
  prices: { maple: 8, walnut: 12, cherry: 10 }
});
const longerRequiredLength = 16 * 1.625 + 15 * .125;
close(longerPlan.requiredBlankLength, longerRequiredLength);
close(longerPlan.rows.find(row=>row.species==='maple').roughCubicInches, (1 + .0625) * 2.125 * longerRequiredLength * 4);
close(longerPlan.totalPurchaseBoardFeet / plan.totalPurchaseBoardFeet, longerRequiredLength / requiredLength);
if (!(longerPlan.totalEstimatedCost > plan.totalEstimatedCost)) throw new Error('Additional kerf-inclusive row length did not increase Estimated Wood Cost');
console.log('KERF-INCLUSIVE ROW-LENGTH COST PASS');

const edge = M.materialQuantityPlan({
  finishedThickness: 1, requiredLaminationSize: 1.5, laminatedRows: 6,
  moduleWidth: 2, stripRoughAllowance: .0625, borderRoughAllowance: .0625,
  strips: [{width:2,wood:'maple'}], includeBorders:false, borderBands:[],
  edgeInset:1, edgeWood:'walnut', crosscutCount:10,
  roughCrosscut:1, bladeKerf:0, wastePercent:0, prices:{maple:0,walnut:20}
});
close(edge.edgeFraction,.25);
close(edge.rows.find(row=>row.species==='walnut').roughCubicInches,15);
close(edge.rows.find(row=>row.species==='walnut').estimatedCost,(15/144)*20);
close(edge.rows.find(row=>row.species==='maple').roughCubicInches,2.0625*1.5*10*6);

// First real-build validation supplied by the user. The purchased boards total
// 9.2917 bd ft / $144.69 and left usable stock. The cut-plan estimate should be
// below that purchase while remaining close enough to explain the leftovers.
const validation = M.materialQuantityPlan({
  finishedThickness: 1.5, requiredLaminationSize: 2.125, laminatedRows: 6,
  moduleWidth: 2.025, stripRoughAllowance: .0625, borderRoughAllowance: .0625,
  strips: [
    {width:.25,wood:'cherry'}, {width:.1875,wood:'maple'},
    {width:.1875,wood:'padauk'}, {width:.3875,wood:'walnut'},
    {width:.3875,wood:'walnut'}, {width:.1875,wood:'padauk'},
    {width:.1875,wood:'maple'}, {width:.25,wood:'cherry'}
  ],
  includeBorders:true,
  borderBands:[{width:1.125,wood:'cherry'},{width:.1875,wood:'padauk'}],
  edgeInset:.5, edgeWood:'walnut', crosscutCount:12,
  roughCrosscut:1.625, bladeKerf:.125, wastePercent:40,
  prices:{maple:8,padauk:20,walnut:28,cherry:8}
});
const purchasedBoardFeet = 24*7.25*1.875/144 + 24*9.25*.875/144 + 24*13*1.25/144 + 24*9.5*1.875/144;
const purchasedCost = (24*7.25*1.875/144)*8 + (24*9.25*.875/144)*20 + (24*13*1.25/144)*28 + (24*9.5*1.875/144)*8;
if (!(validation.totalPurchaseBoardFeet > 7.9 && validation.totalPurchaseBoardFeet < 8.0)) throw new Error(`Validation rough lumber ${validation.totalPurchaseBoardFeet} bd ft is outside the approved range`);
if (!(validation.totalEstimatedCost > 131 && validation.totalEstimatedCost < 132)) throw new Error(`Validation cost $${validation.totalEstimatedCost} is outside the approved range`);
if (!(validation.totalPurchaseBoardFeet < purchasedBoardFeet && validation.totalEstimatedCost < purchasedCost)) throw new Error('Validation estimate must remain below the purchase that left usable stock');

console.log('ROUGH-STOCK MATERIAL QUANTITY PASS');
console.log(`VALIDATION BUILD: ${validation.totalPurchaseBoardFeet.toFixed(3)} bd ft / $${validation.totalEstimatedCost.toFixed(2)} vs purchased ${purchasedBoardFeet.toFixed(3)} bd ft / $${purchasedCost.toFixed(2)}`);
