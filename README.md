# Diamond End Grain Designer v3.0.27

Clean-architecture foundation rebuild for Built By The Butts.

## Core rules
- Finished board setup uses length, width, and thickness only.
- Strip schedule is the source of pattern geometry.
- No rows/columns sizing mode exists in state, UI, or renderer.
- Rough machining values are recommendations, not user-entered allowances.
- Crosscut Engineering reports the actual calculated whole-crosscut count.
- Odd counts drive the preview unchanged and display an unbalanced-pattern warning.
- Optional all-end-grain borders run along the two long edges inside the finished dimensions.
- Add or remove any number of border bands; every band has its own width and species.
- Border bands mirror across the two long edges; turning borders off restores the full-diamond field.
- Laminated rows are calculated automatically from the finished width and entered border-band widths.
- Every Add Border entry represents one physical band, including adjacent bands of the same species.
- Border calculations retain only complete laminated rows and report the additional border needed to replace the next row fully.
- Bordered previews rebuild the diamond field between the borders so no partial outside laminate rows remain visible.
- Bordered diamond cells retain square proportions; length overage is centered and clipped rather than stretching the pattern.
- Material Quantity reports finished cubic inches, net board feet, and waste-adjusted purchase board feet by species.
- Editable USD board-foot prices produce per-species and total estimated material costs.
- Print Illustrated Build Guide produces a current cut list, material summary, and ten visual steps generated from the active design for paper or PDF.
- Border engineering shows the exact replacement width required per edge and flags underage or overage.
- Renderer is built from physical square end-grain faces and contains no legacy v2 grid code.

## v3 foundation features
- Finished board dimensions
- Editable strip schedule and species
- Recommended rough rip beside each strip
- Edge rip inset through 1 inch and replacement species
- Editable kerf, rough-crosscut guidance, actual count, and required master blank length in one result
- Undo/redo
- JSON save/open
- SVG export

This release intentionally does not carry forward every v2 feature. Additional features should be added only after the core geometry is validated.


## v3.0.8 manufacturing guidance
The top engineering metric now calculates the required square lamination size before the two 45° cuts from finished thickness using `finished thickness × √2`, rounded upward to the nearest 1/8 inch for a practical starting dimension.
