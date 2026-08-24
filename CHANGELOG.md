# Changelog

## v2.7.7 — Renderer stability correction
- Restored the exact proven v2.6.x diamond-field renderer instead of resizing or reinventing module geometry.
- Finished length and width now calculate hidden internal rows/columns from the physical module width.
- Removed 180-degree crosscut rotation from the main renderer until it can be modeled without corrupting the proven pattern.
- Crosscut Engineering remains active as planning guidance and still enforces balanced even crosscut recommendations.
- Finished Board Dimensions remain the only user-facing sizing controls.

## v2.7.6 — Proven renderer restoration + finished-size engineering
- Restored the known-good v2.6.x diamond-module renderer instead of stretching a single module across the board.
- Finished length, width, and thickness remain the design goal and are never overwritten by hidden grid math.
- Final-board preview keeps module geometry at its physical strip-schedule size, crops to the finished board aspect ratio, and mirrors every other physical crosscut 180°.
- Crosscut count is now derived from finished board length ÷ finished thickness and corrected to a balanced even count.
- Master blank length is now a feasibility check: Crosscut Engineering shows the rough blank required and whether the entered blank is long enough.
- Fixed internal version migration so saves/projects are stamped v2.7.6 consistently.

## v2.7.5 — Final-board preview repair
- Rebuilt the final-board renderer so diamonds tessellate edge-to-edge with no white gaps.
- Preview is cropped to the requested Finished Board Dimensions aspect ratio instead of repeating isolated diamond tiles.
- Uses the engineered even crosscut count as paired repeating motifs; two alternating 0°/180° crosscuts form one visual diamond repeat.
- Rows and columns remain internal only and are not exposed as design inputs.

## v2.7.4 — Finished-dimension workflow + rough-cut guidance
- Removed the sizing-mode choice and editable Rows/Columns controls. **Finished Board Dimensions** is now the single design workflow.
- Board Setup now asks only for finished Length, Width, and Thickness.
- Removed user-entered Finishing Allowance; machining overage is now Designer guidance rather than a required input.
- Added approximate **Recommended rough rip** guidance beside every strip width (design width + ~1/16 in), with a Why? explanation.
- Crosscut Engineering now shows an approximate **Recommended rough crosscut** (finished thickness + ~1/8 in) and clearly labels it as shop-dependent guidance.
- Final-board preview automatically uses the balanced even crosscut count and rotates every other crosscut 180°.
- Finished width still determines the internal pattern rows; rows/columns remain internal engineering values rather than user inputs.


## v2.7.3
- True crosscut-row preview now uses the balanced even count from Crosscut Engineering.
- Every other rendered crosscut row rotates 180 degrees (0°, 180°, 0°, 180°...).
- Preview row count updates automatically when blank length, blade kerf, finished thickness, or finishing allowance changes.
- Moved approximate blank remaining into the balanced-count recommendation; the rough-target card now shows finished thickness target.

# v2.7.2
- Fixed legacy autosave/project migration after the rough-thickness model changed to a **total finishing allowance**.
- Older saved values no longer carry forward the previous per-face allowance and incorrectly show an approximately 2.000 in rough crosscut target for a 1.500 in finished target.
- Legacy projects now migrate to the new default: **1.500 in finished + 0.125 in total allowance = 1.625 in approximate rough crosscut target**.

# v2.7.1 — Thickness terminology + realistic crosscut allowance

- Renamed the top Module Width metric to **Module design width (strip total)** so it is not confused with board thickness.
- Top thickness metric now shows **Finished thickness** only and follows the Finished board thickness control.
- Reworked rough crosscut allowance from a per-face planing assumption to a **total adjustable finishing allowance**.
- Default 1.500 in finished thickness + 0.125 in allowance now yields an **approx. 1.625 in rough crosscut target**.
- Added guidance that rough thickness is an estimate and varies with glue-up quality, drum sanding, hand sanding, or planer use.

# Changelog

## v2.6.3 — Release Candidate
- Restored stable module rendering after the v2.6.2 edge-preview regression.
- Removed module spacing from the interface, saved state, sizing math, and renderer.
- Rebuilt the visible edge treatment so every preset from Zero through 1 inch is distinct while remaining clipped inside each module.
- Preserved independent edge-species board-foot and cost calculations.
- Added a developer diagnostics panel for build-prep checks.
- Corrected versioned asset references and removed a duplicate rough-thickness field.

## v2.6.2
- Removed module spacing.
- Added larger edge-width presets through 1 inch.

## v2.6.1
- Made manual target-module-width changes immediately rescale unlocked strips and update geometry and cost.

## v2.6.0
- Added automatic/manual module width, proportional normalization, strip locks, and restore-to-1.500-inch controls.

## v2.5.8
- Added edge-species selection, edge-material costing, and a no-edge option.

## v2.5.x
- Added thickness planning, dynamic sizing, trim allowance, expanded engineering calculations, and manufacturing controls.

## v2.6.4
- Renamed the product to **Diamond End Grain Designer by Built By The Butts**.
- Replaced strip-only saved schedules with full saved projects.
- Selecting a project opens it immediately and restores the complete design.
- Added Save, Save As, Duplicate, Rename, Delete, and Project Notes.
- Migrates legacy saved strip schedules into projects.

## v2.7.0 — Crosscut Engineering
- Added master blank length and blade kerf inputs.
- Added the prototype-proven even-crosscut rule for balanced alternating 180° diamond layouts.
- If the raw crosscut count is odd, the Designer recommends the nearest lower even count instead of silently accepting the odd count.
- Added a comparison showing the next even-count option and the maximum slice thickness that will fit the available blank after kerf.
- Added a `Crosscut rows — alternate 0° / 180°` preview orientation.
- Added crosscut diagnostics so shop math can be checked against real builds.
