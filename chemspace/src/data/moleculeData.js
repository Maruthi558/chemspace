// CPK Color Standards & Atomic Radii (in Angstroms)
export const ELEMENT_PROPERTIES = {
  H: { name: 'Hydrogen', color: '#ffffff', radius: 0.35, vdw: 1.2, valency: 1, mass: 1.008, electronegativity: 2.20 },
  C: { name: 'Carbon', color: '#333333', radius: 0.70, vdw: 1.7, valency: 4, mass: 12.011, electronegativity: 2.55 },
  N: { name: 'Nitrogen', color: '#3050f8', radius: 0.65, vdw: 1.55, valency: 3, mass: 14.007, electronegativity: 3.04 },
  O: { name: 'Oxygen', color: '#ff0d0d', radius: 0.60, vdw: 1.52, valency: 2, mass: 15.999, electronegativity: 3.44 },
  F: { name: 'Fluorine', color: '#90e050', radius: 0.50, vdw: 1.47, valency: 1, mass: 18.998, electronegativity: 3.98 },
  Cl: { name: 'Chlorine', color: '#1ff01f', radius: 1.00, vdw: 1.75, valency: 1, mass: 35.45, electronegativity: 3.16 },
  Br: { name: 'Bromine', color: '#a62929', radius: 1.15, vdw: 1.85, valency: 1, mass: 79.904, electronegativity: 2.96 },
  S: { name: 'Sulfur', color: '#ffff30', radius: 1.00, vdw: 1.80, valency: 2, mass: 32.06, electronegativity: 2.58 },
  P: { name: 'Phosphorus', color: '#ff8000', radius: 1.05, vdw: 1.80, valency: 5, mass: 30.974, electronegativity: 2.19 },
  Fe: { name: 'Iron', color: '#e06633', radius: 1.25, vdw: 2.0, valency: 3, mass: 55.845, electronegativity: 1.83 },
  Na: { name: 'Sodium', color: '#ab5cf2', radius: 1.80, vdw: 2.27, valency: 1, mass: 22.99, electronegativity: 0.93 },
};

export const MOLECULES = [
  {
    id: 'water',
    name: 'Water',
    formula: 'H₂O',
    iupac: 'Oxidane',
    smiles: 'O',
    molWeight: '18.015 g/mol',
    category: 'Inorganic',
    description: 'Essential polar solvent for all known life forms. Features bent V-shape molecular geometry with ~104.5° bond angle.',
    atoms: [
      { id: 1, element: 'O', x: 0.000, y: 0.117, z: 0.000 },
      { id: 2, element: 'H', x: 0.757, y: -0.469, z: 0.000 },
      { id: 3, element: 'H', x: -0.757, y: -0.469, z: 0.000 }
    ],
    bonds: [
      { from: 1, to: 2, order: 1 },
      { from: 1, to: 3, order: 1 }
    ]
  },
  {
    id: 'benzene',
    name: 'Benzene',
    formula: 'C₆H₆',
    iupac: 'Benzene',
    smiles: 'c1ccccc1',
    molWeight: '78.11 g/mol',
    category: 'Aromatic Hydrocarbon',
    description: 'Prototypical aromatic hydrocarbon with delocalized pi-electron cloud ring system adhering to Hückel\'s rule (4n+2).',
    atoms: [
      { id: 1, element: 'C', x: 1.397, y: 0.000, z: 0.000 },
      { id: 2, element: 'C', x: 0.699, y: 1.210, z: 0.000 },
      { id: 3, element: 'C', x: -0.699, y: 1.210, z: 0.000 },
      { id: 4, element: 'C', x: -1.397, y: 0.000, z: 0.000 },
      { id: 5, element: 'C', x: -0.699, y: -1.210, z: 0.000 },
      { id: 6, element: 'C', x: 0.699, y: -1.210, z: 0.000 },
      { id: 7, element: 'H', x: 2.481, y: 0.000, z: 0.000 },
      { id: 8, element: 'H', x: 1.240, y: 2.149, z: 0.000 },
      { id: 9, element: 'H', x: -1.240, y: 2.149, z: 0.000 },
      { id: 10, element: 'H', x: -2.481, y: 0.000, z: 0.000 },
      { id: 11, element: 'H', x: -1.240, y: -2.149, z: 0.000 },
      { id: 12, element: 'H', x: 1.240, y: -2.149, z: 0.000 }
    ],
    bonds: [
      { from: 1, to: 2, order: 2 },
      { from: 2, to: 3, order: 1 },
      { from: 3, to: 4, order: 2 },
      { from: 4, to: 5, order: 1 },
      { from: 5, to: 6, order: 2 },
      { from: 6, to: 1, order: 1 },
      { from: 1, to: 7, order: 1 },
      { from: 2, to: 8, order: 1 },
      { from: 3, to: 9, order: 1 },
      { from: 4, to: 10, order: 1 },
      { from: 5, to: 11, order: 1 },
      { from: 6, to: 12, order: 1 }
    ]
  },
  {
    id: 'caffeine',
    name: 'Caffeine',
    formula: 'C₈H₁₀N₄O₂',
    iupac: '1,3,7-Trimethylxanthine',
    smiles: 'CN1C=NC2=C1C(=O)N(C(=O)N2C)C',
    molWeight: '194.19 g/mol',
    category: 'Alkaloid Stimulant',
    description: 'Central nervous system stimulant of the methylxanthine class. Reversibly blocks adenosine A1 and A2A receptors in the brain.',
    atoms: [
      { id: 1, element: 'C', x: -0.672, y: -1.241, z: 0.024 },
      { id: 2, element: 'N', x: 0.725, y: -1.205, z: -0.012 },
      { id: 3, element: 'C', x: 1.402, y: -0.008, z: -0.045 },
      { id: 4, element: 'N', x: 0.679, y: 1.157, z: -0.018 },
      { id: 5, element: 'C', x: -0.718, y: 1.112, z: 0.019 },
      { id: 6, element: 'C', x: -1.418, y: -0.082, z: 0.043 },
      { id: 7, element: 'O', x: -1.282, y: -2.312, z: 0.052 },
      { id: 8, element: 'O', x: -1.332, y: 2.186, z: 0.040 },
      { id: 9, element: 'N', x: -2.766, y: -0.327, z: 0.088 },
      { id: 10, element: 'C', x: -2.859, y: -1.684, z: 0.092 },
      { id: 11, element: 'N', x: -1.603, y: -2.253, z: 0.051 },
      { id: 12, element: 'C', x: 1.455, y: -2.484, z: -0.040 },
      { id: 13, element: 'C', x: 1.396, y: 2.441, z: -0.052 },
      { id: 14, element: 'C', x: 2.894, y: 0.026, z: -0.091 },
      { id: 15, element: 'H', x: 2.493, y: -2.312, z: -0.071 },
      { id: 16, element: 'H', x: 1.187, y: -3.056, z: 0.852 },
      { id: 17, element: 'H', x: 1.171, y: -3.027, z: -0.947 },
      { id: 18, element: 'H', x: 2.438, y: 2.274, z: -0.092 },
      { id: 19, element: 'H', x: 1.127, y: 3.003, z: 0.844 },
      { id: 20, element: 'H', x: 1.111, y: 2.977, z: -0.955 },
      { id: 21, element: 'H', x: 3.322, y: -0.472, z: 0.776 },
      { id: 22, element: 'H', x: 3.268, y: 1.050, z: -0.083 },
      { id: 23, element: 'H', x: 3.249, y: -0.485, z: -0.990 },
      { id: 24, element: 'H', x: -3.784, y: -2.164, z: 0.125 }
    ],
    bonds: [
      { from: 1, to: 2, order: 1 },
      { from: 2, to: 3, order: 1 },
      { from: 3, to: 4, order: 2 },
      { from: 4, to: 5, order: 1 },
      { from: 5, to: 6, order: 1 },
      { from: 6, to: 1, order: 1 },
      { from: 1, to: 7, order: 2 },
      { from: 5, to: 8, order: 2 },
      { from: 6, to: 9, order: 2 },
      { from: 9, to: 10, order: 1 },
      { from: 10, to: 11, order: 2 },
      { from: 2, to: 12, order: 1 },
      { from: 4, to: 13, order: 1 },
      { from: 3, to: 14, order: 1 },
      { from: 12, to: 15, order: 1 },
      { from: 12, to: 16, order: 1 },
      { from: 12, to: 17, order: 1 },
      { from: 13, to: 18, order: 1 },
      { from: 13, to: 19, order: 1 },
      { from: 13, to: 20, order: 1 },
      { from: 14, to: 21, order: 1 },
      { from: 14, to: 22, order: 1 },
      { from: 14, to: 23, order: 1 },
      { from: 10, to: 24, order: 1 }
    ]
  },
  {
    id: 'aspirin',
    name: 'Aspirin',
    formula: 'C₉H₈O₄',
    iupac: '2-Acetoxybenzoic acid',
    smiles: 'CC(=O)OC1=CC=CC=C1C(=O)O',
    molWeight: '180.16 g/mol',
    category: 'Pharmaceutical NSAID',
    description: 'Acetylsalicylic acid (ASA), nonsteroidal anti-inflammatory drug (NSAID) used to reduce pain, fever, and inflammation by irreversibly inhibiting COX-1 and COX-2 enzymes.',
    atoms: [
      { id: 1, element: 'C', x: -1.215, y: -0.264, z: -0.001 },
      { id: 2, element: 'C', x: -0.498, y: 0.932, z: -0.002 },
      { id: 3, element: 'C', x: 0.898, y: 0.916, z: -0.001 },
      { id: 4, element: 'C', x: 1.579, y: -0.297, z: 0.000 },
      { id: 5, element: 'C', x: 0.863, y: -1.493, z: 0.001 },
      { id: 6, element: 'C', x: -0.533, y: -1.477, z: 0.000 },
      { id: 7, element: 'C', x: -1.240, y: 2.235, z: -0.003 },
      { id: 8, element: 'O', x: -0.730, y: 3.328, z: -0.004 },
      { id: 9, element: 'O', x: -2.573, y: 2.052, z: -0.003 },
      { id: 10, element: 'O', x: -2.579, y: -0.279, z: -0.002 },
      { id: 11, element: 'C', x: -3.342, y: -1.378, z: 0.000 },
      { id: 12, element: 'O', x: -2.903, y: -2.503, z: 0.002 },
      { id: 13, element: 'C', x: -4.810, y: -1.026, z: -0.001 },
      { id: 14, element: 'H', x: 1.455, y: 1.846, z: -0.002 },
      { id: 15, element: 'H', x: 2.664, y: -0.310, z: 0.001 },
      { id: 16, element: 'H', x: 1.393, y: -2.439, z: 0.002 },
      { id: 17, element: 'H', x: -1.090, y: -2.408, z: 0.000 },
      { id: 18, element: 'H', x: -3.003, y: 2.922, z: -0.004 },
      { id: 19, element: 'H', x: -5.068, y: -0.457, z: -0.893 },
      { id: 20, element: 'H', x: -5.342, y: -1.974, z: -0.001 },
      { id: 21, element: 'H', x: -5.068, y: -0.457, z: 0.891 }
    ],
    bonds: [
      { from: 1, to: 2, order: 2 },
      { from: 2, to: 3, order: 1 },
      { from: 3, to: 4, order: 2 },
      { from: 4, to: 5, order: 1 },
      { from: 5, to: 6, order: 2 },
      { from: 6, to: 1, order: 1 },
      { from: 2, to: 7, order: 1 },
      { from: 7, to: 8, order: 2 },
      { from: 7, to: 9, order: 1 },
      { from: 1, to: 10, order: 1 },
      { from: 10, to: 11, order: 1 },
      { from: 11, to: 12, order: 2 },
      { from: 11, to: 13, order: 1 },
      { from: 3, to: 14, order: 1 },
      { from: 4, to: 15, order: 1 },
      { from: 5, to: 16, order: 1 },
      { from: 6, to: 17, order: 1 },
      { from: 9, to: 18, order: 1 },
      { from: 13, to: 19, order: 1 },
      { from: 13, to: 20, order: 1 },
      { from: 13, to: 21, order: 1 }
    ]
  },
  {
    id: 'ethanol',
    name: 'Ethanol',
    formula: 'C₂H₆O',
    iupac: 'Ethanol',
    smiles: 'CCO',
    molWeight: '46.07 g/mol',
    category: 'Alcohol',
    description: 'Primary alcohol found in alcoholic beverages and widely used as a biofuel, antiseptic, and organic solvent.',
    atoms: [
      { id: 1, element: 'C', x: -1.187, y: -0.389, z: 0.000 },
      { id: 2, element: 'C', x: 0.225, y: 0.187, z: 0.000 },
      { id: 3, element: 'O', x: 1.166, y: -0.866, z: 0.000 },
      { id: 4, element: 'H', x: 2.052, y: -0.490, z: 0.000 },
      { id: 5, element: 'H', x: -1.258, y: -1.026, z: 0.887 },
      { id: 6, element: 'H', x: -1.258, y: -1.026, z: -0.887 },
      { id: 7, element: 'H', x: -1.956, y: 0.388, z: 0.000 },
      { id: 8, element: 'H', x: 0.360, y: 0.817, z: 0.887 },
      { id: 9, element: 'H', x: 0.360, y: 0.817, z: -0.887 }
    ],
    bonds: [
      { from: 1, to: 2, order: 1 },
      { from: 2, to: 3, order: 1 },
      { from: 3, to: 4, order: 1 },
      { from: 1, to: 5, order: 1 },
      { from: 1, to: 6, order: 1 },
      { from: 1, to: 7, order: 1 },
      { from: 2, to: 8, order: 1 },
      { from: 2, to: 9, order: 1 }
    ]
  },
  {
    id: 'dna',
    name: 'DNA Fragment (Base Pair)',
    formula: 'C₁₉H₂₃N₇O₁₂P₂',
    iupac: 'Deoxyribonucleic Acid Pair',
    smiles: 'Adenine-Thymine Pair',
    molWeight: '617.36 g/mol',
    category: 'Biopolymer',
    description: 'Double helix base pair held together by specific hydrogen bonding (Adenine to Thymine 2 H-bonds, Guanine to Cytosine 3 H-bonds).',
    atoms: [
      { id: 1, element: 'P', x: -3.500, y: 2.100, z: 0.500 },
      { id: 2, element: 'O', x: -4.200, y: 3.100, z: -0.300 },
      { id: 3, element: 'O', x: -3.800, y: 0.700, z: 0.000 },
      { id: 4, element: 'C', x: -2.000, y: 2.300, z: 0.200 },
      { id: 5, element: 'C', x: -1.200, y: 1.100, z: 0.000 },
      { id: 6, element: 'N', x: 0.200, y: 1.200, z: -0.100 },
      { id: 7, element: 'C', x: 0.900, y: 2.300, z: -0.100 },
      { id: 8, element: 'N', x: 2.200, y: 2.200, z: -0.200 },
      { id: 9, element: 'C', x: 2.700, y: 1.000, z: -0.200 },
      { id: 10, element: 'N', x: 2.000, y: -0.100, z: -0.100 },
      { id: 11, element: 'C', x: 0.700, y: 0.000, z: -0.100 },
      { id: 12, element: 'H', x: 3.770, y: 1.000, z: -0.300 },
      { id: 13, element: 'N', x: -0.100, y: -1.100, z: 0.000 },
      { id: 14, element: 'C', x: -1.400, y: -0.800, z: 0.100 },
      { id: 15, element: 'P', x: 4.500, y: -2.100, z: -0.500 },
      { id: 16, element: 'O', x: 5.200, y: -3.100, z: 0.300 },
      { id: 17, element: 'C', x: 3.000, y: -2.300, z: -0.200 }
    ],
    bonds: [
      { from: 1, to: 2, order: 2 },
      { from: 1, to: 3, order: 1 },
      { from: 1, to: 4, order: 1 },
      { from: 4, to: 5, order: 1 },
      { from: 5, to: 6, order: 1 },
      { from: 6, to: 7, order: 1 },
      { from: 7, to: 8, order: 2 },
      { from: 8, to: 9, order: 1 },
      { from: 9, to: 10, order: 2 },
      { from: 10, to: 11, order: 1 },
      { from: 11, to: 6, order: 1 },
      { from: 9, to: 12, order: 1 },
      { from: 11, to: 13, order: 1 },
      { from: 13, to: 14, order: 2 },
      { from: 15, to: 16, order: 2 },
      { from: 15, to: 17, order: 1 }
    ]
  },
  {
    id: 'glucose',
    name: 'D-Glucose',
    formula: 'C₆H₁₂O₆',
    iupac: '(2R,3S,4R,5R)-2,3,4,5,6-Pentahydroxyhexanal',
    smiles: 'C([C@@H]1[C@H]([C@@H]([C@H](C(O1)O)O)O)O)O',
    molWeight: '180.16 g/mol',
    category: 'Monosaccharide',
    description: 'Primary energy source for biological metabolism. Exists as a pyranose chair ring structure in aqueous equilibrium.',
    atoms: [
      { id: 1, element: 'C', x: 1.18, y: -0.22, z: 0.15 },
      { id: 2, element: 'C', x: 0.42, y: 1.07, z: -0.15 },
      { id: 3, element: 'C', x: -1.07, y: 0.95, z: 0.20 },
      { id: 4, element: 'C', x: -1.68, y: -0.38, z: -0.25 },
      { id: 5, element: 'C', x: -0.85, y: -1.56, z: 0.25 },
      { id: 6, element: 'O', x: 0.52, y: -1.40, z: -0.18 },
      { id: 7, element: 'O', x: 2.50, y: -0.15, z: -0.38 },
      { id: 8, element: 'O', x: 1.05, y: 2.19, z: 0.45 },
      { id: 9, element: 'O', x: -1.75, y: 2.06, z: -0.36 },
      { id: 10, element: 'O', x: -3.03, y: -0.45, z: 0.20 },
      { id: 11, element: 'C', x: -1.38, y: -2.90, z: -0.25 },
      { id: 12, element: 'O', x: -0.58, y: -3.95, z: 0.28 },
      { id: 13, element: 'H', x: 1.19, y: -0.36, z: 1.25 },
      { id: 14, element: 'H', x: 0.45, y: 1.20, z: -1.25 },
      { id: 15, element: 'H', x: -1.13, y: 0.98, z: 1.30 },
      { id: 16, element: 'H', x: -1.66, y: -0.43, z: -1.35 },
      { id: 17, element: 'H', x: -0.90, y: -1.59, z: 1.35 },
      { id: 18, element: 'H', x: 2.91, y: 0.65, z: -0.10 },
      { id: 19, element: 'H', x: 0.60, y: 2.97, z: 0.15 },
      { id: 20, element: 'H', x: -1.35, y: 2.87, z: -0.10 },
      { id: 21, element: 'H', x: -3.42, y: 0.38, z: -0.05 },
      { id: 22, element: 'H', x: -1.38, y: -2.96, z: -1.35 },
      { id: 23, element: 'H', x: -2.43, y: -3.00, z: 0.10 },
      { id: 24, element: 'H', x: -0.85, y: -4.80, z: -0.05 }
    ],
    bonds: [
      { from: 1, to: 2, order: 1 }, { from: 2, to: 3, order: 1 },
      { from: 3, to: 4, order: 1 }, { from: 4, to: 5, order: 1 },
      { from: 5, to: 6, order: 1 }, { from: 6, to: 1, order: 1 },
      { from: 1, to: 7, order: 1 }, { from: 2, to: 8, order: 1 },
      { from: 3, to: 9, order: 1 }, { from: 4, to: 10, order: 1 },
      { from: 5, to: 11, order: 1 }, { from: 11, to: 12, order: 1 },
      { from: 1, to: 13, order: 1 }, { from: 2, to: 14, order: 1 },
      { from: 3, to: 15, order: 1 }, { from: 4, to: 16, order: 1 },
      { from: 5, to: 17, order: 1 }, { from: 7, to: 18, order: 1 },
      { from: 8, to: 19, order: 1 }, { from: 9, to: 20, order: 1 },
      { from: 10, to: 21, order: 1 }, { from: 11, to: 22, order: 1 },
      { from: 11, to: 23, order: 1 }, { from: 12, to: 24, order: 1 }
    ]
  },
  {
    id: 'buckyball',
    name: 'Buckminsterfullerene',
    formula: 'C₆₀',
    iupac: '(C60-Ih)[5,6]fullerene',
    smiles: 'C12=C3C4=C5C6=C1C7=C8C9=C2C1=C3C2=C3C4=C4C5=C5...',
    molWeight: '720.64 g/mol',
    category: 'Allotrope of Carbon',
    description: 'Truncated icosahedron spherical cage molecule resembling a soccer ball, composed of 20 hexagons and 12 pentagons of sp2 hybridized carbon.',
    atoms: generateBuckyballAtoms(),
    bonds: generateBuckyballBonds()
  }
];

// Helper to generate C60 geodesic sphere coordinates
function generateBuckyballAtoms() {
  const phi = (1 + Math.sqrt(5)) / 2;
  const radius = 2.4;
  const rawCoords = [
    [0, 1, 3 * phi], [0, 1, -3 * phi], [0, -1, 3 * phi], [0, -1, -3 * phi],
    [1, 3 * phi, 0], [1, -3 * phi, 0], [-1, 3 * phi, 0], [-1, -3 * phi, 0],
    [3 * phi, 0, 1], [3 * phi, 0, -1], [-3 * phi, 0, 1], [-3 * phi, 0, -1],
    [2, 1 + 2 * phi, phi], [2, 1 + 2 * phi, -phi], [-2, 1 + 2 * phi, phi], [-2, 1 + 2 * phi, -phi],
    [2, -(1 + 2 * phi), phi], [2, -(1 + 2 * phi), -phi], [-2, -(1 + 2 * phi), phi], [-2, -(1 + 2 * phi), -phi],
    [1 + 2 * phi, phi, 2], [1 + 2 * phi, phi, -2], [1 + 2 * phi, -phi, 2], [1 + 2 * phi, -phi, -2],
    [-(1 + 2 * phi), phi, 2], [-(1 + 2 * phi), phi, -2], [-(1 + 2 * phi), -phi, 2], [-(1 + 2 * phi), -phi, -2],
    [phi, 2, 1 + 2 * phi], [phi, 2, -(1 + 2 * phi)], [phi, -2, 1 + 2 * phi], [phi, -2, -(1 + 2 * phi)],
    [-phi, 2, 1 + 2 * phi], [-phi, 2, -(1 + 2 * phi)], [-phi, -2, 1 + 2 * phi], [-phi, -2, -(1 + 2 * phi)]
  ];

  return rawCoords.map((c, i) => {
    const len = Math.sqrt(c[0] * c[0] + c[1] * c[1] + c[2] * c[2]);
    return {
      id: i + 1,
      element: 'C',
      x: (c[0] / len) * radius,
      y: (c[1] / len) * radius,
      z: (c[2] / len) * radius
    };
  });
}

function generateBuckyballBonds() {
  const atoms = generateBuckyballAtoms();
  const bonds = [];
  let bondId = 1;
  const cutoffSq = 2.2 * 2.2;

  for (let i = 0; i < atoms.length; i++) {
    for (let j = i + 1; j < atoms.length; j++) {
      const dx = atoms[i].x - atoms[j].x;
      const dy = atoms[i].y - atoms[j].y;
      const dz = atoms[i].z - atoms[j].z;
      const distSq = dx * dx + dy * dy + dz * dz;

      if (distSq < cutoffSq) {
        bonds.push({ from: atoms[i].id, to: atoms[j].id, order: 1 });
        bondId++;
      }
    }
  }
  return bonds;
}
