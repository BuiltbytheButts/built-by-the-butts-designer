# Changelog

## v3.0.0 — Clean foundation rebuild
- Rebuilt the application from a minimal state model instead of patching v2.7.x.
- Removed rows, columns, sizing modes, layout modes, orientation modes, trim allowance, and finishing allowance from the architecture.
- Finished board setup now contains only length, width, and finished thickness.
- Rebuilt preview around physical square end-grain faces with alternating diagonal direction and paired 180-degree crosscut rows.
- Added rough-rip guidance (+1/16 in) beside strip design widths.
- Added rough-crosscut guidance (+1/8 in) as a recommendation rather than a user allowance.
- Preserved even-count Crosscut Engineering with master blank length and kerf.
- Added clean JSON save/open, undo/redo, SVG export, edge-rip controls, and strip-pair controls.
