# v3 Architecture Notes

## State
The application has one small state object containing only user-owned design inputs:
- finished board length, width, thickness
- blade kerf
- edge inset and replacement species
- optional top/bottom border selection and an unbounded array of width/species bands
- calculated whole laminated-row count derived from available width after borders
- strip schedule

No rows, columns, sizing mode, layout mode, orientation mode, trim allowance, or finishing allowance are stored.

## Geometry
- `moduleWidth()` comes only from the active strip schedule.
- `recommendedRoughRip()` is guidance only.
- `recommendedRoughCrosscut()` is guidance only.
- `crosscutEngineering()` is the single source of truth for even-count crosscut math.
- `previewGrid()` derives display counts from physical dimensions and engineering outputs; those counts are never user controls.

## Rendering
- `drawEndGrainCell()` draws one physical square end-grain face.
- `renderBoard()` assembles those faces into the preview and clips to the finished-board aspect ratio.
- Rendering does not alter design dimensions.

## UI
- All input binding is centralized.
- Strip editor structure is rebuilt only when strip structure changes or on full render.
- No duplicated renderers or compatibility migration code exists.

## Persistence
v3 uses its own local-storage key and JSON schema so old v2 autosaves cannot silently inject retired fields.

## Edge Rip invariant
The strip field is immutable under Edge Rip. Edge Rip is modeled as a subtractive 45-degree corner cut, followed by replacement stock filling exactly the removed triangular area.

## v3.0.7 geometry invariant
The renderer has no fallback/filler wood. `geometry.js` computes clipped polygons for every physical laminate strip and is shared by the browser renderer and regression tests. Edge Rip is a separate cut/replacement overlay.


## v3.0.8 lamination-size invariant
- Finished board thickness is the target module thickness used for the 45-degree machining calculation.
- `manufacturing.js` is the single source of truth for the required pre-45-degree square lamination size.
- Mathematical minimum = finished thickness × √2.
- Shop recommendation rounds that minimum upward to the nearest 1/8 inch.
- This calculation is manufacturing guidance only and cannot modify the frozen v3.0.7 renderer.

## v3.0.13 border invariant
- Finished dimensions are always the outside board dimensions.
- With borders off, the diamond field occupies the full finished width.
- With borders on, diamond field width = finished width − (2 × border width).
- Borders are drawn as a separate overlay around the source-identical frozen renderer.
- v3.0.14 extends that overlay to an outside-to-inside band schedule mirrored on both long edges; total border width is the sum of all bands.
- v3.0.15 treats borders as replacements for complete laminated rows. Required width per edge is `(finished width - selected rows × module width) / 2`.
- v3.0.16 makes the border schedule the input: available diamond width is `finished width - 2 × scheduled border width`, and the nearest complete laminated-row count is derived from that space.
- v3.0.17 uses `floor(available diamond width / module width)` so partial laminated rows are never treated as buildable rows.
- v3.0.18 adds a border-specific compositor that lays out exactly `laminated rows × crosscuts` inside the calculated inner field while continuing to call the frozen `drawEndGrainCell` geometry.
- v3.0.19 applies one uniform cell scale in bordered mode. The row stack determines square cell size; length overage is centered and clipped at the finished ends.

## v3.0.20 material-quantity invariant
- `material.js` is the pure calculation source for species quantities.
- Net board feet = finished cubic inches ÷ 144.
- Finished composition includes diamond laminate after Edge Rip replacement, replacement wood, and every physical border band.
- Purchase board feet retains the original laminate consumed before Edge Rip, adds rough-crosscut and blade-kerf consumption, then applies editable waste.
- Species shared across components are combined into one purchasing row.

## v3.0.21 pricing invariant
- Prices are user-owned USD-per-board-foot inputs and default to zero.
- Estimated cost is calculated only from the v3.0.20 purchase board-foot result.
- A species has one price regardless of how many design components use it.

## v3.0.23 print invariant
- The print plan is derived from current state and existing validated calculation functions immediately before `window.print()`.
- Print markup contains no independent engineering formulas.
- Print CSS hides the interactive workspace and formats the plan for paper or Save as PDF.


## v3.0.24 illustrated-guide invariant

The print-only procedure is regenerated from current state and contains nine SVG diagrams. It may consume engineering results but must not alter frozen laminate geometry or the finished-board renderer.


## v3.0.25 guide-display invariant

Guide-only shapes may respond to design state but must not alter the frozen finished-board renderer. Edge Rip guide content is conditional on a nonzero cut depth.
