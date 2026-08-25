'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { pathToFileURL } = require('url');
const { chromium } = require('C:/Users/built/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function hash(file) {
  return crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
}

function functionSource(source, name) {
  const start = source.indexOf(`function ${name}(`);
  assert(start >= 0, `${name} not found`);
  let depth = 0;
  let opened = false;
  for (let i = start; i < source.length; i += 1) {
    if (source[i] === '{') { depth += 1; opened = true; }
    if (source[i] === '}') depth -= 1;
    if (opened && depth === 0) return source.slice(start, i + 1);
  }
  throw new Error(`${name} source incomplete`);
}

(async () => {
  const root = __dirname;
  const baselineApp = fs.readFileSync('C:/Users/built/AppData/Local/Temp/app (26).js', 'utf8');
  const releaseApp = fs.readFileSync(path.join(root, 'app.js'), 'utf8');
  assert(hash(path.join(root, 'geometry.js')) === hash('C:/Users/built/AppData/Local/Temp/geometry (5).js'), 'Frozen geometry.js changed');
  for (const name of ['edgeCutGeometry', 'drawEndGrainCell', 'renderBoard']) {
    assert(functionSource(releaseApp, name) === functionSource(baselineApp, name), `Frozen ${name} changed`);
  }

  const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
  assert(!/Alternate even option/i.test(html), 'Alternate Even Option remains in UI');
  assert(!/v=3\.0\.(10|11|12|13|14|15|16|17|18|19|20|21|22|23|24|25|26|27|28|29|30|31)/.test(html), 'Stale cache key remains');
  assert((html.match(/v=3\.0\.32/g) || []).length === 5, 'All asset cache keys must be v3.0.32');
  assert(html.includes('Material Quantity (Estimate)'), 'Estimate qualifier is missing from Material Quantity');
  assert(html.indexOf('Top &amp; Bottom Borders') < html.indexOf('Strip Schedule'), 'Border section is not above Strip Schedule');

  const browser = await chromium.launch({
    headless: true,
    executablePath: 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'
  });
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto(pathToFileURL(path.join(root, 'index.html')).href);

  assert(await page.locator('.version-badge').textContent() === 'v3.0.32', 'Wrong visible version');
  assert(await page.locator('#bladeKerf').isEditable(), 'Blade kerf is not editable');
  assert(await page.locator('#printPlanBtn').isVisible(), 'Print Workshop Plan action is missing');
  const planText = await page.locator('#printPlan').textContent();
  for (const heading of ['Finished Design', 'Lamination Engineering', 'Crosscut Engineering', 'Edge Rip', 'Border Schedule', 'Material Quantity (Estimate)', 'Illustrated Build Procedure', 'Workshop Sequence — Quick Checklist']) {
    assert(planText.includes(heading), `Printable plan is missing ${heading}`);
  }
  assert((await page.locator('#printPlan').textContent()).includes('18.625 × 11.625 × 1.500 in'), 'Printable plan does not reflect current dimensions');
  assert(await page.locator('#printPlan .print-board-reference').count() === 1, 'Finished board reference is missing from the printout');
  assert(await page.locator('#printPlan .print-board-reference polygon[fill^="#"]').count() > 0, 'Finished board reference does not contain printable solid wood colors');
  assert((await page.locator('#printPlan .print-board-section').textContent()).includes('Keep this image available throughout the build'), 'Finished board reference guidance is missing');
  const guideTitles = await page.locator('#printPlan .guide-copy h3').allTextContents();
  const edgeRipCutIndex = guideTitles.indexOf('Cut the Edge Rip after the 45° cuts');
  const edgeRipGlueIndex = guideTitles.findIndex(title => title.startsWith('Glue the new 45°'));
  assert(guideTitles.indexOf('Make the four 45° cuts') < edgeRipCutIndex, 'Edge Rip is not after the first 45-degree cuts');
  assert(edgeRipCutIndex < edgeRipGlueIndex, 'Edge Rip cut is not before replacement glue-up');
  assert((await page.locator('#printPlan').textContent()).includes('Two solid Walnut pieces'), 'Two solid replacement pieces are not shown before glue-up');
  assert((await page.locator('#printPlan').textContent()).includes('Finished square'), 'Finished square replacement view is missing');
  assert(edgeRipGlueIndex < guideTitles.indexOf('Dry-fit the 45° cut pieces'), 'Replacement glue-up is not a separate step before dry fit');
  assert(await page.locator('#printPlan .guide-step').count() === 12, 'Edge Rip build must contain twelve illustrated steps');
  assert(await page.locator('#printPlan .guide-svg').count() === 12, 'Every illustrated step must contain a diagram');
  assert((await page.locator('#printPlan').textContent()).includes('0.125 in blade kerf'), 'Illustrated crosscut step does not reflect blade kerf');
  assert((await page.locator('#printPlan').textContent()).includes('crosscuts assigned to this build'), 'Assigned crosscut count is not shown in one line');
  assert(await page.locator('#printPlan svg[aria-label*=four] .guide-center-cut').count() === 1, 'Center-to-center 45-degree guide is missing');
  assert((await page.locator('#printPlan').textContent()).includes('2.125 × 2.125 in'), 'Square lamination dimensions are not shown on both sides');
  assert((await page.locator('#printPlan').textContent()).includes('Dry-fit the 45° cut pieces'), 'Two-row 45-degree dry fit step is missing');
  assert((await page.locator('#printPlan').textContent()).includes('run each dotted cut line fully across its width'), 'Top-view crosscut instruction is missing');
  assert((await page.locator('#printPlan').textContent()).includes('1.625 in'), 'Calculated crosscut spacing is missing');
  assert(((await page.locator('#printPlan').textContent()).match(/CUT/g) || []).length >= 4, 'All four corner cuts are not labeled');
  await page.locator('#edgeInset').fill('0');
  await page.locator('#edgeInset').dispatchEvent('input');
  await page.evaluate(() => renderWorkshopPlan());
  assert(!(await page.locator('#printPlan').textContent()).includes('Edge Rip selected'), 'Illustration shows Edge Rip when none is selected');
  assert(!(await page.locator('#printPlan').textContent()).includes('Cut depth:'), 'Edge Rip schedule shows when none is selected');
  assert(await page.locator('#printPlan .guide-step').count() === 10, 'Zero Edge Rip should remove its separate illustrated step');
  await page.locator('#edgeInset').fill('0.5');
  await page.locator('#edgeInset').dispatchEvent('input');
  await page.evaluate(() => renderWorkshopPlan());
  await page.evaluate(() => { window.__printCalled = false; window.print = () => { window.__printCalled = true; }; });
  await page.locator('#printPlanBtn').click();
  assert(await page.evaluate(() => window.__printCalled), 'Print Workshop Plan did not invoke printing');
  assert(await page.locator('#wastePercent').isEditable(), 'Waste allowance is not editable');
  assert(await page.locator('#materialNetMetric').textContent() === '2.255 bd ft', 'Default net board-foot total is incorrect');
  assert(await page.locator('#materialTableBody tr').count() === 3, 'Default species were not combined into three rows');
  const purchaseBeforeWasteChange = Number((await page.locator('#materialPurchaseMetric').textContent()).split(' ')[0]);
  await page.locator('#wastePercent').fill('25');
  await page.locator('#wastePercent').dispatchEvent('input');
  const purchaseAfterWasteChange = Number((await page.locator('#materialPurchaseMetric').textContent()).split(' ')[0]);
  assert(purchaseAfterWasteChange > purchaseBeforeWasteChange, 'Waste allowance did not increase purchase board feet');
  assert(await page.locator('#materialCostMetric').textContent() === '$0.00', 'Pricing should default to zero');
  assert(await page.locator('[data-wood-price]').count() === 3, 'Each combined species should have one price input');
  const walnutPrice = page.locator('[data-wood-price="walnut"]');
  const walnutRow = walnutPrice.locator('xpath=ancestor::tr');
  await walnutPrice.fill('10');
  await walnutPrice.dispatchEvent('input');
  const walnutBuyBf = Number(await walnutRow.locator('td').nth(3).textContent());
  assert(await walnutRow.locator('td').nth(5).textContent() === `$${(walnutBuyBf * 10).toFixed(2)}`, 'Walnut species cost is incorrect');
  assert(await page.locator('#materialCostMetric').textContent() === `$${(walnutBuyBf * 10).toFixed(2)}`, 'Total material cost is incorrect');

  await page.locator('#boardLength').fill('18');
  await page.locator('#boardLength').dispatchEvent('input');
  assert(await page.locator('#crosscutCountMetric').textContent() === '12 crosscuts', '12-crosscut balanced case failed');
  assert(await page.locator('#crosscutWarning').isHidden(), 'Balanced warning should be hidden');
  assert(await page.evaluate(() => previewGrid().lengthSliceCount) === 12, 'Preview is not driven by 12 calculated crosscuts');

  await page.locator('#boardLength').fill('19.5');
  await page.locator('#boardLength').dispatchEvent('input');
  assert(await page.locator('#crosscutCountMetric').textContent() === '13 crosscuts', '13-crosscut case was silently forced even');
  assert(await page.locator('#crosscutWarning').isVisible(), 'Odd-count warning is not visible');
  assert((await page.locator('#crosscutWarning').textContent()).includes('unbalanced pattern'), 'Odd warning wording missing');
  assert(await page.evaluate(() => previewGrid().lengthSliceCount) === 13, 'Preview is not driven by 13 calculated crosscuts');
  assert((await page.locator('#crosscutCountHelp').textContent()).includes('22.625 in rough blank'), 'Required master blank is not inside the single result');

  await page.locator('#bladeKerf').fill('0.100');
  await page.locator('#bladeKerf').dispatchEvent('input');
  assert((await page.locator('#crosscutCountHelp').textContent()).includes('22.325 in rough blank'), 'Editable kerf did not recalculate master blank');

  assert(await page.locator('.end-grain-border').count() === 0, 'Borders should default off');
  assert((await page.locator('#diamondFieldMetric').textContent()).includes('(full board)'), 'Border-off diamond field should use full width');
  await page.locator('#boardWidth').fill('13');
  await page.locator('#boardWidth').dispatchEvent('input');
  assert(await page.locator('#laminatedRowMetric').textContent() === '9', 'Automatic no-border laminated-row count is incorrect');
  await page.locator('#includeBorders').check();
  assert(await page.locator('.end-grain-border').count() === 2, 'Top and bottom borders were not rendered');
  await page.locator('[data-border-width]').fill('2.9375');
  await page.locator('[data-border-width]').dispatchEvent('input');
  await page.locator('[data-border-wood]').selectOption('padauk');
  await page.locator('#addBorderBandBtn').click();
  await page.locator('[data-border-width]').nth(1).fill('1.375');
  await page.locator('[data-border-width]').nth(1).dispatchEvent('input');
  await page.locator('[data-border-wood]').nth(1).selectOption('walnut');
  assert(await page.locator('#laminatedRowMetric').textContent() === '2', 'Only complete laminated rows should remain after entered borders');
  assert(await page.locator('#diamondFieldMetric').textContent() === '19.500 × 3.000 in', 'Whole-row diamond field is incorrect');
  assert(await page.locator('#requiredBorderMetric').textContent() === '5.0000 in per edge', 'Whole-row replacement-border calculation is incorrect');
  assert(await page.locator('#borderDifferenceMetric').textContent() === '0.6875 in still needed per edge', 'Whole-row completion warning is incorrect');
  assert(await page.locator('#borderWarning').isVisible(), 'Mismatched dynamic border schedule should warn');
  assert(await page.locator('#materialGapWarning').isVisible(), 'Unfilled border schedule should block purchase totals');
  await page.locator('[data-border-width]').nth(0).fill('3.625');
  await page.locator('[data-border-width]').nth(0).dispatchEvent('input');
  assert(await page.locator('#borderDifferenceMetric').textContent() === 'Matched ✓', 'Matching border schedule was not recognized');
  assert(await page.locator('#borderWarning').isHidden(), 'Matched border schedule should not warn');
  assert(await page.locator('#materialGapWarning').isHidden(), 'Matched border schedule should reconcile material volume');
  for (let i = 0; i < 2; i += 1) await page.locator('#addBorderBandBtn').click();
  for (let i = 0; i < 4; i += 1) await page.locator('[data-border-wood]').nth(i).selectOption('padauk');
  assert(await page.locator('[data-border-width]').count() === 4, 'Four same-color physical bands were not kept as four entries');
  assert(await page.locator('.end-grain-border').count() === 8, 'Four same-color bands should render as eight mirrored strips');
  await page.locator('#includeBorders').uncheck();
  assert(await page.locator('.end-grain-border').count() === 0, 'Turning borders off did not restore full-diamond view');
  assert(await page.locator('#laminatedRowMetric').textContent() === '9', 'Turning borders off did not restore automatic laminated rows');

  await page.evaluate(() => restore(JSON.stringify({
    boardLength: 17.25, boardWidth: 13, finishedThickness: 1.125,
    includeBorders: true, borderBands: [{ width: 1.25, wood: 'walnut' }]
  })));
  assert(await page.locator('.bordered-diamond-field').getAttribute('data-laminated-rows') === '7', '1.25 in border should render seven complete rows');
  await page.evaluate(() => renderWorkshopPlan());
  const borderedPlanText = await page.locator('#printPlan').textContent();
  assert(borderedPlanText.includes('Glue the borders before crosscutting'), 'Border-before-crosscut step is missing');
  assert(borderedPlanText.indexOf('Glue the borders before crosscutting') < borderedPlanText.indexOf('Mark the crosscuts from the top view'), 'Borders are not glued before crosscutting in the guide');
  const guideCrosscutCount = await page.evaluate(() => crosscutEngineering().crosscutCount);
  assert(await page.locator('#printPlan svg[aria-label*=completed] .guide-center-cut').count() === guideCrosscutCount - 1, 'Top-view crosscut lines do not match the calculated count');
  assert((await page.locator('#printPlan').textContent()).includes('freshly cut Walnut edges'), 'Selected Edge Rip replacement glue-up is missing');
  assert(await page.locator('.bordered-diamond-cell').count() === 105, 'Seven rows by fifteen crosscuts should render 105 complete cells');
  assert(await page.locator('[data-row="0"]').count() === 15 && await page.locator('[data-row="6"]').count() === 15, 'First or last complete row is missing');
  assert(/^translate\([^)]*\) scale\([^ ,)]+\)$/.test(await page.locator('.bordered-diamond-cell').first().getAttribute('transform')), '1.25 in bordered cells are not uniformly scaled squares');
  let alignment = await page.evaluate(() => {
    const borders = [...document.querySelectorAll('.end-grain-border')];
    const field = document.querySelector('.bordered-diamond-field');
    const y = Number(field.dataset.fieldY);
    const h = Number(field.dataset.fieldHeight);
    return {
      topGap: Math.abs(Number(borders[0].getAttribute('y')) + Number(borders[0].getAttribute('height')) - y),
      bottomGap: Math.abs(Number(borders[1].getAttribute('y')) - (y + h))
    };
  });
  assert(alignment.topGap < 1e-6 && alignment.bottomGap < 1e-6, '1.25 in borders do not meet complete laminate rows exactly');
  await page.locator('[data-border-width]').fill('3.5');
  await page.locator('[data-border-width]').dispatchEvent('input');
  assert(await page.locator('.bordered-diamond-field').getAttribute('data-laminated-rows') === '4', '3.5 in border should render four complete rows');
  assert(await page.locator('.bordered-diamond-cell').count() === 60, 'Four rows by fifteen crosscuts should render 60 complete cells');
  assert(await page.locator('[data-row="0"]').count() === 15 && await page.locator('[data-row="3"]').count() === 15, '3.5 in case has a partial boundary row');
  assert(/^translate\([^)]*\) scale\([^ ,)]+\)$/.test(await page.locator('.bordered-diamond-cell').first().getAttribute('transform')), '3.5 in bordered cells are not uniformly scaled squares');
  alignment = await page.evaluate(() => {
    const borders = [...document.querySelectorAll('.end-grain-border')];
    const field = document.querySelector('.bordered-diamond-field');
    const y = Number(field.dataset.fieldY);
    const h = Number(field.dataset.fieldHeight);
    return {
      topGap: Math.abs(Number(borders[0].getAttribute('y')) + Number(borders[0].getAttribute('height')) - y),
      bottomGap: Math.abs(Number(borders[1].getAttribute('y')) - (y + h))
    };
  });
  assert(alignment.topGap < 1e-6 && alignment.bottomGap < 1e-6, '3.5 in borders do not meet complete laminate rows exactly');

  await page.evaluate(() => restore(JSON.stringify({ includeBorders: true, borderWidth: 0.75, borderWood: 'padauk' })));
  assert(await page.locator('[data-border-width]').count() === 1, 'Legacy single border did not migrate to one band');
  assert(await page.locator('[data-border-width]').inputValue() === '0.7500', 'Legacy border width migration failed');
  assert(await page.locator('[data-border-wood]').inputValue() === 'padauk', 'Legacy border wood migration failed');
  assert(errors.length === 0, `Browser errors: ${errors.join('; ')}`);
  await browser.close();
  console.log('VERSION/CACHE PASS');
  console.log('FROZEN GEOMETRY/RENDERER PASS');
  console.log('BROWSER/MANUFACTURING/BORDER REGRESSION PASS');
})().catch(error => { console.error(error); process.exit(1); });
