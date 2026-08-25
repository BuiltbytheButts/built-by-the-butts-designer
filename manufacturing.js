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

  return Object.freeze({
    SQRT2,
    SHOP_INCREMENT,
    requiredLaminationSize,
    finishedDimensionCrosscutPlan
  });
});
