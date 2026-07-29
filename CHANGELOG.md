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
