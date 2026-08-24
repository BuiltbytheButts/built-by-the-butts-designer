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

  return Object.freeze({ SQRT2, SHOP_INCREMENT, requiredLaminationSize });
});
