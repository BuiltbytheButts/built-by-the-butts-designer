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
