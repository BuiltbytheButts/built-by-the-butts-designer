# v3 Architecture Notes

## State
The application has one small state object containing only user-owned design inputs:
- finished board length, width, thickness
- blade kerf
- edge inset and replacement species
- optional top/bottom border selection and an unbounded array of width/species bands
- selected whole laminated-row count when borders replace outside rows
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
