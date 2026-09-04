/**
 * ChemNova Analytical & Synthetic Reagent Library
 * Comprehensive categorized database of organic synthetic reagents, catalysts, solvents, and reaction conditions.
 */

export const REAGENT_CATEGORIES = [
  { id: 'all', label: 'All Reagents & Catalysts' },
  { id: 'acids', label: 'Acids & Lewis Acids' },
  { id: 'bases', label: 'Bases & Scavengers' },
  { id: 'oxidation', label: 'Oxidizing Agents' },
  { id: 'reduction', label: 'Reducing Agents' },
  { id: 'coupling', label: 'Coupling Reagents & Catalysts' },
  { id: 'halogenation', label: 'Halogenation Reagents' },
  { id: 'protection', label: 'Protecting Groups & Deprotection' },
  { id: 'solvents', label: 'Solvents' },
  { id: 'conditions', label: 'Temperature & Conditions' }
];

export const REAGENTS_DATABASE = [
  // Acids & Lewis Acids
  { id: 'h2so4', name: 'Sulfuric Acid', formula: 'H₂SO₄', category: 'acids', type: 'Brønsted Acid Catalyst', pKa: -3.0, typicalUse: 'Fischer esterification, dehydration, nitration' },
  { id: 'hcl', name: 'Hydrochloric Acid', formula: 'HCl', category: 'acids', type: 'Acid Catalyst', pKa: -6.3, typicalUse: 'Acetal hydrolysis, amine salt formation' },
  { id: 'ptsoh', name: 'p-Toluenesulfonic Acid', formula: 'p-TsOH / TsOH', category: 'acids', type: 'Organic Acid Catalyst', pKa: -2.8, typicalUse: 'Acetal protection, esterification' },
  { id: 'tfa', name: 'Trifluoroacetic Acid', formula: 'CF₃COOH (TFA)', category: 'acids', type: 'Strong Organic Acid', pKa: 0.23, typicalUse: 'Boc group deprotection, cleavage from resin' },
  { id: 'alcl3', name: 'Aluminum Chloride', formula: 'AlCl₃', category: 'acids', type: 'Strong Lewis Acid', typicalUse: 'Friedel-Crafts alkylation and acylation' },
  { id: 'bf3_oet2', name: 'Boron Trifluoride Etherate', formula: 'BF₃·OEt₂', category: 'acids', type: 'Lewis Acid', typicalUse: 'Epoxide ring opening, Lewis-acid catalyzed condensations' },
  { id: 'fecl3', name: 'Iron(III) Chloride', formula: 'FeCl₃', category: 'acids', type: 'Lewis Acid', typicalUse: 'Aromatic electrophilic halogenation' },
  { id: 'ticl4', name: 'Titanium Tetrachloride', formula: 'TiCl₄', category: 'acids', type: 'Lewis Acid', typicalUse: 'Mukaiyama aldol, Knoevenagel condensation' },

  // Bases & Scavengers
  { id: 'naoh', name: 'Sodium Hydroxide', formula: 'NaOH', category: 'bases', type: 'Inorganic Base', pKa: 15.7, typicalUse: 'Ester saponification, aldol condensation' },
  { id: 'k2co3', name: 'Potassium Carbonate', formula: 'K₂CO₃', category: 'bases', type: 'Mild Inorganic Base', typicalUse: 'Suzuki coupling, Williamson ether synthesis, alkylation' },
  { id: 'cs2co3', name: 'Cesium Carbonate', formula: 'Cs₂CO₃', category: 'bases', type: 'Inorganic Base (High Solubility)', typicalUse: 'Buchwald-Hartwig amination, macrocyclization' },
  { id: 'et3n', name: 'Triethylamine (TEA)', formula: 'Et₃N / NEt₃', category: 'bases', type: 'Tertiary Amine Base', pKa: 10.75, typicalUse: 'Acid scavenger in acylations, sulfonylations' },
  { id: 'dipea', name: 'Diisopropylethylamine (Hünig\'s Base)', formula: 'iPr₂NEt (DIPEA)', category: 'bases', type: 'Hindered Amine Base', pKa: 11.4, typicalUse: 'Amide coupling, SN2 reactions without N-alkylation' },
  { id: 'pyridine', name: 'Pyridine', formula: 'C₅H₅N', category: 'bases', type: 'Aromatic Amine Base', pKa: 5.25, typicalUse: 'Acylation solvent/scavenger, Swern oxidation' },
  { id: 'dmap', name: '4-Dimethylaminopyridine', formula: 'DMAP', category: 'bases', type: 'Nucleophilic Base Catalyst', typicalUse: 'Steglich esterification accelerator, acyl transfer' },
  { id: 'lda', name: 'Lithium Diisopropylamide', formula: 'LDA', category: 'bases', type: 'Strong Non-Nucleophilic Base', pKa: 36, typicalUse: 'Kinetic enolate generation at -78 °C' },
  { id: 'tbuk', name: 'Potassium tert-Butoxide', formula: 't-BuOK / KOtBu', category: 'bases', type: 'Strong Bulky Base', pKa: 17, typicalUse: 'E2 elimination to Hofmann alkenes, condensation' },

  // Oxidizing Agents
  { id: 'pcc', name: 'Pyridinium Chlorochromate', formula: 'PCC', category: 'oxidation', type: 'Selective Cr(VI) Oxidant', typicalUse: 'Primary alcohol to aldehyde (no over-oxidation to acid)' },
  { id: 'dmp', name: 'Dess-Martin Periodinane', formula: 'DMP', category: 'oxidation', type: 'Hypervalent Iodine Oxidant', typicalUse: 'Mild, neutral oxidation of alcohols to aldehydes/ketones' },
  { id: 'swern', name: 'Swern Reagent System', formula: '(COCl)₂ + DMSO + Et₃N', category: 'oxidation', type: 'Low-Temp Activated DMSO', typicalUse: 'High-yield oxidation of sensitive substrates at -78 °C' },
  { id: 'mcpba', name: 'meta-Chloroperoxybenzoic Acid', formula: 'mCPBA', category: 'oxidation', type: 'Peroxycarboxylic Acid', typicalUse: 'Alkene epoxidation, Baeyer-Villiger ketone oxidation' },
  { id: 'kmno4', name: 'Potassium Permanganate', formula: 'KMnO₄', category: 'oxidation', type: 'Vigorous Oxidant', typicalUse: 'Alkylbenzene side-chain oxidation to benzoic acid, dihydroxylation' },
  { id: 'tempo', name: 'TEMPO + Bleach (NaOCl)', formula: 'TEMPO / NaOCl / KBr', category: 'oxidation', type: 'Nitroxyl Radical Catalytic System', typicalUse: 'Selective catalytic oxidation of primary alcohols to aldehydes' },
  { id: 'o3', name: 'Ozone', formula: 'O₃ (followed by Me₂S or Zn/AcOH)', category: 'oxidation', type: 'Ozonolysis System', typicalUse: 'Cleavage of alkenes into carbonyl fragments' },

  // Reducing Agents
  { id: 'nabh4', name: 'Sodium Borohydride', formula: 'NaBH₄', category: 'reduction', type: 'Mild Hydride Reductant', typicalUse: 'Reduction of aldehydes and ketones to alcohols' },
  { id: 'lialh4', name: 'Lithium Aluminum Hydride (LAH)', formula: 'LiAlH₄', category: 'reduction', type: 'Powerful Hydride Reductant', typicalUse: 'Reduction of esters, carboxylic acids, and amides' },
  { id: 'dibal', name: 'Diisobutylaluminum Hydride', formula: 'DIBAL-H', category: 'reduction', type: 'Sterically Hindered Reductant', typicalUse: 'Selective reduction of esters to aldehydes at -78 °C' },
  { id: 'h2_pd_c', name: 'Hydrogen on Palladium/Carbon', formula: 'H₂ + 10% Pd/C', category: 'reduction', type: 'Heterogeneous Catalytic Hydrogenation', typicalUse: 'Alkene/alkyne saturation, hydrogenolysis of benzyl (Bn) ethers' },
  { id: 'lindlar', name: 'Lindlar\'s Catalyst', formula: 'H₂ + Pd/CaCO₃/Pb(OAc)₂', category: 'reduction', type: 'Poisoned Catalyst', typicalUse: 'Stereoselective reduction of alkynes to cis-(Z)-alkenes' },
  { id: 'zn_hcl', name: 'Clemmensen Reduction', formula: 'Zn(Hg) + conc. HCl', category: 'reduction', type: 'Acidic Carbonyl Deoxygenation', typicalUse: 'Reduction of aryl ketones to alkylarenes (C=O → CH₂)' },

  // Coupling Reagents & Cross-Coupling Catalysts
  { id: 'edc_hobt', name: 'EDC·HCl + HOBt', formula: 'EDC·HCl / HOBt / DIPEA', category: 'coupling', type: 'Water-Soluble Carbodiimide Coupling', typicalUse: 'Peptide and amide bond formation with minimal racemization' },
  { id: 'hatu', name: 'HATU', formula: 'HATU (Uronium-based)', category: 'coupling', type: 'High-Efficiency Peptide Coupling Agent', typicalUse: 'Rapid amide coupling of hindered or unreactive amines' },
  { id: 'dcc', name: 'Dicyclohexylcarbodiimide', formula: 'DCC + DMAP', category: 'coupling', type: 'Steglich Esterification Reagent', typicalUse: 'Esterification of hindered alcohols with carboxylic acids' },
  { id: 'pd_pph3_4', name: 'Tetrakis(triphenylphosphine)palladium(0)', formula: 'Pd(PPh₃)₄', category: 'coupling', type: 'Pd(0) Cross-Coupling Catalyst', typicalUse: 'Suzuki-Miyaura, Stille, Negishi, and Heck couplings' },
  { id: 'pd_dppf_cl2', name: '[1,1\'-Bis(diphenylphosphino)ferrocene]Pd(II)Cl₂', formula: 'Pd(dppf)Cl₂·DCM', category: 'coupling', type: 'Bidentate Pd(II) Catalyst', typicalUse: 'Suzuki cross-coupling of sterically hindered or aryl chlorides' },
  { id: 'cui', name: 'Copper(I) Iodide', formula: 'CuI', category: 'coupling', type: 'Cu(I) Co-Catalyst', typicalUse: 'Sonogashira coupling, Ullmann biaryl ether synthesis, Click chemistry' },

  // Halogenation Reagents
  { id: 'nbs', name: 'N-Bromosuccinimide', formula: 'NBS + AIBN or hν', category: 'halogenation', type: 'Radical Brominating Agent', typicalUse: 'Allylic and benzylic bromination (Wohl-Ziegler reaction)' },
  { id: 'br2', name: 'Bromine', formula: 'Br₂ (in DCM or AcOH)', category: 'halogenation', type: 'Electrophilic Bromine', typicalUse: 'Alkene electrophilic anti-addition, α-bromination of ketones' },
  { id: 'socl2', name: 'Thionyl Chloride', formula: 'SOCl₂', category: 'halogenation', type: 'Acyl / Alkyl Chlorinating Agent', typicalUse: 'Carboxylic acid → Acyl chloride, Alcohol → Alkyl chloride' },
  { id: 'pbr3', name: 'Phosphorus Tribromide', formula: 'PBr₃', category: 'halogenation', type: 'Alcohol Brominating Reagent', typicalUse: 'Inversion conversion of 1° and 2° alcohols to alkyl bromides' },
  { id: 'pocl3', name: 'Phosphorus Oxychloride', formula: 'POCl₃', category: 'halogenation', type: 'Dehydrating / Chlorinating Agent', typicalUse: 'Bischler-Napieralski isoquinoline synthesis, Vilsmeier-Haack formylation' },

  // Protecting Groups & Deprotection
  { id: 'boc2o', name: 'Di-tert-butyl Dicarbonate (Boc₂O)', formula: 'Boc₂O / NaOH or Et₃N', category: 'protection', type: 'Amine Protection (Boc Group)', typicalUse: 'Protects primary and secondary amines as acid-labile tert-butyl carbamates' },
  { id: 'tbscl', name: 'tert-Butyldimethylsilyl Chloride (TBSCl)', formula: 'TBSCl + Imidazole', category: 'protection', type: 'Hydroxyl Protection (Silyl Ether)', typicalUse: 'Selective protection of primary and secondary alcohols' },
  { id: 'tbaf', name: 'Tetrabutylammonium Fluoride (TBAF)', formula: 'TBAF (1.0 M in THF)', category: 'protection', type: 'Fluoride Deprotection Agent', typicalUse: 'Selective mild cleavage of O-silyl ethers (TBS, TBDPS, TMS)' },
  { id: 'bnbr', name: 'Benzyl Bromide', formula: 'BnBr + NaH / K₂CO₃', category: 'protection', type: 'Benzyl Ether Protection', typicalUse: 'Robust ether protection of alcohols resistant to acid/base' },
  { id: 'ac2o', name: 'Acetic Anhydride', formula: 'Ac₂O + Pyridine or DMAP', category: 'protection', type: 'Acetylation Reagent', typicalUse: 'Acetate protection of alcohols, amines (Aspirin, Paracetamol)' },

  // Solvents
  { id: 'dcm', name: 'Dichloromethane (DCM)', formula: 'CH₂Cl₂', category: 'solvents', type: 'Polar Aprotic Solvent', bp: '39.6 °C', typicalUse: 'Standard organic extraction, acylation, Swern oxidation' },
  { id: 'thf', name: 'Tetrahydrofuran (Anhydrous THF)', formula: 'C₄H₈O (THF)', category: 'solvents', type: 'Ether Aprotic Solvent', bp: '66 °C', typicalUse: 'Grignard additions, LAH reductions, organometallics' },
  { id: 'dmf', name: 'N,N-Dimethylformamide', formula: 'HCON(CH₃)₂ (DMF)', category: 'solvents', type: 'Polar Aprotic Solvent', bp: '153 °C', typicalUse: 'SN2 substitutions, cross-couplings, peptide coupling' },
  { id: 'dmso', name: 'Dimethyl Sulfoxide', formula: '(CH₃)₂SO (DMSO)', category: 'solvents', type: 'Polar Aprotic Solvent', bp: '189 °C', typicalUse: 'SN2 substitutions, Swern oxidations, nucleophilic displacements' },
  { id: 'etoh', name: 'Ethanol (Absolute)', formula: 'CH₃CH₂OH (EtOH)', category: 'solvents', type: 'Polar Protic Solvent', bp: '78.4 °C', typicalUse: 'Recrystallizations, NaBH4 reductions, nucleophilic additions' },
  { id: 'etac', name: 'Ethyl Acetate', formula: 'CH₃COOCH₂CH₃ (EtOAc)', category: 'solvents', type: 'Moderately Polar Solvent', bp: '77.1 °C', typicalUse: 'Chromatography mobile phase, organic extractions' },
  { id: 'toluene', name: 'Toluene', formula: 'C₆H₅CH₃', category: 'solvents', type: 'Non-Polar Aromatic Solvent', bp: '110.6 °C', typicalUse: 'High-temperature reflux, Dean-Stark water removal, Diels-Alder' },
  { id: 'me_cn', name: 'Acetonitrile', formula: 'CH₃CN (MeCN)', category: 'solvents', type: 'Polar Aprotic Solvent', bp: '82 °C', typicalUse: 'HPLC mobile phase, alkylations, Lewis acid reactions' },

  // Standard Laboratory Conditions & Temperatures
  { id: 'cond_ice', name: '0 °C (Ice-Water Bath)', formula: '0 °C', category: 'conditions', type: 'Low-Temperature Exotherm Control', typicalUse: 'Controlling vigorous additions (e.g. LAH, acyl chlorides, nitrations)' },
  { id: 'cond_rt', name: '25 °C (Room Temperature)', formula: '25 °C (Ambient)', category: 'conditions', type: 'Standard Lab Condition', typicalUse: 'Mild stirring, spontaneous couplings, hydrogenation' },
  { id: 'cond_reflux', name: 'Reflux (Boiling Point of Solvent)', formula: 'Reflux (Δ)', category: 'conditions', type: 'Thermal Heating', typicalUse: 'Overcoming activation energy barriers (esterification, cross-coupling)' },
  { id: 'cond_dry_ice', name: '-78 °C (Dry Ice / Acetone Bath)', formula: '-78 °C', category: 'conditions', type: 'Cryogenic Reaction Condition', typicalUse: 'Lithiation, LDA kinetic deprotonation, DIBAL-H selective reductions' },
  { id: 'cond_inert', name: 'Inert Atmosphere (N₂ / Argon Gas)', formula: 'N₂ / Ar purge', category: 'conditions', type: 'Air & Moisture Exclusion', typicalUse: 'Organolithium, Grignard, Pd(0) cross-couplings' }
];
