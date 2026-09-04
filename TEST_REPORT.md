# v3.0.72 Compact Uniform Header Actions

- PASS — the header contains eight matching clickable controls.
- PASS — every header control has the same compact width and 46 px height, including Help and Sample Build.
- PASS — long labels remain centered and wrap within their controls.
- PASS — syntax, geometry, manufacturing, material, version/cache, print-guide, and browser regression checks completed for v3.0.72.
- PASS — frozen geometry.js and frozen Diamond Accent/laminate/board-renderer function hashes are unchanged.

# v3.0.71 Diamond Accent Terminology

- PASS — the Designer control is labeled Diamond Accent with Accent cut depth and Diamond Accent wood settings.
- PASS — the printed guide uses Cut the Diamond Accent shoulders and dynamically names the selected Diamond Accent pieces.
- PASS — material rows, waste guidance, Sample Build, User Guide, FAQ, and current documentation use Diamond Accent terminology.
- PASS — existing saved-project fields remain compatible, and all geometry, manufacturing, material, and browser regression checks completed for v3.0.71.
- PASS — frozen geometry.js and frozen Diamond Accent/laminate/board-renderer function hashes are unchanged.

# v3.0.70 Tighter Laminate-Strip Rough-Rip Allowance

- PASS — a 0.2500 in finished laminate strip recommends a 0.2850 in rough rip.
- PASS — a combined 0.5000 in center pair recommends a 0.5350 in rough rip with the allowance applied once.
- PASS — the first validation build updates from 7.779 bd ft / $127.03 to 7.281 bd ft / $119.91 while its separate border allowance remains unchanged.
- PASS — syntax, geometry, manufacturing, material, version/cache, print-guide, and browser regression checks completed for v3.0.70.
- PASS — frozen geometry.js and frozen Edge Rip/laminate/board-renderer function hashes are unchanged.

# v3.0.69 Clearer Design-Image Download

- PASS — the main action now reads “Download Design Image” and retains the existing SVG download behavior.
- PASS — the button tooltip, FAQ, and User Guide explain SVG in plain language.
- PASS — syntax, geometry, manufacturing, material, version/cache, print-guide, and browser regression checks completed for v3.0.69.
- PASS — frozen geometry.js and frozen Edge Rip/laminate/board-renderer function hashes are unchanged.

# v3.0.68 Grouped Strip Totals and Combined Center Stock

- PASS — the printable Lamination Engineering table groups identical species and finished-width cut settings.
- PASS — two 0.2500 in Hard Maple strips per blank across eight rows report 16 strips total.
- PASS — the matching 0.2500 in Walnut center pair becomes one 0.5000 in finished / 0.5625 in rough strip per blank and reports eight strips total.
- PASS — the material engine applies one center-strip rough allowance; the validation build is now 7.779 bd ft / $127.03 before comparison with the purchased stock.
- PASS — syntax, geometry, manufacturing, material, version/cache, print-guide, and browser regression checks completed for v3.0.68.
- PASS — frozen geometry.js and frozen Edge Rip/laminate/board-renderer function hashes are unchanged.

# v3.0.67 Dynamic Step 1 Lumber Layout

- PASS — Step 1 draws one labeled lumber block for every strip in the active mirrored schedule.
- PASS — a twelve-strip design shows the full 1A–6A / 6B–1B sequence inside the printable diagram.
- PASS — blocks progressively shrink as strip count grows, remain centered, do not overlap, and stay within the SVG bounds.
- PASS — syntax, geometry, manufacturing, material, version/cache, print-guide, and browser regression checks completed for v3.0.67.
- PASS — frozen geometry.js and frozen Edge Rip/laminate/board-renderer function hashes are unchanged.

# v3.0.66 Correct Step 7 Diamond-Square Assembly

- PASS — the laminated center forms the left and right points of the completed cross-section.
- PASS — the selected Edge Rip replacement triangles attach to the full top and bottom cut faces.
- PASS — the final four-point outline is a true square rotated 45 degrees.
- PASS — both replacement triangles retain dynamic species color and labeling.
- PASS — syntax, geometry, manufacturing, material, version/cache, print-guide, and browser regression checks completed for v3.0.66.
- PASS — frozen geometry.js and frozen Edge Rip/laminate/board-renderer function hashes are unchanged.

# v3.0.65 Flush Step 7 Replacement-Triangle Assembly

- PASS — Step 7 retains the octagonal Edge Rip cut face from the preceding operation.
- PASS — the left replacement triangle shares the complete left target-band edge with no gap.
- PASS — the right replacement triangle shares the complete right target-band edge with no gap.
- PASS — both triangles use the currently selected Edge Rip replacement species and remain dynamically labeled.
- PASS — syntax, geometry, manufacturing, material, version/cache, print-guide, and browser regression checks completed for v3.0.65.
- PASS — frozen geometry.js and frozen Edge Rip/laminate/board-renderer function hashes are unchanged.

# v3.0.64 Pre-45° Lamination Strip-Total Validation

- PASS — the strip total is compared with the rounded Required Lamination Size Before 45° Cuts instead of finished board thickness.
- PASS — a 1.500 in finished board requires a 2.1250 in strip total; a 1.3750 in schedule reports a 0.7500 in shortage.
- PASS — the warning appears in the Strip Schedule and Required Lamination Size result, not in Finished thickness.
- PASS — the printable workshop plan, User Guide, and FAQ use the same pre-45° requirement.
- PASS — syntax, geometry, manufacturing, material, version/cache, and browser regression checks completed for v3.0.64.
- PASS — frozen geometry.js and frozen Edge Rip/laminate/original-renderer function hashes are unchanged.

# v3.0.63 Laminated-Row Length and Board-Foot Disclosure

- PASS — the Laminated rows card states the required count and minimum kerf-inclusive length for every row.
- PASS — a 24.000 in requested board at 1.500 in thickness shows 7 rows at least 27.875 in long in the validation fixture.
- PASS — Estimated Wood Cost displays and uses the same 7 × 27.875 in row-length basis.
- PASS — increasing the required row length proportionally increases rough board feet, purchase board feet, and estimated cost.
- PASS — syntax, geometry, manufacturing, material, version/cache, and browser regression checks completed for v3.0.63.
- PASS — frozen geometry.js and frozen Edge Rip/laminate/original-renderer function hashes are unchanged.

# v3.0.62 Length Trace and Finished-Strip-Total Validation

- PASS — 24.000 in requested length at 1.500 in finished thickness produces 16 crosscuts and a 24.000 in projected finished run.
- PASS — 16 rough crosscuts at 1.625 in plus 15 blade kerfs at 0.125 in produces a 27.875 in required rough master blank.
- PASS — a 1.3750 in finished strip total against a 1.5000 in requested thickness shows a 0.1250 in shortage in the Strip Schedule, top Finished thickness result, and printable plan.
- PASS — matching the finished strip total to finished thickness clears both screen warnings.
- PASS — syntax, geometry, manufacturing, material, version/cache, and browser regression checks completed for v3.0.62.
- PASS — frozen geometry.js and frozen Edge Rip/laminate/original-renderer function hashes are unchanged.

# v3.0.61 Complete Sample Build Photo Guide

- PASS — the original Designer target appears before Step 1 and opens in the enlarged-photo viewer.
- PASS — Step 10 contains both supplied finished-board photos in the approved perspective-then-top-view order.
- PASS — all twenty-three self-contained images load, remain clickable, and retain captions and descriptive alternate text.
- PASS — the Sample Build contains all ten numbered steps and no unfinished photo placeholder.
- PASS — screen and print layouts keep the opening reference and both finished-board photos legible.
- PASS — syntax, geometry, manufacturing, material, version/cache, and browser regression checks completed for v3.0.61.
- PASS — frozen geometry.js and frozen Edge Rip/laminate/original-renderer function hashes are unchanged.

# v3.0.60 Illustrated-Guide Label Cleanup

- PASS — Steps 3, 4, and 5 display the ten-strip 1A–5A / 5B–1B order on two separate centered lines.
- PASS — both strip-order lines remain within the SVG view box and do not overlap vertically.
- PASS — Step 4 no longer contains clamp text competing with the vertical square dimension.
- PASS — syntax, geometry, manufacturing, material, version/cache, and browser regression checks completed for v3.0.60.
- PASS — frozen geometry.js and frozen Edge Rip/laminate/original-renderer function hashes are unchanged.

# v3.0.59 Rough-Stock Wood Cost Validation

- PASS — every physical strip is counted at rough-rip width for every retained laminated row.
- PASS — the estimator uses the required pre-45° square size and full kerf-inclusive master-blank length.
- PASS — Edge Rip replacement and both physical copies of every border band are included and combined by species.
- PASS — waste and price changes recalculate rough board feet and Estimated Wood Cost without changing geometry.
- PASS — the supplied validation build estimates 7.941 bd ft / $131.56 versus 9.292 bd ft / $144.69 purchased with usable leftovers.
- PASS — finished cubic inches and net board feet are absent from the Designer and printable guide.
- PASS — syntax, geometry, manufacturing, material, version/cache, and browser regression checks completed for v3.0.59.
- PASS — frozen geometry.js and frozen Edge Rip/laminate/original-renderer function hashes are unchanged.

# v3.0.58 Sample Build Photo Sequencing

- PASS — Step 2 displays the full strip layout before the combined stack measurement.
- PASS — Step 3 displays the clamped laminated-blank glue-up before the two measurement photos.
- PASS — Step 6 displays both clamped glue-up views before the former first replacement-piece photo.
- PASS — all twenty embedded photos load, remain clickable, and retain their original captions and filenames.
- PASS — Step 10 retains the single finishing-photo placeholder for the user’s forthcoming oiled-board photos.
- PASS — syntax, geometry, manufacturing, material, version/cache, and browser regression checks completed for v3.0.58.
- PASS — frozen geometry.js and frozen Edge Rip/laminate/original-renderer function hashes are unchanged.

# v3.0.57 Starting-Crosscut Glue-Up Views

- PASS — As cut and Turned 180° produce visibly different diamond placement from the same complete crosscuts.
- PASS — the alternate view redraws every crosscut in place with no blank, translated, or clipped board edge.
- PASS — actual dimensions, crosscut count, laminated rows, borders, material quantities, and pricing are invariant between both views.
- PASS — the selected view survives project save/open and appears in the printable reference and glue-up instructions.
- PASS — bordered and unbordered previews both honor the selected starting crosscut.
- PASS — syntax, geometry, manufacturing, material, version/cache, and browser regression checks completed for v3.0.57.
- PASS — frozen geometry.js and frozen Edge Rip/laminate/original-renderer function hashes are unchanged.

# v3.0.56 Actual Board Dimensions

- PASS — requested dimensions remain editable and are clearly labeled as requested.
- PASS — 18.000 × 13.000 in requested at 1.500 in thickness produces 12 whole crosscuts × 8 whole rows and reports 18.000 × 12.000 in actual.
- PASS — a compact warning appears when requested and actual dimensions differ and clears when they match.
- PASS — entered borders contribute their full physical width to the actual board instead of being resized or silently trimmed.
- PASS — preview, material quantity, printed summary, border schedule, and illustrated guide agree with the actual buildable dimensions.
- PASS — version/cache, syntax, geometry, manufacturing, material, and browser regression checks completed for v3.0.56.
- PASS — frozen geometry.js and frozen Edge Rip/laminate/base-renderer function hashes are unchanged.

# v3.0.55 Finished-Cell Sizing Correction
- PASS — the reported 18.000 × 12.875 × 1.500 in recreation uses six retained rows and displays three complete diamonds between the borders.
- PASS — the fixture intentionally totals 2.025 in across its finished strip schedule, while the preview correctly uses the independent 1.500 in finished cell pitch.
- PASS — twelve calculated crosscuts occupy exactly the full 18.000 in preview length with no strip-total-driven clipping.
- PASS — the recreated 1.3125 in border schedule requires 1.9375 in per edge and correctly reports 0.6250 in still needed.
- PASS — the latest saved 18.000 × 13.000 × 1.500 in project renders six rows, 72 complete cells, a 9.000 in diamond field, and a 0.2500 in per-edge border warning.
- PASS — syntax, geometry, manufacturing, material, version/cache, Sample Build, border, print, and frozen geometry/renderer regressions.

# v3.0.54 Save/Open Confirmation and Restore
- PASS — the exact user-downloaded v3.0.53 JSON restores 15.250 × 10.000 in, all eight strips, the border band, and the custom wood without browser errors.
- PASS — reopening the same file clearly reports that it matches the design already on screen.
- PASS — Save Project downloads valid v3.0.54 JSON and shows its filename and Downloads location.
- PASS — Open Project uses a dedicated button, resets after each selection, and can reopen the same file repeatedly.
- PASS — invalid-file errors remain visible for seven seconds; successful save/open confirmations remain visible for five seconds.
- PASS — syntax, geometry, manufacturing, material, version/cache, Sample Build, border, print, and frozen geometry/renderer regressions.

# v3.0.53 User Guide and FAQ
- PASS — the Designer Help menu exposes independent User Guide and FAQ links without crowding the header with two more buttons.
- PASS — User Guide contains the quick start, every control group, top results, warnings, materials, project tools, build references, workflow, and glossary.
- PASS — FAQ contains 35 interactive answers and opens/closes correctly in the browser.
- PASS — both pages are self-contained, printable, responsive, and load with no browser errors.
- PASS — syntax, geometry, manufacturing, material, version/cache, Sample Build, border, print, and frozen-renderer regressions.

# v3.0.52 Self-Contained Clickable Sample Build Photos
- PASS — all twenty original photos are embedded in Sample Build with no external photo or stylesheet dependency.
- PASS — every thumbnail opens the enlarged viewer and exposes keyboard-accessible controls.
- PASS — previous, next, caption, counter, close, and embedded enlarged-image behavior work in the browser.
- PASS — syntax, photo loading, geometry, manufacturing, material, version/cache, border, print, and frozen-renderer regressions.

# v3.0.51 Mirrored Border Row-Pair Replacement
- PASS — mirrored borders remove one complete laminated row from both edges at each threshold.
- PASS — 10.000 in board, 1.750 in module, and 0.500 in entered border produces four rows and requires 1.500 in per edge.
- PASS — wider border schedules retain paired row counts, warn by the correct remaining width, and align when matched.
- PASS — material quantities, legacy migration, border rendering, syntax, geometry, manufacturing, version/cache, and frozen-renderer regressions.

# v3.0.50 Sample Build Step 9 Photo
- PASS — the supplied original diamond-field dry-fit photo appears beneath Sample Build step 9.
- PASS — Sample Build contains twenty original photos and only the final finishing placeholder remains.
- PASS — the Step 9 photo loads successfully in the browser.
- PASS — syntax, geometry, manufacturing, material, version/cache, browser, border, print, waste, strip-pair, custom-wood, and frozen-renderer regressions.

# v3.0.49 Sample Build Step 8 Photo
- PASS — the supplied original crosscut sequence photo appears beneath Sample Build step 8.
- PASS — Step 8 identifies that every crosscut must remain in order before rotation and dry fitting.
- PASS — the Step 8 photo loads successfully in the browser.
- PASS — syntax, geometry, manufacturing, material, version/cache, browser, border, print, waste, strip-pair, custom-wood, and frozen-renderer regressions.

# v3.0.48 Sample Build Step 7 Photos
- PASS — both supplied original master-blank photos appear beneath Sample Build step 7.
- PASS — Sample Build contains nineteen original photos and all packaged assets exist.
- PASS — both Step 7 photos load successfully in the browser.
- PASS — syntax, geometry, manufacturing, material, version/cache, browser, border, print, waste, strip-pair, custom-wood, and frozen-renderer regressions.

# v3.0.47 Sample Build Step 6 Photos
- PASS — all three supplied original replacement glue-up photos appear beneath Sample Build step 6.
- PASS — Sample Build contains eighteen original photos and all packaged assets exist.
- PASS — all three Step 6 photos load successfully in the browser.
- PASS — syntax, geometry, manufacturing, material, version/cache, browser, border, print, waste, strip-pair, custom-wood, and frozen-renderer regressions.

# v3.0.46 Sample Build Step 5 Photos
- PASS — all three supplied original Edge Rip photos appear beneath Sample Build step 5.
- PASS — Sample Build contains sixteen original photos and all packaged assets exist.
- PASS — all three Step 5 photos load successfully in the browser.
- PASS — syntax, geometry, manufacturing, material, version/cache, browser, border, print, waste, strip-pair, custom-wood, and frozen-renderer regressions.

# v3.0.45 Sample Build Step 4 Photos
- PASS — all three supplied original 45-degree preparation photos appear beneath Sample Build step 4.
- PASS — Sample Build contains fourteen original photos and all fourteen packaged assets exist.
- PASS — all three Step 4 photos load successfully in the browser.
- PASS — syntax, geometry, manufacturing, material, version/cache, browser, border, print, waste, strip-pair, custom-wood, and frozen-renderer regressions.

# v3.0.44 Sample Build Step 3 Photos
- PASS — all three supplied original glue-up photos appear beneath Sample Build step 3.
- PASS — Sample Build contains eleven original photos and all eleven packaged assets exist.
- PASS — all three Step 3 photos load successfully in the browser.
- PASS — syntax, geometry, manufacturing, material, version/cache, browser, border, print, waste, strip-pair, custom-wood, and frozen-renderer regressions.

# v3.0.43 Sample Build Step 2 Photos
- PASS — both supplied original strip-preparation photos appear together beneath Sample Build step 2.
- PASS — Sample Build contains eight original photos and all eight packaged assets exist.
- PASS — both Step 2 photos load successfully in the browser.
- PASS — syntax, geometry, manufacturing, material, version/cache, browser, border, print, waste, strip-pair, custom-wood, and frozen-renderer regressions.

# v3.0.42 Sample Build Step 1 Photos
- PASS — both supplied original lumber photos appear together beneath Sample Build step 1.
- PASS — Sample Build contains six original photos and all six packaged assets exist.
- PASS — the two-photo gallery adapts for desktop, narrow screens, and printing.
- PASS — syntax, geometry, manufacturing, material, version/cache, browser, border, print, waste, strip-pair, custom-wood, and frozen-renderer regressions.

# v3.0.41 Direct A/B Pair Removal
- PASS — obsolete Outside Pair and Center Pair removal controls are absent.
- PASS — each A/B strip row identifies the exact mirrored pair that will be removed.
- PASS — hovering or focusing highlights both matched rows.
- PASS — clicking removes both rows and renumbers all remaining A/B pairs.
- PASS — syntax, geometry, manufacturing, material, version/cache, browser, border, print, waste, custom-wood, and frozen-renderer regressions.

# v3.0.40 A/B Mirrored Strip Labels
- PASS — eight strips label outside-in as 1A through 4A and mirror back from 4B through 1B.
- PASS — inline additions show the new A/B pair name before insertion.
- PASS — both inserted strips receive the expected matching A/B labels.
- PASS — A/B labels propagate to diagrams and the printable strip schedule.
- PASS — syntax, geometry, manufacturing, material, version/cache, browser, border, print, waste, custom-wood, and frozen-renderer regressions.

# v3.0.39 Inline Strip Pairs and Conditional Waste
- PASS — every strip gap has an inline + control and mirrored gaps highlight together.
- PASS — selected mirrored gaps receive one new strip each and both new rows highlight.
- PASS — waste defaults to 35% without Edge Rip and 40% with Edge Rip.
- PASS — manual waste values survive Edge Rip changes and show a below-recommendation warning when applicable.
- PASS — Use recommended restores conditional automatic waste.
- PASS — syntax, geometry, manufacturing, material, version/cache, browser, border, print, custom-wood, and frozen-renderer regressions.

# v3.0.38 Kerf, Wood Cost, and Strip-Pair Placement
- PASS — blade thickness guidance is visible beside Blade kerf.
- PASS — Estimated Wood Cost appears by itself.
- PASS — eight strips expose all five valid symmetrical insertion positions.
- PASS — both chosen gaps are highlighted and receive one new strip each.
- PASS — syntax, geometry, manufacturing, material, version/cache, browser, border, print, custom-wood, and frozen-renderer regressions.

# v3.0.37 Control Panel Reordering
- PASS — Top & Bottom Borders appears directly after Edge Rip.
- PASS — Wood Library is the final control-panel section.
- PASS — syntax, geometry, manufacturing, material, version/cache, browser, border, print, custom-wood, and frozen-renderer regressions.

# v3.0.36 Expanded and Custom Wood Library
- PASS — 24 built-in species are available anywhere a wood is selected.
- PASS — a custom species name and color propagate to the board preview, materials, pricing, printable guide, and all wood selectors.
- PASS — custom species survive project serialization and restore.
- PASS — invalid custom data is normalized without affecting frozen geometry.
- PASS — syntax, geometry, manufacturing, material, version/cache, browser, border, print, and frozen-renderer regressions.

# v3.0.7 Preflight Report

## Automated geometry
- PASS: every sampled point in a crosscut cell is covered by exactly one laminate polygon for all four rotation/slope variants.
- PASS: changing outside strip species does not alter laminate geometry coordinates.
- PASS: Edge Rip presets 0 through 1 in produce strictly increasing cut geometry at a 1.625 in module width.

## Chromium smoke test
- PASS: v3.0.7 loaded with six strip controls and no page errors.
- PASS: Edge Rip replacement polygons grew strictly at every preset from 1/8 through 1 in.
- PASS: changing the first and last strip species changed color only; laminate polygon geometry remained identical.
- PASS: local 1/8 in screenshot visually reviewed with no white/background gaps.

This report tests Change #15 only.


## v3.0.8 Change #16 preflight
- Frozen `geometry.js` SHA-256 verified unchanged from v3.0.7 source package.
- Existing exact-geometry regression suite rerun.
- New manufacturing formula regression suite added.
- 1.500 in finished thickness must produce 2.121320... in mathematical minimum and 2.125 in shop recommendation.
- Version/cache references checked for consistency.

### Executed results
- PASS — `geometry.test.js` exact laminate/Edge Rip regression.
- PASS — `manufacturing.test.js` formula regression.
- PASS — `drawEndGrainCell()`, `renderBoard()`, and `edgeCutGeometry()` byte-for-byte unchanged from v3.0.7.
- PASS — `geometry.js` unchanged from v3.0.7.
- PASS — JavaScript syntax for `app.js` and `manufacturing.js`.
- PASS — all CSS/JS cache-busting asset references = 3.0.8.
- Browser dump preflight was unavailable in this container, so no browser-visual claim is made for this metric-only change.
# v3.0.12 Release Test Report

## Result: PASS

- JavaScript syntax: `app.js`, `geometry.js`, and `manufacturing.js` pass syntax checks.
- Geometry: existing exact-laminate and Edge Rip regression suite passes.
- Manufacturing: 12-count balanced, 13-count unbalanced, required-blank, lamination, and editable-kerf tests pass.
- Browser: v3.0.12 loads without page errors; actual counts drive preview; warning visibility follows parity.
- Version/cache: visible badge and all four asset references use 3.0.12; no stale 3.0.10/3.0.11 cache keys remain.
- Frozen regression: `geometry.js` is byte-identical to validated v3.0.11; `edgeCutGeometry`, `drawEndGrainCell`, and `renderBoard` are source-identical.

### Locked acceptance cases

- 18.000 in / 1.500 in thickness → 12 crosscuts, balanced, 20.875 in required blank at 0.125 in kerf.
- 19.500 in / 1.500 in thickness → 13 crosscuts, visible unbalanced warning, 22.625 in required blank at 0.125 in kerf.
- Same 13-count case at 0.100 in kerf → 22.325 in required blank.
# v3.0.13 Border Engineering Test Report

## Result: PASS

- Border-off mode uses the full finished-board width and renders no border material.
- Border-on mode renders exactly two long-edge borders inside the finished dimensions.
- 7.375 in finished width with two 0.500 in borders produces a 6.375 in diamond field.
- Changing each border to 0.750 in produces a 5.875 in diamond field.
- Turning borders off restores the full-diamond view.
- Border material dimensions respond to length, border width, and finished thickness.
- Visible version and all asset cache keys are 3.0.13.
- `geometry.js`, `edgeCutGeometry`, `drawEndGrainCell`, and `renderBoard` remain unchanged from the validated baseline.
- All v3.0.12 crosscut, manufacturing, and browser regressions continue to pass.
# v3.0.14 Multi-Band Border Test Report

## Result: PASS

- Border controls appear above Strip Schedule.
- Four independently sized and colored bands render as four mirrored bands on each long edge.
- A fifth band can be added; there is no fixed four-band limit.
- Bands can be removed independently.
- Four 0.250 in bands total 1.000 in per edge and reduce a 7.375 in board to a 5.375 in diamond field.
- v3.0.13 single-border saved data migrates to the new one-band schedule.
- Visible version and all cache keys are 3.0.14.
- All syntax, geometry, manufacturing, crosscut, frozen-renderer, and browser regressions pass.
# v3.0.15 Laminated Row Engineering Test Report

## Result: PASS

- A 7.375 in no-border board with 1.500 in modules calculates five laminated rows.
- Enabling borders initially removes two rows and retains three complete laminated rows.
- Three rows require 1.4375 in of replacement border per edge.
- Selecting two rows creates a 3.000 in diamond field and requires 2.1875 in per edge.
- Four independently colored bands totaling 2.1875 in clear the mismatch warning.
- Underage and overage schedules show the remaining/excess width and warning.
- Turning borders off restores automatic laminated-row calculation and the full-diamond view.
- All multi-border, crosscut, geometry, manufacturing, cache, and frozen-renderer regressions pass.
# v3.0.16 Dynamic Border-Driven Row Test Report

## Result: PASS

- Removed manual laminated-row control; no stale control remains in the page.
- A 13.000 in board with 2.9375 in Padauk plus 1.3750 in Walnut per edge calculates three complete laminated rows.
- Three 1.500 in rows create a 4.500 in diamond field and require 4.2500 in of border per edge.
- The 4.3125 in schedule reports exactly 0.0625 in too wide per edge.
- Reducing the schedule to 4.2500 in produces a matched result and removes the warning.
- Four same-species border entries remain four physical bands and render as eight mirrored strips.
- All previous geometry, crosscut, manufacturing, migration, cache, and frozen-renderer regressions pass.
# v3.0.17 Strict Whole-Row Test Report

## Result: PASS

- Laminated-row calculation rounds available diamond space down to complete rows.
- 13.000 in board with 4.3125 in scheduled border per edge retains two 1.500 in rows.
- The resulting diamond field is 3.000 in and required border is 5.0000 in per edge.
- The schedule correctly reports 0.6875 in still needed per edge.
- Increasing the schedule to 5.0000 in produces a matched result and clears the warning.
- Same-species multi-band entries remain distinct physical bands.
- All previous geometry, crosscut, manufacturing, migration, cache, and frozen-renderer regressions pass.
# v3.0.18 Bordered Preview Alignment Test Report

## Result: PASS

- 17.250 × 13.000 in case with 1.125 in thickness calculates fifteen crosscuts.
- A 1.250 in matched border renders exactly seven complete rows and 105 complete cells.
- A 3.500 in matched border renders exactly four complete rows and 60 complete cells.
- First and last row boundaries meet the top and bottom borders with zero measured gap or overlap.
- No full-board pattern remains masked underneath the borders in bordered mode.
- Frozen `geometry.js`, `edgeCutGeometry`, `drawEndGrainCell`, and `renderBoard` remain unchanged.
- All crosscut, manufacturing, migration, cache, and prior browser regressions pass.
# v3.0.19 Square-Proportion Border Test Report

## Result: PASS

- Every bordered cell uses a single uniform SVG scale; independent X/Y stretching is absent.
- 1.250 in borders retain seven complete square rows and exact border alignment.
- 3.500 in borders retain four complete square rows and exact border alignment.
- Horizontal overage is centered and clipped at the finished board ends.
- Frozen geometry, Edge Rip, crosscut calculations, and unbordered renderer remain unchanged.
- All syntax, manufacturing, migration, cache, and browser regressions pass.
# v3.0.20 Material Quantity Test Report

## Result: PASS

- Finished cubic inches reconcile to target volume for complete designs.
- Net board feet use 144 cubic inches per board foot.
- Strip-schedule shares allocate diamond laminate by species.
- Edge Rip subtracts replaced finished laminate and adds replacement species while retaining removed laminate in purchase needs.
- Border bands are counted twice, once for each long edge, and combined by species.
- Rough-crosscut and blade-kerf factors increase diamond-laminate purchase quantity.
- Editable waste changes purchase board feet without changing net finished quantity.
- Unmatched border schedules show an unfilled-volume warning; matched schedules clear it.
- All frozen geometry, crosscut, manufacturing, border, cache, and browser regressions pass.
# v3.0.21 Species Pricing Test Report

## Result: PASS

- Every combined species receives exactly one editable price-per-board-foot input.
- All new and migrated projects default missing prices to $0.00.
- Per-species cost equals full-precision purchase board feet multiplied by the entered price.
- Total estimated cost equals the sum of all species costs.
- Waste changes purchase board feet and estimated cost without changing net finished quantities.
- Pricing updates immediately and persists through the existing project state/save workflow.
- All material quantity, geometry, crosscut, manufacturing, border, cache, and browser regressions pass.
# v3.0.23 Printable Workshop Plan Test Report

## Result: PASS

- Print Workshop Plan action is visible and invokes the browser print workflow.
- Plan regenerates from current state immediately before printing.
- Finished Design, Lamination Engineering, Crosscut Engineering, Edge Rip, Border Schedule, Material Quantity (Estimate), and Workshop Sequence are present.
- Current dimensions, strip schedule, border schedule, quantities, prices, and calculated results populate the plan.
- Print-only styling hides the interactive application and formats tables for paper/PDF.
- All material, pricing, geometry, crosscut, manufacturing, border, cache, and browser regressions pass.


# v3.0.24 Illustrated Build Guide Test Report

PASS — syntax; material quantities; geometry; manufacturing; actual crosscut behavior; version/cache; frozen geometry/renderer; browser, border, and print regression.

- Nine numbered procedure steps and nine generated SVG diagrams verified.
- Wood key, blade kerf, dimensions, row count, Edge Rip, and border-dependent wording verified against current state.
- Existing v3.0.23 calculations and renderer remain unchanged.


# v3.0.25 Illustrated Guide Refinement Test Report

PASS — syntax; material quantities; geometry; manufacturing; actual crosscut behavior; version/cache; frozen geometry/renderer; browser, border, and print regression.

- Square stock and square laminate illustrations verified.
- All assigned laminated rows are shown together in one line.
- Dotted adjacent-edge-center 45-degree guide verified.
- Edge Rip visuals, wording, and schedule are suppressed at zero cut depth and restored when selected.


# v3.0.26 Ten-Step Illustrated Sequence Test Report

PASS — syntax; material quantities; geometry; manufacturing; actual crosscut behavior; version/cache; frozen geometry/renderer; browser, border, and print regression.

- Ten numbered steps and ten diagrams verified.
- Required square dimension appears on both axes.
- All four center-to-center corner cuts and CUT labels verified.
- Two-row 45-degree dry fit and dynamic top-view crosscut spacing verified.
- Assigned quantity is sourced from calculated crosscuts, not laminated rows.


# v3.0.27 Master-Blank Workflow Test Report

PASS — syntax; material quantities; geometry; manufacturing; actual crosscut behavior; version/cache; frozen geometry/renderer; browser, border, and print regression.

- Bordered guide places long-edge border glue-up before crosscut marking.
- Top-view master blank uses longitudinal species bands and calculated dotted crosscut lines across the full width.
- Crosscut-line count follows the actual calculated crosscut count.
- Selected Edge Rip uses two outlined, labeled opposing wedges and remains hidden at zero depth.


# v3.0.28 Board Reference and Edge Rip Sequence Test Report

PASS — syntax; material quantities; geometry; manufacturing; actual crosscut behavior; version/cache; frozen geometry/renderer; browser, border, and print regression.

- Exact finished-board SVG is reproduced at the beginning of the printed guide.
- Board reference follows current wood, border, dimension, and pattern state without changing the live renderer.
- Nonzero Edge Rip adds a separate illustrated step after the four 45-degree cuts and before dry fit.
- Zero Edge Rip removes the separate step and all Edge Rip print content.


# v3.0.29 Printable Colors and Edge Rip Detail Test Report

PASS — syntax; material quantities; geometry; manufacturing; actual crosscut behavior; version/cache; frozen geometry/renderer; browser, border, and print regression.

- Finished-board reference contains direct solid wood fills instead of print-fragile pattern references.
- Nonzero Edge Rip generates two separate images after the first four 45-degree cuts: cut face, then replacement glue-up.
- Zero Edge Rip removes both steps.
- Assigned crosscuts render as a single diamond row.


# v3.0.30 Edge Rip Before-and-After Test Report

PASS — syntax; material quantities; geometry; manufacturing; actual crosscut behavior; version/cache; frozen geometry/renderer; browser, border, and print regression.

- Replacement glue-up diagram contains a solid standalone replacement piece.
- Completed view combines the selected replacement wood with the cut target wood.
- Labels remain dynamic for the project-selected replacement species.


# v3.0.31 Two-End Replacement and Print Reference Repair

PASS — syntax; material quantities; geometry; manufacturing; actual crosscut behavior; version/cache; frozen geometry/renderer; browser, border, and print regression.

- Step 7 shows two standalone replacement wedges followed by both wedges attached to the octagonal cut face.
- Completed Edge Rip view preserves the target wood band and selected replacement color.
- Print-board IDs and clip paths are uniquely namespaced to prevent missing triangular fills.


# v3.0.32 Square Edge Rip Completion Test Report

PASS — syntax; material quantities; geometry; manufacturing; actual crosscut behavior; version/cache; frozen geometry/renderer; browser, border, and print regression.

- Completed Step 7 view is a square.
- Both replacement wedges attach to the opposing ends of the target wood band.


# v3.0.33 Dynamic Edge Title and Cleaner Square

PASS — syntax; material quantities; geometry; manufacturing; actual crosscut behavior; version/cache; frozen geometry/renderer; browser, border, and print regression.

- Edge Rip glue-up title verified against a live species change to Hard Maple.
- Finished square retains a straight target-wood center and two opposing replacement ends.
- Step 1 wording contains only milling and planing/sanding allowance guidance.


# v3.0.34 Compact Top Metrics Test Report

PASS — syntax; material quantities; geometry; manufacturing; actual crosscut behavior; version/cache; frozen geometry/renderer; browser, border, and print regression.

- Required lamination value remains visible.
- Minimum/rounding explanation and its layout element are absent from the top metric card.
- Photo Reference and Step 7 guide content are unchanged.


# v3.0.35 Independent Sample Build Phase 1

PASS — syntax; material quantities; geometry; manufacturing; actual crosscut behavior; version/cache; frozen geometry/renderer; browser, border, print, and sample-page regression.

- Independent Sample Build opens in a separate page and does not mutate active project state.
- Ten ordered steps and independent print action verified.
- Four original workshop photo assets verified and included.
- Six missing-photo positions are clearly labeled for later replacement.
