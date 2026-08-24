## v3.0.8 — Required Lamination Size Before 45° Cuts
- Change #16 only; v3.0.7 exact-geometry renderer remains frozen.
- Replaced the misleading **Module design width** metric with **Required Lamination Size Before 45° Cuts**.
- Minimum square lamination size = finished thickness × √2.
- Shop recommendation rounds the mathematical minimum upward to the nearest 1/8 inch.
- Example: 1.500 in × √2 = 2.121 in minimum → 2.125 in recommended.

## v3.0.7 — Exact laminate geometry
- Change #15 only.
- Removed the full-cell support/filler species entirely.
- Replaced rotated strip rectangles with exact clipped laminate polygons, so every point in a crosscut face comes from the actual strip schedule.
- Removed the arbitrary half-cell Edge Rip cap; presets through 1 inch now remain distinct whenever the physical module supports them.
- Added a production-geometry regression test for complete cell coverage, species-independent geometry, and monotonic Edge Rip presets.

## v3.0.6 — Release integrity fix
- No new woodworking geometry change.
- Carries forward the v3.0.5 laminate-continuity renderer.
- Corrected cache-busting references so the HTML badge, JavaScript, CSS, and requested asset versions all match.
- Added release preflight checks for version consistency before packaging.

## v3.0.5 — Edge Rip continuity preflight
- Change #15 only.
- Added laminate-derived support beneath each rotated crosscut face so canvas cannot show through at cell-corner boundaries.
- Edge Rip targeting and depth math are unchanged.

# Changelog

## v3.0.4 — Edge Rip join continuity
- Removed the subtractive SVG laminate mask that could expose canvas at alternating module intersections.
- The original laminate now renders continuously in every cell.
- Edge Rip replacement wood overlays only the exact 45° cut triangles, preserving the same cut depth and intersection targeting with no white/background gaps.
- No board sizing, strip schedule, crosscut engineering, or Edge Rip sizing logic changed.

## v3.0.4 — Shallow Edge Rip laminate continuation
- Kept the v3.0.2 intersection targeting unchanged.
- Extended the physical outside laminate strips beneath the clipped crosscut face so shallow Edge Rip values no longer expose the board background.
- Replacement wood still occupies only the material removed by the Edge Rip mask.
- No changes to finished dimensions, strip schedule math, crosscut engineering, or board-layout logic.


## v3.0.2 — Edge Rip intersection correction
- Changed only the Edge Rip corner pairing.
- Replacement wood now targets the alternating board-intersection diamonds rather than the laminated/internal diamond.
- Strip geometry, finished dimensions, crosscut engineering, and the base pattern are unchanged.

## v3.0.2 — Edge Rip geometry correction
- Edge Rip now removes two 45° corner triangles from the unchanged laminated crosscut geometry.
- Replacement wood fills only the removed cut area.
- Changing Edge Rip no longer scales, stretches, or redefines the strip field.
- Zero means no cut and no replacement geometry.
- No other board, strip, crosscut, or sizing behavior was changed.


## v3.0.0 — Clean foundation rebuild
- Rebuilt the application from a minimal state model instead of patching v2.7.x.
- Removed rows, columns, sizing modes, layout modes, orientation modes, trim allowance, and finishing allowance from the architecture.
- Finished board setup now contains only length, width, and finished thickness.
- Rebuilt preview around physical square end-grain faces with alternating diagonal direction and paired 180-degree crosscut rows.
- Added rough-rip guidance (+1/16 in) beside strip design widths.
- Added rough-crosscut guidance (+1/8 in) as a recommendation rather than a user allowance.
- Preserved even-count Crosscut Engineering with master blank length and kerf.
- Added clean JSON save/open, undo/redo, SVG export, edge-rip controls, and strip-pair controls.
