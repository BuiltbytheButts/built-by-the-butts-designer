# Diamond End Grain Designer v3.0.59

Clean-architecture foundation rebuild for Built By The Butts.

## Core rules
- Finished board setup uses requested length, requested width, and finished thickness only.
- Actual Board Dimensions report the physical result from complete crosscuts, complete laminated rows, and entered borders; a warning appears when that result differs from the requested size.
- The Designer never silently trims a complete laminated row to force the requested width.
- Starting Crosscut switches which crosscut receives the first 180° turn, providing both physical glue-up views without changing dimensions, counts, borders, or material quantities.
- Strip schedule is the source of pattern geometry.
- No rows/columns sizing mode exists in state, UI, or renderer.
- Rough machining values are recommendations, not user-entered allowances.
- Crosscut Engineering reports the actual calculated whole-crosscut count.
- Odd counts drive the preview unchanged and display an unbalanced-pattern warning.
- Optional all-end-grain borders run along the two long edges and contribute their full entered widths to the Actual Board Dimensions.
- Add or remove any number of border bands; every band has its own width and species.
- Border bands mirror across the two long edges; turning borders off restores the full-diamond field.
- Laminated rows are calculated automatically from the finished width and entered border-band widths.
- Finished thickness sets the physical square-cell pitch in both preview directions; strip widths set only the relative wood-band proportions inside the cells.
- Every Add Border entry represents one physical band, including adjacent bands of the same species.
- Border calculations remove complete laminated rows as mirrored pairs—one full row at each edge—and report the additional border needed to reach the paired boundary.
- Bordered previews rebuild the diamond field between the borders so no partial outside laminate rows remain visible.
- Bordered diamond cells retain square proportions, and calculated crosscuts span the finished length without strip-total-driven clipping.
- Estimated Wood Cost counts every physical rough-ripped strip across every laminated row, using the required pre-45° lamination size and the full kerf-inclusive master-blank length.
- Border stock, Edge Rip replacement stock, rough-rip allowance, and waste are included by species; finished/net design volume is intentionally omitted from the interface.
- Editable USD board-foot prices produce per-species and total estimated wood costs.
- Print Illustrated Build Guide produces a current cut list, material summary, and ten visual steps generated from the active design for paper or PDF.
- Independent Sample Build is a self-contained photo guide; all original photos are embedded and open in an enlarged previous/next viewer.
- A printable User Guide and interactive FAQ open independently from the compact Help menu.
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

- Independent Sample Build opens as a separate, printable real-photo reference without changing the active project.
