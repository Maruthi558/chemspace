/**
 * Comprehensive Analytical Chromatography Curriculum & Lesson Archive
 * Covers principles, instrumentation, mobile/stationary phases, mechanisms,
 * standard procedures, calculations, troubleshooting, and applications.
 */

export const CHROMATOGRAPHY_TECHNIQUES = [
  {
    id: 'paper',
    name: 'Paper Chromatography',
    shortCode: 'Paper',
    badge: 'Planar',
    category: 'Planar Chromatography',
    formula: 'Rf = d_solute / d_solvent',
    description: 'Separation of soluble chemical mixtures on cellulose filter paper via differential capillary migration and liquid-liquid partition.',
    principle: 'Cellulose fibers contain tightly bound water molecules acting as the stationary phase. A mobile solvent moves upward (ascending) or downward (descending) via capillary action. Solutes partition between the stationary water layer and the organic mobile phase based on polarity and solubility.',
    stationaryPhase: 'Cellulose filter paper (Whatman No. 1 or 3MM) with adsorbed water molecules (liquid-liquid partition).',
    mobilePhase: 'Organic solvents (e.g., n-butanol : acetic acid : water 4:1:5, isopropanol-ammonia-water, or ethanol-water).',
    mechanism: 'Liquid-Liquid Partition with minor adsorption on cellulose hydroxyl groups.',
    instrumentation: 'Chromatography developing chamber, airtight lid, solvent reservoir, baseline pencil marker, capillary spotters, drying oven, visualization reagent (e.g., Ninhydrin for amino acids).',
    standardProcedure: [
      'Draw a light pencil baseline 1.5–2.0 cm from the bottom edge of the chromatography paper (never use ink).',
      'Apply micro-spots of sample and reference standards using a glass capillary tube; allow spots to dry completely.',
      'Pour mobile phase solvent into the chromatography chamber to a depth of 0.5–1.0 cm (below the baseline) and cover to equilibrate vapor.',
      'Place paper vertically into the chamber without touching the walls; close the lid.',
      'Allow solvent to ascend until the solvent front reaches 1–2 cm from the top edge.',
      'Remove paper immediately, mark the solvent front with a pencil, and dry.',
      'Visualize spots under UV light or spray with a chemical visualizer (Ninhydrin, Iodine).'
    ],
    calculations: [
      { name: 'Retention Factor (Rf)', formula: 'R_f = \\frac{d_{\\text{solute}}}{d_{\\text{solvent front}}}', note: 'Always 0.0 ≤ Rf ≤ 1.0. Constant for a given substance, temperature, and solvent system.' }
    ],
    troubleshooting: [
      { issue: 'Tailing or streaked spots', cause: 'Sample overloaded, or solvent pH inappropriate causing ionic ionization equilibria.', fix: 'Dilute the sample 10-fold or add trace acid/base (e.g., 1% acetic acid or ammonia) to buffer the solvent.' },
      { issue: 'Solvent front ascends unevenly / wavy line', cause: 'Chamber was moved or paper touched the side of the developing tank.', fix: 'Keep chamber sealed and stable on a level surface without agitation.' },
      { issue: 'Spots remain on baseline (Rf ≈ 0)', cause: 'Mobile phase too non-polar to elute strongly polar solutes.', fix: 'Increase polarity of mobile phase (increase water or alcohol proportion).' }
    ],
    applications: ['Separation of amino acids, carbohydrates, plant chlorophyll pigments, and food dye quality testing.'],
    safety: 'Work in a fume hood when developing with volatile organic solvents (butanol, pyridine, ammonia). Avoid inhaling aerosolized ninhydrin spray.'
  },
  {
    id: 'tlc',
    name: 'Thin-Layer Chromatography (TLC)',
    shortCode: 'TLC',
    badge: 'Planar / Fast',
    category: 'Planar Chromatography',
    formula: 'Rf = d_spot / d_front',
    description: 'Rapid, micro-scale planar chromatographic method using a thin adsorbent layer on glass, aluminum, or plastic support.',
    principle: 'Analytes partition between a solid stationary phase (polar silica gel SiO₂ or alumina Al₂O₃) and a liquid mobile phase moving by capillary action. Polar compounds bind strongly to silanol (Si-OH) groups and travel slowly (low Rf), while non-polar compounds elute rapidly with the solvent (high Rf).',
    stationaryPhase: 'Silica Gel 60 F₂₅₄ (acidic/polar, with fluorescent indicator at 254 nm) or Aluminum Oxide (basic/neutral).',
    mobilePhase: 'Binary or tertiary solvent mixtures (e.g., Hexane : Ethyl Acetate, Dichloromethane : Methanol, Pet Ether : Ether).',
    mechanism: 'Solid-Liquid Adsorption & surface hydrogen bonding.',
    instrumentation: 'TLC glass plates / aluminum sheets, developing jar with filter paper saturation wick, capillary micropipettes, UV lamp (254 nm & 365 nm), iodine chamber, staining dips (KMnO₄, Vanillin, Phosphomolybdic acid / PMA, CAM).',
    standardProcedure: [
      'Mark origin line 1.0 cm from plate bottom with soft pencil without gouging adsorbent layer.',
      'Spot 1–2 µL of sample solution (1–5 mg/mL) and co-spots for reaction monitoring.',
      'Saturate TLC developing jar with mobile phase using a filter paper liner for 10 minutes.',
      'Place plate inside at ~75° angle and seal jar tightly.',
      'Allow mobile phase to travel to ~0.5–1.0 cm below top edge.',
      'Remove plate, mark solvent front immediately with pencil, and dry.',
      'Visualize under UV light (254 nm quenching or 365 nm fluorescence) or dip into staining reagent and heat on hot plate.'
    ],
    calculations: [
      { name: 'Rf Value', formula: 'R_f = \\frac{\\text{Distance from origin to center of spot}}{\\text{Distance from origin to solvent front}}', note: 'Optimal Rf for organic synthetic reaction monitoring is 0.20 to 0.40.' },
      { name: 'Column Scaling Factor (ΔRf)', formula: '\\Delta R_f = R_{f,2} - R_{f,1}', note: 'A ΔRf ≥ 0.2 is required for effective flash column chromatography.' }
    ],
    troubleshooting: [
      { issue: 'Spots overlapping or merging across lanes', cause: 'Spots placed too close together or sample concentration too high.', fix: 'Space spots at least 0.5 cm apart and apply smaller volume (0.5 µL).' },
      { issue: 'Spot dragging / tailing of carboxylic acids or amines', cause: 'Strong specific binding to acidic silanol groups.', fix: 'Add 1% acetic acid (for carboxylic acids) or 1% triethylamine (for basic amines) to the eluent.' }
    ],
    applications: ['Monitoring reaction progress, purity checks of synthetic compounds, solvent optimization for flash column chromatography.'],
    safety: 'Use TLC staining solutions containing sulfuric acid or heavy metals under a fume hood; wear thermal gloves when heating plates.'
  },
  {
    id: 'gc',
    name: 'Gas Chromatography (GC)',
    shortCode: 'GC',
    badge: 'Instrumental',
    category: 'Column Chromatography',
    formula: "tR, k', N, Rs, Area %",
    description: 'High-resolution separation of volatile and semi-volatile thermally stable organic compounds in the gas phase.',
    principle: 'Vaporized sample is carried by an inert gas (carrier gas) through a narrow capillary column coated with a microscopic liquid stationary phase. Compounds separate based on boiling points (vapor pressures) and relative polarities with the liquid phase film inside the column.',
    stationaryPhase: 'Crosslinked polysiloxanes (e.g., 100% dimethylpolysiloxane DB-1, 5% phenyl DB-5) or polyethylene glycol (Carbowax / DB-Wax).',
    mobilePhase: 'High-purity inert carrier gas (Helium 99.999%, Nitrogen, or Hydrogen) at regulated flow rates (1–3 mL/min).',
    mechanism: 'Gas-Liquid Partition (GLC) / Gas-Solid Adsorption (GSC).',
    instrumentation: 'Split/splitless heated injector (200–300 °C), capillary fused-silica column (15–60 m, 0.25 mm ID), programmable oven (40–350 °C), Flame Ionization Detector (FID) / Mass Spectrometer (GC-MS) / Thermal Conductivity Detector (TCD).',
    standardProcedure: [
      'Set carrier gas flow rate (e.g., He at 1.2 mL/min constant flow).',
      'Program oven temperature ramp (e.g., initial 50 °C hold 2 min, ramp 10 °C/min to 280 °C, hold 5 min).',
      'Set injector temperature to ~250 °C with split ratio (e.g., 20:1) or splitless mode for trace analysis.',
      'Ignite FID detector flame with H₂ and Air (300 °C).',
      'Inject 1.0 µL of filtered sample dissolved in volatile solvent (DCM, hexane, methanol).',
      'Acquire chromatogram signal, integrate peak areas, and measure retention times.'
    ],
    calculations: [
      { name: 'Adjusted Retention Time', formula: "t'_R = t_R - t_0", note: 't0 is the retention time of unretained gas (e.g., methane or air peak).' },
      { name: 'Area % Composition', formula: '\\%\\,\\text{Area}_i = \\frac{A_i \\cdot f_i}{\\sum A_j \\cdot f_j} \\times 100\\%', note: 'f_i is the FID relative response factor for analyte i.' },
      { name: 'Theoretical Plates', formula: 'N = 16 \\left(\\frac{t_R}{W}\\right)^2 = 5.545 \\left(\\frac{t_R}{W_{0.5}}\\right)^2', note: 'Capillary columns typically provide 50,000 to 200,000 plates.' }
    ],
    troubleshooting: [
      { issue: 'Ghost peaks or baseline drift at high temperature', cause: 'Column bleed from thermal degradation or injector septum bleed.', fix: 'Condition column below maximum temperature limit; replace GC septum.' },
      { issue: 'Split or asymmetric doublet peaks', cause: 'Slow injection technique, poor sample vaporization, or damaged column inlet.', fix: 'Trim 10 cm off column inlet; use fast autosampler injection.' }
    ],
    applications: ['Petrochemical hydrocarbon analysis, forensic drug screening, environmental pesticide analysis, volatile essential oils and aroma profiling.'],
    safety: 'Hydrogen carrier/detector gas is flammable — verify leak-free connections. Injector and FID reach dangerous temperatures (>300 °C).'
  },
  {
    id: 'hplc',
    name: 'High-Performance Liquid Chromatography (HPLC / UHPLC)',
    shortCode: 'HPLC',
    badge: 'Instrumental / Gold Standard',
    category: 'Liquid Chromatography',
    formula: "k', α, Rs, N, HETP, Cx",
    description: 'High-pressure liquid chromatographic technique for quantitative separation, identification, and purification of non-volatile and thermolabile analytes.',
    principle: 'Liquid mobile phase is pumped under high pressure (50 to 1000 bar) through a stainless-steel column packed with sub-micron silica particles coated with bonded functional groups (e.g., octadecylsilyl C18). Analytes separate based on hydrophobic, polar, ionic, or size interactions.',
    stationaryPhase: 'Reversed-Phase C18 (Octadecylsilane), C8, Phenyl-Hexyl, HILIC (Zwitterionic), or Normal Phase silica (sub-2 to 5 µm particles).',
    mobilePhase: 'Degassed solvents: Water / Buffer (Aqueous phase A) + Acetonitrile or Methanol (Organic phase B) under Isocratic or Gradient mode.',
    mechanism: 'Hydrophobic interaction / Partitioning (RP-HPLC), Polar adsorption (NP), Hydrogen bonding (HILIC).',
    instrumentation: 'Quaternary/Binary high-pressure pump (0.1–5 mL/min), autosampler with peltier cooler, column compartment oven (20–60 °C), Photodiode Array (PDA/DAD) UV-Vis detector, Fluorescence detector (FLD), Refractive Index (RID), or Triple Quadrupole Mass Spectrometer (LC-MS/MS).',
    standardProcedure: [
      'Prepare and degas mobile phases through 0.22 µm nylon/PTFE membrane filters; sonicate 15 min.',
      'Equilibrate C18 column with starting gradient (e.g., 90% A / 10% B at 1.0 mL/min for 20 column volumes).',
      'Set column temperature (e.g., 35 °C) and detector wavelength (e.g., 254 nm or λmax).',
      'Inject standard calibration solutions and unknown samples (typically 5–20 µL).',
      'Run chromatographic gradient method (e.g., 10% B to 90% B over 15 min).',
      'Perform baseline integration, calculate retention times, peak areas, symmetry factors, and quantify unknown sample concentration from standard curve.'
    ],
    calculations: [
      { name: 'Retention Factor (k\')', formula: "k' = \\frac{t_R - t_0}{t_0}", note: 'Target 1.0 ≤ k\' ≤ 10.0 for optimal separation.' },
      { name: 'Resolution (Rs)', formula: 'R_s = \\frac{2(t_{R2} - t_{R1})}{W_1 + W_2}', note: 'Rs ≥ 1.5 indicates baseline separation compliant with USP/ICH.' },
      { name: 'Selectivity Factor (α)', formula: '\\alpha = \\frac{k_2\'}{k_1\'}', note: 'Measures chemical separation capability independent of column dimensions.' },
      { name: 'Height Equivalent to Theoretical Plate (H)', formula: 'H = \\frac{L}{N}', note: 'Lower H corresponds to higher efficiency (H ≈ 2 × particle diameter d_p).' }
    ],
    troubleshooting: [
      { issue: 'High system backpressure exceeding pressure limit', cause: 'Clogged column inlet frit, precipitated buffer salts, or particulate in sample.', fix: 'Filter all samples with 0.2 µm syringe filters; flush column with 90:10 water:methanol to dissolve salts, or reverse-flush column.' },
      { issue: 'Peak split or fronting (asymmetry < 0.9)', cause: 'Column overloaded or sample dissolved in stronger solvent than mobile phase.', fix: 'Dissolve sample in starting mobile phase (or weaker solvent) and reduce injection volume.' }
    ],
    applications: ['Pharmaceutical drug assay and impurity profiling, clinical bioanalysis, food safety and pesticide residue screening, environmental water analysis.'],
    safety: 'Acetonitrile and methanol vapors are toxic; store waste in closed containers with vapor traps. Release pressure before opening column connections.'
  },
  {
    id: 'column',
    name: 'Column Chromatography (Flash / Preparative)',
    shortCode: 'Column',
    badge: 'Preparative',
    category: 'Preparative Chromatography',
    formula: 'Yield %, Recovery %, Fraction Rf',
    description: 'Preparative liquid chromatography for isolating and purifying gram-scale reaction mixtures using silica or alumina beds.',
    principle: 'A vertical glass column is packed with an adsorbent stationary phase. Sample is loaded on top and mobile solvent is percolated through the column by gravity or air pressure (flash chromatography). Components travel at different velocities based on adsorption affinities and are collected in separate fractions.',
    stationaryPhase: 'Silica Gel 60 (40–63 µm for flash, 63–200 µm for gravity) or Neutral / Basic Alumina (ratio: 30:1 to 50:1 silica:sample mass).',
    mobilePhase: 'Step-gradient eluent system (e.g., 100% Hexane → 5% EtOAc/Hex → 10% → 20% → 50% EtOAc).',
    mechanism: 'Adsorption-Desorption equilibrium across high-surface-area silica gel.',
    instrumentation: 'Glass column with fritted disc and PTFE stopcock, air pump / bellows for flash pressure, fraction test tube rack, TLC kit for fraction monitoring, rotary evaporator.',
    standardProcedure: [
      'Choose column diameter based on sample size (e.g., 25 mm ID for 0.5–1.0 g crude product).',
      'Slurry-pack silica gel with starting non-polar solvent (e.g., hexane) and tap gently to eliminate air bubbles and voids.',
      'Drain solvent level to the exact top of the silica bed.',
      'Load concentrated sample dissolved in minimal solvent or adsorbed onto silica as a dry plug.',
      'Apply air pressure (1–2 bar) to maintain steady flow rate (~2 inches/min meniscus drop).',
      'Collect fractions in numbered test tubes (e.g., 15–20 mL per tube).',
      'Analyze fractions by TLC; combine pure fractions and concentrate on rotary evaporator.'
    ],
    calculations: [
      { name: 'Recovery Percentage', formula: '\\%\\,\\text{Recovery} = \\frac{\\sum \\text{Mass of isolated pure fractions (mg)}}{\\text{Mass of crude loaded (mg)}} \\times 100\\%', note: 'Quantifies yield and mass balance of the isolation.' },
      { name: 'Column Volume (CV)', formula: 'V_{\\text{column}} = \\pi \\cdot r^2 \\cdot h \\cdot \\epsilon', note: 'ε is the column bed porosity (~0.7 for silica gel).' }
    ],
    troubleshooting: [
      { issue: 'Channels or cracks forming in the silica bed', cause: 'Column ran dry (solvent drained below silica top) or air bubbles trapped during packing.', fix: 'Never let solvent level drop below the silica top; repack column if major channels appear.' },
      { issue: 'Two components co-eluting in identical fractions', cause: 'Solvent polarity increased too rapidly or column overloaded.', fix: 'Use a shallower gradient (e.g., 2% polarity step increases) and wider column.' }
    ],
    applications: ['Purification of synthetic organic intermediates, isolation of natural products from plant extracts, isomer separation.'],
    safety: 'Silica dust is a severe respiratory hazard (silicosis) — always handle dry silica gel inside a certified fume hood. Flash pressure must not exceed 2.5 bar.'
  },
  {
    id: 'ion_exchange',
    name: 'Ion-Exchange Chromatography (IEX)',
    shortCode: 'IEX',
    badge: 'Biomolecules',
    category: 'Liquid Chromatography',
    formula: 'pI, pH, Salt Gradient',
    description: 'Separation of charged biomolecules (proteins, nucleic acids, peptides, amino acids) based on net surface electrical charge.',
    principle: 'Molecules bind reversibly to an oppositely charged resin matrix. Bound analytes are eluted by increasing ionic strength (NaCl/KCl gradient) or altering buffer pH to neutralize the net molecular charge.',
    stationaryPhase: 'Cation Exchangers (negatively charged matrix: SP-Sepharose, CM-Cellulose) or Anion Exchangers (positively charged matrix: Q-Sepharose, DEAE-Cellulose).',
    mobilePhase: 'Starting low-salt binding buffer (e.g., 20 mM Tris-HCl pH 7.5) and high-salt elution buffer (e.g., 20 mM Tris-HCl + 1.0 M NaCl pH 7.5).',
    mechanism: 'Reversible electrostatic ionic exchange of counterions.',
    instrumentation: 'FPLC / HPLC chromatography system with UV (280 nm), conductivity meter, gradient mixer, fraction collector, pH monitor.',
    standardProcedure: [
      'Determine analyte isoelectric point (pI). Set buffer pH > pI for Anion Exchange (net negative protein), or pH < pI for Cation Exchange (net positive protein).',
      'Equilibrate IEX column with 5 column volumes of low-salt binding buffer.',
      'Load filtered protein sample at low ionic strength (conductivity < 5 mS/cm).',
      'Wash unbound neutral/oppositely-charged contaminants with binding buffer.',
      'Apply linear salt gradient (0 to 1.0 M NaCl over 20 CV) to elute proteins in order of increasing charge density.',
      'Monitor UV 280 nm and conductivity (mS/cm); collect elution peaks in fractions.'
    ],
    calculations: [
      { name: 'Net Charge Rule', formula: '\\text{Net Charge} = \\begin{cases} + \\text{ (Cation Binding)}, & \\text{if } \\text{pH} < \\text{pI} - 1 \\\\ - \\text{ (Anion Binding)}, & \\text{if } \\text{pH} > \\text{pI} + 1 \\end{cases}', note: 'Maintain buffer pH at least 1.0 unit away from analyte pI for robust binding.' }
    ],
    troubleshooting: [
      { issue: 'Target protein fails to bind and elutes in flow-through', cause: 'Conductivity too high (excessive salt in sample) or buffer pH too close to protein pI.', fix: 'Desalt sample via dialysis or spin filter; adjust buffer pH further from pI.' }
    ],
    applications: ['Therapeutic antibody and recombinant protein purification, amino acid separation, water deionization, nucleotide analysis.'],
    safety: 'Maintain biocontainment when processing biological samples; filter all buffers through 0.22 µm to prevent bacterial growth.'
  },
  {
    id: 'sec',
    name: 'Size-Exclusion Chromatography (SEC / Gel Filtration)',
    shortCode: 'SEC',
    badge: 'Hydrodynamic Size',
    category: 'Liquid Chromatography',
    formula: 'K_SEC = (Ve - V0) / (Vt - V0)',
    description: 'Non-adsorptive separation of macromolecules based exclusively on their hydrodynamic size and molecular volume.',
    principle: 'Porous spherical polymer gel beads with controlled pore sizes fill the column. Large molecules cannot enter pores and elute first in the void volume (V₀). Smaller molecules diffuse into pores, travel a longer path length, and elute later in order of decreasing size.',
    stationaryPhase: 'Porous cross-linked dextran (Sephadex), polyacrylamide (Bio-Gel P), or cross-linked agarose (Superdex 75 / 200).',
    mobilePhase: 'Aqueous buffer containing 50–150 mM NaCl (to prevent secondary ionic adsorption on matrix) at physiological pH (e.g., PBS pH 7.4).',
    mechanism: 'Steric exclusion from porous gel network (no chemical binding).',
    instrumentation: 'FPLC / HPLC liquid chromatograph, high-precision peristaltic or piston pump, UV detector (280 nm / 214 nm), refractive index detector (RID), multi-angle light scattering (MALS).',
    standardProcedure: [
      'Calibrate column using standard molecular weight calibration kit (Blue Dextran for V₀, Vitamin B12 or acetone for V_t, and globular protein standards).',
      'Equilibrate SEC column with 2 column volumes of buffer.',
      'Inject sample with volume strictly limited to 1–3% of total column volume (V_t) for sharp resolution.',
      'Elute isocratically at constant low flow rate (e.g., 0.5 mL/min); no gradient is used.',
      'Collect fractions and determine retention volume (V_e) of target peaks.'
    ],
    calculations: [
      { name: 'Distribution Coefficient (K_SEC)', formula: 'K_{\\text{SEC}} = \\frac{V_e - V_0}{V_t - V_0}', note: 'K_SEC = 0 (completely excluded); K_SEC = 1.0 (fully permeating small molecule).' },
      { name: 'Molecular Weight Calibration', formula: '\\log(MW) = -m \\cdot \\left(\\frac{V_e}{V_0}\\right) + b', note: 'Linear correlation between log MW and relative elution volume Ve/V0.' }
    ],
    troubleshooting: [
      { issue: 'Broad, overlapping peaks with low resolution', cause: 'Sample injection volume was too large (> 5% of Vt) or flow rate too high.', fix: 'Reduce sample loading volume to < 2% of total column volume and lower flow rate.' }
    ],
    applications: ['Protein oligomerization / aggregation state determination, polymer molecular weight distribution (GPC), desalting and buffer exchange.'],
    safety: 'Prevent SEC columns from drying or experiencing sudden pressure shocks which irreversibly collapse the gel bed.'
  },
  {
    id: 'affinity',
    name: 'Affinity Chromatography',
    shortCode: 'Affinity',
    badge: 'High Specificity',
    category: 'Liquid Chromatography',
    formula: 'Yield %, Purity %, Specific Activity',
    description: 'Ultra-selective purification based on specific, biological molecular recognition interactions between analyte and immobilized ligand.',
    principle: 'A specific bio-ligand is covalently attached to an insoluble agarose or polymeric matrix. Only the target analyte binds specifically with high affinity ($K_d \\approx 10^{-6}$ to $10^{-9}$ M), while non-target contaminants wash through unretained. The bound target is eluted with a competitive ligand or altered pH/ionic conditions.',
    stationaryPhase: 'Agarose/Sepharose beads coupled with functional ligands: Ni²⁺/Co²⁺-NTA (for His-tagged proteins), Protein A/G (for IgG antibodies), Glutathione (for GST-fusion tags), Streptavidin (for biotinylated targets).',
    mobilePhase: 'Binding Buffer (e.g., 50 mM NaH₂PO₄, 300 mM NaCl, 20 mM Imidazole pH 8.0) and Elution Buffer (same buffer + 250–500 mM Imidazole).',
    mechanism: 'Reversible Lock-and-Key bio-molecular recognition (coordination, antigen-antibody, enzyme-substrate).',
    instrumentation: 'Gravity-flow cartridges, spin columns, or automated FPLC chromatography systems with UV 280 nm and fraction collector.',
    standardProcedure: [
      'Equilibrate affinity matrix with 5–10 column volumes of binding buffer.',
      'Clarify and filter biological cell lysate (0.45 µm) to remove particulates; load sample onto column.',
      'Wash with 10–20 column volumes of wash buffer (containing low competitor concentration, e.g., 20 mM imidazole) to eliminate non-specifically bound proteins.',
      'Elute target protein using step or gradient elution of competitive ligand (e.g., 250 mM imidazole or 0.1 M glycine-HCl pH 2.8).',
      'Collect eluate fractions into tubes (containing neutralizing buffer if using acidic elution).',
      'Regenerate and store affinity column in 20% ethanol at 4 °C.'
    ],
    calculations: [
      { name: 'Specific Activity', formula: '\\text{Specific Activity} = \\frac{\\text{Total Enzyme Activity (Units)}}{\\text{Total Protein Mass (mg)}}', note: 'Increases progressively with purification factor.' },
      { name: 'Purification Factor', formula: '\\text{Purification Fold} = \\frac{\\text{Specific Activity (Eluate)}}{\\text{Specific Activity (Crude)}}', note: 'Single-step affinity purification often achieves > 95% purity and > 50-fold purification.' }
    ],
    troubleshooting: [
      { issue: 'His-tagged protein does not bind Ni-NTA resin', cause: 'His-tag is buried in protein tertiary structure, or EDTA/chelators were present in lysate stripping nickel ions.', fix: 'Add 6 M urea / 4 M guanidine for denaturing purification, or verify buffer is free of EDTA/DTT.' }
    ],
    applications: ['Purification of recombinant fusion proteins (His-tag, GST, MBP), monoclonal antibody downstream processing, enzyme isolation.'],
    safety: 'Nickel and cobalt salts are skin sensitizers. Handle resins and concentrated eluates with gloves.'
  }
];
