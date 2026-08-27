'use strict';

(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.DiamondMaterial = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  const BOARD_FOOT_CUBIC_INCHES = 144;

  function materialQuantityPlan(input) {
    const thickness = Math.max(0, Number(input.finishedThickness) || 0);
    const moduleWidth = Math.max(0.001, Number(input.moduleWidth) || 0.001);
    const laminationSize = Math.max(thickness, Number(input.requiredLaminationSize) || thickness);
    const laminatedRows = Math.max(0, Math.floor(Number(input.laminatedRows) || 0));
    const stripRoughAllowance = Math.max(0, Number(input.stripRoughAllowance) || 0);
    const borderRoughAllowance = Math.max(0, Number(input.borderRoughAllowance) || 0);
    const wastePercent = Math.max(0, Number(input.wastePercent) || 0);
    const prices = input.prices && typeof input.prices === 'object' ? input.prices : {};
    const strips = Array.isArray(input.strips) ? input.strips.filter(strip => Number(strip.width) > 0) : [];
    const borders = input.includeBorders && Array.isArray(input.borderBands) ? input.borderBands : [];
    const crosscutCount = Math.max(0, Math.floor(Number(input.crosscutCount) || 0));
    const roughCrosscut = Math.max(thickness, Number(input.roughCrosscut) || thickness);
    const kerf = Math.max(0, Number(input.bladeKerf) || 0);
    const requiredBlankLength = crosscutCount > 0
      ? crosscutCount * roughCrosscut + Math.max(0, crosscutCount - 1) * kerf
      : 0;
    const finishedCrosscutRun = crosscutCount * thickness;
    const crosscutFactor = finishedCrosscutRun > 0 ? requiredBlankLength / finishedCrosscutRun : 1;
    const edgeFraction = Math.min(1, Math.pow(Math.max(0, Number(input.edgeInset) || 0) / moduleWidth, 2));
    const bySpecies = {};

    function species(key) {
      if (!bySpecies[key]) bySpecies[key] = { species: key, roughCubicInches: 0, components: {} };
      return bySpecies[key];
    }

    // Every finished row starts as a full-length square laminated blank. Count
    // each physical strip at its recommended rough-rip width, the required
    // pre-45-degree blank thickness, and the complete kerf-inclusive blank
    // length. This intentionally includes the stock later removed by the four
    // 45-degree cuts and by an optional Edge Rip.
    strips.forEach(strip => {
      const roughWidth = Math.max(0, Number(strip.width) || 0) + stripRoughAllowance;
      const volume = roughWidth * laminationSize * requiredBlankLength * laminatedRows;
      const row = species(strip.wood);
      row.roughCubicInches += volume;
      row.components.laminatedStrips = (row.components.laminatedStrips || 0) + volume;
    });

    // Edge Rip consumes the original laminated stock above and also requires
    // replacement wood along every full-length laminated row. The two cut
    // triangles together occupy edgeFraction of one finished square face.
    if (laminatedRows > 0 && requiredBlankLength > 0 && edgeFraction > 0 && input.edgeWood) {
      const replacement = thickness * thickness * edgeFraction * requiredBlankLength * laminatedRows;
      const row = species(input.edgeWood);
      row.roughCubicInches += replacement;
      row.components.edgeRip = (row.components.edgeRip || 0) + replacement;
    }

    borders.forEach(band => {
      const roughWidth = Math.max(0, Number(band.width) || 0) + borderRoughAllowance;
      const volume = 2 * requiredBlankLength * roughWidth * laminationSize;
      const row = species(band.wood);
      row.roughCubicInches += volume;
      row.components.borders = (row.components.borders || 0) + volume;
    });

    const rows = Object.values(bySpecies).map(row => {
      const roughBoardFeet = row.roughCubicInches / BOARD_FOOT_CUBIC_INCHES;
      const purchaseBoardFeet = roughBoardFeet * (1 + wastePercent / 100);
      const pricePerBoardFoot = Math.max(0, Number(prices[row.species]) || 0);
      return { ...row, roughBoardFeet, purchaseBoardFeet, pricePerBoardFoot, estimatedCost: purchaseBoardFeet * pricePerBoardFoot };
    }).sort((a, b) => a.species.localeCompare(b.species));
    return {
      rows,
      wastePercent,
      requiredBlankLength,
      requiredLaminationSize: laminationSize,
      laminatedRows,
      crosscutFactor,
      edgeFraction,
      totalRoughBoardFeet: rows.reduce((sum, row) => sum + row.roughBoardFeet, 0),
      totalPurchaseBoardFeet: rows.reduce((sum, row) => sum + row.purchaseBoardFeet, 0),
      totalEstimatedCost: rows.reduce((sum, row) => sum + row.estimatedCost, 0)
    };
  }

  return Object.freeze({ BOARD_FOOT_CUBIC_INCHES, materialQuantityPlan });
});
