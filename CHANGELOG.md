## v3.0.17 — Strict Whole-Row Border Replacement
- Border-driven laminated rows now always round down to complete rows that physically fit.
- When a border crosses into the next laminated row, that row is automatically removed.
- The warning reports how much more border width is required per edge to complete the replacement.
- No design result implies ripping a laminated diamond row lengthwise.
- Acceptance case: 13.000 in board with 4.3125 in border per edge → 2 rows, 5.0000 in required, 0.6875 in still needed.
- Frozen diamond, laminate, Edge Rip, and crosscut geometry remains unchanged.

## v3.0.16 — Border-Driven Laminated Rows
- Removed the manual laminated-row input.
- Entered border-band widths are now the source of truth for the remaining diamond field.
- Laminated rows recalculate dynamically as border widths are edited.
- Each Add Border entry remains a distinct physical band, even when several bands use the same species.
- Whole-row fit reports the exact border adjustment needed instead of comparing against a stale manual count.
- Screenshot acceptance case: 13.000 in board, 4.3125 in scheduled per edge → 3 rows, 4.2500 in required, 0.0625 in excess.
- Frozen diamond, laminate, Edge Rip, and crosscut geometry remains unchanged.

## v3.0.15 — Laminated Row & Border Replacement Engineering
- Added a Laminated Rows result alongside Calculated Crosscuts.
- No-border designs calculate laminated rows automatically from finished width and module width.
- Enabling borders initially removes one complete laminated row from each long edge.
- The user can select any positive whole number of laminated rows, including a two-row centerpiece.
- Required border width per edge = (finished width − selected rows × module width) ÷ 2.
- Added required-width, scheduled-width, remaining/excess, and mismatch warning results.
- Future material costing can use the selected laminated-row count instead of charging for replaced rows.
- Frozen diamond, laminate, Edge Rip, and crosscut geometry remains unchanged.

## v3.0.14 — Unlimited Multi-Band Borders
- Moved Top & Bottom Borders above Strip Schedule.
- Replaced the single border with an unlimited add/remove border-band schedule.
- Every band has an independent finished width and wood species.
- Bands are ordered outside-to-inside and mirrored on the two long edges.
- Diamond field width subtracts twice the combined band width.
- Existing v3.0.13 single-border project data migrates into one border band.
- Frozen diamond, laminate, Edge Rip, and crosscut behavior remains unchanged.

## v3.0.13 — Optional Top & Bottom End-Grain Borders
- Added an Include all-end-grain borders choice; borders default off.
- Added adjustable border width and wood species.
- Finished board dimensions always remain the outside dimensions.
- With borders on, diamond field width = finished width − two border widths.
- With borders off, the diamond field uses the complete finished-board width.
- Added finished border material dimensions for two long-edge pieces.
- Added invalid-width protection and warning.
- Frozen v3.0.12 diamond, laminate, and Edge Rip renderer remains source-identical.

## v3.0.12 — Truthful Actual Crosscut Preview
- Removed Alternate Even Option and all alternate-count calculations from the UI.
- The nearest whole calculated crosscut count now drives the preview without even-number coercion.
- Odd counts remain visible and display an unbalanced-pattern warning.
- Required master blank length is included in the single calculated crosscut result.
- Blade kerf remains editable and recalculates required blank length.
- Frozen v3.0.7 laminate, Edge Rip, and renderer geometry remain unchanged.
- Updated visible version and every asset cache key to 3.0.12.

## v3.0.11 — Derived Master Blank Length + Crosscut Wording

- Master blank length is now calculated from the finished-board-driven balanced crosscut recommendation.
- Blade kerf remains editable and directly affects required blank length.
- Balanced and alternate cards now use matching wording.
- Removed “Target …” and “exact target” wording.
- Renamed the first card to **Balanced recommendation**.
- No pattern, Edge Rip, strip, or renderer geometry changes.

## v3.0.10 — Crosscut Availability Wording

- Replaced ambiguous raw-count wording with **Total crosscuts available**.
- 24.000 in blank + 1.625 in rough crosscut + 0.125 in kerf reports **13 total crosscuts available**.
- The balanced recommendation remains separately identified as **12 crosscuts** for this example.
- No pattern, Edge Rip, strip, or renderer geometry changes.

## v3.0.9 — Finished-Dimension-Driven Crosscut Engineering
- Change #17 only; v3.0.7 geometry and v3.0.8 lamination-size engineering remain frozen.
- Finished board length now drives the nearest balanced even crosscut count.
- Shows the resulting achievable finished length, dimensional difference from target, rough blank required, and blank remaining/shortfall.
- Shows the neighboring even-count alternative with its projected finished length and rough blank requirement.
- Master blank length is now a feasibility check; it no longer dictates the design count.

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
