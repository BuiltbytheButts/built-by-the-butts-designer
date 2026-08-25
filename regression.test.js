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
  assert(!/v=3\.0\.(10|11|12|13|14|15)/.test(html), 'Stale cache key remains');
  assert((html.match(/v=3\.0\.16/g) || []).length === 4, 'All asset cache keys must be v3.0.16');
  assert(html.indexOf('Top &amp; Bottom Borders') < html.indexOf('Strip Schedule'), 'Border section is not above Strip Schedule');

  const browser = await chromium.launch({
    headless: true,
    executablePath: 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'
  });
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto(pathToFileURL(path.join(root, 'index.html')).href);

  assert(await page.locator('.version-badge').textContent() === 'v3.0.16', 'Wrong visible version');
  assert(await page.locator('#bladeKerf').isEditable(), 'Blade kerf is not editable');

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
  assert(await page.locator('#laminatedRowMetric').textContent() === '3', 'Entered border widths did not dynamically calculate three laminated rows');
  assert(await page.locator('#diamondFieldMetric').textContent() === '19.500 × 4.500 in', 'Dynamic three-row diamond field is incorrect');
  assert(await page.locator('#requiredBorderMetric').textContent() === '4.2500 in per edge', 'Dynamic replacement-border calculation is incorrect');
  assert(await page.locator('#borderDifferenceMetric').textContent() === '0.0625 in too wide per edge', 'Screenshot-case adjustment is incorrect');
  assert(await page.locator('#borderWarning').isVisible(), 'Mismatched dynamic border schedule should warn');
  await page.locator('[data-border-width]').nth(0).fill('2.875');
  await page.locator('[data-border-width]').nth(0).dispatchEvent('input');
  assert(await page.locator('#borderDifferenceMetric').textContent() === 'Matched ✓', 'Matching border schedule was not recognized');
  assert(await page.locator('#borderWarning').isHidden(), 'Matched border schedule should not warn');
  for (let i = 0; i < 2; i += 1) await page.locator('#addBorderBandBtn').click();
  for (let i = 0; i < 4; i += 1) await page.locator('[data-border-wood]').nth(i).selectOption('padauk');
  assert(await page.locator('[data-border-width]').count() === 4, 'Four same-color physical bands were not kept as four entries');
  assert(await page.locator('.end-grain-border').count() === 8, 'Four same-color bands should render as eight mirrored strips');
  await page.locator('#includeBorders').uncheck();
  assert(await page.locator('.end-grain-border').count() === 0, 'Turning borders off did not restore full-diamond view');
  assert(await page.locator('#laminatedRowMetric').textContent() === '9', 'Turning borders off did not restore automatic laminated rows');
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
