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
