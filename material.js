'use strict';

(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.DiamondMaterial = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  const BOARD_FOOT_CUBIC_INCHES = 144;

  function materialQuantityPlan(input) {
    const length = Math.max(0, Number(input.boardLength) || 0);
    const width = Math.max(0, Number(input.boardWidth) || 0);
    const thickness = Math.max(0, Number(input.finishedThickness) || 0);
    const moduleWidth = Math.max(0.001, Number(input.moduleWidth) || 0.001);
    const diamondWidth = Math.max(0, Number(input.diamondFieldWidth) || 0);
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
    const diamondVolume = length * diamondWidth * thickness;
    const targetVolume = length * width * thickness;
    const stripTotal = strips.reduce((sum, strip) => sum + Number(strip.width), 0);
    const bySpecies = {};

    function species(key) {
      if (!bySpecies[key]) bySpecies[key] = { species: key, finishedCubicInches: 0, purchaseBaseCubicInches: 0, components: {} };
      return bySpecies[key];
    }

    if (stripTotal > 0) {
      strips.forEach(strip => {
        const share = Number(strip.width) / stripTotal;
        const baseFinished = diamondVolume * share;
        const retainedFinished = baseFinished * (1 - edgeFraction);
        const row = species(strip.wood);
        row.finishedCubicInches += retainedFinished;
        row.purchaseBaseCubicInches += baseFinished * crosscutFactor;
        row.components.diamondLaminate = (row.components.diamondLaminate || 0) + baseFinished * crosscutFactor;
      });
    }

    if (diamondVolume > 0 && edgeFraction > 0 && input.edgeWood) {
      const replacement = diamondVolume * edgeFraction;
      const row = species(input.edgeWood);
      row.finishedCubicInches += replacement;
      row.purchaseBaseCubicInches += replacement;
      row.components.edgeRip = (row.components.edgeRip || 0) + replacement;
    }

    borders.forEach(band => {
      const volume = 2 * length * Math.max(0, Number(band.width) || 0) * thickness;
      const row = species(band.wood);
      row.finishedCubicInches += volume;
      row.purchaseBaseCubicInches += volume;
      row.components.borders = (row.components.borders || 0) + volume;
    });

    const rows = Object.values(bySpecies).map(row => {
      const netBoardFeet = row.finishedCubicInches / BOARD_FOOT_CUBIC_INCHES;
      const purchaseBoardFeet = (row.purchaseBaseCubicInches / BOARD_FOOT_CUBIC_INCHES) * (1 + wastePercent / 100);
      const pricePerBoardFoot = Math.max(0, Number(prices[row.species]) || 0);
      return { ...row, netBoardFeet, purchaseBoardFeet, pricePerBoardFoot, estimatedCost: purchaseBoardFeet * pricePerBoardFoot };
    }).sort((a, b) => a.species.localeCompare(b.species));
    const designedVolume = rows.reduce((sum, row) => sum + row.finishedCubicInches, 0);
    return {
      rows,
      wastePercent,
      targetVolume,
      designedVolume,
      unfilledVolume: Math.max(0, targetVolume - designedVolume),
      crosscutFactor,
      edgeFraction,
      totalNetBoardFeet: rows.reduce((sum, row) => sum + row.netBoardFeet, 0),
      totalPurchaseBoardFeet: rows.reduce((sum, row) => sum + row.purchaseBoardFeet, 0),
      totalEstimatedCost: rows.reduce((sum, row) => sum + row.estimatedCost, 0)
    };
  }

  return Object.freeze({ BOARD_FOOT_CUBIC_INCHES, materialQuantityPlan });
});
