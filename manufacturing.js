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
    const blank = Math.max(0, Number(masterBlankLength) || 0);

    const idealCount = target / finished;
    const lowerEven = Math.max(2, Math.floor(idealCount / 2) * 2);
    const upperEven = Math.max(2, Math.ceil(idealCount / 2) * 2);
    const lowerLength = lowerEven * finished;
    const upperLength = upperEven * finished;
    const lowerError = Math.abs(target - lowerLength);
    const upperError = Math.abs(target - upperLength);

    // On an exact tie, prefer the lower even count: it conserves material and
    // never overshoots the requested finished length unless the upper choice is closer.
    const balancedCount = upperError < lowerError ? upperEven : lowerEven;
    const achievableLength = balancedCount * finished;
    const dimensionDelta = achievableLength - target;

    const requiredBlankFor = count => count > 0
      ? count * rough + Math.max(0, count - 1) * kerf
      : 0;
    const requiredBlankLength = requiredBlankFor(balancedCount);
    const blankDelta = blank - requiredBlankLength;
    const blankIsSufficient = blankDelta >= -1e-9;

    // Complete rough crosscuts physically available from the master blank.
    // n cuts consume n * roughCrosscut plus (n - 1) blade kerfs.
    const totalCrosscutsAvailable = blank > 0
      ? Math.max(0, Math.floor(((blank + kerf) / (rough + kerf)) + 1e-12))
      : 0;

    const alternateCount = balancedCount === lowerEven
      ? (upperEven > lowerEven ? upperEven : balancedCount + 2)
      : lowerEven;
    const alternateFinishedLength = alternateCount * finished;
    const alternateRequiredBlankLength = requiredBlankFor(alternateCount);
    const alternateBlankDelta = blank - alternateRequiredBlankLength;

    return {
      targetLength: target,
      finishedThickness: finished,
      roughCrosscut: rough,
      bladeKerf: kerf,
      masterBlankLength: blank,
      idealCount,
      lowerEven,
      upperEven,
      balancedCount,
      achievableLength,
      dimensionDelta,
      requiredBlankLength,
      blankDelta,
      blankIsSufficient,
      totalCrosscutsAvailable,
      alternateCount,
      alternateFinishedLength,
      alternateRequiredBlankLength,
      alternateBlankDelta
    };
  }

  return Object.freeze({
    SQRT2,
    SHOP_INCREMENT,
    requiredLaminationSize,
    finishedDimensionCrosscutPlan
  });
});
