# Changelog

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
