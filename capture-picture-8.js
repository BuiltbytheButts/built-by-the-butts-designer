"use strict";

const path = require("path");
const { pathToFileURL } = require("url");
const { chromium } = require("C:/Users/built/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright");

(async function capturePicture8() {
  const appUrl = pathToFileURL(path.join(__dirname, "index.html")).href;
  const outputPath = path.resolve(__dirname, "..", "..", "outputs", "Diamond-End-Grain-Designer-v3.0.78-picture-8.png");
  const strips = [
    { width: 0.25, wood: "maple" },
    { width: 0.125, wood: "cherry" },
    { width: 0.25, wood: "padauk" },
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
  const page = await browser.newPage({ viewport: { width: 1700, height: 1100 }, deviceScaleFactor: 1.5 });
  await page.goto(appUrl);
  await page.evaluate((nextStrips) => {
    localStorage.setItem("diamond-end-grain-designer-v3", JSON.stringify({
      version: "3.0.78",
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
      bladeKerf: 0.125,
      edgeInset: 0.25,
      edgeWood: "padauk",
      strips: nextStrips
    }));
  }, strips);
  await page.reload();
  await page.evaluate(() => { window.print = () => {}; });
  await page.locator("#printPlanBtn").click();
  await page.emulateMedia({ media: "print" });
  await page.waitForTimeout(150);
  const titles = await page.locator("#printPlan .guide-copy h3").allTextContents();
  const picture8Index = titles.indexOf("Dry-fit the 45° cut pieces");
  if (picture8Index < 0) throw new Error("Picture 8 was not found.");
  const picture8 = page.locator("#printPlan .guide-step").nth(picture8Index);
  await picture8.screenshot({ path: outputPath });
  const result = await picture8.evaluate((element) => ({
    pieces: element.querySelectorAll('[data-guide-part="dry-fit-piece"]').length,
    strips: element.querySelectorAll('[data-guide-part="dry-fit-strip"]').length,
    joints: element.querySelectorAll('[data-guide-part="dry-fit-joint"]').length,
    text: element.innerText
  }));
  await browser.close();
  console.log(JSON.stringify({ outputPath, ...result }, null, 2));
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
