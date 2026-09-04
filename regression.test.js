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
  const releaseApp = fs.readFileSync(path.join(root, 'app.js'), 'utf8');
  const frozenFunctionHashes = {
    edgeCutGeometry: '4596bd31f6dfcef581b5e52730bb73be95d4adac1820c05aeefbb94115a6115d',
    drawEndGrainCell: '7780a699fa123b814b71e59fac895fd11839da9ce248c724df251747a657881e',
    renderBoard: 'a7f6e362a986c45e17b154ace989417f689748213b5cdf4a447bcfd95c7aabcc'
  };
  assert(hash(path.join(root, 'geometry.js')) === '808a73619d0961591cdfe2d7f666792fb9f17d3f6f7479168c198d6a3516e12b', 'Frozen geometry.js changed');
  for (const [name, expectedHash] of Object.entries(frozenFunctionHashes)) {
    const actualHash = crypto.createHash('sha256').update(functionSource(releaseApp, name)).digest('hex');
    assert(actualHash === expectedHash, `Frozen ${name} changed`);
  }

  const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
  const css = fs.readFileSync(path.join(root, 'styles.css'), 'utf8');
  assert(!/Alternate even option/i.test(html), 'Alternate Even Option remains in UI');
  assert(!/v=3\.0\.(10|11|12|13|14|15|16|17|18|19|20|21|22|23|24|25|26|27|28|29|30|31|32|33|34|35|36|37|38|39|40|41|42|43|44|45|46|47|48|49|50|51|52|53|54|55|56|57|58|59|60|61|62|63|64|65|66|67|68|69|70|71|72)/.test(html), 'Stale cache key remains');
  assert((html.match(/v=3\.0\.73/g) || []).length === 5, 'All asset cache keys must be v3.0.73');
  assert(css.includes('@media(min-width:1001px){html,body{height:100%;overflow:hidden}') && css.includes('overscroll-behavior:contain'), 'Desktop controls-panel scroll containment CSS is missing');
  assert(html.includes('id="exportSvgBtn"') && html.includes('>Download Design Image</button>') && html.includes('scalable SVG image'), 'Plain-language design-image download control or tooltip is missing');
  assert(html.includes('Actual Board Dimensions') && html.includes('id="actualBoardWarning"'), 'Actual Board Dimensions result or its warning is missing');
  assert(html.includes('id="stripTotalMetric"') && html.includes('id="stripTotalWarning"') && html.includes('id="laminationWarning"'), 'Pre-45 strip-total validation is missing');
  assert(!html.includes('id="thicknessWarning"'), 'Strip-total warning remains attached to Finished thickness');
  assert(html.includes('These strip widths build the lamination before the 45° cuts.'), 'Strip Schedule help still describes the entries as finished-width totals');
  assert(html.includes('id="laminatedRowHelp"') && html.includes('id="materialLengthHelp"'), 'Laminated-row length guidance is missing');
  assert(html.includes('Starting crosscut') && (html.match(/data-glue-up-phase=/g) || []).length === 2, 'Starting-crosscut glue-up control is missing');
  assert(html.includes('id="helpMenu"') && html.includes('user-guide.html') && html.includes('faq.html'), 'Designer Help menu is missing the User Guide or FAQ');
  assert(html.includes('Estimated Wood Cost') && html.includes('Estimated rough lumber'), 'Rough-lumber cost estimate is missing');
  assert(!html.includes('materialNetMetric') && !html.includes('materialVolumeHelp') && !html.includes('materialGapWarning'), 'Finished/net material volume remains visible');
  const controlOrder = ['Strip Schedule', 'Diamond Accent', 'Top &amp; Bottom Borders', 'Crosscut Engineering', 'Estimated Wood Cost', 'Wood Library'].map(label => html.indexOf(label));
  assert(controlOrder.every((position, index) => position >= 0 && (!index || position > controlOrder[index - 1])), 'Left-panel control sections are not in the approved order');
  const sampleHtml = fs.readFileSync(path.join(root, 'sample-build.html'), 'utf8');
  const sampleTemplateHtml = fs.readFileSync(path.join(root, 'sample-build.template.html'), 'utf8');
  assert(sampleHtml.includes('Independent Sample Build'), 'Independent Sample Build page is missing');
  assert(!/href="sample-build\.css/.test(sampleHtml), 'Sample Build still depends on an external stylesheet');
  assert(!/src="assets\/sample-build\//.test(sampleHtml), 'Sample Build still depends on external photo paths');
  assert((sampleHtml.match(/src="data:image\/png;base64,/g) || []).length === 23, 'All twenty-three Sample Build images must be embedded');
  assert((sampleHtml.match(/class=.step /g) || []).length === 10, 'Sample Build must contain ten ordered steps');
  assert((sampleHtml.match(/<img [^>]*data-photo-file=/g) || []).length === 23, 'Sample Build must contain the reference image and twenty-two workshop photos');
  assert((sampleHtml.match(/class="photo-placeholder"/g) || []).length === 0, 'The completed Sample Build must not retain a photo placeholder');
  assert(sampleHtml.includes('Complete photo guide') && sampleHtml.includes('Original Designer reference'), 'The completed Sample Build introduction or design reference is missing');
  assert(sampleHtml.indexOf('designer-build-reference.png') < sampleHtml.indexOf('<div class="step-number">1</div>'), 'The Designer reference must appear before Step 1');
  assert(sampleHtml.includes('rough-lumber-selection.png') && sampleHtml.includes('milled-lumber-stock.png'), 'Step 1 does not contain both supplied lumber photos');
  assert(sampleHtml.includes('strip-stack-measurement.png') && sampleHtml.includes('strip-order-dry-fit.png'), 'Step 2 does not contain both supplied strip photos');
  assert(sampleHtml.includes('laminated-assembly-measurement.png') && sampleHtml.includes('laminated-blank-glue-up.png') && sampleHtml.includes('squared-blank-measurement.png'), 'Step 3 does not contain all three supplied glue-up photos');
  assert(sampleHtml.includes('marked-45-profile.png') && sampleHtml.includes('cut-section-measurement.png') && sampleHtml.includes('completed-45-sections.png'), 'Step 4 does not contain all three supplied 45-degree photos');
  assert(sampleHtml.includes('edge-rip-before-cut.png') && sampleHtml.includes('edge-rip-cut-face.png') && sampleHtml.includes('matched-edge-rip-pair.png'), 'Step 5 does not contain all three supplied Diamond Accent photos');
  assert(sampleHtml.includes('Cut the Diamond Accent shoulders') && sampleHtml.includes('Glue the maple Diamond Accent pieces') && !sampleHtml.includes('Edge Rip'), 'Sample Build does not use the approved Diamond Accent wording');
  assert(sampleHtml.includes('maple-walnut-glue-up.png') && sampleHtml.includes('replacement-strip-glue-up.png') && sampleHtml.includes('replacement-glue-up-alignment.png'), 'Step 6 does not contain all three supplied replacement glue-up photos');
  assert(sampleHtml.indexOf('strip-order-dry-fit.png') < sampleHtml.indexOf('strip-stack-measurement.png'), 'Step 2 must show the layout before the measurement');
  assert(sampleHtml.indexOf('laminated-blank-glue-up.png') < sampleHtml.indexOf('laminated-assembly-measurement.png') && sampleHtml.indexOf('laminated-assembly-measurement.png') < sampleHtml.indexOf('squared-blank-measurement.png'), 'Step 3 photo order is incorrect');
  assert(sampleHtml.indexOf('replacement-strip-glue-up.png') < sampleHtml.indexOf('replacement-glue-up-alignment.png') && sampleHtml.indexOf('replacement-glue-up-alignment.png') < sampleHtml.indexOf('maple-walnut-glue-up.png'), 'Step 6 former first photo must appear last');
  assert(sampleTemplateHtml.indexOf('strip-order-dry-fit.png') < sampleTemplateHtml.indexOf('strip-stack-measurement.png'), 'Step 2 template photo order is incorrect');
  assert(sampleTemplateHtml.indexOf('laminated-blank-glue-up.png') < sampleTemplateHtml.indexOf('laminated-assembly-measurement.png') && sampleTemplateHtml.indexOf('laminated-assembly-measurement.png') < sampleTemplateHtml.indexOf('squared-blank-measurement.png'), 'Step 3 template photo order is incorrect');
  assert(sampleTemplateHtml.indexOf('replacement-strip-glue-up.png') < sampleTemplateHtml.indexOf('replacement-glue-up-alignment.png') && sampleTemplateHtml.indexOf('replacement-glue-up-alignment.png') < sampleTemplateHtml.indexOf('maple-walnut-glue-up.png'), 'Step 6 template photo order is incorrect');
  assert(sampleHtml.includes('master-blank-width-check.png') && sampleHtml.includes('bordered-master-blank.png'), 'Step 7 does not contain both supplied master-blank photos');
  assert(sampleHtml.includes('Crosscut the master blank and keep every piece in order'), 'Step 8 does not describe the supplied ordered crosscut sequence');
  assert(sampleHtml.includes('crosscut-diamond-dry-fit.png'), 'Step 9 does not contain the supplied diamond-field dry-fit photo');
  assert(sampleHtml.includes('finished-board-perspective.png') && sampleHtml.includes('finished-board-top-view.png') && sampleHtml.includes('Finished build photos'), 'Step 10 does not contain both supplied finished-board photos');
  assert(sampleHtml.includes("document.querySelectorAll('img[data-photo-file]')"), 'The photo viewer does not include the opening Designer reference');
  for (const asset of ['designer-build-reference.png','rough-lumber-selection.png','milled-lumber-stock.png','strip-stack-measurement.png','strip-order-dry-fit.png','laminated-assembly-measurement.png','laminated-blank-glue-up.png','squared-blank-measurement.png','marked-45-profile.png','cut-section-measurement.png','completed-45-sections.png','edge-rip-before-cut.png','edge-rip-cut-face.png','matched-edge-rip-pair.png','maple-walnut-glue-up.png','replacement-strip-glue-up.png','replacement-glue-up-alignment.png','master-blank-width-check.png','bordered-master-blank.png','master-blank-top-view.png','crosscut-diamond-dry-fit.png','finished-board-perspective.png','finished-board-top-view.png']) assert(fs.existsSync(path.join(root,'assets','sample-build',asset)), 'Sample photo missing: ' + asset);
  const userGuideHtml = fs.readFileSync(path.join(root, 'user-guide.html'), 'utf8');
  const faqHtml = fs.readFileSync(path.join(root, 'faq.html'), 'utf8');
  for (const required of ['Quick start','Using the Designer controls','Reading the top results','Understanding warnings','Estimated Wood Cost','Project and output tools','Build references','Recommended workshop workflow','Glossary']) assert(userGuideHtml.includes(required), 'User Guide section missing: ' + required);
  assert(userGuideHtml.includes('Designer v3.0.73') && userGuideHtml.includes('Starting Crosscut') && userGuideHtml.includes('Strip total before 45° cuts') && userGuideHtml.includes('0.2850-inch rough rip') && userGuideHtml.includes('Diamond Accent') && userGuideHtml.includes('Download Design Image') && userGuideHtml.includes('<style>'), 'User Guide is not a self-contained v3.0.73 page');
  assert((faqHtml.match(/class="faq"/g) || []).length === 37, 'FAQ must contain the 37 approved questions');
  assert(faqHtml.includes('Frequently asked questions') && faqHtml.includes('Designer v3.0.73') && faqHtml.includes('+0.035-inch rough-rip recommendation') && faqHtml.includes('What does the Diamond Accent control change?') && faqHtml.includes('Why must the strip total match the required pre-45° lamination size?') && faqHtml.includes('What is Download Design Image for?') && faqHtml.includes('<style>'), 'FAQ is not a self-contained v3.0.73 page');

  const browser = await chromium.launch({
    headless: true,
    executablePath: 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'
  });
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto(pathToFileURL(path.join(root, 'index.html')).href);

  assert(await page.locator('.version-badge').textContent() === 'v3.0.73', 'Wrong visible version');
  const headerControlSizes = await page.locator('.header-actions > button, .header-actions > .header-link, .header-actions > .help-menu > summary').evaluateAll(elements => elements.map(element => {
    const rect = element.getBoundingClientRect();
    return { width: Math.round(rect.width), height: Math.round(rect.height) };
  }));
  assert(headerControlSizes.length === 8, 'Header must contain eight standardized actions');
  assert(new Set(headerControlSizes.map(size => size.width)).size === 1 && new Set(headerControlSizes.map(size => size.height)).size === 1, 'Header actions are not the same size');
  assert(headerControlSizes[0].width <= 100 && headerControlSizes[0].height === 46, 'Header actions are not using the approved compact size');
  const desktopScrollFrame = await page.evaluate(() => {
    const header = document.querySelector('.app-header');
    const panel = document.querySelector('.controls-panel');
    window.scrollTo(0, 100);
    const panelTopBefore = panel.getBoundingClientRect().top;
    panel.scrollTop = Math.min(250, panel.scrollHeight - panel.clientHeight);
    return {
      bodyOverflow: getComputedStyle(document.body).overflow,
      pageScrollY: window.scrollY,
      headerBottom: header.getBoundingClientRect().bottom,
      panelTopBefore,
      panelTopAfter: panel.getBoundingClientRect().top,
      panelScrollTop: panel.scrollTop
    };
  });
  assert(desktopScrollFrame.bodyOverflow === 'hidden' && desktopScrollFrame.pageScrollY === 0, 'Desktop page can still scroll behind the sticky header');
  assert(desktopScrollFrame.panelTopBefore >= desktopScrollFrame.headerBottom && Math.abs(desktopScrollFrame.panelTopAfter - desktopScrollFrame.panelTopBefore) < 0.5, 'Controls-panel scrollbar can move beneath the header');
  assert(desktopScrollFrame.panelScrollTop > 0, 'Controls panel did not retain its own scrolling');
  assert(await page.evaluate(() => recommendedRoughRip(0.25)) === 0.285, 'Quarter-inch strip does not recommend a 0.2850 in rough rip');
  assert(await page.locator('#exportSvgBtn').textContent() === 'Download Design Image', 'Design-image download button label is incorrect');
  assert((await page.locator('#exportSvgBtn').getAttribute('title')).includes('scalable SVG image'), 'Design-image download tooltip is missing');
  assert(await page.locator('#laminatedRowHelp').textContent() === 'Build 7 rows at least 20.875 in long each.', 'Default laminated-row length guidance is incorrect');
  assert((await page.locator('#materialLengthHelp').textContent()).includes('7 rows × 20.875 in of kerf-inclusive length'), 'Default cost guidance does not disclose row count and length');
  assert(await page.locator('#stripTotalMetric').textContent() === '1.5000 in', 'Default pre-45° strip total is incorrect');
  assert(await page.locator('#stripTotalHelp').textContent() === 'Required 2.1250 in', 'Default strip-total requirement does not use the pre-45° lamination size');
  assert(await page.locator('#stripTotalWarning').isVisible(), 'Default pre-45° lamination shortage should warn');
  assert((await page.locator('#stripTotalWarning').textContent()).includes('0.6250 in short'), 'Default pre-45° shortage is incorrect');
  assert(await page.locator('#laminationWarning').isVisible(), 'Default shortage does not warn in the top lamination result');
  assert(await page.locator('#laminationMetricCard').evaluate(card => card.classList.contains('metric-has-warning')), 'Top lamination warning styling is missing');
  await page.evaluate(() => {
    state.strips = [
      { width: 0.8125, wood: 'cherry' },
      { width: 0.125, wood: 'maple' },
      { width: 0.125, wood: 'walnut' },
      { width: 0.125, wood: 'walnut' },
      { width: 0.125, wood: 'maple' },
      { width: 0.8125, wood: 'cherry' }
    ];
    render();
  });
  assert(await page.locator('#stripTotalMetric').textContent() === '2.1250 in', 'Matched pre-45° strip total is incorrect');
  assert((await page.locator('#stripTotalHelp').textContent()).includes('matched ✓'), 'Matched pre-45° strip total is not confirmed');
  assert(await page.locator('#stripTotalWarning').isHidden(), 'Matched pre-45° strip total still warns in the Strip Schedule');
  assert(await page.locator('#laminationWarning').isHidden(), 'Matched pre-45° strip total still warns in the top lamination result');
  assert(!await page.locator('#laminationMetricCard').evaluate(card => card.classList.contains('metric-has-warning')), 'Matched lamination result retains warning styling');
  await page.evaluate(() => {
    state.boardLength = 24;
    state.finishedThickness = 1.5;
    state.strips = [
      { width: 0.4375, wood: 'cherry' },
      { width: 0.125, wood: 'maple' },
      { width: 0.125, wood: 'walnut' },
      { width: 0.125, wood: 'walnut' },
      { width: 0.125, wood: 'maple' },
      { width: 0.4375, wood: 'cherry' }
    ];
    render();
  });
  assert(await page.locator('#crosscutCountMetric').textContent() === '16 crosscuts', '24 × 1.5 length trace did not produce 16 crosscuts');
  assert((await page.locator('#crosscutCountHelp').textContent()).includes('16 × 1.625 in rough crosscuts + 15 × 0.125 in kerf = 27.875 in rough blank'), 'Crosscut result does not disclose the master-blank formula');
  assert(await page.locator('#laminatedRowHelp').textContent() === 'Build 7 rows at least 27.875 in long each.', '24-inch example does not show the required laminated-row build length');
  assert((await page.locator('#materialLengthHelp').textContent()).includes('7 rows × 27.875 in of kerf-inclusive length'), 'Cost guidance does not use the 24-inch example row length');
  assert(await page.locator('#stripTotalMetric').textContent() === '1.3750 in', 'Short pre-45° strip total is not shown');
  assert(await page.locator('#stripTotalWarning').isVisible(), 'Short pre-45° strip total does not warn in the Strip Schedule');
  assert((await page.locator('#stripTotalWarning').textContent()).includes('0.7500 in short'), 'Strip Schedule warning does not disclose the pre-45° shortage');
  assert(await page.locator('#laminationWarning').isVisible(), 'Short strip total does not warn in the top lamination result');
  assert(await page.locator('#laminationMetricCard').evaluate(card => card.classList.contains('metric-has-warning')), 'Required lamination warning styling is missing');
  assert((await page.locator('#printPlan').textContent()).includes('Strip-total warning') && (await page.locator('#printPlan').textContent()).includes('1.3750 in'), 'Printable plan does not disclose the strip-total mismatch');
  await page.evaluate(() => restore(JSON.stringify(defaultState())));
  assert(await page.locator('#openProjectBtn').isVisible(), 'Open Project is not a visible button');
  const [projectDownload] = await Promise.all([
    page.waitForEvent('download'),
    page.locator('#saveProjectBtn').click()
  ]);
  assert(projectDownload.suggestedFilename() === 'diamond-end-grain-design-v3.json', 'Save Project produced the wrong filename');
  assert((await page.locator('#toast').textContent()).includes('Project saved to Downloads'), 'Save Project confirmation is missing');

  const openProject = JSON.parse(await page.evaluate(() => snapshot()));
  openProject.boardLength = 15.25;
  openProject.boardWidth = 10;
  const openProjectFile = {
    name: 'diamond-end-grain-design-v3.json',
    mimeType: 'application/json',
    buffer: Buffer.from(JSON.stringify(openProject))
  };
  const [firstChooser] = await Promise.all([
    page.waitForEvent('filechooser'),
    page.locator('#openProjectBtn').click()
  ]);
  await firstChooser.setFiles(openProjectFile);
  await page.waitForFunction(() => document.querySelector('#boardLength').value === '15.25');
  assert(await page.locator('#boardWidth').inputValue() === '10', 'Open Project did not restore the saved dimensions');
  assert((await page.locator('#toast').textContent()).includes('Project opened: diamond-end-grain-design-v3.json'), 'Open Project confirmation is missing the filename');
  assert(await page.locator('#openProjectInput').evaluate(input => input.files.length) === 0, 'Open Project file input was not reset');

  const [sameProjectChooser] = await Promise.all([
    page.waitForEvent('filechooser'),
    page.locator('#openProjectBtn').click()
  ]);
  await sameProjectChooser.setFiles(openProjectFile);
  await page.waitForFunction(() => document.querySelector('#toast').textContent.includes('matches the design already on screen'));
  assert((await page.locator('#toast').textContent()).includes('matches the design already on screen'), 'Opening the current design does not explain the lack of visual change');

  const [invalidProjectChooser] = await Promise.all([
    page.waitForEvent('filechooser'),
    page.locator('#openProjectBtn').click()
  ]);
  await invalidProjectChooser.setFiles({ name: 'not-a-project.json', mimeType: 'application/json', buffer: Buffer.from('{not valid json') });
  await page.waitForFunction(() => document.querySelector('#toast').classList.contains('error'));
  assert((await page.locator('#toast').textContent()).includes('could not be opened'), 'Invalid project error is not visible');
  assert(await page.locator('#boardLength').inputValue() === '15.25', 'Invalid project changed the active design');
  await page.evaluate(() => restore(JSON.stringify(defaultState())));
  assert(await page.locator('#helpMenu').isVisible(), 'Help menu is missing');
  await page.locator('#helpMenu summary').click();
  assert(await page.locator('#userGuideLink').isVisible() && await page.locator('#faqLink').isVisible(), 'Help menu links did not open');
  assert(await page.locator('#userGuideLink').getAttribute('target') === '_blank' && await page.locator('#faqLink').getAttribute('target') === '_blank', 'Help pages are not independent');
  assert(await page.locator('#sampleBuildLink').isVisible(), 'Sample Build link is missing');
  assert(await page.locator('#sampleBuildLink').getAttribute('target') === '_blank', 'Sample Build is not independent of the active designer view');
  assert(await page.locator('#laminationMinimumMetric').count() === 0, 'Minimum/rounding explanation still occupies the top metric card');
  assert(await page.locator('#bladeKerf').isEditable(), 'Blade kerf is not editable');
  assert((await page.locator('#bladeKerf').locator('xpath=ancestor::label').textContent()).includes('enter your blade’s thickness'), 'Blade-thickness note is missing');
  assert(await page.locator('#materialCostMetric').locator('xpath=preceding-sibling::span').textContent() === 'Estimated Wood Cost', 'Estimated Wood Cost label is incorrect');
  assert(await page.locator('.glue-up-phase-control [data-glue-up-phase]').count() === 2, 'Both starting-crosscut choices are not visible');
  assert(await page.locator('.glue-up-phase-control [data-glue-up-phase="0"]').getAttribute('aria-pressed') === 'true', 'As-cut view is not the backward-compatible default');
  const asCutBaseline = {
    dimensions: await page.locator('#boardSizeMetric').textContent(),
    crosscuts: await page.locator('#crosscutMetric').textContent(),
    rows: await page.locator('#laminatedRowMetric').textContent(),
    material: await page.locator('#materialPurchaseMetric').textContent(),
    svg: await page.locator('#boardSvg').innerHTML()
  };
  await page.locator('.glue-up-phase-control [data-glue-up-phase="1"]').click();
  const turnedView = {
    dimensions: await page.locator('#boardSizeMetric').textContent(),
    crosscuts: await page.locator('#crosscutMetric').textContent(),
    rows: await page.locator('#laminatedRowMetric').textContent(),
    material: await page.locator('#materialPurchaseMetric').textContent(),
    svg: await page.locator('#boardSvg').innerHTML()
  };
  assert(await page.evaluate(() => state.glueUpPhase) === 1, 'Turned-first glue-up choice did not reach project state');
  assert(await page.locator('.glue-up-phase-control [data-glue-up-phase="1"]').getAttribute('aria-pressed') === 'true', 'Turned-first glue-up button is not selected');
  assert(asCutBaseline.svg !== turnedView.svg, 'Starting-crosscut choice did not change the board pattern');
  assert(JSON.stringify({ ...asCutBaseline, svg: null }) === JSON.stringify({ ...turnedView, svg: null }), 'Starting-crosscut choice changed a manufacturing result');
  assert(await page.locator('#boardSvg g[data-glue-up-phase="1"]').getAttribute('transform') === null, 'Alternate view translates the completed board and can create a blank edge');
  await page.evaluate(() => renderWorkshopPlan());
  assert((await page.locator('#printPlan').textContent()).includes('Crosscut 1 turned 180°'), 'Printable reference does not identify the selected glue-up start');
  assert((await page.locator('#printPlan').textContent()).includes('Turn Crosscut 1 180°, keep Crosscut 2 as cut'), 'Printable glue-up instructions do not follow the selected view');
  const turnedSnapshot = await page.evaluate(() => snapshot());
  await page.evaluate(serialized => restore(serialized), turnedSnapshot);
  assert(await page.locator('.glue-up-phase-control [data-glue-up-phase="1"]').getAttribute('aria-pressed') === 'true', 'Starting-crosscut choice did not survive project restore');
  await page.locator('.glue-up-phase-control [data-glue-up-phase="0"]').click();
  assert(await page.evaluate(() => state.glueUpPhase) === 0, 'As-cut glue-up choice could not be restored');
  assert(await page.locator('#edgeWood option').count() === 24, 'Expanded built-in wood library must contain 24 species');
  await page.locator('#addCustomWoodBtn').click();
  assert(await page.locator('[data-custom-name]').count() === 1, 'Custom wood editor was not added');
  await page.locator('[data-custom-name]').fill('Ambrosia Maple');
  await page.locator('[data-custom-name]').dispatchEvent('input');
  await page.locator('[data-custom-name]').dispatchEvent('change');
  await page.locator('[data-custom-color]').fill('#88aa66');
  await page.locator('[data-custom-color]').dispatchEvent('input');
  await page.locator('[data-custom-color]').dispatchEvent('change');
  assert(await page.locator('#edgeWood option[value="custom-1"]').textContent() === 'Ambrosia Maple', 'Custom wood is missing from Diamond Accent choices');
  assert(await page.locator('[data-border-wood]').first().locator('option[value="custom-1"]').count() === 1, 'Custom wood is missing from border choices');
  await page.locator('#edgeWood').selectOption('custom-1');
  assert(await page.evaluate(() => state.edgeWood) === 'custom-1', 'Custom wood was not accepted by Diamond Accent');
  assert(await page.locator('#boardSvg .edge-replacement[fill="url(#wood-custom-1)"]').count() > 0, 'Custom Diamond Accent color did not reach the board renderer');
  await page.locator('[data-border-wood]').first().evaluate(select => {
    select.value = 'custom-1';
    select.dispatchEvent(new Event('change', { bubbles: true }));
  });
  assert(await page.evaluate(() => state.borderBands[0].wood) === 'custom-1', 'Custom wood was not accepted by the border schedule');
  await page.locator('[data-strip-wood]').first().selectOption('custom-1');
  assert(await page.locator('#boardSvg pattern#wood-custom-1 rect').getAttribute('fill') === '#88aa66', 'Custom color did not reach the board renderer');
  assert((await page.locator('#materialTableBody').textContent()).includes('Ambrosia Maple'), 'Custom wood is missing from material quantities');
  assert(await page.locator('[data-wood-price="custom-1"]').count() === 1, 'Custom wood is missing from pricing');
  await page.evaluate(() => renderWorkshopPlan());
  assert((await page.locator('#printPlan').textContent()).includes('Ambrosia Maple'), 'Custom wood is missing from the printable guide');
  const customSnapshot = await page.evaluate(() => snapshot());
  await page.evaluate(serialized => restore(serialized), customSnapshot);
  assert(await page.locator('[data-custom-name]').inputValue() === 'Ambrosia Maple', 'Custom wood did not survive project restore');
  await page.evaluate(() => restore(JSON.stringify({
    customWoods: { 'custom-7': { name: '<Unsafe Wood>', color: 'red' } },
    strips: [{ width: 1, wood: 'custom-7' }]
  })));
  assert(await page.locator('[data-custom-name]').inputValue() === 'Unsafe Wood', 'Custom wood name was not normalized during restore');
  assert(await page.locator('[data-custom-color]').inputValue() === '#9b7653', 'Invalid custom color was not normalized during restore');
  await page.evaluate(() => restore(JSON.stringify(defaultState())));
  await page.evaluate(() => {
    state.strips = Array.from({ length: 8 }, (_, index) => ({ width: 0.2 + index * 0.01, wood: 'maple' }));
    render();
  });
  assert(await page.locator('#stripPairPosition').count() === 0, 'Rejected strip-position selector is still present');
  assert(await page.locator('.strip-insertion-control').count() === 9, 'Eight strips should show an inline control at all nine gaps');
  const offsetLabels = await page.locator('[data-strip-width]').evaluateAll(inputs => inputs.map(input => input.parentElement.textContent.trim()));
  assert(JSON.stringify(offsetLabels) === JSON.stringify(['Strip 1A','Strip 2A','Strip 3A','Strip 4A','Strip 4B','Strip 3B','Strip 2B','Strip 1B']), 'Mirrored strip offsets are not labeled outside-in');
  const mirroredPairButton = page.locator('[data-add-strip-pair="2"]').first();
  assert((await mirroredPairButton.textContent()).trim() === '+ Add 3A/3B', 'Inline pair control does not identify the new A/B offsets');
  await mirroredPairButton.locator('xpath=..').dispatchEvent('mouseenter');
  assert(await page.locator('.strip-insertion-control.pair-location-active').count() === 2, 'Matching insertion gap is not highlighted');
  await mirroredPairButton.click();
  assert(await page.locator('[data-strip-width]').count() === 10, 'Selected symmetrical pair was not added');
  assert(await page.locator('.strip-row.new-strip').count() === 2, 'Both newly inserted strips were not highlighted');
  const insertedWidths = await page.evaluate(() => [state.strips[2].width, state.strips[7].width]);
  assert(insertedWidths.every(width => width === 0.125), 'New strips were not inserted at the two selected gaps');
  const insertedLabels = await page.locator('[data-strip-width]').evaluateAll(inputs => inputs.map(input => input.parentElement.textContent.trim()));
  assert(insertedLabels[2] === 'Strip 3A' && insertedLabels[7] === 'Strip 3B', 'New mirrored strips did not receive matching A/B labels');
  assert(await page.locator('#removeOuterPairBtn, #removeInnerPairBtn').count() === 0, 'Rejected outer/inner removal controls are still present');
  const removePairButton = page.locator('[data-remove-strip-pair="2"]').first();
  assert((await removePairButton.textContent()).trim() === 'Remove 3A/3B', 'Pair-specific removal control has the wrong label');
  await removePairButton.dispatchEvent('mouseenter');
  assert(await page.locator('.strip-row.pair-remove-active').count() === 2, 'Removal hover does not highlight both matching strips');
  await removePairButton.click();
  assert(await page.locator('[data-strip-width]').count() === 8, 'Pair-specific removal did not remove both matching strips');
  const labelsAfterRemoval = await page.locator('[data-strip-width]').evaluateAll(inputs => inputs.map(input => input.parentElement.textContent.trim()));
  assert(JSON.stringify(labelsAfterRemoval) === JSON.stringify(offsetLabels), 'Remaining strips were not renumbered after pair removal');
  await page.evaluate(() => restore(JSON.stringify(defaultState())));
  assert(await page.locator('#wastePercent').inputValue() === '40', 'Diamond Accent design should default to 40% waste');
  assert((await page.locator('#wasteRecommendation').textContent()).includes('40% (Diamond Accent selected)'), '40% Diamond Accent recommendation is missing');
  await page.locator('#edgeInset').fill('0');
  await page.locator('#edgeInset').dispatchEvent('input');
  assert(await page.locator('#wastePercent').inputValue() === '35', 'No-Edge-Rip design should automatically use 35% waste');
  await page.locator('#wastePercent').fill('36');
  await page.locator('#wastePercent').dispatchEvent('input');
  await page.locator('#edgeInset').fill('0.5');
  await page.locator('#edgeInset').dispatchEvent('input');
  assert(await page.locator('#wastePercent').inputValue() === '36', 'Manual waste entry was overwritten by Diamond Accent');
  assert(await page.locator('#wasteWarning').isVisible(), 'Below-recommendation waste warning is missing');
  await page.locator('#useRecommendedWasteBtn').click();
  assert(await page.locator('#wastePercent').inputValue() === '40', 'Use recommended did not restore the conditional value');
  assert(await page.locator('#printPlanBtn').isVisible(), 'Print Workshop Plan action is missing');
  const planText = await page.locator('#printPlan').textContent();
  for (const heading of ['Finished Design', 'Lamination Engineering', 'Crosscut Engineering', 'Diamond Accent', 'Border Schedule', 'Estimated Wood Cost', 'Illustrated Build Procedure', 'Workshop Sequence — Quick Checklist']) {
    assert(planText.includes(heading), `Printable plan is missing ${heading}`);
  }
  assert((await page.locator('#printPlan').textContent()).includes('Actual Board Dimensions: 18.000 × 10.500 × 1.500 in'), 'Printable plan does not reflect the actual buildable dimensions');
  assert((await page.locator('#printPlan').textContent()).includes('Requested 18.625 × 11.625 × 1.500 in'), 'Printable plan does not disclose the requested dimensions');
  assert(await page.locator('#printPlan .print-board-reference').count() === 1, 'Finished board reference is missing from the printout');
  assert(await page.locator('#printPlan .print-board-reference polygon[fill^="#"]').count() > 0, 'Finished board reference does not contain printable solid wood colors');
  assert((await page.locator('#printPlan .print-board-section').textContent()).includes('Keep this image available throughout the build'), 'Finished board reference guidance is missing');
  const guideTitles = await page.locator('#printPlan .guide-copy h3').allTextContents();
  const edgeRipCutIndex = guideTitles.indexOf('Cut the Diamond Accent shoulders');
  const edgeRipGlueIndex = guideTitles.findIndex(title => title.includes('Diamond Accent pieces'));
  assert(guideTitles.indexOf('Make the four 45° cuts') < edgeRipCutIndex, 'Diamond Accent is not after the first 45-degree cuts');
  assert(edgeRipCutIndex < edgeRipGlueIndex, 'Diamond Accent cut is not before accent glue-up');
  const edgeRipGlueStep = page.locator('#printPlan .guide-step').nth(edgeRipGlueIndex);
  assert(await edgeRipGlueStep.locator('[data-guide-part="edge-rip-center-blank"]').getAttribute('points') === '140,45 280,45 380,95 280,145 140,145 40,95', 'Step 7 laminated center does not form the approved left and right points');
  assert(await edgeRipGlueStep.locator('[data-guide-part="edge-rip-diamond-square"]').getAttribute('points') === '210,12 380,95 210,178 40,95', 'Step 7 completed outline is not the approved diamond-shaped square');
  assert(await edgeRipGlueStep.locator('[data-guide-part="replacement-top"]').getAttribute('points') === '140,45 280,45 210,12', 'Top replacement triangle is not flush with the complete top cut face');
  assert(await edgeRipGlueStep.locator('[data-guide-part="replacement-bottom"]').getAttribute('points') === '140,145 280,145 210,178', 'Bottom replacement triangle is not flush with the complete bottom cut face');
  assert(await edgeRipGlueStep.locator('[data-guide-part="replacement-top-seam"]').getAttribute('x1') === '140' && await edgeRipGlueStep.locator('[data-guide-part="replacement-top-seam"]').getAttribute('x2') === '280', 'Top replacement seam does not cover the full cut face');
  assert(await edgeRipGlueStep.locator('[data-guide-part="replacement-bottom-seam"]').getAttribute('x1') === '140' && await edgeRipGlueStep.locator('[data-guide-part="replacement-bottom-seam"]').getAttribute('x2') === '280', 'Bottom replacement seam does not cover the full cut face');
  assert((await edgeRipGlueStep.textContent()).includes('completed cross-section is a square'), 'Step 7 does not explain the completed square cross-section');
  assert((await page.locator('#printPlan').textContent()).includes('Mill the selected lumber square and straight, and make sure to include extra allowance for planing and sanding.'), 'Simplified lumber-preparation wording is missing');
  await page.evaluate(() => { state.edgeWood = 'maple'; renderWorkshopPlan(); });
  assert((await page.locator('#printPlan .guide-copy h3').allTextContents()).includes('Glue the Hard Maple Diamond Accent pieces'), 'Diamond Accent title is not dynamic');
  assert(await page.locator('#printPlan [data-guide-part="replacement-top"]').getAttribute('fill') === '#e4ca96', 'Top Step 7 triangle does not use the selected replacement wood');
  assert(await page.locator('#printPlan [data-guide-part="replacement-bottom"]').getAttribute('fill') === '#e4ca96', 'Bottom Step 7 triangle does not use the selected replacement wood');
  await page.evaluate(() => { state.edgeWood = 'walnut'; renderWorkshopPlan(); });
  assert(edgeRipGlueIndex < guideTitles.indexOf('Dry-fit the 45° cut pieces'), 'Replacement glue-up is not a separate step before dry fit');
  assert(await page.locator('#printPlan .guide-step').count() === 12, 'Diamond Accent build must contain twelve illustrated steps');
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
  assert(!(await page.locator('#printPlan').textContent()).includes('Diamond Accent selected'), 'Illustration shows Diamond Accent when none is selected');
  assert(!(await page.locator('#printPlan').textContent()).includes('Accent cut depth:'), 'Diamond Accent schedule shows when none is selected');
  assert(await page.locator('#printPlan .guide-step').count() === 10, 'Zero Diamond Accent should remove its separate illustrated step');
  await page.locator('#edgeInset').fill('0.5');
  await page.locator('#edgeInset').dispatchEvent('input');
  await page.evaluate(() => renderWorkshopPlan());
  await page.evaluate(() => { window.__printCalled = false; window.print = () => { window.__printCalled = true; }; });
  await page.locator('#printPlanBtn').click();
  assert(await page.evaluate(() => window.__printCalled), 'Print Workshop Plan did not invoke printing');
  assert(await page.locator('#wastePercent').isEditable(), 'Waste allowance is not editable');
  assert(await page.locator('#materialNetMetric').count() === 0, 'Finished/net board-foot metric is still visible');
  assert(!(await page.locator('#materialTableBody').textContent()).includes('Net BF'), 'Material table still reports net board feet');
  assert(await page.locator('#materialTableBody tr').count() === 3, 'Default species were not combined into three rows');
  const purchaseBeforeWasteChange = Number((await page.locator('#materialPurchaseMetric').textContent()).split(' ')[0]);
  await page.locator('#wastePercent').fill('50');
  await page.locator('#wastePercent').dispatchEvent('input');
  const purchaseAfterWasteChange = Number((await page.locator('#materialPurchaseMetric').textContent()).split(' ')[0]);
  assert(purchaseAfterWasteChange > purchaseBeforeWasteChange, 'Waste allowance did not increase purchase board feet');
  assert(await page.locator('#materialCostMetric').textContent() === '$0.00', 'Pricing should default to zero');
  assert(await page.locator('[data-wood-price]').count() === 3, 'Each combined species should have one price input');
  const walnutPrice = page.locator('[data-wood-price="walnut"]');
  const walnutRow = walnutPrice.locator('xpath=ancestor::tr');
  await walnutPrice.fill('10');
  await walnutPrice.dispatchEvent('input');
  const walnutBuyBf = Number(await walnutRow.locator('td').nth(2).textContent());
  assert(await walnutRow.locator('td').nth(4).textContent() === `$${(walnutBuyBf * 10).toFixed(2)}`, 'Walnut species cost is incorrect');
  assert(await page.locator('#materialCostMetric').textContent() === `$${(walnutBuyBf * 10).toFixed(2)}`, 'Total material cost is incorrect');

  await page.locator('#boardLength').fill('18');
  await page.locator('#boardLength').dispatchEvent('input');
  await page.locator('#boardWidth').fill('13');
  await page.locator('#boardWidth').dispatchEvent('input');
  assert(await page.locator('#crosscutCountMetric').textContent() === '12 crosscuts', '12-crosscut balanced case failed');
  assert(await page.locator('#crosscutWarning').isHidden(), 'Balanced warning should be hidden');
  assert(await page.evaluate(() => previewGrid().lengthSliceCount) === 12, 'Preview is not driven by 12 calculated crosscuts');
  assert(await page.locator('#boardSizeMetric').textContent() === '18.000 × 12.000 in', 'Actual board did not keep eight complete 1.500 in laminated rows');
  assert(await page.locator('#actualBoardWarning').isVisible(), 'Requested-versus-actual warning is missing');
  assert((await page.locator('#actualBoardWarning').textContent()).includes('Requested 18.000 × 13.000 in'), 'Actual board warning does not disclose the requested size');
  assert(await page.locator('#actualBoardMetricCard').evaluate(card => card.classList.contains('metric-has-warning')), 'Actual board warning styling is missing');
  const actualNoBorder = await page.evaluate(() => ({ actual: actualBoardDimensions(), material: materialQuantity() }));
  assert(actualNoBorder.actual.length === 18 && actualNoBorder.actual.width === 12, 'Actual board helper returned the wrong no-border dimensions');
  assert(actualNoBorder.material.laminatedRows === 8, 'Material estimate does not count all eight complete laminated rows');
  assert(Math.abs(actualNoBorder.material.requiredBlankLength - 20.875) < 0.001, 'Material estimate does not use the full kerf-inclusive master blank');
  assert(actualNoBorder.material.totalPurchaseBoardFeet > 0, 'Rough-lumber estimate is empty');
  const stripCutSummarySnapshot = await page.evaluate(() => snapshot());
  await page.evaluate(() => restore(JSON.stringify({
    boardLength: 18,
    boardWidth: 13,
    finishedThickness: 1.5,
    includeBorders: false,
    edgeInset: 0,
    strips: [
      { width: 0.25, wood: 'maple' },
      { width: 0.125, wood: 'cherry' },
      { width: 0.25, wood: 'padauk' },
      { width: 0.1875, wood: 'maple' },
      { width: 0.25, wood: 'walnut' },
      { width: 0.25, wood: 'walnut' },
      { width: 0.1875, wood: 'maple' },
      { width: 0.25, wood: 'padauk' },
      { width: 0.125, wood: 'cherry' },
      { width: 0.25, wood: 'maple' }
    ]
  })));
  const laminationCutRows = page.locator('#printPlan .lamination-cut-table tbody tr');
  assert(await laminationCutRows.count() === 5, 'Lamination cut summary did not group identical species and widths');
  const mapleQuarterRow = laminationCutRows.filter({ hasText: '1A · 1B' });
  assert((await mapleQuarterRow.textContent()).includes('Hard Maple') && (await mapleQuarterRow.textContent()).includes('0.2500 in') && (await mapleQuarterRow.textContent()).includes('0.2850 in') && (await mapleQuarterRow.textContent()).includes('16 strips total') && (await mapleQuarterRow.textContent()).includes('2 per blank × 8 rows'), 'Quarter-inch Maple total does not report the 0.2850 in rough rip and sixteen strips for eight rows');
  const combinedCenterRow = page.locator('#printPlan .lamination-cut-table tbody tr[data-center-combined="true"]');
  assert(await combinedCenterRow.count() === 1, 'Matching center pair was not combined into one cut-summary row');
  const combinedCenterText = await combinedCenterRow.textContent();
  assert(combinedCenterText.includes('5A + 5B (combined center)') && combinedCenterText.includes('Walnut') && combinedCenterText.includes('0.5000 in') && combinedCenterText.includes('0.5350 in') && combinedCenterText.includes('8 strips total') && combinedCenterText.includes('1 per blank × 8 rows'), 'Combined Walnut center does not report the approved half-inch cut and eight-strip total');
  const groupedMaterial = await page.evaluate(() => materialQuantity());
  assert(groupedMaterial.laminateCuts.reduce((sum, entry) => sum + entry.totalQuantity, 0) === 72, 'Material estimate does not use the grouped physical strip count');
  assert(Math.abs(groupedMaterial.rows.find(row => row.species === 'walnut').roughCubicInches - 0.535 * 2.125 * 20.875 * 8) < 1e-9, 'Material estimate did not remove the duplicate center-strip rough allowance');
  assert((await page.locator('#printPlan').textContent()).includes('using one rough-rip allowance instead of two'), 'Printable guide does not explain the combined-center savings');
  await page.evaluate(serialized => restore(serialized), stripCutSummarySnapshot);
  const unborderedFrameAspect = await page.locator('#boardSvg > rect').first().evaluate(rect => (Number(rect.getAttribute('width')) - 6) / (Number(rect.getAttribute('height')) - 6));
  assert(Math.abs(unborderedFrameAspect - 1.5) < 0.001, 'Unbordered preview frame does not use the actual 18 × 12 aspect');
  await page.locator('#boardWidth').fill('12');
  await page.locator('#boardWidth').dispatchEvent('input');
  assert(await page.locator('#boardSizeMetric').textContent() === '18.000 × 12.000 in', 'Matching request changed the actual board');
  assert(await page.locator('#actualBoardWarning').isHidden(), 'Actual board warning did not clear when requested and actual sizes matched');

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

  await page.evaluate(() => restore(JSON.stringify({
    boardLength: 15.25,
    boardWidth: 10,
    finishedThickness: 1.5,
    includeBorders: true,
    borderBands: [{ width: 0.5, wood: 'maple' }],
    strips: [
      { width: 0.5, wood: 'cherry' },
      { width: 0.375, wood: 'maple' },
      { width: 0.375, wood: 'walnut' },
      { width: 0.5, wood: 'cherry' }
    ]
  })));
  assert(await page.locator('#laminatedRowMetric').textContent() === '4', 'A border must remove one complete laminated row from each edge');
  assert(await page.locator('#diamondFieldMetric').textContent() === '15.000 × 6.000 in', 'Finished-thickness border-row field is incorrect');
  assert(await page.locator('#requiredBorderMetric').textContent() === '2.0000 in per edge', 'Paired border replacement must use the 1.500 in finished cell pitch');
  assert(await page.locator('#borderDifferenceMetric').textContent() === '1.5000 in still needed per edge', 'Paired border completion warning is incorrect');
  await page.evaluate(() => restore(JSON.stringify({})));

  assert(await page.locator('.end-grain-border').count() === 0, 'Borders should default off');
  assert((await page.locator('#diamondFieldMetric').textContent()).includes('(full board)'), 'Border-off diamond field should use full width');
  await page.locator('#boardWidth').fill('13');
  await page.locator('#boardWidth').dispatchEvent('input');
  assert(await page.locator('#laminatedRowMetric').textContent() === '8', 'Automatic no-border laminated-row count is incorrect');
  await page.locator('#includeBorders').check();
  assert(await page.locator('.end-grain-border').count() === 2, 'Top and bottom borders were not rendered');
  await page.locator('[data-border-width]').fill('2.8125');
  await page.locator('[data-border-width]').dispatchEvent('input');
  await page.locator('[data-border-wood]').selectOption('padauk');
  await page.locator('#addBorderBandBtn').click();
  await page.locator('[data-border-width]').nth(1).fill('1.375');
  await page.locator('[data-border-width]').nth(1).dispatchEvent('input');
  await page.locator('[data-border-wood]').nth(1).selectOption('walnut');
  assert(await page.locator('#laminatedRowMetric').textContent() === '2', 'Only mirrored pairs of complete finished-thickness rows should be removed');
  assert(await page.locator('#diamondFieldMetric').textContent() === '18.000 × 3.000 in', 'Paired whole-row diamond field is incorrect');
  assert(await page.locator('#requiredBorderMetric').textContent() === '5.0000 in per edge', 'Paired replacement-border calculation is incorrect');
  assert(await page.locator('#borderDifferenceMetric').textContent() === '0.8125 in still needed per edge', 'Paired whole-row completion warning is incorrect');
  assert(await page.locator('#borderWarning').isVisible(), 'Mismatched dynamic border schedule should warn');
  assert(await page.locator('#boardSizeMetric').textContent() === '18.000 × 11.375 in', 'Entered borders were not included at their full physical width');
  assert(await page.locator('#actualBoardWarning').isVisible(), 'Mismatched border schedule should warn in Actual Board Dimensions');
  assert(Number((await page.locator('#materialPurchaseMetric').textContent()).split(' ')[0]) > 0, 'Mismatched borders removed the rough-lumber estimate');
  await page.locator('[data-border-width]').nth(0).fill('3.625');
  await page.locator('[data-border-width]').nth(0).dispatchEvent('input');
  assert(await page.locator('#borderDifferenceMetric').textContent() === 'Matched ✓', 'Matching border schedule was not recognized');
  assert(await page.locator('#borderWarning').isHidden(), 'Matched border schedule should not warn');
  assert(await page.locator('#boardSizeMetric').textContent() === '18.000 × 13.000 in', 'Matched borders did not produce the requested actual width');
  assert(await page.locator('#actualBoardWarning').isVisible(), 'Length mismatch warning was lost when only the border width matched');
  assert((await page.locator('#actualBoardWarning').textContent()).includes('Requested 18.625 × 13.000 in'), 'Length mismatch warning does not preserve the requested dimensions');
  assert(Number((await page.locator('#materialPurchaseMetric').textContent()).split(' ')[0]) > 0, 'Matched borders removed the rough-lumber estimate');
  for (let i = 0; i < 2; i += 1) await page.locator('#addBorderBandBtn').click();
  for (let i = 0; i < 4; i += 1) await page.locator('[data-border-wood]').nth(i).selectOption('padauk');
  assert(await page.locator('[data-border-width]').count() === 4, 'Four same-color physical bands were not kept as four entries');
  assert(await page.locator('.end-grain-border').count() === 8, 'Four same-color bands should render as eight mirrored strips');
  await page.locator('#includeBorders').uncheck();
  assert(await page.locator('.end-grain-border').count() === 0, 'Turning borders off did not restore full-diamond view');
  assert(await page.locator('#laminatedRowMetric').textContent() === '8', 'Turning borders off did not restore automatic laminated rows');

  await page.evaluate(() => restore(JSON.stringify({
    boardLength: 18,
    boardWidth: 12.875,
    finishedThickness: 1.5,
    includeBorders: true,
    borderBands: [
      { width: 1.125, wood: 'cherry' },
      { width: 0.1875, wood: 'padauk' }
    ],
    strips: [
      { width: 0.25, wood: 'cherry' },
      { width: 0.1875, wood: 'maple' },
      { width: 0.1875, wood: 'padauk' },
      { width: 0.3875, wood: 'walnut' },
      { width: 0.3875, wood: 'walnut' },
      { width: 0.1875, wood: 'padauk' },
      { width: 0.1875, wood: 'maple' },
      { width: 0.25, wood: 'cherry' }
    ],
    edgeInset: 0.5,
    edgeWood: 'walnut',
    bladeKerf: 0.125,
    wastePercent: 40,
    wasteIsManual: true,
    woodPrices: { maple: 8, padauk: 20, walnut: 28, cherry: 8 }
  })));
  assert(Math.abs(await page.evaluate(() => moduleWidth()) - 2.025) < 1e-9, 'Recreation fixture no longer has the reported 2.025 in strip total');
  assert(Math.abs(await page.evaluate(() => previewGrid().module) - 1.5) < 1e-9, 'Preview cell pitch is not finished thickness');
  assert(await page.locator('#crosscutCountMetric').textContent() === '12 crosscuts', '18 in recreation did not retain twelve finished crosscuts');
  assert(await page.locator('.bordered-diamond-field').getAttribute('data-laminated-rows') === '6', 'Recreation must render six complete rows / three full diamonds');
  assert(await page.locator('.bordered-diamond-field').getAttribute('data-finished-cell-pitch') === '1.5', 'Bordered field does not expose the 1.500 in finished cell pitch');
  assert(await page.locator('#diamondFieldMetric').textContent() === '18.000 × 9.000 in', 'Recreation diamond field is not six 1.500 in rows');
  assert(await page.locator('#requiredBorderMetric').textContent() === '1.9375 in per edge', 'Recreation required border width is incorrect');
  assert(await page.locator('#borderDifferenceMetric').textContent() === '0.6250 in still needed per edge', 'Recreation border completion warning is incorrect');
  assert(await page.locator('#materialPurchaseMetric').textContent() === '7.281 bd ft', 'Validation build tightened rough-lumber estimate changed');
  assert(await page.locator('#materialCostMetric').textContent() === '$119.91', 'Validation build tightened cost estimate changed');
  const validationMaterial = await page.evaluate(() => materialQuantity());
  assert(validationMaterial.rows.find(row => row.species === 'walnut').components.edgeRip > 0, 'Validation estimate omits Diamond Accent replacement stock');
  assert(validationMaterial.rows.find(row => row.species === 'cherry').components.borders > 0, 'Validation estimate omits border stock');
  assert((await page.locator('#materialTableBody').textContent()).includes('Rough laminate strips') && (await page.locator('#materialTableBody').textContent()).includes('Diamond Accent') && (await page.locator('#materialTableBody').textContent()).includes('Borders'), 'Material table does not disclose all rough-stock components');
  await page.evaluate(() => renderWorkshopPlan());
  const borderedPlanText = await page.locator('#printPlan').textContent();
  const expectedStripOrder = [
    'A side: 1A · 2A · 3A · 4A',
    'B side: 4B · 3B · 2B · 1B'
  ];
  for (const stepIndex of [2, 3, 4]) {
    const orderLabels = await page.locator('#printPlan .guide-step').nth(stepIndex).locator('.guide-strip-order').allTextContents();
    assert(JSON.stringify(orderLabels) === JSON.stringify(expectedStripOrder), `Step ${stepIndex + 1} strip-order labels are not split into clean A/B lines`);
    const orderBoxes = await page.locator('#printPlan .guide-step').nth(stepIndex).locator('.guide-strip-order').evaluateAll(labels => labels.map(label => {
      const box = label.getBBox();
      return { x: box.x, y: box.y, width: box.width, height: box.height };
    }));
    assert(orderBoxes.every(box => box.x >= 0 && box.x + box.width <= 420), `Step ${stepIndex + 1} strip-order labels overflow the diagram`);
    assert(orderBoxes[0].y + orderBoxes[0].height <= orderBoxes[1].y, `Step ${stepIndex + 1} strip-order label lines overlap`);
  }
  assert(!(await page.locator('#printPlan .guide-step').nth(3).locator('svg').textContent()).includes('clamp'), 'Step 4 retains overlapping clamp labels');
  const baselineLumberBlockWidth = Number(await page.locator('#printPlan .guide-step').first().locator('[data-guide-part="lumber-block"]').first().getAttribute('width'));
  const guideLayoutSnapshot = await page.evaluate(() => snapshot());
  await page.evaluate(() => {
    state.strips = [
      { width: 0.25, wood: 'maple' },
      { width: 0.125, wood: 'cherry' },
      { width: 0.125, wood: 'padauk' },
      { width: 0.125, wood: 'cherry' },
      { width: 0.21875, wood: 'walnut' },
      { width: 0.21875, wood: 'walnut' },
      { width: 0.125, wood: 'cherry' },
      { width: 0.125, wood: 'padauk' },
      { width: 0.125, wood: 'cherry' },
      { width: 0.25, wood: 'maple' }
    ];
    renderWorkshopPlan();
  });
  const tenStripOrder = await page.locator('#printPlan .guide-step').nth(2).locator('.guide-strip-order').allTextContents();
  assert(JSON.stringify(tenStripOrder) === JSON.stringify([
    'A side: 1A · 2A · 3A · 4A · 5A',
    'B side: 5B · 4B · 3B · 2B · 1B'
  ]), 'Ten-strip project does not retain the exact non-overlapping 1A–5A / 5B–1B order');
  assert(await page.locator('#printPlan .guide-step').first().locator('[data-guide-part="lumber-block"]').count() === 10, 'Step 1 does not show all ten lumber strips');
  const tenStripLumberWidth = Number(await page.locator('#printPlan .guide-step').first().locator('[data-guide-part="lumber-block"]').first().getAttribute('width'));
  assert(tenStripLumberWidth < baselineLumberBlockWidth, 'Step 1 lumber blocks do not shrink as the strip count grows');
  await page.evaluate(() => {
    state.strips = [
      { width: 0.25, wood: 'maple' },
      { width: 0.125, wood: 'cherry' },
      { width: 0.1875, wood: 'padauk' },
      { width: 0.1875, wood: 'maple' },
      { width: 0.125, wood: 'padauk' },
      { width: 0.1875, wood: 'walnut' },
      { width: 0.1875, wood: 'walnut' },
      { width: 0.125, wood: 'padauk' },
      { width: 0.1875, wood: 'maple' },
      { width: 0.1875, wood: 'padauk' },
      { width: 0.125, wood: 'cherry' },
      { width: 0.25, wood: 'maple' }
    ];
    renderWorkshopPlan();
  });
  const twelveStripStep = page.locator('#printPlan .guide-step').first();
  const twelveStripLabels = await twelveStripStep.locator('[data-guide-part="lumber-strip-label"]').allTextContents();
  assert(JSON.stringify(twelveStripLabels) === JSON.stringify(['1A', '2A', '3A', '4A', '5A', '6A', '6B', '5B', '4B', '3B', '2B', '1B']), 'Step 1 does not show the complete mirrored twelve-strip order');
  const twelveStripBlocks = await twelveStripStep.locator('[data-guide-part="lumber-block"]').evaluateAll(blocks => blocks.map(block => {
    const box = block.getBBox();
    return { x: box.x, width: box.width };
  }));
  assert(twelveStripBlocks.length === 12, 'Step 1 does not draw all twelve lumber blocks');
  assert(twelveStripBlocks.every(block => block.x >= 0 && block.x + block.width <= 420), 'Step 1 lumber blocks overflow the printable diagram');
  assert(twelveStripBlocks.every((block, index) => index === 0 || twelveStripBlocks[index - 1].x + twelveStripBlocks[index - 1].width <= block.x), 'Step 1 lumber blocks overlap');
  assert(twelveStripBlocks[0].width < tenStripLumberWidth, 'Step 1 lumber blocks do not continue shrinking for a twelve-strip schedule');
  await page.evaluate(serialized => restore(serialized), guideLayoutSnapshot);
  await page.evaluate(() => renderWorkshopPlan());
  assert(borderedPlanText.includes('Glue the borders before crosscutting'), 'Border-before-crosscut step is missing');
  assert(borderedPlanText.indexOf('Glue the borders before crosscutting') < borderedPlanText.indexOf('Mark the crosscuts from the top view'), 'Borders are not glued before crosscutting in the guide');
  const guideCrosscutCount = await page.evaluate(() => crosscutEngineering().crosscutCount);
  assert(await page.locator('#printPlan svg[aria-label*=completed] .guide-center-cut').count() === guideCrosscutCount - 1, 'Top-view crosscut lines do not match the calculated count');
  assert((await page.locator('#printPlan').textContent()).includes('freshly cut Walnut faces'), 'Selected Diamond Accent glue-up is missing');
  assert(await page.locator('.bordered-diamond-cell').count() === 72, 'Six rows by twelve crosscuts should render 72 complete cells');
  assert(await page.locator('[data-row="0"]').count() === 12 && await page.locator('[data-row="5"]').count() === 12, 'First or last recreation row is missing');
  assert(/^translate\([^)]*\) scale\([^ ,)]+\)$/.test(await page.locator('.bordered-diamond-cell').first().getAttribute('transform')), 'Recreation cells are not uniformly scaled squares');
  const borderedBaseline = {
    dimensions: await page.locator('#boardSizeMetric').textContent(),
    crosscuts: await page.locator('#crosscutMetric').textContent(),
    rows: await page.locator('#laminatedRowMetric').textContent(),
    material: await page.locator('#materialPurchaseMetric').textContent(),
    points: await page.locator('.bordered-diamond-cell').first().locator('.laminate-band').first().getAttribute('points')
  };
  await page.locator('.glue-up-phase-control [data-glue-up-phase="1"]').click();
  const borderedTurned = {
    dimensions: await page.locator('#boardSizeMetric').textContent(),
    crosscuts: await page.locator('#crosscutMetric').textContent(),
    rows: await page.locator('#laminatedRowMetric').textContent(),
    material: await page.locator('#materialPurchaseMetric').textContent(),
    points: await page.locator('.bordered-diamond-cell').first().locator('.laminate-band').first().getAttribute('points')
  };
  assert(await page.locator('.bordered-diamond-field').getAttribute('data-glue-up-phase') === '1', 'Bordered preview did not adopt the selected starting crosscut');
  assert(borderedBaseline.points !== borderedTurned.points, 'Bordered diamond placement did not change between glue-up views');
  assert(JSON.stringify({ ...borderedBaseline, points: null }) === JSON.stringify({ ...borderedTurned, points: null }), 'Bordered starting-crosscut choice changed a manufacturing result');
  await page.locator('.glue-up-phase-control [data-glue-up-phase="0"]').click();
  const lengthFit = await page.evaluate(() => {
    const field = document.querySelector('.bordered-diamond-field');
    return {
      startGap: Math.abs(Number(field.dataset.gridX) - Number(field.dataset.boardFieldX)),
      endGap: Math.abs(
        Number(field.dataset.gridX) + Number(field.dataset.gridWidth)
        - Number(field.dataset.boardFieldX) - Number(field.dataset.boardFieldWidth)
      )
    };
  });
  assert(lengthFit.startGap < 1e-6 && lengthFit.endGap < 1e-6, 'Twelve 1.500 in crosscuts do not occupy the exact 18.000 in preview length');

  await page.locator('[data-border-width]').first().fill('1.75');
  await page.locator('[data-border-width]').first().dispatchEvent('input');
  assert(await page.locator('#borderDifferenceMetric').textContent() === 'Matched ✓', '1.9375 in recreation border schedule was not recognized');
  let alignment = await page.evaluate(() => {
    const borders = [...document.querySelectorAll('.end-grain-border')];
    const field = document.querySelector('.bordered-diamond-field');
    const y = Number(field.dataset.fieldY);
    const h = Number(field.dataset.fieldHeight);
    const topEnd = Math.max(...borders.map(border => Number(border.getAttribute('y')) + Number(border.getAttribute('height'))).filter(edge => edge <= y + 0.0001));
    const bottomStart = Math.min(...borders.map(border => Number(border.getAttribute('y'))).filter(edge => edge >= y + h - 0.0001));
    return {
      topGap: Math.abs(topEnd - y),
      bottomGap: Math.abs(bottomStart - (y + h))
    };
  });
  assert(alignment.topGap < 1e-6 && alignment.bottomGap < 1e-6, 'Matched recreation borders do not meet the six complete rows exactly');

  await page.evaluate(() => restore(JSON.stringify({ includeBorders: true, borderWidth: 0.75, borderWood: 'padauk' })));
  assert(await page.locator('[data-border-width]').count() === 1, 'Legacy single border did not migrate to one band');
  assert(await page.locator('[data-border-width]').inputValue() === '0.7500', 'Legacy border width migration failed');
  assert(await page.locator('[data-border-wood]').inputValue() === 'padauk', 'Legacy border wood migration failed');
  const samplePage = await browser.newPage();
  const sampleErrors = [];
  samplePage.on('pageerror', error => sampleErrors.push(error.message));
  await samplePage.goto(pathToFileURL(path.join(root, 'sample-build.html')).href);
  assert(await samplePage.locator('.design-reference img').count() === 1, 'Sample Build does not display the opening Designer reference');
  assert(await samplePage.locator('.design-reference img').evaluate(image => image.complete && image.naturalWidth > 0), 'The opening Designer reference failed to load');
  assert(await samplePage.locator('.step').first().locator('img').count() === 2, 'Sample Build step 1 does not display both supplied photos');
  assert(await samplePage.locator('.step').first().locator('img').evaluateAll(images => images.every(image => image.complete && image.naturalWidth > 0)), 'One or more Step 1 photos failed to load');
  assert(await samplePage.locator('.step').nth(1).locator('img').count() === 2, 'Sample Build step 2 does not display both supplied photos');
  assert(await samplePage.locator('.step').nth(1).locator('img').evaluateAll(images => images.every(image => image.complete && image.naturalWidth > 0)), 'One or more Step 2 photos failed to load');
  assert(JSON.stringify(await samplePage.locator('.step').nth(1).locator('img').evaluateAll(images => images.map(image => image.dataset.photoFile))) === JSON.stringify(['strip-order-dry-fit.png', 'strip-stack-measurement.png']), 'Step 2 browser photo order is incorrect');
  assert(await samplePage.locator('.step').nth(2).locator('img').count() === 3, 'Sample Build step 3 does not display all three supplied photos');
  assert(await samplePage.locator('.step').nth(2).locator('img').evaluateAll(images => images.every(image => image.complete && image.naturalWidth > 0)), 'One or more Step 3 photos failed to load');
  assert(JSON.stringify(await samplePage.locator('.step').nth(2).locator('img').evaluateAll(images => images.map(image => image.dataset.photoFile))) === JSON.stringify(['laminated-blank-glue-up.png', 'laminated-assembly-measurement.png', 'squared-blank-measurement.png']), 'Step 3 browser photo order is incorrect');
  assert(await samplePage.locator('.step').nth(3).locator('img').count() === 3, 'Sample Build step 4 does not display all three supplied photos');
  assert(await samplePage.locator('.step').nth(3).locator('img').evaluateAll(images => images.every(image => image.complete && image.naturalWidth > 0)), 'One or more Step 4 photos failed to load');
  assert(await samplePage.locator('.step').nth(4).locator('img').count() === 3, 'Sample Build step 5 does not display all three supplied photos');
  assert(await samplePage.locator('.step').nth(4).locator('img').evaluateAll(images => images.every(image => image.complete && image.naturalWidth > 0)), 'One or more Step 5 photos failed to load');
  assert(await samplePage.locator('.step').nth(5).locator('img').count() === 3, 'Sample Build step 6 does not display all three supplied photos');
  assert(await samplePage.locator('.step').nth(5).locator('img').evaluateAll(images => images.every(image => image.complete && image.naturalWidth > 0)), 'One or more Step 6 photos failed to load');
  assert(JSON.stringify(await samplePage.locator('.step').nth(5).locator('img').evaluateAll(images => images.map(image => image.dataset.photoFile))) === JSON.stringify(['replacement-strip-glue-up.png', 'replacement-glue-up-alignment.png', 'maple-walnut-glue-up.png']), 'Step 6 browser photo order is incorrect');
  assert(await samplePage.locator('.step').nth(6).locator('img').count() === 2, 'Sample Build step 7 does not display both supplied photos');
  assert(await samplePage.locator('.step').nth(6).locator('img').evaluateAll(images => images.every(image => image.complete && image.naturalWidth > 0)), 'One or more Step 7 photos failed to load');
  assert(await samplePage.locator('.step').nth(7).locator('img').count() === 1, 'Sample Build step 8 does not display the supplied crosscut sequence photo');
  assert(await samplePage.locator('.step').nth(7).locator('img').evaluateAll(images => images.every(image => image.complete && image.naturalWidth > 0)), 'The Step 8 photo failed to load');
  assert(await samplePage.locator('.step').nth(8).locator('img').count() === 1, 'Sample Build step 9 does not display the supplied dry-fit photo');
  assert(await samplePage.locator('.step').nth(8).locator('img').evaluateAll(images => images.every(image => image.complete && image.naturalWidth > 0)), 'The Step 9 photo failed to load');
  assert(await samplePage.locator('.step').nth(9).locator('img').count() === 2, 'Sample Build step 10 does not display both finished-board photos');
  assert(await samplePage.locator('.step').nth(9).locator('img').evaluateAll(images => images.every(image => image.complete && image.naturalWidth > 0)), 'One or more Step 10 photos failed to load');
  assert(JSON.stringify(await samplePage.locator('.step').nth(9).locator('img').evaluateAll(images => images.map(image => image.dataset.photoFile))) === JSON.stringify(['finished-board-perspective.png', 'finished-board-top-view.png']), 'Step 10 browser photo order is incorrect');
  assert(await samplePage.locator('.photo-thumbnail').count() === 23, 'Every Sample Build image must be clickable');
  assert(await samplePage.locator('.photo-thumbnail').first().getAttribute('role') === 'button', 'Photo thumbnails are not keyboard accessible');
  await samplePage.locator('.photo-thumbnail').first().click();
  assert(await samplePage.locator('#photoLightbox').isVisible(), 'Clicking a Sample Build photo did not open the enlarged viewer');
  assert((await samplePage.locator('#photoLightboxImage').getAttribute('src')).startsWith('data:image/png;base64,'), 'Enlarged photo is not self-contained');
  assert(await samplePage.locator('#photoLightboxCounter').textContent() === '1 of 23', 'Photo viewer counter is incorrect');
  await samplePage.locator('#photoLightboxNext').click();
  assert(await samplePage.locator('#photoLightboxCounter').textContent() === '2 of 23', 'Photo viewer next control failed');
  await samplePage.locator('#photoLightboxClose').click();
  assert(await samplePage.locator('#photoLightbox').isHidden(), 'Photo viewer close control failed');
  const userGuidePage = await browser.newPage();
  const userGuideErrors = [];
  userGuidePage.on('pageerror', error => userGuideErrors.push(error.message));
  await userGuidePage.goto(pathToFileURL(path.join(root, 'user-guide.html')).href);
  assert((await userGuidePage.locator('h1').textContent()).includes('User Guide'), 'User Guide heading is missing');
  assert(await userGuidePage.locator('.section').count() === 9, 'User Guide does not display all nine major sections');
  assert(await userGuidePage.getByRole('button', { name: 'Print Guide' }).isVisible(), 'User Guide print control is missing');
  const faqPage = await browser.newPage();
  const faqErrors = [];
  faqPage.on('pageerror', error => faqErrors.push(error.message));
  await faqPage.goto(pathToFileURL(path.join(root, 'faq.html')).href);
  assert((await faqPage.locator('h1').textContent()).includes('FAQ'), 'FAQ heading is missing');
  assert(await faqPage.locator('details.faq').count() === 37, 'FAQ does not display all 37 questions');
  await faqPage.locator('details.faq summary').first().click();
  assert(await faqPage.locator('details.faq').first().getAttribute('open') !== null, 'FAQ question did not expand');
  assert(sampleErrors.length === 0, `Sample Build browser errors: ${sampleErrors.join('; ')}`);
  assert(userGuideErrors.length === 0, `User Guide browser errors: ${userGuideErrors.join('; ')}`);
  assert(faqErrors.length === 0, `FAQ browser errors: ${faqErrors.join('; ')}`);
  assert(errors.length === 0, `Browser errors: ${errors.join('; ')}`);
  await browser.close();
  console.log('VERSION/CACHE PASS');
  console.log('FROZEN GEOMETRY/RENDERER PASS');
  console.log('BROWSER/MANUFACTURING/BORDER REGRESSION PASS');
})().catch(error => { console.error(error); process.exit(1); });
