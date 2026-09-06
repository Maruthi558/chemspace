/**
 * Spectroscopy Reference Database & Simulation Algorithms
 * Provides Mass Spectrometry (EI), FT-IR (4000-400 cm⁻¹),
 * 1H-NMR / 13C-NMR chemical shifts, and UV-Vis spectrophotometry curves.
 */

export const SPECTROSCOPY_SAMPLES = [
  {
    id: "ethanol",
    name: "Ethanol",
    formula: "C₂H₆O",
    mw: 46.07,
    smiles: "CCO",
    massSpec: {
      basePeak: 31,
      molecularIon: 46,
      peaks: [
        { mz: 46, intensity: 32, label: "[CH₃CH₂OH]⁺• (M⁺• Molecular Ion)" },
        { mz: 45, intensity: 58, label: "[CH₃CH₂O]⁺ (M - H)" },
        { mz: 31, intensity: 100, label: "[CH₂=OH]⁺ (Base Peak, α-cleavage)" },
        { mz: 29, intensity: 75, label: "[CH₃CH₂]⁺ Ethyl Cation" },
        { mz: 27, intensity: 38, label: "[C₂H₃]⁺ Vinyl Cation" },
        { mz: 15, intensity: 42, label: "[CH₃]⁺ Methyl Cation" }
      ]
    },
    ir: {
      keyBands: [
        { range: "3350 - 3200 cm⁻¹", assignment: "O-H Stretch (Strong, Broad intermolecular H-bond)" },
        { range: "2975 - 2880 cm⁻¹", assignment: "C-H Stretch (Alkane C-sp³ Asymmetric/Symmetric)" },
        { range: "1450 - 1380 cm⁻¹", assignment: "C-H Bending (CH₃/CH₂ Deformation)" },
        { range: "1085 - 1050 cm⁻¹", assignment: "C-O Stretch (Primary Alcohol C-O vibration)" },
        { range: "880 cm⁻¹", assignment: "C-C-O In-plane Skeletal Deformation" }
      ],
      curve: generateIrCurve('alcohol')
    },
    nmr1H: {
      solvent: "CDCl₃",
      formula: "C₂H₆O",
      signals: [
        { shift: 1.22, multiplicity: "Triplet (t)", integration: 3, coupling: "J = 7.1 Hz", assignment: "-CH₃ Protons (coupled to -CH₂-)" },
        { shift: 3.68, multiplicity: "Quartet (q)", integration: 2, coupling: "J = 7.1 Hz", assignment: "-CH₂-O- Protons (downfield due to Oxygen)" },
        { shift: 2.15, multiplicity: "Singlet (s)", integration: 1, coupling: "Exchangeable", assignment: "-OH Hydroxyl Proton (broadened)" }
      ]
    },
    nmr13C: {
      signals: [
        { shift: 58.2, type: "CH₂ (DEPT-135 inverted)", assignment: "-CH₂-OH Carbon" },
        { shift: 18.1, type: "CH₃ (DEPT-135 positive)", assignment: "-CH₃ Methyl Carbon" }
      ]
    },
    uvVis: {
      lambdaMax: 204,
      extinction: 45,
      curve: generateUvCurve(204)
    }
  },
  {
    id: "benzene",
    name: "Benzene",
    formula: "C₆H₆",
    mw: 78.11,
    smiles: "c1ccccc1",
    massSpec: {
      basePeak: 78,
      molecularIon: 78,
      peaks: [
        { mz: 78, intensity: 100, label: "[C₆H₆]⁺• (Molecular Ion & Base Peak)" },
        { mz: 77, intensity: 24, label: "[C₆H₅]⁺ Phenyl Cation" },
        { mz: 52, intensity: 36, label: "[C₄H₄]⁺• Acetylene Elimination" },
        { mz: 51, intensity: 28, label: "[C₄H₃]⁺ Fragment" },
        { mz: 39, intensity: 45, label: "[C₃H₃]⁺ Cyclopropenyl Cation" }
      ]
    },
    ir: {
      keyBands: [
        { range: "3080 - 3030 cm⁻¹", assignment: "C-H Aromatic Stretch (C-sp²-H)" },
        { range: "1600 - 1475 cm⁻¹", assignment: "C=C Aromatic Ring Quadrant Vibrations" },
        { range: "1035 cm⁻¹", assignment: "In-plane C-H Bending" },
        { range: "750 - 690 cm⁻¹", assignment: "Out-of-plane C-H Bending (Monosubstituted/Ring)" }
      ],
      curve: generateIrCurve('aromatic')
    },
    nmr1H: {
      solvent: "CDCl₃",
      formula: "C₆H₆",
      signals: [
        { shift: 7.36, multiplicity: "Singlet (s)", integration: 6, coupling: "Degenerate", assignment: "Aromatic Ring Protons (strong diamagnetic ring current)" }
      ]
    },
    nmr13C: {
      signals: [
        { shift: 128.4, type: "CH (6 equivalent carbons)", assignment: "Aromatic Ring Carbons" }
      ]
    },
    uvVis: {
      lambdaMax: 254,
      extinction: 2040,
      curve: generateUvCurve(254)
    }
  },
  {
    id: "aspirin",
    name: "Aspirin",
    formula: "C₉H₈O₄",
    mw: 180.16,
    smiles: "CC(=O)OC1=CC=CC=C1C(=O)O",
    massSpec: {
      basePeak: 120,
      molecularIon: 180,
      peaks: [
        { mz: 180, intensity: 25, label: "[C₉H₈O₄]⁺• (M⁺• Molecular Ion)" },
        { mz: 138, intensity: 88, label: "[Salicylic Acid]⁺• (Loss of Ketene CH₂=C=O)" },
        { mz: 120, intensity: 100, label: "[C₆H₄(OH)C≡O⁺] (Base Peak)" },
        { mz: 92, intensity: 52, label: "[C₆H₄O]⁺ Phenoxy Radical" },
        { mz: 65, intensity: 34, label: "[C₅H₅]⁺ Cyclopentadienyl" },
        { mz: 43, intensity: 92, label: "[CH₃C≡O]⁺ Acetylium Cation" }
      ]
    },
    ir: {
      keyBands: [
        { range: "3200 - 2500 cm⁻¹", assignment: "O-H Carboxylic Acid Stretch (Extremely Broad)" },
        { range: "1750 cm⁻¹", assignment: "C=O Ester Carbonyl Stretch" },
        { range: "1685 cm⁻¹", assignment: "C=O Carboxylic Acid Carbonyl Stretch (H-bonded)" },
        { range: "1605 - 1480 cm⁻¹", assignment: "C=C Aromatic Ring Skeletal Vibrations" },
        { range: "1220 - 1180 cm⁻¹", assignment: "C-O Ester Phenolic Stretch" }
      ],
      curve: generateIrCurve('carbonyl')
    },
    nmr1H: {
      solvent: "CDCl₃",
      formula: "C₉H₈O₄",
      signals: [
        { shift: 2.35, multiplicity: "Singlet (s)", integration: 3, coupling: "-", assignment: "Acetyl -CH₃ Protons" },
        { shift: 7.15, multiplicity: "Doublet (d)", integration: 1, coupling: "J = 8.2 Hz", assignment: "Ar-H (ortho to ester)" },
        { shift: 7.36, multiplicity: "Triplet (t)", integration: 1, coupling: "J = 7.5 Hz", assignment: "Ar-H (meta to acid)" },
        { shift: 7.62, multiplicity: "Triplet (t)", integration: 1, coupling: "J = 7.8 Hz", assignment: "Ar-H (para to acid)" },
        { shift: 8.12, multiplicity: "Doublet (d)", integration: 1, coupling: "J = 7.9 Hz", assignment: "Ar-H (ortho to carboxylic acid)" },
        { shift: 11.20, multiplicity: "Singlet (s)", integration: 1, coupling: "Broad", assignment: "Carboxylic Acid -COOH Proton" }
      ]
    },
    nmr13C: {
      signals: [
        { shift: 169.8, type: "C=O (Ester)", assignment: "Acetyl Carbonyl Carbon" },
        { shift: 169.2, type: "C=O (Acid)", assignment: "Carboxylic Acid Carbonyl Carbon" },
        { shift: 151.2, type: "C-Ar (ipso)", assignment: "C-2 (Phenolic ester attachment)" },
        { shift: 134.8, type: "CH-Ar", assignment: "C-4 (para position)" },
        { shift: 132.4, type: "CH-Ar", assignment: "C-6 (ortho to carboxylic acid)" },
        { shift: 126.1, type: "CH-Ar", assignment: "C-5 (meta position)" },
        { shift: 123.9, type: "CH-Ar", assignment: "C-3 (ortho to ester)" },
        { shift: 122.1, type: "C-Ar (ipso)", assignment: "C-1 (Carboxylic acid attachment)" },
        { shift: 20.9, type: "CH₃", assignment: "Acetyl Methyl Carbon" }
      ]
    },
    uvVis: {
      lambdaMax: 276,
      extinction: 1250,
      curve: generateUvCurve(276)
    }
  },
  {
    id: "caffeine",
    name: "Caffeine",
    formula: "C₈H₁₀N₄O₂",
    mw: 194.19,
    smiles: "CN1C=NC2=C1C(=O)N(C(=O)N2C)C",
    massSpec: {
      basePeak: 194,
      molecularIon: 194,
      peaks: [
        { mz: 194, intensity: 100, label: "[C₈H₁₀N₄O₂]⁺• (Molecular Ion & Base Peak)" },
        { mz: 165, intensity: 48, label: "[M - N=CH]⁺ Purine Ring Cleavage" },
        { mz: 137, intensity: 32, label: "[M - CH₃NCO]⁺ Loss of Methyl Isocyanate" },
        { mz: 109, intensity: 65, label: "[C₅H₇N₂]⁺ Imidazole Core" },
        { mz: 67, intensity: 40, label: "[C₃H₃N₂]⁺ Fragment" },
        { mz: 42, intensity: 25, label: "[CH₂=C=NH]⁺" }
      ]
    },
    ir: {
      keyBands: [
        { range: "3110 cm⁻¹", assignment: "C-H Imidazole Ring Stretch (C-sp²)" },
        { range: "2955 - 2880 cm⁻¹", assignment: "C-H Methyl Stretches (N-CH₃)" },
        { range: "1700 cm⁻¹", assignment: "C=O Amide I Carbonyl (Asymmetric)" },
        { range: "1655 cm⁻¹", assignment: "C=O Amide I Carbonyl (Symmetric)" },
        { range: "1545 cm⁻¹", assignment: "C=N and C=C Purine Ring Skeletal Bands" }
      ],
      curve: generateIrCurve('carbonyl')
    },
    nmr1H: {
      solvent: "CDCl₃",
      formula: "C₈H₁₀N₄O₂",
      signals: [
        { shift: 3.40, multiplicity: "Singlet (s)", integration: 3, coupling: "-", assignment: "N1-CH₃ Methyl Protons" },
        { shift: 3.58, multiplicity: "Singlet (s)", integration: 3, coupling: "-", assignment: "N3-CH₃ Methyl Protons" },
        { shift: 3.99, multiplicity: "Singlet (s)", integration: 3, coupling: "-", assignment: "N7-CH₃ Methyl Protons (deshielded)" },
        { shift: 7.52, multiplicity: "Singlet (s)", integration: 1, coupling: "-", assignment: "C8-H Imidazole Ring Proton" }
      ]
    },
    nmr13C: {
      signals: [
        { shift: 155.4, type: "C=O", assignment: "C-6 Carbonyl Carbon" },
        { shift: 151.7, type: "C=O", assignment: "C-2 Carbonyl Carbon" },
        { shift: 148.8, type: "C=N", assignment: "C-4 Bridgehead Carbon" },
        { shift: 141.5, type: "CH", assignment: "C-8 Imidazole Carbon" },
        { shift: 107.6, type: "C-Bridge", assignment: "C-5 Bridgehead Carbon" },
        { shift: 33.6, type: "CH₃", assignment: "N7-Methyl Carbon" },
        { shift: 29.8, type: "CH₃", assignment: "N3-Methyl Carbon" },
        { shift: 27.9, type: "CH₃", assignment: "N1-Methyl Carbon" }
      ]
    },
    uvVis: {
      lambdaMax: 273,
      extinction: 9800,
      curve: generateUvCurve(273)
    }
  }
];

export function generateSpectrumForSmiles(smilesInput) {
  const smiles = smilesInput.trim();
  const mw = estimateMwFromSmiles(smiles);
  const hasCarbonyl = smiles.includes("=O") || smiles.includes("(=O)");
  const hasOH = smiles.includes("O") || smiles.includes("OH");
  const hasAromatic = smiles.includes("c") || smiles.includes("C1") || smiles.includes("c1");
  const hasAmine = smiles.includes("N") || smiles.includes("n");

  const lMax = hasAromatic ? (hasCarbonyl ? 276 : 254) : hasCarbonyl ? 275 : 210;

  return {
    id: "custom_" + Date.now(),
    name: `Simulated (${smiles})`,
    formula: `Calculated Formula`,
    mw: mw,
    smiles: smiles,
    massSpec: {
      basePeak: Math.round(mw * 0.65),
      molecularIon: Math.round(mw),
      peaks: [
        { mz: Math.round(mw), intensity: 35, label: `[M]⁺• Molecular Ion (${mw} g/mol)` },
        { mz: Math.round(mw * 0.85), intensity: 68, label: `[M - Fragment]⁺` },
        { mz: Math.round(mw * 0.65), intensity: 100, label: `[Base Peak]` },
        { mz: 43, intensity: 75, label: `[Acyl/Alkyl Fragment]` },
        { mz: 15, intensity: 42, label: `[CH₃]⁺ Methyl Cation` }
      ]
    },
    ir: {
      keyBands: [
        ...(hasOH ? [{ range: "3400 - 3200 cm⁻¹", assignment: "O-H Hydroxyl Stretch (Broad)" }] : []),
        ...(hasAmine ? [{ range: "3350 - 3250 cm⁻¹", assignment: "N-H Amine/Amide Stretch" }] : []),
        ...(hasCarbonyl ? [{ range: "1720 - 1680 cm⁻¹", assignment: "C=O Carbonyl Stretch (Strong)" }] : []),
        ...(hasAromatic ? [{ range: "1600 - 1475 cm⁻¹", assignment: "C=C Aromatic Ring Stretches" }] : []),
        { range: "2960 - 2850 cm⁻¹", assignment: "C-H Alkane Sp3 Stretch" },
        { range: "1150 - 1050 cm⁻¹", assignment: "C-O / C-N Single Bond Stretch" }
      ],
      curve: generateIrCurve(hasCarbonyl ? 'carbonyl' : hasOH ? 'alcohol' : 'aromatic')
    },
    nmr1H: {
      solvent: "CDCl₃",
      formula: `Simulated for ${smiles}`,
      signals: [
        { shift: 1.25, multiplicity: "Triplet (t)", integration: 3, coupling: "J = 7.0 Hz", assignment: "Aliphatic -CH₃" },
        ...(hasCarbonyl ? [{ shift: 2.35, multiplicity: "Singlet (s)", integration: 3, coupling: "-", assignment: "Alpha-carbonyl -CH₃" }] : []),
        ...(hasAromatic ? [{ shift: 7.25, multiplicity: "Multiplet (m)", integration: 4, coupling: "J = 7.8 Hz", assignment: "Aromatic Ring Protons" }] : []),
        ...(hasOH ? [{ shift: 4.10, multiplicity: "Singlet (s)", integration: 1, coupling: "Broad", assignment: "Hydroxyl -OH" }] : [])
      ]
    },
    nmr13C: {
      signals: [
        ...(hasCarbonyl ? [{ shift: 172.5, type: "C=O", assignment: "Carbonyl Carbon" }] : []),
        ...(hasAromatic ? [{ shift: 128.5, type: "CH-Ar", assignment: "Aromatic Ring Carbons" }] : []),
        { shift: 22.4, type: "CH₃", assignment: "Aliphatic Methyl Carbon" }
      ]
    },
    uvVis: {
      lambdaMax: lMax,
      extinction: hasAromatic ? 1800 : 450,
      curve: generateUvCurve(lMax)
    }
  };
}

function estimateMwFromSmiles(smiles) {
  let mw = 0;
  const weights = { C: 12.01, H: 1.008, O: 16.0, N: 14.01, F: 19.0, Cl: 35.45, Br: 79.9, S: 32.06, P: 30.97 };
  for (let char of smiles) {
    if (weights[char]) mw += weights[char];
    else if (char === 'c' || char === 'o' || char === 'n') mw += 12.0;
  }
  return mw > 20 ? Math.round(mw) : 120;
}

function generateIrCurve(type) {
  const points = [];
  for (let w = 4000; w >= 400; w -= 30) {
    let trans = 95 - Math.sin(w / 300) * 4;
    if (type === 'alcohol' && w > 3200 && w < 3600) trans -= 55 * Math.exp(-Math.pow((w - 3350) / 110, 2));
    if (type === 'carbonyl' && w > 1650 && w < 1750) trans -= 70 * Math.exp(-Math.pow((w - 1715) / 35, 2));
    if (type === 'aromatic' && w > 1550 && w < 1620) trans -= 45 * Math.exp(-Math.pow((w - 1600) / 30, 2));
    if (w > 2850 && w < 2980) trans -= 38 * Math.exp(-Math.pow((w - 2920) / 40, 2));
    points.push({ wavenumber: w, transmittance: Math.max(10, Math.min(100, trans)) });
  }
  return points;
}

function generateUvCurve(lMax) {
  const points = [];
  for (let l = 200; l <= 500; l += 5) {
    const abs = 1.25 * Math.exp(-Math.pow((l - lMax) / 35, 2));
    points.push({ wavelength: l, absorbance: Math.max(0, abs) });
  }
  return points;
}
