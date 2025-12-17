// frontend/js/risk.js
// Weights are explicit and fixed for the demo (explainability).
const WEIGHTS = { engine: 0.4, harsh: 0.35, vib: 0.25 };

/**
 * Calculate risk percent (0-100) from raw factor values (0-100).
 * Returns number with two decimals.
 */
function calcRiskPercent(engineTemp, harshBraking, vibration) {
  const contribEngine = WEIGHTS.engine * engineTemp;
  const contribHarsh = WEIGHTS.harsh * harshBraking;
  const contribVib = WEIGHTS.vib * vibration;
  const sum = contribEngine + contribHarsh + contribVib;
  return Math.round(sum * 100) / 100;
}

/**
 * Apply a counterfactual: reduce harsh braking by reductionPercent (0-100)
 * Returns object { newRisk, contributions }
 */
function applyCounterfactual(values, reductionPercent) {
  const engine = values.engine_temp;
  const harsh = values.harsh_braking * (1 - reductionPercent / 100);
  const vib = values.vibration;
  const newRisk = calcRiskPercent(engine, harsh, vib);
  // contributions breakdown (for UI)
  const contributions = {
    engine: Math.round(WEIGHTS.engine * engine * 100) / 100,
    harsh: Math.round(WEIGHTS.harsh * harsh * 100) / 100,
    vib: Math.round(WEIGHTS.vib * vib * 100) / 100
  };
  return { newRisk, contributions };
}
