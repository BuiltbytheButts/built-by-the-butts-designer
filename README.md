# Diamond End Grain Designer v3.0.0

Clean-architecture foundation rebuild for Built By The Butts.

## Core rules
- Finished board setup uses length, width, and thickness only.
- Strip schedule is the source of pattern geometry.
- No rows/columns sizing mode exists in state, UI, or renderer.
- Rough machining values are recommendations, not user-entered allowances.
- Crosscut Engineering recommends balanced even counts.
- Renderer is built from physical square end-grain faces and contains no legacy v2 grid code.

## v3 foundation features
- Finished board dimensions
- Editable strip schedule and species
- Recommended rough rip beside each strip
- Edge rip inset through 1 inch and replacement species
- Crosscut blank length, kerf, rough-crosscut guidance, balanced even count, and next-even option
- Undo/redo
- JSON save/open
- SVG export

This release intentionally does not carry forward every v2 feature. Additional features should be added only after the core geometry is validated.
