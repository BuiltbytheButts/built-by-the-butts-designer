# Built By The Butts End Grain Designer Pro v2.5.5

This release restores the compact original strip editor layout, removes drag-and-drop, keeps individual strip on/off controls, and ensures the full wood-species selector remains visible in the sidebar. Cache-busting version tags are included so GitHub Pages loads the new CSS and JavaScript immediately.

# Built By The Butts End Grain Designer Pro v2.2

This release adds:

- Separate **Remove Outer Pair** and **Remove Inner Pair** controls.
- Full species pricing for Walnut, Purpleheart, Cherry, Padauk, and Hard Maple.
- Finished board thickness and waste allowance inputs.
- Whole-board material cost driven by board dimensions, active strip widths, wood selections, replacement edge wood, and species prices.
- Per-species board-foot and cost breakdown.
- Edge-rip added-stock cost still updates with the inset and chosen edge wood.

Upload `index.html`, `styles.css`, `app.js`, and `README.md` to the root of the GitHub repository and replace the existing files.


## v2.2
- Restored the original simple strip editor layout.
- Removed drag-and-drop strip reordering.
- Kept individual strip on/off controls and inner/outer pair controls.
- Fixed wood selectors so they remain visible in the control panel.


## Version 2.5

- Added finished board thickness to Board Setup.
- Added planing allowance per face from 1/8 in to 1/4 in.
- Automatically calculates required rough slice thickness.
- Whole-board material cost now uses rough thickness, so planing loss affects board feet and species cost.
- Shows total planing loss in inches and board feet.


## Version 2.5

- Removed the Recommended Inset card and Apply button.
- Removed the Goal for Correct Inset and target center-diamond controls.
- Kept the Edge Rip Inset slider, preset tiles, Design Explorer, geometry metrics, and full-board cost calculations.


## Version 2.5.1

- Added a **Zero** edge-rip option for traditional diamond boards with no replacement edge wood.
- Zero edge now produces no added-edge geometry, no added-edge material, and no added-edge cost.
- Removed the Design Explorer edge-change thumbnails because the main preview and engineering calculations already update live.
- Whole-board lumber cost remains driven by board dimensions, rough thickness, strip species, wood prices, and waste allowance.


## Version 2.5.3

- Corrected the zero-edge preview so the original strip woods extend continuously to every diamond corner.
- Zero edge now removes only the added edge replacement; it no longer creates cleared gaps at the tips.


## Version 2.5.3

- Expanded the Edge Rip Inset range through 1.000 in.
- Added quick-select buttons for 7/8 in and 1 in edge strips.
- Preview, engineering, and cost calculations update automatically for both new sizes.


## Version 2.5.4

- Corrected the starting strip schedule to display six strips.
- Split the former center strip into two matching half-width strips, preserving the same pattern, total width, species usage, and cost.
- Automatically migrates older five-strip autosaves to the six-strip layout.


## v2.5.5 — Linked sizing

- Added **Board dimensions determine grid** mode. Length and width remain editable while rows and columns are calculated.
- Added **Rows and columns determine board dimensions** mode. Grid counts remain editable while finished length and width are calculated.
- Added a final-trim allowance per edge.
- Board size, visible module count, board feet, species usage, waste, and total material cost now update from the selected sizing mode.
- Module width, orientation, spacing, layout, and strip-schedule changes automatically flow through the sizing calculation.
