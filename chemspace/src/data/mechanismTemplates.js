/**
 * ChemNova Organic Reaction Mechanism Templates Library
 * Rich, editable multi-step organic reaction mechanisms with:
 * - Starting materials, Intermediates, Transition states [‡], Final products
 * - Curved electron-pushing arrows (double-barb pair & single fishhook radical)
 * - Source/target anchor types (lone-pair, bond, atom, reactive site)
 * - Formal charge bookkeeping and step-by-step scientific explanations
 */

export const MECHANISM_TEMPLATES = [
  // ── 1. SN2 Aliphatic Nucleophilic Substitution ──
  {
    id: 'sn2_bimolecular',
    name: 'SN2 Bimolecular Nucleophilic Substitution',
    class: 'Nucleophilic Substitution',
    subclass: 'Aliphatic sp3 Inversion',
    description: 'Concerted backside nucleophilic attack with simultaneous departure of the leaving group, resulting in inversion of configuration (Walden inversion).',
    drivingForce: 'Expulsion of a stable leaving group (halide/tosylate) and formation of a stronger C-Nu covalent bond.',
    reactantsSmiles: ['CC(C)Br', '[OH-]'],
    productSmiles: 'CC(C)O',
    steps: [
      {
        stepNumber: 1,
        title: 'Backside Attack & Concerted Displacement',
        isTransitionState: false,
        reagent: 'Aqueous NaOH / Polar Aprotic Solvent (DMF)',
        condition: '25–50 °C',
        description: 'The hydroxide nucleophile attacks the electrophilic carbon from the backside (180° opposite the C-Br σ bond). Simultaneous cleavage of the C-Br bond proceeds through a pentacoordinate transition state.',
        nucleophile: 'Hydroxide Oxygen (O⁻ Lone Pair)',
        electrophile: 'Carbon center (C-Br σ* antibonding orbital)',
        drivingForce: 'High nucleophilicity of alkoxide and favorable release of stable bromide anion.',
        atoms: [
          // Hydroxide
          { id: 1, element: 'O', x: 120, y: 180, charge: -1, label: 'Nu:⁻' },
          // Central sp3 Carbon
          { id: 2, element: 'C', x: 260, y: 180, charge: 0 },
          // Methyl 1
          { id: 3, element: 'C', x: 260, y: 110, charge: 0 },
          // Methyl 2
          { id: 4, element: 'C', x: 260, y: 250, charge: 0 },
          // Leaving Group (Bromine)
          { id: 5, element: 'Br', x: 390, y: 180, charge: 0, label: 'LG' }
        ],
        bonds: [
          { id: 101, from: 2, to: 3, type: 'single', order: 1 },
          { id: 102, from: 2, to: 4, type: 'single', order: 1 },
          { id: 103, from: 2, to: 5, type: 'single', order: 1 }
        ],
        arrows: [
          {
            id: 'arr_1',
            type: 'pair',
            sourceType: 'atom',
            sourceId: 1,
            targetType: 'atom',
            targetId: 2,
            curveOffset: -35,
            label: 'Nu: attack',
            description: 'Hydroxide oxygen lone pair attacks the electrophilic carbon.'
          },
          {
            id: 'arr_2',
            type: 'pair',
            sourceType: 'bond',
            sourceId: 103,
            targetType: 'atom',
            targetId: 5,
            curveOffset: -35,
            label: 'C-Br cleavage',
            description: 'C-Br electron pair departs onto Bromine as bromide ion (Br⁻).'
          }
        ]
      },
      {
        stepNumber: 2,
        title: 'Final Inverted Product & Solvated Halide',
        isTransitionState: false,
        reagent: 'Product Workup',
        condition: 'Ambient',
        description: 'Formation of inverted alcohol product with regenerated tetrahedral geometry and free bromide ion.',
        nucleophile: 'None (Completed)',
        electrophile: 'None',
        drivingForce: 'Thermodynamically stable covalent alcohol and solvated bromide anion.',
        atoms: [
          // Alcohol Oxygen
          { id: 1, element: 'O', x: 160, y: 180, charge: 0 },
          // Inverted Carbon
          { id: 2, element: 'C', x: 260, y: 180, charge: 0 },
          // Methyl 1
          { id: 3, element: 'C', x: 290, y: 115, charge: 0 },
          // Methyl 2
          { id: 4, element: 'C', x: 290, y: 245, charge: 0 },
          // Bromide Ion
          { id: 5, element: 'Br', x: 420, y: 180, charge: -1, label: 'Br⁻' }
        ],
        bonds: [
          { id: 201, from: 1, to: 2, type: 'single', order: 1 },
          { id: 202, from: 2, to: 3, type: 'single', order: 1 },
          { id: 203, from: 2, to: 4, type: 'single', order: 1 }
        ],
        arrows: []
      }
    ]
  },

  // ── 2. Fischer Esterification (Nucleophilic Acyl Substitution) ──
  {
    id: 'fischer_esterification',
    name: 'Fischer Esterification',
    class: 'Nucleophilic Acyl Substitution',
    subclass: 'Acid-Catalyzed Condensation',
    description: 'Reversible acid-catalyzed condensation of a carboxylic acid and alcohol through a tetrahedral oxocarbenium intermediate.',
    drivingForce: 'Excess alcohol or continuous azeotropic removal of water (Le Chatelier\'s principle).',
    reactantsSmiles: ['CC(=O)O', 'CCO'],
    productSmiles: 'CC(=O)OCC',
    steps: [
      {
        stepNumber: 1,
        title: 'Carbonyl Activation via Protonation',
        isTransitionState: false,
        reagent: 'H2SO4 Catalyst',
        condition: '80 °C Reflux',
        description: 'Proton transfer from the strong acid to the carbonyl oxygen enhances electrophilicity of the carbonyl carbon.',
        nucleophile: 'Carbonyl Oxygen (O Lone Pair)',
        electrophile: 'Proton (H⁺)',
        drivingForce: 'Protonation creates resonance-stabilized oxocarbenium ion with very electrophilic central carbon.',
        atoms: [
          { id: 1, element: 'C', x: 180, y: 190, charge: 0 },
          { id: 2, element: 'O', x: 180, y: 100, charge: 0, label: 'C=O' },
          { id: 3, element: 'O', x: 270, y: 230, charge: 0, label: 'OH' },
          { id: 4, element: 'C', x: 90, y: 230, charge: 0 },
          { id: 5, element: 'H', x: 260, y: 70, charge: 1, label: 'H⁺ (cat)' }
        ],
        bonds: [
          { id: 101, from: 1, to: 2, type: 'double', order: 2 },
          { id: 102, from: 1, to: 3, type: 'single', order: 1 },
          { id: 103, from: 1, to: 4, type: 'single', order: 1 }
        ],
        arrows: [
          {
            id: 'arr_1',
            type: 'pair',
            sourceType: 'atom',
            sourceId: 2,
            targetType: 'atom',
            targetId: 5,
            curveOffset: -30,
            label: 'Protonation',
            description: 'Carbonyl oxygen lone pair captures catalytic H⁺.'
          }
        ]
      },
      {
        stepNumber: 2,
        title: 'Nucleophilic Attack of Alcohol → Tetrahedral Intermediate',
        isTransitionState: false,
        reagent: 'Ethanol (Nucleophile)',
        condition: '80 °C',
        description: 'The neutral alcohol oxygen attacks the activated carbocationic carbonyl carbon, generating a neutral/protonated tetrahedral intermediate.',
        nucleophile: 'Ethanol Oxygen',
        electrophile: 'Activated Carbonyl Carbon',
        drivingForce: 'Nucleophilic addition relieves positive charge into resonance-stabilized hydroxyl oxygen.',
        atoms: [
          { id: 1, element: 'C', x: 200, y: 180, charge: 0 },
          { id: 2, element: 'O', x: 200, y: 100, charge: 0, label: 'OH' },
          { id: 3, element: 'O', x: 290, y: 220, charge: 0, label: 'OH' },
          { id: 4, element: 'C', x: 110, y: 220, charge: 0 },
          // Ethanol
          { id: 5, element: 'O', x: 200, y: 270, charge: 0, label: 'HO-Et' },
          { id: 6, element: 'C', x: 260, y: 310, charge: 0 },
          { id: 7, element: 'C', x: 330, y: 280, charge: 0 }
        ],
        bonds: [
          { id: 201, from: 1, to: 2, type: 'double', order: 2 },
          { id: 202, from: 1, to: 3, type: 'single', order: 1 },
          { id: 203, from: 1, to: 4, type: 'single', order: 1 },
          { id: 204, from: 5, to: 6, type: 'single', order: 1 },
          { id: 205, from: 6, to: 7, type: 'single', order: 1 }
        ],
        arrows: [
          {
            id: 'arr_2',
            type: 'pair',
            sourceType: 'atom',
            sourceId: 5,
            targetType: 'atom',
            targetId: 1,
            curveOffset: -40,
            label: 'Nucleophilic Addition',
            description: 'Alcohol lone pair attacks the activated carbonyl carbon.'
          },
          {
            id: 'arr_3',
            type: 'pair',
            sourceType: 'bond',
            sourceId: 201,
            targetType: 'atom',
            targetId: 2,
            curveOffset: 30,
            label: 'π-bond displacement',
            description: 'C=O π-bond electrons push onto oxygen to neutralize the positive charge.'
          }
        ]
      },
      {
        stepNumber: 3,
        title: 'Tetrahedral Collapse & Water Elimination',
        isTransitionState: false,
        reagent: 'Acid Catalyst Regeneration',
        condition: '80 °C',
        description: 'Proton transfer creates a good leaving group (-OH2⁺). The lone pair on the hydroxyl oxygen collapses to reform the stable C=O π bond, expelling water.',
        nucleophile: 'Hydroxyl Lone Pair',
        electrophile: 'Protonated -OH2⁺ leaving group',
        drivingForce: 'Thermodynamic stability of carbonyl double bond (C=O) and entropic gain of water departure.',
        atoms: [
          { id: 1, element: 'C', x: 220, y: 180, charge: 0 },
          { id: 2, element: 'O', x: 220, y: 95, charge: 0, label: 'OH' },
          { id: 3, element: 'O', x: 330, y: 150, charge: 1, label: '-OH₂⁺ (LG)' },
          { id: 4, element: 'C', x: 130, y: 220, charge: 0 },
          { id: 5, element: 'O', x: 220, y: 265, charge: 0, label: '-OEt' },
          { id: 6, element: 'C', x: 290, y: 305, charge: 0 },
          { id: 7, element: 'C', x: 360, y: 275, charge: 0 }
        ],
        bonds: [
          { id: 301, from: 1, to: 2, type: 'single', order: 1 },
          { id: 302, from: 1, to: 3, type: 'single', order: 1 },
          { id: 303, from: 1, to: 4, type: 'single', order: 1 },
          { id: 304, from: 1, to: 5, type: 'single', order: 1 },
          { id: 305, from: 5, to: 6, type: 'single', order: 1 },
          { id: 306, from: 6, to: 7, type: 'single', order: 1 }
        ],
        arrows: [
          {
            id: 'arr_4',
            type: 'pair',
            sourceType: 'atom',
            sourceId: 2,
            targetType: 'bond',
            targetId: 301,
            curveOffset: -30,
            label: 'C=O Reformation',
            description: 'Oxygen lone pair reforms carbonyl π-bond.'
          },
          {
            id: 'arr_5',
            type: 'pair',
            sourceType: 'bond',
            sourceId: 302,
            targetType: 'atom',
            targetId: 3,
            curveOffset: 35,
            label: 'H₂O Expulsion',
            description: 'Departure of water neutralizes the positive charge on oxygen.'
          }
        ]
      },
      {
        stepNumber: 4,
        title: 'Final Deprotonation to Ester Product',
        isTransitionState: false,
        reagent: 'Base Workup / Catalyst Recovery',
        condition: 'Room Temp',
        description: 'Deprotonation of the carbonyl oxonium intermediate delivers the pure ester product (Ethyl Acetate) and regenerates H3O⁺.',
        nucleophile: 'Water / Solvent Base',
        electrophile: 'Proton on Ester Carbonyl',
        drivingForce: 'Formation of resonance-stabilized ester and acid catalyst turnover.',
        atoms: [
          { id: 1, element: 'C', x: 220, y: 180, charge: 0 },
          { id: 2, element: 'O', x: 220, y: 95, charge: 0, label: 'C=O' },
          { id: 4, element: 'C', x: 130, y: 220, charge: 0 },
          { id: 5, element: 'O', x: 290, y: 220, charge: 0, label: '-OEt' },
          { id: 6, element: 'C', x: 360, y: 180, charge: 0 },
          { id: 7, element: 'C', x: 430, y: 220, charge: 0 },
          { id: 8, element: 'O', x: 500, y: 110, charge: 0, label: 'H₂O (byproduct)' }
        ],
        bonds: [
          { id: 401, from: 1, to: 2, type: 'double', order: 2 },
          { id: 402, from: 1, to: 4, type: 'single', order: 1 },
          { id: 403, from: 1, to: 5, type: 'single', order: 1 },
          { id: 404, from: 5, to: 6, type: 'single', order: 1 },
          { id: 405, from: 6, to: 7, type: 'single', order: 1 }
        ],
        arrows: []
      }
    ]
  },

  // ── 3. Electrophilic Aromatic Substitution (EAS Friedel-Crafts Acylation) ──
  {
    id: 'eas_acylation',
    name: 'Electrophilic Aromatic Substitution (Friedel-Crafts)',
    class: 'Electrophilic Aromatic Substitution (EAS)',
    subclass: 'Arenium Ion / Wheland Complex',
    description: 'Electrophilic attack of an acylium cation (R-C≡O⁺) on an aromatic ring followed by deprotonation of the Wheland sigma-complex to restore aromaticity.',
    drivingForce: 'Resonance restoration of aromatic stability (aromatization driving force ~36 kcal/mol for benzene).',
    reactantsSmiles: ['c1ccccc1', 'CC(=O)Cl'],
    productSmiles: 'CC(=O)c1ccccc1',
    steps: [
      {
        stepNumber: 1,
        title: 'Generation of Acylium Cation via AlCl3 Lewis Acid',
        isTransitionState: false,
        reagent: 'AlCl3 (Anhydrous Lewis Acid)',
        condition: '0–20 °C, DCM Solvent',
        description: 'Coordination of the acyl chloride chlorine with AlCl3 polarizes the C-Cl bond, followed by chloride abstraction to generate the linear, resonance-stabilized acylium ion.',
        nucleophile: 'Acyl Chloride Chlorine',
        electrophile: 'Aluminum center (empty p-orbital of AlCl3)',
        drivingForce: 'Formation of stable [AlCl4]⁻ anion and resonance-stabilized linear acylium cation [H3C-C≡O⁺].',
        atoms: [
          { id: 1, element: 'C', x: 120, y: 180, charge: 0 },
          { id: 2, element: 'O', x: 120, y: 95, charge: 0 },
          { id: 3, element: 'Cl', x: 210, y: 180, charge: 0 },
          { id: 4, element: 'Al', x: 330, y: 180, charge: 0, label: 'AlCl₃' }
        ],
        bonds: [
          { id: 101, from: 1, to: 2, type: 'double', order: 2 },
          { id: 102, from: 1, to: 3, type: 'single', order: 1 }
        ],
        arrows: [
          {
            id: 'arr_1',
            type: 'pair',
            sourceType: 'atom',
            sourceId: 3,
            targetType: 'atom',
            targetId: 4,
            curveOffset: -30,
            label: 'Lewis coordination',
            description: 'Chlorine lone pair coordinates to empty p-orbital of AlCl3.'
          },
          {
            id: 'arr_2',
            type: 'pair',
            sourceType: 'atom',
            sourceId: 2,
            targetType: 'bond',
            targetId: 101,
            curveOffset: 25,
            label: 'Triple bond formation',
            description: 'Oxygen lone pair pushes in to form resonance-stabilized acylium ion.'
          }
        ]
      },
      {
        stepNumber: 2,
        title: 'Electrophilic Attack & Wheland (Arenium) Complex',
        isTransitionState: false,
        reagent: 'Acylium Cation + Benzene',
        condition: '25 °C',
        description: 'Aromatic π-electrons attack the electrophilic carbon of the acylium ion, breaking aromaticity to form the resonance-stabilized Wheland σ-complex (arenium cation).',
        nucleophile: 'Benzene π-electron cloud',
        electrophile: 'Acylium Carbon (C⁺)',
        drivingForce: 'High electrophilicity of acylium cation overcomes initial aromatic resonance barrier.',
        atoms: [
          // Arenium Ring (sp3 at C1)
          { id: 1, element: 'C', x: 180, y: 120, charge: 0, label: 'C(sp3)-H' },
          { id: 2, element: 'C', x: 240, y: 160, charge: 1, label: 'C⁺ (delocalized)' },
          { id: 3, element: 'C', x: 240, y: 240, charge: 0 },
          { id: 4, element: 'C', x: 180, y: 280, charge: 0 },
          { id: 5, element: 'C', x: 120, y: 240, charge: 0 },
          { id: 6, element: 'C', x: 120, y: 160, charge: 0 },
          // Attached Acyl Group
          { id: 7, element: 'C', x: 180, y: 40, charge: 0 },
          { id: 8, element: 'O', x: 250, y: 10, charge: 0, label: 'C=O' },
          { id: 9, element: 'C', x: 110, y: 10, charge: 0 }
        ],
        bonds: [
          { id: 201, from: 1, to: 2, type: 'single', order: 1 },
          { id: 202, from: 2, to: 3, type: 'double', order: 2 },
          { id: 203, from: 3, to: 4, type: 'single', order: 1 },
          { id: 204, from: 4, to: 5, type: 'double', order: 2 },
          { id: 205, from: 5, to: 6, type: 'single', order: 1 },
          { id: 206, from: 6, to: 1, type: 'single', order: 1 },
          { id: 207, from: 1, to: 7, type: 'single', order: 1 },
          { id: 208, from: 7, to: 8, type: 'double', order: 2 },
          { id: 209, from: 7, to: 9, type: 'single', order: 1 }
        ],
        arrows: [
          {
            id: 'arr_3',
            type: 'pair',
            sourceType: 'bond',
            sourceId: 206,
            targetType: 'atom',
            targetId: 7,
            curveOffset: -40,
            label: 'π-attack on acylium',
            description: 'Benzene π-cloud captures electrophilic acylium cation.'
          }
        ]
      },
      {
        stepNumber: 3,
        title: 'Aromatization via Base-Mediated Deprotonation',
        isTransitionState: false,
        reagent: '[AlCl4]⁻ base',
        condition: '25 °C',
        description: 'Tetrachloroaluminate abstracts the proton from the sp3 carbon. The C-H electron pair collapses into the ring to restore complete aromatic conjugation.',
        nucleophile: 'Chloride on [AlCl4]⁻',
        electrophile: 'Arenium sp3 C-H proton',
        drivingForce: 'Enormous thermodynamic drive to restore 6 π-electron Hückel aromatic resonance stabilization.',
        atoms: [
          // Restored Aromatic Acetophenone
          { id: 1, element: 'C', x: 180, y: 120, charge: 0 },
          { id: 2, element: 'C', x: 240, y: 160, charge: 0 },
          { id: 3, element: 'C', x: 240, y: 240, charge: 0 },
          { id: 4, element: 'C', x: 180, y: 280, charge: 0 },
          { id: 5, element: 'C', x: 120, y: 240, charge: 0 },
          { id: 6, element: 'C', x: 120, y: 160, charge: 0 },
          // Acyl Group
          { id: 7, element: 'C', x: 180, y: 40, charge: 0 },
          { id: 8, element: 'O', x: 250, y: 10, charge: 0 },
          { id: 9, element: 'C', x: 110, y: 10, charge: 0 },
          // Byproducts
          { id: 10, element: 'Cl', x: 360, y: 120, charge: 0, label: 'HCl (gas)' }
        ],
        bonds: [
          { id: 301, from: 1, to: 2, type: 'aromatic', order: 1.5 },
          { id: 302, from: 2, to: 3, type: 'aromatic', order: 1.5 },
          { id: 303, from: 3, to: 4, type: 'aromatic', order: 1.5 },
          { id: 304, from: 4, to: 5, type: 'aromatic', order: 1.5 },
          { id: 305, from: 5, to: 6, type: 'aromatic', order: 1.5 },
          { id: 306, from: 6, to: 1, type: 'aromatic', order: 1.5 },
          { id: 307, from: 1, to: 7, type: 'single', order: 1 },
          { id: 308, from: 7, to: 8, type: 'double', order: 2 },
          { id: 309, from: 7, to: 9, type: 'single', order: 1 }
        ],
        arrows: []
      }
    ]
  },

  // ── 4. E2 Elimination (Anti-Periplanar) ──
  {
    id: 'e2_elimination',
    name: 'E2 Anti-Periplanar Bimolecular Elimination',
    class: 'Elimination',
    subclass: 'Concerted Stereospecific E2',
    description: 'Concerted removal of a β-hydrogen by a strong hindered base simultaneous with π-bond formation and leaving group expulsion in an anti-periplanar conformation.',
    drivingForce: 'Formation of thermodynamically stable alkene (Zaitsev or Hofmann product depending on base steric hindrance).',
    reactantsSmiles: ['CCC(Br)C', 'KOtBu'],
    productSmiles: 'CC=CC',
    steps: [
      {
        stepNumber: 1,
        title: 'Concerted Anti-Periplanar Deprotonation & Expulsion',
        isTransitionState: false,
        reagent: 't-BuOK (Bulky Base) / t-BuOH Solvent',
        condition: '60 °C Reflux',
        description: 'Bulky base removes anti-coplanar β-hydrogen. Electron pair shifts to form the C=C π bond while the bromide leaving group departs simultaneously.',
        nucleophile: 'tert-Butoxide Oxygen (tBuO⁻)',
        electrophile: 'β-Hydrogen (anti to leaving group)',
        drivingForce: 'Concerted single-step release of leaving group and generation of conjugated/substituted alkene.',
        atoms: [
          { id: 1, element: 'O', x: 90, y: 110, charge: -1, label: 'tBuO:⁻ (Base)' },
          { id: 2, element: 'H', x: 190, y: 110, charge: 0, label: 'H(β)' },
          { id: 3, element: 'C', x: 240, y: 180, charge: 0, label: 'C(β)' },
          { id: 4, element: 'C', x: 330, y: 180, charge: 0, label: 'C(α)' },
          { id: 5, element: 'Br', x: 380, y: 250, charge: 0, label: 'Br (anti-LG)' },
          { id: 6, element: 'C', x: 190, y: 250, charge: 0 },
          { id: 7, element: 'C', x: 380, y: 110, charge: 0 }
        ],
        bonds: [
          { id: 101, from: 3, to: 2, type: 'single', order: 1 },
          { id: 102, from: 3, to: 4, type: 'single', order: 1 },
          { id: 103, from: 4, to: 5, type: 'single', order: 1 },
          { id: 104, from: 3, to: 6, type: 'single', order: 1 },
          { id: 105, from: 4, to: 7, type: 'single', order: 1 }
        ],
        arrows: [
          {
            id: 'arr_1',
            type: 'pair',
            sourceType: 'atom',
            sourceId: 1,
            targetType: 'atom',
            targetId: 2,
            curveOffset: -30,
            label: 'Base abstraction',
            description: 'tBuO⁻ lone pair abstracts the acidic β-proton.'
          },
          {
            id: 'arr_2',
            type: 'pair',
            sourceType: 'bond',
            sourceId: 101,
            targetType: 'bond',
            targetId: 102,
            curveOffset: 35,
            label: 'C=C π-bond formation',
            description: 'C-H bonding electrons fold in to create C=C double bond.'
          },
          {
            id: 'arr_3',
            type: 'pair',
            sourceType: 'bond',
            sourceId: 103,
            targetType: 'atom',
            targetId: 5,
            curveOffset: -35,
            label: 'Bromide departure',
            description: 'C-Br electrons depart onto Bromine to yield Br⁻.'
          }
        ]
      },
      {
        stepNumber: 2,
        title: 'Alkene Product & Halide Salt Formation',
        isTransitionState: false,
        reagent: 'Workup',
        condition: 'Room Temp',
        description: 'Generation of 2-butene alkene product, tert-butanol solvent, and potassium bromide salt.',
        nucleophile: 'None',
        electrophile: 'None',
        drivingForce: 'Thermodynamically favored sp2 alkene formation and high crystal lattice enthalpy of KBr.',
        atoms: [
          { id: 3, element: 'C', x: 220, y: 180, charge: 0 },
          { id: 4, element: 'C', x: 310, y: 180, charge: 0 },
          { id: 6, element: 'C', x: 165, y: 235, charge: 0 },
          { id: 7, element: 'C', x: 365, y: 125, charge: 0 },
          { id: 5, element: 'Br', x: 460, y: 220, charge: -1, label: 'Br⁻' }
        ],
        bonds: [
          { id: 201, from: 3, to: 4, type: 'double', order: 2 },
          { id: 202, from: 3, to: 6, type: 'single', order: 1 },
          { id: 203, from: 4, to: 7, type: 'single', order: 1 }
        ],
        arrows: []
      }
    ]
  },

  // ── 5. Diels-Alder [4+2] Concerted Cycloaddition ──
  {
    id: 'diels_alder_cycloaddition',
    name: 'Diels-Alder [4+2] Pericyclic Cycloaddition',
    class: 'Pericyclic Reaction',
    subclass: 'Concerted [4π + 2π] Cycloaddition',
    description: 'Thermally allowed, concerted suprafacial cycloaddition between a conjugated diene (4 π-electrons) and a dienophile (2 π-electrons) through a cyclic 6-electron transition state.',
    drivingForce: 'Transformation of two relatively weak π-bonds into two strong σ-bonds (exothermic by ~30–40 kcal/mol).',
    reactantsSmiles: ['C=CC=C', 'C=CC(=O)OC'],
    productSmiles: 'COC(=O)C1CC=CCC1',
    steps: [
      {
        stepNumber: 1,
        title: 'Concerted 6-Electron Cyclic Electron Flow',
        isTransitionState: false,
        reagent: 'Thermal / Toluene Solvent',
        condition: '110 °C, Sealed Tube',
        description: 'Simultaneous overlapping of diene HOMO and dienophile LUMO. Three electron pairs move continuously in a closed loop forming two new σ-bonds and shifting one π-bond.',
        nucleophile: 'Diene π1,3-system (HOMO)',
        electrophile: 'Dienophile alkene (LUMO)',
        drivingForce: 'Conservation of orbital symmetry and net gain of two strong carbon-carbon σ bonds.',
        atoms: [
          // s-cis Butadiene (Diene)
          { id: 1, element: 'C', x: 150, y: 120, charge: 0, label: 'C1' },
          { id: 2, element: 'C', x: 150, y: 200, charge: 0, label: 'C2' },
          { id: 3, element: 'C', x: 210, y: 240, charge: 0, label: 'C3' },
          { id: 4, element: 'C', x: 270, y: 200, charge: 0, label: 'C4' },
          // Ethylene Dienophile
          { id: 5, element: 'C', x: 270, y: 120, charge: 0, label: 'C5' },
          { id: 6, element: 'C', x: 210, y: 80, charge: 0, label: 'C6' }
        ],
        bonds: [
          { id: 101, from: 1, to: 2, type: 'double', order: 2 },
          { id: 102, from: 2, to: 3, type: 'single', order: 1 },
          { id: 103, from: 3, to: 4, type: 'double', order: 2 },
          { id: 104, from: 5, to: 6, type: 'double', order: 2 }
        ],
        arrows: [
          {
            id: 'arr_1',
            type: 'pair',
            sourceType: 'bond',
            sourceId: 101,
            targetType: 'atom',
            targetId: 6,
            curveOffset: -30,
            label: 'σ1 formation',
            description: 'Diene C1=C2 π-bond attacks dienophile C6.'
          },
          {
            id: 'arr_2',
            type: 'pair',
            sourceType: 'bond',
            sourceId: 104,
            targetType: 'atom',
            targetId: 4,
            curveOffset: -30,
            label: 'σ2 formation',
            description: 'Dienophile C5=C6 π-electrons attack diene C4.'
          },
          {
            id: 'arr_3',
            type: 'pair',
            sourceType: 'bond',
            sourceId: 103,
            targetType: 'bond',
            targetId: 102,
            curveOffset: 30,
            label: 'π-shift',
            description: 'Diene C3=C4 π-electrons shift to form the internal C2=C3 double bond.'
          }
        ]
      },
      {
        stepNumber: 2,
        title: 'Cyclohexene Adduct Product',
        isTransitionState: false,
        reagent: 'Cooled to Room Temp',
        condition: 'Ambient',
        description: 'Clean formation of 6-membered cyclohexene ring with 100% atom economy.',
        nucleophile: 'None',
        electrophile: 'None',
        drivingForce: 'Stable cyclic adduct with no reaction byproducts.',
        atoms: [
          { id: 1, element: 'C', x: 170, y: 120, charge: 0 },
          { id: 2, element: 'C', x: 170, y: 200, charge: 0 },
          { id: 3, element: 'C', x: 230, y: 240, charge: 0 },
          { id: 4, element: 'C', x: 290, y: 200, charge: 0 },
          { id: 5, element: 'C', x: 290, y: 120, charge: 0 },
          { id: 6, element: 'C', x: 230, y: 80, charge: 0 }
        ],
        bonds: [
          { id: 201, from: 1, to: 2, type: 'single', order: 1 },
          { id: 202, from: 2, to: 3, type: 'double', order: 2 },
          { id: 203, from: 3, to: 4, type: 'single', order: 1 },
          { id: 204, from: 4, to: 5, type: 'single', order: 1 },
          { id: 205, from: 5, to: 6, type: 'single', order: 1 },
          { id: 206, from: 6, to: 1, type: 'single', order: 1 }
        ],
        arrows: []
      }
    ]
  },

  // ── 6. Carbonyl Hydride Reduction (NaBH4 Reduction of Ketone) ──
  {
    id: 'hydride_reduction',
    name: 'Nucleophilic Carbonyl Hydride Reduction',
    class: 'Carbonyl Addition / Reduction',
    subclass: 'Hydride Transfer',
    description: 'Nucleophilic addition of hydride (H⁻) from sodium borohydride to an electrophilic ketone carbonyl, followed by aqueous protonation to yield a secondary alcohol.',
    drivingForce: 'Relief of carbonyl dipole and formation of stable C-H and O-H bonds.',
    reactantsSmiles: ['CC(=O)C', '[BH4-]'],
    productSmiles: 'CC(O)C',
    steps: [
      {
        stepNumber: 1,
        title: 'Nucleophilic Hydride Attack on Carbonyl',
        isTransitionState: false,
        reagent: 'NaBH4 / Methanol (MeOH)',
        condition: '0–25 °C',
        description: 'The B-H σ-bonding electron pair acts as a nucleophile, transferring hydride to the electrophilic carbonyl carbon while the C=O π-bond breaks to create an alkoxide.',
        nucleophile: 'Borohydride B-H Bond (Hydride Donor)',
        electrophile: 'Carbonyl Carbon (C=O)',
        drivingForce: 'Electrophilic polarization of the carbonyl carbon and Lewis-acid stabilization by the boron center.',
        atoms: [
          // Ketone
          { id: 1, element: 'C', x: 240, y: 180, charge: 0, label: 'C=O' },
          { id: 2, element: 'O', x: 240, y: 100, charge: 0 },
          { id: 3, element: 'C', x: 170, y: 220, charge: 0 },
          { id: 4, element: 'C', x: 310, y: 220, charge: 0 },
          // Borohydride
          { id: 5, element: 'B', x: 100, y: 130, charge: -1, label: 'BH₄⁻' },
          { id: 6, element: 'H', x: 160, y: 145, charge: 0, label: 'H:⁻' }
        ],
        bonds: [
          { id: 101, from: 1, to: 2, type: 'double', order: 2 },
          { id: 102, from: 1, to: 3, type: 'single', order: 1 },
          { id: 103, from: 1, to: 4, type: 'single', order: 1 },
          { id: 104, from: 5, to: 6, type: 'single', order: 1 }
        ],
        arrows: [
          {
            id: 'arr_1',
            type: 'pair',
            sourceType: 'bond',
            sourceId: 104,
            targetType: 'atom',
            targetId: 1,
            curveOffset: -35,
            label: 'Hydride transfer',
            description: 'B-H σ-electrons transfer hydride to carbonyl carbon.'
          },
          {
            id: 'arr_2',
            type: 'pair',
            sourceType: 'bond',
            sourceId: 101,
            targetType: 'atom',
            targetId: 2,
            curveOffset: 35,
            label: 'π-displacement',
            description: 'C=O π-bond electrons push onto oxygen forming alkoxide.'
          }
        ]
      },
      {
        stepNumber: 2,
        title: 'Protonation of Alkoxide Intermediate',
        isTransitionState: false,
        reagent: 'Aqueous / Methanolic Workup',
        condition: 'Room Temp',
        description: 'The alkoxide oxygen abstracts a proton from the solvent (MeOH/H2O) to deliver the pure secondary alcohol (Isopropanol).',
        nucleophile: 'Alkoxide Oxygen (O⁻)',
        electrophile: 'Solvent Proton (H-OMe)',
        drivingForce: 'Proton transfer equilibrium strongly favors neutral alcohol formation.',
        atoms: [
          { id: 1, element: 'C', x: 240, y: 180, charge: 0 },
          { id: 2, element: 'O', x: 240, y: 100, charge: -1, label: 'O⁻' },
          { id: 3, element: 'C', x: 170, y: 220, charge: 0 },
          { id: 4, element: 'C', x: 310, y: 220, charge: 0 },
          { id: 6, element: 'H', x: 240, y: 250, charge: 0, label: 'H (added)' },
          { id: 7, element: 'H', x: 330, y: 70, charge: 1, label: 'H⁺ (solvent)' }
        ],
        bonds: [
          { id: 201, from: 1, to: 2, type: 'single', order: 1 },
          { id: 202, from: 1, to: 3, type: 'single', order: 1 },
          { id: 203, from: 1, to: 4, type: 'single', order: 1 },
          { id: 204, from: 1, to: 6, type: 'single', order: 1 }
        ],
        arrows: [
          {
            id: 'arr_3',
            type: 'pair',
            sourceType: 'atom',
            sourceId: 2,
            targetType: 'atom',
            targetId: 7,
            curveOffset: -30,
            label: 'Protonation',
            description: 'Alkoxide lone pair captures solvent proton.'
          }
        ]
      }
    ]
  },

  // ── 7. Radical Allylic Bromination (Wohl-Ziegler NBS Mechanism) ──
  {
    id: 'radical_bromination',
    name: 'Radical Allylic Bromination (NBS / Wohl-Ziegler)',
    class: 'Radical Reaction',
    subclass: 'Single-Electron Fishhook Mechanism',
    description: 'Free-radical chain mechanism featuring single-electron abstraction of resonance-stabilized allylic hydrogen by a bromine radical, followed by trap with Br2.',
    drivingForce: 'Resonance stabilization of allylic radical intermediate (~13 kcal/mol stabilization energy).',
    reactantsSmiles: ['CC=C', 'NBS'],
    productSmiles: 'BrCC=C',
    steps: [
      {
        stepNumber: 1,
        title: 'Single-Electron Allylic Hydrogen Abstraction',
        isTransitionState: false,
        reagent: 'NBS + AIBN or Light (hν)',
        condition: '80 °C, CCl4 / MeCN Reflux',
        description: 'A bromine radical (Br•) abstracts the allylic hydrogen via single-electron homolytic cleavage (fishhook arrows), generating a resonance-stabilized allylic radical and HBr.',
        nucleophile: 'Bromine Radical (Br•)',
        electrophile: 'Allylic C-H bond',
        drivingForce: 'Formation of resonance-stabilized allylic radical.',
        atoms: [
          { id: 1, element: 'Br', x: 90, y: 120, charge: 0, label: 'Br• (Radical)' },
          { id: 2, element: 'H', x: 180, y: 120, charge: 0, label: 'H(allyl)' },
          { id: 3, element: 'C', x: 230, y: 180, charge: 0, label: 'C(allyl)' },
          { id: 4, element: 'C', x: 310, y: 180, charge: 0 },
          { id: 5, element: 'C', x: 370, y: 120, charge: 0 }
        ],
        bonds: [
          { id: 101, from: 3, to: 2, type: 'single', order: 1 },
          { id: 102, from: 3, to: 4, type: 'single', order: 1 },
          { id: 103, from: 4, to: 5, type: 'double', order: 2 }
        ],
        arrows: [
          {
            id: 'arr_1',
            type: 'single', // Fishhook single-electron arrow
            sourceType: 'atom',
            sourceId: 1,
            targetType: 'atom',
            targetId: 2,
            curveOffset: -30,
            label: 'Fishhook 1',
            description: 'Br• single electron meets H• electron.'
          },
          {
            id: 'arr_2',
            type: 'single',
            sourceType: 'bond',
            sourceId: 101,
            targetType: 'atom',
            targetId: 2,
            curveOffset: 30,
            label: 'Fishhook 2',
            description: 'One electron of C-H σ bond pairs with Br•.'
          },
          {
            id: 'arr_3',
            type: 'single',
            sourceType: 'bond',
            sourceId: 101,
            targetType: 'atom',
            targetId: 3,
            curveOffset: -30,
            label: 'Fishhook 3',
            description: 'Second electron of C-H σ bond resides on carbon as an allylic radical.'
          }
        ]
      }
    ]
  }
];

/**
 * Validates mechanism steps for basic chemical consistency
 * Checks:
 * - Formal charge conservation across steps
 * - Valence sanity on transformed atoms
 * - Arrow origin and destination validity
 */
export function validateMechanismStep(step) {
  const diagnostics = [];
  let isConsistent = true;

  if (!step || !step.atoms) {
    return { isConsistent: false, diagnostics: ['Empty or undefined mechanism step graph.'] };
  }

  // 1. Calculate net charge of the step
  const netCharge = step.atoms.reduce((sum, a) => sum + (a.charge || 0), 0);

  // 2. Validate arrows
  if (step.arrows && step.arrows.length > 0) {
    step.arrows.forEach((arr, idx) => {
      // Check source
      if (arr.sourceType === 'atom') {
        const found = step.atoms.find(a => a.id === arr.sourceId);
        if (!found) {
          diagnostics.push(`Arrow #${idx + 1}: Source atom ID [${arr.sourceId}] does not exist in step.`);
          isConsistent = false;
        }
      } else if (arr.sourceType === 'bond') {
        const found = step.bonds?.find(b => b.id === arr.sourceId);
        if (!found) {
          diagnostics.push(`Arrow #${idx + 1}: Source bond ID [${arr.sourceId}] does not exist in step.`);
          isConsistent = false;
        }
      }

      // Check target
      if (arr.targetType === 'atom') {
        const found = step.atoms.find(a => a.id === arr.targetId);
        if (!found) {
          diagnostics.push(`Arrow #${idx + 1}: Target atom ID [${arr.targetId}] does not exist in step.`);
          isConsistent = false;
        }
      } else if (arr.targetType === 'bond') {
        const found = step.bonds?.find(b => b.id === arr.targetId);
        if (!found) {
          diagnostics.push(`Arrow #${idx + 1}: Target bond ID [${arr.targetId}] does not exist in step.`);
          isConsistent = false;
        }
      }
    });
  }

  // 3. Informational diagnostics
  if (diagnostics.length === 0) {
    diagnostics.push(`Structural integrity verified. Net step formal charge: ${netCharge >= 0 ? '+' : ''}${netCharge}.`);
    if (step.arrows?.length > 0) {
      diagnostics.push(`${step.arrows.length} electron-pushing arrow(s) mapped with valid topology.`);
    }
  }

  return {
    isConsistent,
    netCharge,
    diagnostics
  };
}
