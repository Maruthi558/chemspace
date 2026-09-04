/**
 * ChemNova Analytical Separation Science & Chromatography Calculation Engine
 * Contains verified, mathematically rigorous formulas and step-by-step explanations
 * for Paper, TLC, GC, HPLC, Column, Ion-Exchange, SEC, and Affinity chromatography.
 */

/**
 * 1. Retention Factor (Rf) for Paper and TLC
 * Rf = Distance travelled by solute / Distance travelled by solvent front
 */
export function calculateRf(soluteDistance, solventFrontDistance, unit = 'cm') {
  const dSolute = parseFloat(soluteDistance);
  const dSolvent = parseFloat(solventFrontDistance);

  if (isNaN(dSolute) || isNaN(dSolvent)) {
    return { error: 'Please enter valid numerical distances for solute and solvent front.' };
  }
  if (dSolvent <= 0) {
    return { error: 'Solvent front distance must be greater than 0.' };
  }
  if (dSolute < 0) {
    return { error: 'Solute distance cannot be negative.' };
  }
  if (dSolute > dSolvent * 1.05) {
    return { error: 'Solute distance cannot exceed solvent front distance.' };
  }

  const rf = Number((dSolute / dSolvent).toFixed(3));

  let interpretation = '';
  if (rf < 0.2) {
    interpretation = 'Low Rf (< 0.2): High affinity for polar stationary phase or insufficient mobile phase elution power.';
  } else if (rf >= 0.2 && rf <= 0.8) {
    interpretation = 'Optimal Rf range (0.2 – 0.8): Well-balanced partitioning between stationary and mobile phases.';
  } else {
    interpretation = 'High Rf (> 0.8): Solute moves very close to solvent front; weak interaction with stationary phase. Consider decreasing solvent polarity.';
  }

  return {
    success: true,
    rf,
    dSolute,
    dSolvent,
    unit,
    steps: {
      inputValues: `Distance of Solute (d₁) = ${dSolute} ${unit}, Solvent Front Distance (d₂) = ${dSolvent} ${unit}`,
      formula: 'R_f = \\frac{\\text{Distance travelled by solute (d}_1\\text{)}}{\\text{Distance travelled by solvent front (d}_2\\text{)}}',
      substitution: `R_f = \\frac{${dSolute}\\text{ ${unit}}}{${dSolvent}\\text{ ${unit}}}`,
      result: `R_f = ${rf}`,
      unit: 'dimensionless (0.000 to 1.000)'
    },
    interpretation
  };
}

/**
 * 2. Capacity Factor / Retention Factor (k') for Column, GC, HPLC
 * k' = (tR - t0) / t0
 */
export function calculateCapacityFactor(retentionTime, deadTime, unit = 'min') {
  const tR = parseFloat(retentionTime);
  const t0 = parseFloat(deadTime);

  if (isNaN(tR) || isNaN(t0)) {
    return { error: 'Please enter valid numbers for Retention Time (tR) and Dead Time (t0).' };
  }
  if (t0 <= 0) {
    return { error: 'Dead time (t0) must be greater than 0.' };
  }
  if (tR < t0) {
    return { error: 'Retention time (tR) must be greater than or equal to unretained dead time (t0).' };
  }

  const k = Number(((tR - t0) / t0).toFixed(3));
  let interpretation = '';
  if (k < 1.0) {
    interpretation = 'k\' < 1: Analyte elutes too close to solvent front (poor retention). Peaks may co-elute with sample matrix.';
  } else if (k >= 1.0 && k <= 10.0) {
    interpretation = '1 ≤ k\' ≤ 10: Ideal chromatographic retention window offering optimal balance between resolution and run time.';
  } else {
    interpretation = 'k\' > 10: Excessive retention resulting in broad, tailing peaks and long analysis runs. Consider increasing elution strength.';
  }

  return {
    success: true,
    k,
    tR,
    t0,
    unit,
    steps: {
      inputValues: `Retention Time (t_R) = ${tR} ${unit}, Dead Time (t_0) = ${t0} ${unit}`,
      formula: "k' = \\frac{t_R - t_0}{t_0}",
      substitution: `k' = \\frac{${tR}\\text{ ${unit}} - ${t0}\\text{ ${unit}}}{${t0}\\text{ ${unit}}} = \\frac{${Number((tR - t0).toFixed(3))}}{${t0}}`,
      result: `k' = ${k}`,
      unit: 'dimensionless'
    },
    interpretation
  };
}

/**
 * 3. Chromatographic Resolution (Rs) between two adjacent peaks
 * Rs = 2 * (tR2 - tR1) / (W1 + W2) or 1.177 * (tR2 - tR1) / (W0.5_1 + W0.5_2)
 */
export function calculateResolution(tR1, tR2, w1, w2, useHalfHeight = false, unit = 'min') {
  const r1 = parseFloat(tR1);
  const r2 = parseFloat(tR2);
  const width1 = parseFloat(w1);
  const width2 = parseFloat(w2);

  if (isNaN(r1) || isNaN(r2) || isNaN(width1) || isNaN(width2)) {
    return { error: 'Please enter valid numerical values for retention times and peak widths.' };
  }
  if (r2 <= r1) {
    return { error: 'Peak 2 retention time (tR2) must be greater than Peak 1 (tR1).' };
  }
  if (width1 <= 0 || width2 <= 0) {
    return { error: 'Peak widths must be greater than 0.' };
  }

  let rs;
  let formulaStr;
  let subStr;

  if (useHalfHeight) {
    rs = Number(((1.177 * (r2 - r1)) / (width1 + width2)).toFixed(3));
    formulaStr = 'R_s = \\frac{1.177 \\cdot (t_{R2} - t_{R1})}{W_{0.5,1} + W_{0.5,2}}';
    subStr = `R_s = \\frac{1.177 \\cdot (${r2} - ${r1})}{${width1} + ${width2}} = \\frac{${Number((1.177 * (r2 - r1)).toFixed(3))}}{${Number((width1 + width2).toFixed(3))}}`;
  } else {
    rs = Number(((2 * (r2 - r1)) / (width1 + width2)).toFixed(3));
    formulaStr = 'R_s = \\frac{2 \\cdot (t_{R2} - t_{R1})}{W_1 + W_2}';
    subStr = `R_s = \\frac{2 \\cdot (${r2} - ${r1})}{${width1} + ${width2}} = \\frac{${Number((2 * (r2 - r1)).toFixed(3))}}{${Number((width1 + width2).toFixed(3))}}`;
  }

  let interpretation = '';
  if (rs < 1.0) {
    interpretation = 'Rs < 1.0: Incomplete separation with significant peak overlap. Unacceptable for quantitative analysis.';
  } else if (rs >= 1.0 && rs < 1.5) {
    interpretation = '1.0 ≤ Rs < 1.5: Near baseline separation (~98% baseline resolution). Acceptable for routine screening.';
  } else {
    interpretation = 'Rs ≥ 1.5: Complete baseline separation (>99.7% peak purity). Compliant with regulatory (ICH/USP) validation standards.';
  }

  return {
    success: true,
    rs,
    tR1: r1,
    tR2: r2,
    w1: width1,
    w2: width2,
    useHalfHeight,
    unit,
    steps: {
      inputValues: `tR₁ = ${r1} ${unit}, tR₂ = ${r2} ${unit}, Width₁ = ${width1} ${unit}, Width₂ = ${width2} ${unit} (${useHalfHeight ? 'Half-height W0.5' : 'Baseline W'})`,
      formula: formulaStr,
      substitution: subStr,
      result: `R_s = ${rs}`,
      unit: 'dimensionless'
    },
    interpretation
  };
}

/**
 * 4. Selectivity Factor (alpha)
 * alpha = k'2 / k'1 = (tR2 - t0) / (tR1 - t0)
 */
export function calculateSelectivity(tR1, tR2, t0) {
  const r1 = parseFloat(tR1);
  const r2 = parseFloat(tR2);
  const dead = parseFloat(t0);

  if (isNaN(r1) || isNaN(r2) || isNaN(dead)) {
    return { error: 'Please enter valid values for tR1, tR2, and dead time t0.' };
  }
  if (dead <= 0 || r1 <= dead || r2 <= r1) {
    return { error: 'Ensure dead time t0 > 0, tR1 > t0, and tR2 > tR1.' };
  }

  const k1 = (r1 - dead) / dead;
  const k2 = (r2 - dead) / dead;
  const alpha = Number((k2 / k1).toFixed(3));

  let interpretation = '';
  if (alpha <= 1.0) {
    interpretation = 'α = 1.0: No chemical selectivity between compounds. Change stationary or mobile phase chemistry.';
  } else if (alpha > 1.0 && alpha < 1.1) {
    interpretation = '1.0 < α < 1.1: Weak selectivity; will require high column plate count (N > 20,000) for baseline resolution.';
  } else {
    interpretation = `α = ${alpha} ≥ 1.1: Excellent thermodynamic selectivity between the two stationary phase interactions.`;
  }

  return {
    success: true,
    alpha,
    k1: Number(k1.toFixed(3)),
    k2: Number(k2.toFixed(3)),
    steps: {
      inputValues: `tR₁ = ${r1}, tR₂ = ${r2}, t₀ = ${dead}`,
      formula: "\\alpha = \\frac{k'_2}{k'_1} = \\frac{t_{R2} - t_0}{t_{R1} - t_0}",
      substitution: `\\alpha = \\frac{${r2} - ${dead}}{${r1} - ${dead}} = \\frac{${Number((r2 - dead).toFixed(3))}}{${Number((r1 - dead).toFixed(3))}}`,
      result: `\\alpha = ${alpha}`,
      unit: 'dimensionless (≥ 1.000)'
    },
    interpretation
  };
}

/**
 * 5. Theoretical Plates (N) & Height Equivalent to a Theoretical Plate (HETP)
 * N = 16 * (tR / W)^2 = 5.545 * (tR / W0.5)^2
 * H = L / N
 */
export function calculateColumnEfficiency(retentionTime, peakWidth, columnLengthMm, useHalfHeight = false) {
  const tR = parseFloat(retentionTime);
  const w = parseFloat(peakWidth);
  const length = parseFloat(columnLengthMm);

  if (isNaN(tR) || isNaN(w)) {
    return { error: 'Please enter valid numerical values for retention time and peak width.' };
  }
  if (tR <= 0 || w <= 0) {
    return { error: 'Retention time and peak width must both be positive numbers.' };
  }

  let N;
  let formulaN;
  let subN;

  if (useHalfHeight) {
    N = Math.round(5.545 * Math.pow(tR / w, 2));
    formulaN = 'N = 5.545 \\cdot \\left( \\frac{t_R}{W_{0.5}} \\right)^2';
    subN = `N = 5.545 \\cdot \\left( \\frac{${tR}}{${w}} \\right)^2 = 5.545 \\cdot ${Number(Math.pow(tR / w, 2).toFixed(2))}`;
  } else {
    N = Math.round(16 * Math.pow(tR / w, 2));
    formulaN = 'N = 16 \\cdot \\left( \\frac{t_R}{W} \\right)^2';
    subN = `N = 16 \\cdot \\left( \\frac{${tR}}{${w}} \\right)^2 = 16 \\cdot ${Number(Math.pow(tR / w, 2).toFixed(2))}`;
  }

  let H_um = null;
  let stepsH = null;

  if (!isNaN(length) && length > 0) {
    // Column length in mm converted to H in micrometers: H (um) = (L mm * 1000) / N
    H_um = Number(((length * 1000) / N).toFixed(2));
    stepsH = {
      formula: 'H = \\frac{L}{N}',
      substitution: `H = \\frac{${length}\\text{ mm} \\cdot 1000\\,\\mu\\text{m/mm}}{${N}\\text{ plates}}`,
      result: `H = ${H_um}\\,\\mu\\text{m}`
    };
  }

  let interpretation = '';
  if (N < 2000) {
    interpretation = 'Low efficiency (N < 2,000): Common for flash or preparative columns. Peak broadening is significant.';
  } else if (N >= 2000 && N <= 20000) {
    interpretation = 'Standard analytical HPLC efficiency (2,000 ≤ N ≤ 20,000): Suitable for most multi-component separations.';
  } else {
    interpretation = 'High efficiency column (N > 20,000): Characteristic of UHPLC sub-2μm particle columns or capillary GC.';
  }

  return {
    success: true,
    N,
    H_um,
    tR,
    w,
    columnLengthMm: length || null,
    steps: {
      inputValues: `Retention Time (t_R) = ${tR}, Peak Width = ${w} (${useHalfHeight ? 'W0.5' : 'W_base'})${length ? `, Column Length L = ${length} mm` : ''}`,
      formula: formulaN,
      substitution: subN,
      result: `N = ${N.toLocaleString()} plates`,
      unit: 'theoretical plates'
    },
    stepsH,
    interpretation
  };
}

/**
 * 6. Relative Peak Area Percentage Composition
 * Area % = (Area_i * RF_i) / sum(Area_j * RF_j) * 100%
 */
export function calculateAreaPercentage(peaks = []) {
  if (!Array.isArray(peaks) || peaks.length === 0) {
    return { error: 'Please enter at least one valid peak with an area.' };
  }

  const sanitized = peaks.map((p, idx) => ({
    name: p.name || `Peak ${idx + 1}`,
    tR: parseFloat(p.tR) || 0,
    area: parseFloat(p.area) || 0,
    responseFactor: parseFloat(p.responseFactor) > 0 ? parseFloat(p.responseFactor) : 1.0
  })).filter((p) => p.area > 0);

  if (sanitized.length === 0) {
    return { error: 'All peaks have zero or invalid area values.' };
  }

  const totalCorrectedArea = sanitized.reduce((sum, p) => sum + p.area * p.responseFactor, 0);

  const results = sanitized.map((p) => {
    const correctedArea = p.area * p.responseFactor;
    const percentage = Number(((correctedArea / totalCorrectedArea) * 100).toFixed(2));
    return {
      ...p,
      correctedArea: Number(correctedArea.toFixed(2)),
      percentage
    };
  });

  return {
    success: true,
    totalArea: Number(sanitized.reduce((acc, p) => acc + p.area, 0).toFixed(2)),
    totalCorrectedArea: Number(totalCorrectedArea.toFixed(2)),
    peaks: results,
    steps: {
      inputValues: `Total Chromatographic Peaks: ${sanitized.length}, Total Integrated Area = ${Number(totalCorrectedArea.toFixed(2))}`,
      formula: '\\%\\,\\text{Area}_i = \\frac{A_i \\cdot F_i}{\\sum_{j=1}^k (A_j \\cdot F_j)} \\times 100\\%',
      substitution: `Sum of corrected peak areas = ${Number(totalCorrectedArea.toFixed(2))}`,
      result: results.map((r) => `${r.name}: ${r.percentage}%`).join(' | '),
      unit: 'percent (%)'
    }
  };
}

/**
 * 7. External Standard Calibration Curve Quantification
 * Cx = (Ax - intercept) / slope
 */
export function calculateConcentrationFromCalibration(peakArea, slope, intercept = 0, unit = 'µg/mL') {
  const area = parseFloat(peakArea);
  const m = parseFloat(slope);
  const b = parseFloat(intercept) || 0;

  if (isNaN(area) || isNaN(m)) {
    return { error: 'Please provide valid numbers for sample Peak Area and Calibration Curve Slope.' };
  }
  if (m === 0) {
    return { error: 'Calibration slope (m) cannot be zero.' };
  }

  const concentration = Number(((area - b) / m).toFixed(3));

  return {
    success: true,
    concentration,
    peakArea: area,
    slope: m,
    intercept: b,
    unit,
    steps: {
      inputValues: `Sample Peak Area (A) = ${area}, Curve Slope (m) = ${m}, Intercept (b) = ${b}`,
      formula: 'C_x = \\frac{A_x - b}{m}',
      substitution: `C_x = \\frac{${area} - (${b})}{${m}} = \\frac{${Number((area - b).toFixed(3))}}{${m}}`,
      result: `C_x = ${concentration} ${unit}`,
      unit
    }
  };
}

/**
 * 8. Column Recovery & Fraction Analysis
 * Recovery % = (Total Mass Recovered / Mass Loaded) * 100%
 */
export function calculateColumnRecovery(massLoadedMg, fractions = []) {
  const loaded = parseFloat(massLoadedMg);
  if (isNaN(loaded) || loaded <= 0) {
    return { error: 'Please enter a valid positive mass of sample loaded in mg.' };
  }

  const validFractions = fractions
    .map((f, i) => ({
      fractionNumber: f.fractionNumber || i + 1,
      volumeMl: parseFloat(f.volumeMl) || 0,
      massMg: parseFloat(f.massMg) || 0,
      purity: parseFloat(f.purity) || 100,
      notes: f.notes || ''
    }))
    .filter((f) => f.massMg > 0);

  const totalRecoveredMg = Number(validFractions.reduce((sum, f) => sum + f.massMg, 0).toFixed(2));
  const recoveryPercentage = Number(((totalRecoveredMg / loaded) * 100).toFixed(2));

  return {
    success: true,
    massLoadedMg: loaded,
    totalRecoveredMg,
    recoveryPercentage,
    fractionCount: validFractions.length,
    fractions: validFractions,
    steps: {
      inputValues: `Mass Loaded = ${loaded} mg, Total Fractions Recovered = ${totalRecoveredMg} mg`,
      formula: '\\%\\,\\text{Recovery} = \\frac{\\sum \\text{Mass of Fractions (mg)}}{\\text{Mass Loaded (mg)}} \\times 100\\%',
      substitution: `\\%\\,\\text{Recovery} = \\frac{${totalRecoveredMg}\\text{ mg}}{${loaded}\\text{ mg}} \\times 100\\%`,
      result: `Recovery = ${recoveryPercentage}%`,
      unit: 'percent (%)'
    }
  };
}

/**
 * 9. Size Exclusion Chromatography (SEC) Distribution Coefficient (K_sec)
 * K_sec = (Ve - V0) / (Vt - V0)
 */
export function calculateSEC(elutionVol, voidVol, totalVol) {
  const Ve = parseFloat(elutionVol);
  const V0 = parseFloat(voidVol);
  const Vt = parseFloat(totalVol);

  if (isNaN(Ve) || isNaN(V0) || isNaN(Vt)) {
    return { error: 'Please enter valid elution volume (Ve), void volume (V0), and total volume (Vt).' };
  }
  if (V0 <= 0 || Vt <= V0) {
    return { error: 'Ensure Total Column Volume (Vt) > Void Volume (V0) > 0.' };
  }

  const Ksec = Number(((Ve - V0) / (Vt - V0)).toFixed(3));

  let interpretation = '';
  if (Ksec < 0) {
    interpretation = 'K_SEC < 0: Volume precedes void volume (indicates column channeling or particulate scattering).';
  } else if (Ksec === 0) {
    interpretation = 'K_SEC = 0: Completely excluded molecule (molecular weight exceeds column fractionation exclusion limit).';
  } else if (Ksec > 0 && Ksec < 1.0) {
    interpretation = '0 < K_SEC < 1: Partially permeating analyte inside the gel pores (ideal molecular weight sizing region).';
  } else if (Ksec === 1.0) {
    interpretation = 'K_SEC = 1: Fully permeating small molecule (equal to total accessible permeation volume).';
  } else {
    interpretation = 'K_SEC > 1: Secondary non-ideal interactions occurring (adsorption or hydrophobic binding to the matrix).';
  }

  return {
    success: true,
    Ksec,
    Ve,
    V0,
    Vt,
    steps: {
      inputValues: `Elution Volume (V_e) = ${Ve} mL, Void Volume (V_0) = ${V0} mL, Total Volume (V_t) = ${Vt} mL`,
      formula: 'K_{\\text{SEC}} = \\frac{V_e - V_0}{V_t - V_0}',
      substitution: `K_{\\text{SEC}} = \\frac{${Ve} - ${V0}}{${Vt} - ${V0}} = \\frac{${Number((Ve - V0).toFixed(3))}}{${Number((Vt - V0).toFixed(3))}}`,
      result: `K_{\\text{SEC}} = ${Ksec}`,
      unit: 'distribution coefficient (0.000 to 1.000)'
    },
    interpretation
  };
}
