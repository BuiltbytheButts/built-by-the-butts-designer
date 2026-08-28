'use strict';

(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.DiamondManufacturing = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  const SQRT2 = Math.SQRT2;
  const SHOP_INCREMENT = 1 / 8;

  function requiredLaminationSize(finishedThickness) {
    const target = Math.max(0, Number(finishedThickness) || 0);
    const minimum = target * SQRT2;
    const recommended = minimum > 0
      ? Math.ceil((minimum - 1e-12) / SHOP_INCREMENT) * SHOP_INCREMENT
      : 0;
    return { target, minimum, recommended, shopIncrement: SHOP_INCREMENT };
  }

  function finishedDimensionCrosscutPlan({
    targetLength,
    finishedThickness,
    roughCrosscut,
    bladeKerf,
    masterBlankLength
  }) {
    const target = Math.max(0, Number(targetLength) || 0);
    const finished = Math.max(0.001, Number(finishedThickness) || 0.001);
    const rough = Math.max(finished, Number(roughCrosscut) || finished);
    const kerf = Math.max(0, Number(bladeKerf) || 0);

    const idealCount = target / finished;
    // The requested finished dimensions are the source of truth. Do not hide an
    // odd result by coercing it to an even count; the preview and warning must
    // show the actual nearest whole-crosscut result.
    const crosscutCount = Math.max(1, Math.round(idealCount));
    const isBalanced = crosscutCount % 2 === 0;
    const achievableLength = crosscutCount * finished;
    const dimensionDelta = achievableLength - target;

    const requiredBlankFor = count => count > 0
      ? count * rough + Math.max(0, count - 1) * kerf
      : 0;
    const requiredBlankLength = requiredBlankFor(crosscutCount);
    const recommendedMasterBlankLength = Math.ceil((requiredBlankLength - 1e-12) / SHOP_INCREMENT) * SHOP_INCREMENT;

    return {
      targetLength: target,
      finishedThickness: finished,
      roughCrosscut: rough,
      bladeKerf: kerf,
      masterBlankLength: requiredBlankLength,
      recommendedMasterBlankLength,
      idealCount,
      crosscutCount,
      isBalanced,
      achievableLength,
      dimensionDelta,
      requiredBlankLength
    };
  }

  function stripScheduleLaminationPlan({ stripWidths, requiredLaminationSize }) {
    const required = Math.max(0, Number(requiredLaminationSize) || 0);
    const widths = Array.isArray(stripWidths) ? stripWidths : [];
    const total = widths.reduce((sum, width) => sum + Math.max(0, Number(width) || 0), 0);
    const difference = total - required;
    return {
      required,
      total,
      difference,
      matches: Math.abs(difference) <= 0.0005
    };
  }

  function mirroredBorderRowPlan({
    boardWidth,
    moduleWidth,
    requestedWidth,
    automaticRows,
    bordersEnabled
  }) {
    const width = Math.max(0, Number(boardWidth) || 0);
    const module = Math.max(0.001, Number(moduleWidth) || 0.001);
    const requested = Math.max(0, Number(requestedWidth) || 0);
    const automatic = Math.max(0, Number.isFinite(Number(automaticRows))
      ? Math.floor(Number(automaticRows))
      : Math.floor((width + 1e-12) / module));

    if (!bordersEnabled) {
      return {
        automaticRows: automatic,
        removedRowsPerEdge: 0,
        selectedRows: automatic,
        diamondFieldWidth: automatic * module,
        requiredWidth: 0
      };
    }

    // Finished thickness is the square-cell pitch supplied by the Designer.
    // The entered bands first determine how many complete cells physically fit
    // in the remaining width. Any reduction is then rounded to a mirrored pair,
    // one complete row at each long edge. Selecting borders always removes at
    // least the first pair instead of requiring a patterned row to be ripped.
    const availableWidth = Math.max(0, width - 2 * requested);
    const rowsThatFit = Math.max(0, Math.floor((availableWidth + 1e-12) / module));
    const rowsToRemove = Math.max(0, automatic - rowsThatFit);
    const removedRowsPerEdge = Math.max(1, Math.ceil(rowsToRemove / 2));
    const selectedRows = Math.max(0, automatic - 2 * removedRowsPerEdge);
    const diamondFieldWidth = selectedRows * module;
    const requiredWidth = Math.max(0, (width - diamondFieldWidth) / 2);
    return { automaticRows: automatic, availableWidth, rowsThatFit, removedRowsPerEdge, selectedRows, diamondFieldWidth, requiredWidth };
  }

  return Object.freeze({
    SQRT2,
    SHOP_INCREMENT,
    requiredLaminationSize,
    finishedDimensionCrosscutPlan,
    stripScheduleLaminationPlan,
    mirroredBorderRowPlan
  });
});
