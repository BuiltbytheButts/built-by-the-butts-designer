## v3.0.34 — Compact Top Metrics
- Removed the minimum/rounding explanation beneath the required lamination size in the top metric card.
- Retained the required lamination size itself, allowing the preview to move upward.
- Photo Reference and Step 7 illustrations remain unchanged from v3.0.33.

## v3.0.33 — Dynamic Edge Title and Cleaner Square
- Verified and regression-tested that the Edge Rip glue-up title follows the selected replacement species.
- Finished square keeps a straight Walnut center with one light replacement piece on each end.
- Simplified Step 1 to milling square and straight with extra planing and sanding allowance.

## v3.0.32 — Square Edge Rip Completion
- Corrected the completed Step 7 replacement view from an octagon to a square.
- The square shows the light replacement pieces attached to both ends of the target wood band.

## v3.0.30 — Edge Rip Before-and-After View
- Replacement glue-up diagram now shows the solid light replacement piece by itself first.
- A second view shows that same piece combined with the Walnut edge after gluing.
- Added a clear directional arrow and before/after labels.

## v3.0.29 — Printable Wood Colors and Two-Stage Edge Rip
- Finished-board reference now uses direct printable wood fills so its colors survive print/PDF output.
- Edge Rip now has one octagonal cut-face image followed by a separate 45-degree replacement glue-up image.
- Replacement image shows the selected wood applied to the freshly cut Walnut edges.
- Assigned crosscuts are displayed as one diamond row instead of plain squares.

## v3.0.28 — Board Reference and Separate Edge Rip
- Added the exact generated finished-board image at the beginning of every printed guide.
- Edge Rip is now its own conditional illustrated step after all four initial 45-degree cuts.
- Edge Rip diagram shows the transverse cut across the selected wood area.
- Builds with zero Edge Rip omit that step and retain a ten-step guide.

## v3.0.27 — Correct Master-Blank Workflow
- Border bands are now glued to both long edges before the master blank is crosscut.
- Crosscut diagram is a true top view with longitudinal wood strips and dotted lines running across the full blank.
- Selected Edge Rip wedges are larger, outlined, and explicitly labeled.
- No-border builds retain a full-width master-blank preparation step.

## v3.0.26 — Ten-Step Build Sequence
- Dimensioned the glued blank as a true required-size square on both sides.
- Marked all four dotted 45-degree corner cuts and labeled each CUT.
- Added a two-row dry fit before crosscutting.
- Added a top-view crosscut layout with calculated spacing.
- Corrected the assembly language and count to assigned crosscuts.

## v3.0.25 — Illustrated Guide Refinements
- Changed laminate visuals to square stock and square assembled blanks.
- Shows every assigned laminated row together in one line.
- Added a dotted center-to-center 45° cut guide.
- Edge Rip visuals and print schedule now appear only when a nonzero Edge Rip is selected.

## v3.0.24 — Illustrated Build Guide
- Added a nine-step illustrated procedure generated from the active design.
- Visuals show wood colors, strip order, crosscuts, kerf, Edge Rip, assembly orientation, borders, and final sizing.
- Added a color-coded material key and retained the quick checklist.

## v3.0.23 — Printable Cut List & Workshop Plan
- Added a Print Workshop Plan action that opens the browser print/save-PDF dialog.
- Added a print-only live plan generated from current design state immediately before printing.
- Includes finished dimensions, lamination engineering, strip schedule, crosscuts, Edge Rip, border schedule, material estimate, pricing, and ordered workshop steps.
- Strip and border tables include species, finished/rough dimensions, and physical quantities.
- Print styling removes the application interface and formats sections and tables for paper/PDF output.
- Frozen v3.0.22 design, material, pricing, geometry, and renderer calculations remain unchanged.

## v3.0.22 — Material Estimate Wording
- Renamed Material Quantity to Material Quantity (Estimate).
- Added a visible note that actual usage varies by stock selection, milling, defects, and shop practices.
- All accepted v3.0.21 quantity and pricing calculations remain unchanged.

## v3.0.21 — Editable Species Pricing
- Added an editable USD price per board foot for every species used by the design.
- Prices default to zero and are never inferred from external suppliers.
- Estimated species cost = validated purchase board feet × entered price per board foot.
- Species shared by diamond laminate, Edge Rip, or borders retain one combined price and cost row.
- Added a total estimated material cost that updates immediately with price or waste changes.
- Species prices persist in saved project data with safe zero-price defaults for older projects.
- Frozen v3.0.20 quantity calculations and v3.0.19 geometry/renderer remain unchanged.

## v3.0.20 — Material Quantity by Species
- Added finished cubic inches, net board feet, and estimated purchase board feet by species.
- Added an editable waste allowance, defaulting to 15 percent.
- Diamond laminate, Edge Rip replacement, and border material are calculated separately and combined by species.
- Diamond-laminate purchase quantity includes recommended rough-crosscut and blade-kerf consumption before waste.
- Finished volume reconciles against the target board volume; unmatched border schedules show an unfilled-volume warning.
- Added a standalone tested `material.js` calculation module.
- Frozen v3.0.19 geometry and renderer remain unchanged.

## v3.0.19 — Square-Proportion Bordered Preview
- Bordered diamond cells now use one uniform scale instead of independent horizontal and vertical scaling.
- Square modules and diamond proportions remain identical when borders are enabled.
- Complete laminated rows still meet both borders exactly.
- Horizontal pattern overage is centered and clipped only at the finished board ends.
- Verified both 1.250 in/seven-row and 3.500 in/four-row border cases retain square cells.
- Frozen geometry, Edge Rip, crosscut calculations, and unbordered renderer remain unchanged.

## v3.0.18 — Complete-Row Bordered Preview
- Replaced border masking over the full-board pattern with a dedicated bordered-board compositor.
- Borders render at the outside edges and the diamond field is rebuilt between them.
- The first and last laminated rows now meet the borders exactly with no partial hidden rows.
- The preview renders exactly calculated laminated rows × calculated crosscuts.
- Verified 1.250 in borders produce seven complete rows and 3.500 in borders produce four complete rows in the reported 13 in board case.
- Frozen cell, laminate, Edge Rip, and unbordered renderer functions remain unchanged.

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
## v3.0.24 — Illustrated Build Guide
- Added a nine-step illustrated procedure generated from the active design.
- Visuals show wood colors, strip order, crosscuts, kerf, Edge Rip, assembly orientation, borders, and final sizing.
- Added a color-coded material key and retained the quick checklist.
