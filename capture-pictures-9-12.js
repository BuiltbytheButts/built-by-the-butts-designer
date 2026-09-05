"use strict";

const path = require("path");
const { pathToFileURL } = require("url");
const { chromium } = require("C:/Users/built/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright");

(async function capturePictures9To12() {
  const appUrl = pathToFileURL(path.join(__dirname, "index.html")).href;
  const outputPath = path.resolve(__dirname, "..", "..", "outputs", "Diamond-End-Grain-Designer-v3.0.81-pictures-9-12.png");
  const strips = [
    { width: 0.25, wood: "maple" },
    { width: 0.125, wood: "cherry" },
    { width: 0.25, wood: "purpleheart" },
    { width: 0.1875, wood: "maple" },
    { width: 0.25, wood: "walnut" },
    { width: 0.25, wood: "walnut" },
    { width: 0.1875, wood: "maple" },
    { width: 0.25, wood: "padauk" },
    { width: 0.125, wood: "cherry" },
    { width: 0.25, wood: "maple" }
  ];
  const browser = await chromium.launch({
    headless: true,
    executablePath: "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
    args: ["--allow-file-access-from-files"]
  });
  const page = await browser.newPage({ viewport: { width: 1700, height: 1500 }, deviceScaleFactor: 1.5 });
  await page.goto(appUrl);
  await page.evaluate((nextStrips) => {
    localStorage.setItem("diamond-end-grain-designer-v3", JSON.stringify({
      version: "3.0.81",
      boardLength: 18,
      boardWidth: 12,
      finishedThickness: 1.5,
      glueUpPhase: 0,
      includeBorders: false,
      borderBands: [{ width: 0.5, wood: "maple" }],
      customWoods: {},
      nextCustomWoodId: 1,
      wastePercent: 40,
      wasteIsManual: false,
      woodPrices: {},
      bladeKerf: 0.181,
      edgeInset: 0.25,
      edgeWood: "padauk",
      strips: nextStrips
    }));
  }, strips);
  await page.reload();
  await page.evaluate(() => { window.print = () => {}; });
  await page.locator("#printPlanBtn").click();
  await page.emulateMedia({ media: "print" });
  await page.evaluate(() => {
    const steps = [...document.querySelectorAll("#printPlan .guide-step")];
    steps.forEach((step, index) => { step.style.display = index >= steps.length - 4 ? "grid" : "none"; });
  });
  const guide = page.locator("#printPlan .guide-steps");
  await guide.screenshot({ path: outputPath });
  const result = await guide.evaluate((element) => ({
    titles: [...element.querySelectorAll(".guide-step:not([style*=\"display: none\"]) h3")].map(title => title.textContent),
    masterSections: element.querySelectorAll('[data-guide-part="master-blank-profile"] [data-guide-part="dry-fit-piece"]').length,
    cutLines: element.querySelectorAll('[data-guide-part="master-crosscut-line"]').length,
    assignedCrosscuts: element.querySelectorAll('[data-guide-part="assigned-crosscut"]').length,
    finishedCells: element.querySelectorAll('[data-guide-part="finished-board-cell"]').length
  }));
  await browser.close();
  console.log(JSON.stringify({ outputPath, ...result }, null, 2));
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
