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
