/**
 * ChemNova Extended Chemical Fragment & Functional Group Library
 * Comprehensive, categorized library of organic fragments, substituents, and chemical groups
 * Supports: direct insertion, atom-attachment workflow, real coordinates & attachment points.
 */

export const FRAGMENT_CATEGORIES = [
  { id: 'all', label: 'All Groups' },
  { id: 'alkyl', label: 'Alkyl & Hydrocarbons' },
  { id: 'functional', label: 'Oxygen & Nitrogen' },
  { id: 'carbonyl', label: 'Carbonyl & Carboxylic' },
  { id: 'aromatic', label: 'Aromatic & Rings' },
  { id: 'halogens', label: 'Halogens & Halides' },
  { id: 'hetero', label: 'Sulfur & Phosphorus' },
  { id: 'protecting', label: 'Protecting Groups' }
];

export const FRAGMENT_LIBRARY = [
  // ── 1. Alkyl & Hydrocarbon Groups ──
  {
    id: 'frag_me',
    label: '-CH₃',
    name: 'Methyl',
    smiles: 'C',
    category: 'alkyl',
    desc: 'Methyl group (single carbon substituent)',
    attachmentIndex: 0,
    atoms: [{ el: 'C', dx: 0, dy: 0, charge: 0 }],
    bonds: []
  },
  {
    id: 'frag_et',
    label: '-CH₂CH₃',
    name: 'Ethyl',
    smiles: 'CC',
    category: 'alkyl',
    desc: 'Ethyl aliphatic chain',
    attachmentIndex: 0,
    atoms: [
      { el: 'C', dx: 0, dy: 0, charge: 0 },
      { el: 'C', dx: 43, dy: 25, charge: 0 }
    ],
    bonds: [{ fromIdx: 0, toIdx: 1, type: 'single', order: 1 }]
  },
  {
    id: 'frag_pr',
    label: '-Pr',
    name: 'Propyl (n-Propyl)',
    smiles: 'CCC',
    category: 'alkyl',
    desc: 'Straight-chain propyl group',
    attachmentIndex: 0,
    atoms: [
      { el: 'C', dx: 0, dy: 0, charge: 0 },
      { el: 'C', dx: 43, dy: 25, charge: 0 },
      { el: 'C', dx: 86, dy: 0, charge: 0 }
    ],
    bonds: [
      { fromIdx: 0, toIdx: 1, type: 'single', order: 1 },
      { fromIdx: 1, toIdx: 2, type: 'single', order: 1 }
    ]
  },
  {
    id: 'frag_ipr',
    label: '-iPr',
    name: 'Isopropyl',
    smiles: 'C(C)C',
    category: 'alkyl',
    desc: 'Branched isopropyl substituent (CH(CH3)2)',
    attachmentIndex: 0,
    atoms: [
      { el: 'C', dx: 0, dy: 0, charge: 0 },
      { el: 'C', dx: 38, dy: -30, charge: 0 },
      { el: 'C', dx: 38, dy: 30, charge: 0 }
    ],
    bonds: [
      { fromIdx: 0, toIdx: 1, type: 'single', order: 1 },
      { fromIdx: 0, toIdx: 2, type: 'single', order: 1 }
    ]
  },
  {
    id: 'frag_bu',
    label: '-Bu',
    name: 'Butyl (n-Butyl)',
    smiles: 'CCCC',
    category: 'alkyl',
    desc: 'Four-carbon straight chain',
    attachmentIndex: 0,
    atoms: [
      { el: 'C', dx: 0, dy: 0, charge: 0 },
      { el: 'C', dx: 43, dy: 25, charge: 0 },
      { el: 'C', dx: 86, dy: 0, charge: 0 },
      { el: 'C', dx: 129, dy: 25, charge: 0 }
    ],
    bonds: [
      { fromIdx: 0, toIdx: 1, type: 'single', order: 1 },
      { fromIdx: 1, toIdx: 2, type: 'single', order: 1 },
      { fromIdx: 2, toIdx: 3, type: 'single', order: 1 }
    ]
  },
  {
    id: 'frag_tbu',
    label: '-tBu',
    name: 'tert-Butyl',
    smiles: 'C(C)(C)C',
    category: 'alkyl',
    desc: 'Bulky quaternary tert-butyl group',
    attachmentIndex: 0,
    atoms: [
      { el: 'C', dx: 0, dy: 0, charge: 0 },
      { el: 'C', dx: 45, dy: 0, charge: 0 },
      { el: 'C', dx: 15, dy: -42, charge: 0 },
      { el: 'C', dx: 15, dy: 42, charge: 0 }
    ],
    bonds: [
      { fromIdx: 0, toIdx: 1, type: 'single', order: 1 },
      { fromIdx: 0, toIdx: 2, type: 'single', order: 1 },
      { fromIdx: 0, toIdx: 3, type: 'single', order: 1 }
    ]
  },
  {
    id: 'frag_vinyl',
    label: '-CH=CH₂',
    name: 'Vinyl / Ethenyl',
    smiles: 'C=C',
    category: 'alkyl',
    desc: 'Terminal alkene functional handle',
    attachmentIndex: 0,
    atoms: [
      { el: 'C', dx: 0, dy: 0, charge: 0 },
      { el: 'C', dx: 45, dy: 25, charge: 0 }
    ],
    bonds: [{ fromIdx: 0, toIdx: 1, type: 'double', order: 2 }]
  },
  {
    id: 'frag_allyl',
    label: '-Allyl',
    name: 'Allyl Group',
    smiles: 'CC=C',
    category: 'alkyl',
    desc: 'Allylic 3-carbon unit (-CH2-CH=CH2)',
    attachmentIndex: 0,
    atoms: [
      { el: 'C', dx: 0, dy: 0, charge: 0 },
      { el: 'C', dx: 43, dy: 25, charge: 0 },
      { el: 'C', dx: 86, dy: 0, charge: 0 }
    ],
    bonds: [
      { fromIdx: 0, toIdx: 1, type: 'single', order: 1 },
      { fromIdx: 1, toIdx: 2, type: 'double', order: 2 }
    ]
  },

  // ── 2. Oxygen & Nitrogen Functional Groups ──
  {
    id: 'frag_oh',
    label: '-OH',
    name: 'Hydroxyl',
    smiles: 'O',
    category: 'functional',
    desc: 'Alcohol / Phenol oxygen functional group',
    attachmentIndex: 0,
    atoms: [{ el: 'O', dx: 0, dy: 0, charge: 0 }],
    bonds: []
  },
  {
    id: 'frag_ome',
    label: '-OCH₃',
    name: 'Methoxy',
    smiles: 'OC',
    category: 'functional',
    desc: 'Methoxy ether substituent',
    attachmentIndex: 0,
    atoms: [
      { el: 'O', dx: 0, dy: 0, charge: 0 },
      { el: 'C', dx: 43, dy: 25, charge: 0 }
    ],
    bonds: [{ fromIdx: 0, toIdx: 1, type: 'single', order: 1 }]
  },
  {
    id: 'frag_oet',
    label: '-OCH₂CH₃',
    name: 'Ethoxy',
    smiles: 'OCC',
    category: 'functional',
    desc: 'Ethoxy ether substituent',
    attachmentIndex: 0,
    atoms: [
      { el: 'O', dx: 0, dy: 0, charge: 0 },
      { el: 'C', dx: 43, dy: 25, charge: 0 },
      { el: 'C', dx: 86, dy: 0, charge: 0 }
    ],
    bonds: [
      { fromIdx: 0, toIdx: 1, type: 'single', order: 1 },
      { fromIdx: 1, toIdx: 2, type: 'single', order: 1 }
    ]
  },
  {
    id: 'frag_nh2',
    label: '-NH₂',
    name: 'Amino (Primary)',
    smiles: 'N',
    category: 'functional',
    desc: 'Primary amino group',
    attachmentIndex: 0,
    atoms: [{ el: 'N', dx: 0, dy: 0, charge: 0 }],
    bonds: []
  },
  {
    id: 'frag_nhme',
    label: '-NHCH₃',
    name: 'Methylamino',
    smiles: 'NC',
    category: 'functional',
    desc: 'Secondary methylamino group',
    attachmentIndex: 0,
    atoms: [
      { el: 'N', dx: 0, dy: 0, charge: 0 },
      { el: 'C', dx: 43, dy: 25, charge: 0 }
    ],
    bonds: [{ fromIdx: 0, toIdx: 1, type: 'single', order: 1 }]
  },
  {
    id: 'frag_nme2',
    label: '-N(CH₃)₂',
    name: 'Dimethylamino',
    smiles: 'N(C)C',
    category: 'functional',
    desc: 'Electron-rich tertiary dimethylamino group',
    attachmentIndex: 0,
    atoms: [
      { el: 'N', dx: 0, dy: 0, charge: 0 },
      { el: 'C', dx: 38, dy: -30, charge: 0 },
      { el: 'C', dx: 38, dy: 30, charge: 0 }
    ],
    bonds: [
      { fromIdx: 0, toIdx: 1, type: 'single', order: 1 },
      { fromIdx: 0, toIdx: 2, type: 'single', order: 1 }
    ]
  },
  {
    id: 'frag_no2',
    label: '-NO₂',
    name: 'Nitro',
    smiles: '[N+](=O)[O-]',
    category: 'functional',
    desc: 'Strong electron-withdrawing nitro group',
    attachmentIndex: 0,
    atoms: [
      { el: 'N', dx: 0, dy: 0, charge: 1 },
      { el: 'O', dx: 38, dy: -28, charge: 0 },
      { el: 'O', dx: 38, dy: 28, charge: -1 }
    ],
    bonds: [
      { fromIdx: 0, toIdx: 1, type: 'double', order: 2 },
      { fromIdx: 0, toIdx: 2, type: 'single', order: 1 }
    ]
  },
  {
    id: 'frag_cn',
    label: '-C≡N',
    name: 'Cyano / Nitrile',
    smiles: 'C#N',
    category: 'functional',
    desc: 'Linear nitrile triple bond',
    attachmentIndex: 0,
    atoms: [
      { el: 'C', dx: 0, dy: 0, charge: 0 },
      { el: 'N', dx: 48, dy: 0, charge: 0 }
    ],
    bonds: [{ fromIdx: 0, toIdx: 1, type: 'triple', order: 3 }]
  },

  // ── 3. Carbonyl & Carboxylic Acid Derivatives ──
  {
    id: 'frag_cooh',
    label: '-COOH',
    name: 'Carboxylic Acid',
    smiles: 'C(=O)O',
    category: 'carbonyl',
    desc: 'Carboxyl group (C=O and OH)',
    attachmentIndex: 0,
    atoms: [
      { el: 'C', dx: 0, dy: 0, charge: 0 },
      { el: 'O', dx: 25, dy: -40, charge: 0 },
      { el: 'O', dx: 43, dy: 25, charge: 0 }
    ],
    bonds: [
      { fromIdx: 0, toIdx: 1, type: 'double', order: 2 },
      { fromIdx: 0, toIdx: 2, type: 'single', order: 1 }
    ]
  },
  {
    id: 'frag_cho',
    label: '-CHO',
    name: 'Formyl / Aldehyde',
    smiles: 'C=O',
    category: 'carbonyl',
    desc: 'Aldehyde carbonyl functional group',
    attachmentIndex: 0,
    atoms: [
      { el: 'C', dx: 0, dy: 0, charge: 0 },
      { el: 'O', dx: 38, dy: -30, charge: 0 }
    ],
    bonds: [{ fromIdx: 0, toIdx: 1, type: 'double', order: 2 }]
  },
  {
    id: 'frag_coch3',
    label: '-COCH₃ (Ac)',
    name: 'Acetyl',
    smiles: 'C(=O)C',
    category: 'carbonyl',
    desc: 'Acetyl group (Ac = C(=O)CH3)',
    attachmentIndex: 0,
    atoms: [
      { el: 'C', dx: 0, dy: 0, charge: 0 },
      { el: 'O', dx: 25, dy: -40, charge: 0 },
      { el: 'C', dx: 45, dy: 25, charge: 0 }
    ],
    bonds: [
      { fromIdx: 0, toIdx: 1, type: 'double', order: 2 },
      { fromIdx: 0, toIdx: 2, type: 'single', order: 1 }
    ]
  },
  {
    id: 'frag_coome',
    label: '-COOCH₃',
    name: 'Methyl Ester',
    smiles: 'C(=O)OC',
    category: 'carbonyl',
    desc: 'Methyl carboxylate ester',
    attachmentIndex: 0,
    atoms: [
      { el: 'C', dx: 0, dy: 0, charge: 0 },
      { el: 'O', dx: 25, dy: -40, charge: 0 },
      { el: 'O', dx: 43, dy: 25, charge: 0 },
      { el: 'C', dx: 86, dy: 25, charge: 0 }
    ],
    bonds: [
      { fromIdx: 0, toIdx: 1, type: 'double', order: 2 },
      { fromIdx: 0, toIdx: 2, type: 'single', order: 1 },
      { fromIdx: 2, toIdx: 3, type: 'single', order: 1 }
    ]
  },
  {
    id: 'frag_conh2',
    label: '-CONH₂',
    name: 'Primary Carboxamide',
    smiles: 'C(=O)N',
    category: 'carbonyl',
    desc: 'Primary amide functional group',
    attachmentIndex: 0,
    atoms: [
      { el: 'C', dx: 0, dy: 0, charge: 0 },
      { el: 'O', dx: 25, dy: -40, charge: 0 },
      { el: 'N', dx: 43, dy: 25, charge: 0 }
    ],
    bonds: [
      { fromIdx: 0, toIdx: 1, type: 'double', order: 2 },
      { fromIdx: 0, toIdx: 2, type: 'single', order: 1 }
    ]
  },
  {
    id: 'frag_cocl',
    label: '-COCl',
    name: 'Acyl Chloride',
    smiles: 'C(=O)Cl',
    category: 'carbonyl',
    desc: 'Highly reactive acylating handle',
    attachmentIndex: 0,
    atoms: [
      { el: 'C', dx: 0, dy: 0, charge: 0 },
      { el: 'O', dx: 25, dy: -40, charge: 0 },
      { el: 'Cl', dx: 45, dy: 25, charge: 0 }
    ],
    bonds: [
      { fromIdx: 0, toIdx: 1, type: 'double', order: 2 },
      { fromIdx: 0, toIdx: 2, type: 'single', order: 1 }
    ]
  },

  // ── 4. Aromatic & Ring Substituents ──
  {
    id: 'frag_ph',
    label: '-Ph',
    name: 'Phenyl',
    smiles: 'c1ccccc1',
    category: 'aromatic',
    desc: 'Phenyl aromatic 6-carbon ring',
    attachmentIndex: 0,
    atoms: [
      { el: 'C', dx: 0, dy: 0, charge: 0 },
      { el: 'C', dx: 25, dy: -43, charge: 0 },
      { el: 'C', dx: 75, dy: -43, charge: 0 },
      { el: 'C', dx: 100, dy: 0, charge: 0 },
      { el: 'C', dx: 75, dy: 43, charge: 0 },
      { el: 'C', dx: 25, dy: 43, charge: 0 }
    ],
    bonds: [
      { fromIdx: 0, toIdx: 1, type: 'aromatic', order: 1.5 },
      { fromIdx: 1, toIdx: 2, type: 'aromatic', order: 1.5 },
      { fromIdx: 2, toIdx: 3, type: 'aromatic', order: 1.5 },
      { fromIdx: 3, toIdx: 4, type: 'aromatic', order: 1.5 },
      { fromIdx: 4, toIdx: 5, type: 'aromatic', order: 1.5 },
      { fromIdx: 5, toIdx: 0, type: 'aromatic', order: 1.5 }
    ]
  },
  {
    id: 'frag_bn',
    label: '-Bn',
    name: 'Benzyl',
    smiles: 'Cc1ccccc1',
    category: 'aromatic',
    desc: 'Benzyl substituent (-CH2-Ph)',
    attachmentIndex: 0,
    atoms: [
      { el: 'C', dx: 0, dy: 0, charge: 0 },
      { el: 'C', dx: 45, dy: 0, charge: 0 },
      { el: 'C', dx: 70, dy: -43, charge: 0 },
      { el: 'C', dx: 120, dy: -43, charge: 0 },
      { el: 'C', dx: 145, dy: 0, charge: 0 },
      { el: 'C', dx: 120, dy: 43, charge: 0 },
      { el: 'C', dx: 70, dy: 43, charge: 0 }
    ],
    bonds: [
      { fromIdx: 0, toIdx: 1, type: 'single', order: 1 },
      { fromIdx: 1, toIdx: 2, type: 'aromatic', order: 1.5 },
      { fromIdx: 2, toIdx: 3, type: 'aromatic', order: 1.5 },
      { fromIdx: 3, toIdx: 4, type: 'aromatic', order: 1.5 },
      { fromIdx: 4, toIdx: 5, type: 'aromatic', order: 1.5 },
      { fromIdx: 5, toIdx: 6, type: 'aromatic', order: 1.5 },
      { fromIdx: 6, toIdx: 1, type: 'aromatic', order: 1.5 }
    ]
  },
  {
    id: 'frag_phenethyl',
    label: '-Phenethyl',
    name: 'Phenethyl',
    smiles: 'CCc1ccccc1',
    category: 'aromatic',
    desc: 'Phenethyl 2-carbon spacer to aromatic ring (-CH2-CH2-Ph)',
    attachmentIndex: 0,
    atoms: [
      { el: 'C', dx: 0, dy: 0, charge: 0 },
      { el: 'C', dx: 43, dy: 25, charge: 0 },
      { el: 'C', dx: 86, dy: 0, charge: 0 },
      { el: 'C', dx: 111, dy: -43, charge: 0 },
      { el: 'C', dx: 161, dy: -43, charge: 0 },
      { el: 'C', dx: 186, dy: 0, charge: 0 },
      { el: 'C', dx: 161, dy: 43, charge: 0 },
      { el: 'C', dx: 111, dy: 43, charge: 0 }
    ],
    bonds: [
      { fromIdx: 0, toIdx: 1, type: 'single', order: 1 },
      { fromIdx: 1, toIdx: 2, type: 'single', order: 1 },
      { fromIdx: 2, toIdx: 3, type: 'aromatic', order: 1.5 },
      { fromIdx: 3, toIdx: 4, type: 'aromatic', order: 1.5 },
      { fromIdx: 4, toIdx: 5, type: 'aromatic', order: 1.5 },
      { fromIdx: 5, toIdx: 6, type: 'aromatic', order: 1.5 },
      { fromIdx: 6, toIdx: 7, type: 'aromatic', order: 1.5 },
      { fromIdx: 7, toIdx: 2, type: 'aromatic', order: 1.5 }
    ]
  },
  {
    id: 'frag_cy',
    label: '-Cy',
    name: 'Cyclohexyl',
    smiles: 'C1CCCCC1',
    category: 'aromatic',
    desc: 'Saturated 6-membered cyclohexane ring',
    attachmentIndex: 0,
    atoms: [
      { el: 'C', dx: 0, dy: 0, charge: 0 },
      { el: 'C', dx: 25, dy: -43, charge: 0 },
      { el: 'C', dx: 75, dy: -43, charge: 0 },
      { el: 'C', dx: 100, dy: 0, charge: 0 },
      { el: 'C', dx: 75, dy: 43, charge: 0 },
      { el: 'C', dx: 25, dy: 43, charge: 0 }
    ],
    bonds: [
      { fromIdx: 0, toIdx: 1, type: 'single', order: 1 },
      { fromIdx: 1, toIdx: 2, type: 'single', order: 1 },
      { fromIdx: 2, toIdx: 3, type: 'single', order: 1 },
      { fromIdx: 3, toIdx: 4, type: 'single', order: 1 },
      { fromIdx: 4, toIdx: 5, type: 'single', order: 1 },
      { fromIdx: 5, toIdx: 0, type: 'single', order: 1 }
    ]
  },
  {
    id: 'frag_pyridyl',
    label: '-2-Pyridyl',
    name: '2-Pyridyl',
    smiles: 'c1ccccn1',
    category: 'aromatic',
    desc: 'Pyridine heteroaromatic ring',
    attachmentIndex: 0,
    atoms: [
      { el: 'C', dx: 0, dy: 0, charge: 0 },
      { el: 'N', dx: 25, dy: -43, charge: 0 },
      { el: 'C', dx: 75, dy: -43, charge: 0 },
      { el: 'C', dx: 100, dy: 0, charge: 0 },
      { el: 'C', dx: 75, dy: 43, charge: 0 },
      { el: 'C', dx: 25, dy: 43, charge: 0 }
    ],
    bonds: [
      { fromIdx: 0, toIdx: 1, type: 'aromatic', order: 1.5 },
      { fromIdx: 1, toIdx: 2, type: 'aromatic', order: 1.5 },
      { fromIdx: 2, toIdx: 3, type: 'aromatic', order: 1.5 },
      { fromIdx: 3, toIdx: 4, type: 'aromatic', order: 1.5 },
      { fromIdx: 4, toIdx: 5, type: 'aromatic', order: 1.5 },
      { fromIdx: 5, toIdx: 0, type: 'aromatic', order: 1.5 }
    ]
  },

  // ── 5. Halogen Substituents ──
  {
    id: 'frag_f',
    label: '-F',
    name: 'Fluoro',
    smiles: 'F',
    category: 'halogens',
    desc: 'Fluorine atom substituent',
    attachmentIndex: 0,
    atoms: [{ el: 'F', dx: 0, dy: 0, charge: 0 }],
    bonds: []
  },
  {
    id: 'frag_cl',
    label: '-Cl',
    name: 'Chloro',
    smiles: 'Cl',
    category: 'halogens',
    desc: 'Chlorine atom substituent',
    attachmentIndex: 0,
    atoms: [{ el: 'Cl', dx: 0, dy: 0, charge: 0 }],
    bonds: []
  },
  {
    id: 'frag_br',
    label: '-Br',
    name: 'Bromo',
    smiles: 'Br',
    category: 'halogens',
    desc: 'Bromine atom substituent',
    attachmentIndex: 0,
    atoms: [{ el: 'Br', dx: 0, dy: 0, charge: 0 }],
    bonds: []
  },
  {
    id: 'frag_i',
    label: '-I',
    name: 'Iodo',
    smiles: 'I',
    category: 'halogens',
    desc: 'Iodine atom substituent',
    attachmentIndex: 0,
    atoms: [{ el: 'I', dx: 0, dy: 0, charge: 0 }],
    bonds: []
  },
  {
    id: 'frag_cf3',
    label: '-CF₃',
    name: 'Trifluoromethyl',
    smiles: 'C(F)(F)F',
    category: 'halogens',
    desc: 'Lipophilic, electron-withdrawing CF3',
    attachmentIndex: 0,
    atoms: [
      { el: 'C', dx: 0, dy: 0, charge: 0 },
      { el: 'F', dx: 45, dy: 0, charge: 0 },
      { el: 'F', dx: 15, dy: -42, charge: 0 },
      { el: 'F', dx: 15, dy: 42, charge: 0 }
    ],
    bonds: [
      { fromIdx: 0, toIdx: 1, type: 'single', order: 1 },
      { fromIdx: 0, toIdx: 2, type: 'single', order: 1 },
      { fromIdx: 0, toIdx: 3, type: 'single', order: 1 }
    ]
  },

  // ── 6. Sulfur & Phosphorus Heteroatoms ──
  {
    id: 'frag_sh',
    label: '-SH',
    name: 'Thiol / Mercapto',
    smiles: 'S',
    category: 'hetero',
    desc: 'Sulfur thiol functional group',
    attachmentIndex: 0,
    atoms: [{ el: 'S', dx: 0, dy: 0, charge: 0 }],
    bonds: []
  },
  {
    id: 'frag_sme',
    label: '-SCH₃',
    name: 'Methylthio / Thioether',
    smiles: 'SC',
    category: 'hetero',
    desc: 'Thioether sulfur-methyl handle',
    attachmentIndex: 0,
    atoms: [
      { el: 'S', dx: 0, dy: 0, charge: 0 },
      { el: 'C', dx: 43, dy: 25, charge: 0 }
    ],
    bonds: [{ fromIdx: 0, toIdx: 1, type: 'single', order: 1 }]
  },
  {
    id: 'frag_so2me',
    label: '-SO₂CH₃ (Ms)',
    name: 'Mesyl / Methanesulfonyl',
    smiles: 'S(=O)(=O)C',
    category: 'hetero',
    desc: 'Sulfonyl / mesyl group (Ms)',
    attachmentIndex: 0,
    atoms: [
      { el: 'S', dx: 0, dy: 0, charge: 0 },
      { el: 'O', dx: 0, dy: -42, charge: 0 },
      { el: 'O', dx: 0, dy: 42, charge: 0 },
      { el: 'C', dx: 45, dy: 0, charge: 0 }
    ],
    bonds: [
      { fromIdx: 0, toIdx: 1, type: 'double', order: 2 },
      { fromIdx: 0, toIdx: 2, type: 'double', order: 2 },
      { fromIdx: 0, toIdx: 3, type: 'single', order: 1 }
    ]
  },
  {
    id: 'frag_so3h',
    label: '-SO₃H',
    name: 'Sulfonic Acid',
    smiles: 'S(=O)(=O)O',
    category: 'hetero',
    desc: 'Strongly acidic sulfonate',
    attachmentIndex: 0,
    atoms: [
      { el: 'S', dx: 0, dy: 0, charge: 0 },
      { el: 'O', dx: 0, dy: -42, charge: 0 },
      { el: 'O', dx: 0, dy: 42, charge: 0 },
      { el: 'O', dx: 45, dy: 0, charge: 0 }
    ],
    bonds: [
      { fromIdx: 0, toIdx: 1, type: 'double', order: 2 },
      { fromIdx: 0, toIdx: 2, type: 'double', order: 2 },
      { fromIdx: 0, toIdx: 3, type: 'single', order: 1 }
    ]
  },

  // ── 7. Protecting Groups ──
  {
    id: 'frag_boc',
    label: '-Boc',
    name: 'tert-Butyloxycarbonyl',
    smiles: 'C(=O)OC(C)(C)C',
    category: 'protecting',
    desc: 'Acid-labile carbamate amine protecting group',
    attachmentIndex: 0,
    atoms: [
      { el: 'C', dx: 0, dy: 0, charge: 0 },
      { el: 'O', dx: 25, dy: -40, charge: 0 },
      { el: 'O', dx: 43, dy: 25, charge: 0 },
      { el: 'C', dx: 86, dy: 25, charge: 0 },
      { el: 'C', dx: 130, dy: 25, charge: 0 },
      { el: 'C', dx: 86, dy: -20, charge: 0 },
      { el: 'C', dx: 86, dy: 70, charge: 0 }
    ],
    bonds: [
      { fromIdx: 0, toIdx: 1, type: 'double', order: 2 },
      { fromIdx: 0, toIdx: 2, type: 'single', order: 1 },
      { fromIdx: 2, toIdx: 3, type: 'single', order: 1 },
      { fromIdx: 3, toIdx: 4, type: 'single', order: 1 },
      { fromIdx: 3, toIdx: 5, type: 'single', order: 1 },
      { fromIdx: 3, toIdx: 6, type: 'single', order: 1 }
    ]
  },
  {
    id: 'frag_tbs',
    label: '-TBS / -TBDMS',
    name: 'tert-Butyldimethylsilyl',
    smiles: '[Si](C)(C)C(C)(C)C',
    category: 'protecting',
    desc: 'Silyl ether hydroxyl protecting group',
    attachmentIndex: 0,
    atoms: [
      { el: 'Si', dx: 0, dy: 0, charge: 0 },
      { el: 'C', dx: 0, dy: -42, charge: 0 },
      { el: 'C', dx: 0, dy: 42, charge: 0 },
      { el: 'C', dx: 45, dy: 0, charge: 0 },
      { el: 'C', dx: 90, dy: 0, charge: 0 },
      { el: 'C', dx: 45, dy: -42, charge: 0 },
      { el: 'C', dx: 45, dy: 42, charge: 0 }
    ],
    bonds: [
      { fromIdx: 0, toIdx: 1, type: 'single', order: 1 },
      { fromIdx: 0, toIdx: 2, type: 'single', order: 1 },
      { fromIdx: 0, toIdx: 3, type: 'single', order: 1 },
      { fromIdx: 3, toIdx: 4, type: 'single', order: 1 },
      { fromIdx: 3, toIdx: 5, type: 'single', order: 1 },
      { fromIdx: 3, toIdx: 6, type: 'single', order: 1 }
    ]
  },
  {
    id: 'frag_ts',
    label: '-Ts (Tosyl)',
    name: 'p-Toluenesulfonyl',
    smiles: 'S(=O)(=O)c1ccc(C)cc1',
    category: 'protecting',
    desc: 'Tosyl activating / protecting group',
    attachmentIndex: 0,
    atoms: [
      { el: 'S', dx: 0, dy: 0, charge: 0 },
      { el: 'O', dx: 0, dy: -42, charge: 0 },
      { el: 'O', dx: 0, dy: 42, charge: 0 },
      { el: 'C', dx: 45, dy: 0, charge: 0 },
      { el: 'C', dx: 70, dy: -43, charge: 0 },
      { el: 'C', dx: 120, dy: -43, charge: 0 },
      { el: 'C', dx: 145, dy: 0, charge: 0 },
      { el: 'C', dx: 120, dy: 43, charge: 0 },
      { el: 'C', dx: 70, dy: 43, charge: 0 },
      { el: 'C', dx: 195, dy: 0, charge: 0 }
    ],
    bonds: [
      { fromIdx: 0, toIdx: 1, type: 'double', order: 2 },
      { fromIdx: 0, toIdx: 2, type: 'double', order: 2 },
      { fromIdx: 0, toIdx: 3, type: 'single', order: 1 },
      { fromIdx: 3, toIdx: 4, type: 'aromatic', order: 1.5 },
      { fromIdx: 4, toIdx: 5, type: 'aromatic', order: 1.5 },
      { fromIdx: 5, toIdx: 6, type: 'aromatic', order: 1.5 },
      { fromIdx: 6, toIdx: 7, type: 'aromatic', order: 1.5 },
      { fromIdx: 7, toIdx: 8, type: 'aromatic', order: 1.5 },
      { fromIdx: 8, toIdx: 3, type: 'aromatic', order: 1.5 },
      { fromIdx: 6, toIdx: 9, type: 'single', order: 1 }
    ]
  }
];

/**
 * Calculates optimal attachment orientation and coordinates when grafting a fragment onto a target atom.
 * Considers existing bond vectors to orient the attached group away from existing neighbors.
 */
export function calculateFragmentAttachment(targetAtom, existingBonds, existingAtoms, fragment, standardBondLen = 50) {
  // Find all bonds connected to targetAtom
  const connectedBonds = existingBonds.filter(b => b.from === targetAtom.id || b.to === targetAtom.id);
  
  // Calculate average vector of existing bonds pointing away from targetAtom
  let avgDx = 0;
  let avgDy = 0;

  if (connectedBonds.length === 0) {
    // If target atom has no bonds, point right-up (+30 deg)
    avgDx = Math.cos(Math.PI / 6);
    avgDy = Math.sin(Math.PI / 6);
  } else {
    connectedBonds.forEach(b => {
      const neighborId = b.from === targetAtom.id ? b.to : b.from;
      const neighbor = existingAtoms.find(a => a.id === neighborId);
      if (neighbor) {
        const dx = neighbor.x - targetAtom.x;
        const dy = neighbor.y - targetAtom.y;
        const len = Math.hypot(dx, dy) || 1;
        avgDx += dx / len;
        avgDy += dy / len;
      }
    });
  }

  // Desired direction for new bond is opposite to the average existing bond direction
  let attachAngle = Math.atan2(-avgDy, -avgDx);
  if (connectedBonds.length === 0) {
    attachAngle = Math.PI / 6; // 30 deg
  }

  // Snap to nearest 30 degrees (pi / 6)
  attachAngle = Math.round(attachAngle / (Math.PI / 6)) * (Math.PI / 6);

  const rootX = targetAtom.x + Math.cos(attachAngle) * standardBondLen;
  const rootY = targetAtom.y + Math.sin(attachAngle) * standardBondLen;

  // Now instantiate fragment atoms and bonds with unique IDs
  const idOffset = Date.now() + Math.floor(Math.random() * 10000);
  const fragAtoms = [];
  const fragBonds = [];

  // Cos and Sin for rotating the fragment along the attachment vector
  const cosA = Math.cos(attachAngle);
  const sinA = Math.sin(attachAngle);

  fragment.atoms.forEach((fa, idx) => {
    const newId = idOffset + idx;
    // Rotate relative offset (dx, dy)
    const rotX = fa.dx * cosA - fa.dy * sinA;
    const rotY = fa.dx * sinA + fa.dy * cosA;

    fragAtoms.push({
      id: newId,
      element: fa.el,
      x: Math.round(rootX + rotX),
      y: Math.round(rootY + rotY),
      charge: fa.charge || 0
    });
  });

  // Create internal bonds of fragment
  fragment.bonds.forEach((fb, bIdx) => {
    fragBonds.push({
      id: idOffset + 1000 + bIdx,
      from: fragAtoms[fb.fromIdx].id,
      to: fragAtoms[fb.toIdx].id,
      type: fb.type || 'single',
      order: fb.order || 1
    });
  });

  // Connecting bond between targetAtom and root of fragment
  const attachmentBond = {
    id: idOffset + 9999,
    from: targetAtom.id,
    to: fragAtoms[fragment.attachmentIndex || 0].id,
    type: 'single',
    order: 1
  };

  return {
    newAtoms: fragAtoms,
    newBonds: [...fragBonds, attachmentBond],
    rootAtomId: fragAtoms[fragment.attachmentIndex || 0].id
  };
}
