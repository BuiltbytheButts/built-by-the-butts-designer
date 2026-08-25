'use strict';
const M = require('./material.js');
function close(a,b,e=1e-9){if(Math.abs(a-b)>e)throw new Error(`${a} != ${b}`);}
function eq(a,b){if(a!==b)throw new Error(`${a} != ${b}`);}

const plan = M.materialQuantityPlan({
  boardLength: 18, boardWidth: 10, finishedThickness: 1.5,
  diamondFieldWidth: 8, moduleWidth: 1.5,
  strips: [{width:1,wood:'maple'},{width:.5,wood:'walnut'}],
  includeBorders: true, borderBands: [{width:1,wood:'cherry'}],
  edgeInset: 0, edgeWood: 'purpleheart', crosscutCount: 12,
  roughCrosscut: 1.625, bladeKerf: .125, wastePercent: 10,
  prices: { maple: 8, walnut: 12, cherry: 10 }
});
close(plan.targetVolume,270);
close(plan.designedVolume,270);
close(plan.totalNetBoardFeet,270/144);
close(plan.crosscutFactor,20.875/18);
eq(plan.rows.length,3);
const cherry=plan.rows.find(row=>row.species==='cherry');
close(cherry.finishedCubicInches,54);
close(cherry.estimatedCost,cherry.purchaseBoardFeet*10);
close(plan.totalEstimatedCost,plan.rows.reduce((sum,row)=>sum+row.purchaseBoardFeet*row.pricePerBoardFoot,0));

const edge = M.materialQuantityPlan({
  boardLength: 10, boardWidth: 6, finishedThickness: 1,
  diamondFieldWidth: 6, moduleWidth: 2,
  strips: [{width:2,wood:'maple'}], includeBorders:false, borderBands:[],
  edgeInset:1, edgeWood:'walnut', crosscutCount:10,
  roughCrosscut:1, bladeKerf:0, wastePercent:0, prices:{maple:0,walnut:20}
});
close(edge.edgeFraction,.25);
close(edge.rows.find(row=>row.species==='maple').finishedCubicInches,45);
close(edge.rows.find(row=>row.species==='walnut').finishedCubicInches,15);
close(edge.totalNetBoardFeet,60/144);
close(edge.rows.find(row=>row.species==='walnut').estimatedCost,(15/144)*20);
console.log('MATERIAL QUANTITY PASS');
