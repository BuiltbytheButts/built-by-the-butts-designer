# Built By The Butts End Grain Designer Pro v2.4

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


## Version 2.4

- Added finished board thickness to Board Setup.
- Added planing allowance per face from 1/8 in to 1/4 in.
- Automatically calculates required rough slice thickness.
- Whole-board material cost now uses rough thickness, so planing loss affects board feet and species cost.
- Shows total planing loss in inches and board feet.
