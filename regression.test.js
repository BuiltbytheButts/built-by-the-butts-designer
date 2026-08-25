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
  assert(!/v=3\.0\.(10|11)/.test(html), 'Stale cache key remains');
  assert((html.match(/v=3\.0\.12/g) || []).length === 4, 'All asset cache keys must be v3.0.12');

  const browser = await chromium.launch({
    headless: true,
    executablePath: 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'
  });
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto(pathToFileURL(path.join(root, 'index.html')).href);

  assert(await page.locator('.version-badge').textContent() === 'v3.0.12', 'Wrong visible version');
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
  assert(errors.length === 0, `Browser errors: ${errors.join('; ')}`);
  await browser.close();
  console.log('VERSION/CACHE PASS');
  console.log('FROZEN GEOMETRY/RENDERER PASS');
  console.log('BROWSER/MANUFACTURING REGRESSION PASS');
})().catch(error => { console.error(error); process.exit(1); });
