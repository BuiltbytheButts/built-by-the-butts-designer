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
