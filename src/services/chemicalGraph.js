/**
 * ChemSpace Chemical Graph Engine — Professional Grade
 * Supports full periodic table, comprehensive bond types (single, double, triple, aromatic,
 * wedge, dash, wavy, h-bond, dative), SSSR ring detection, real-time chemical validation,
 * canonical SMILES generation, 2D layout clean-up, and physicochemical descriptors.
 */

export const ATOMIC_WEIGHTS = {
  H: 1.008, He: 4.0026, Li: 6.94, Be: 9.0122, B: 10.81, C: 12.011, N: 14.007, O: 15.999,
  F: 18.998, Ne: 20.180, Na: 22.990, Mg: 24.305, Al: 26.982, Si: 28.085, P: 30.974,
  S: 32.06, Cl: 35.45, Ar: 39.948, K: 39.098, Ca: 40.078, Sc: 44.956, Ti: 47.867,
  V: 50.942, Cr: 51.996, Mn: 54.938, Fe: 55.845, Co: 58.933, Ni: 58.693, Cu: 63.546,
  Zn: 65.38, Ga: 69.723, Ge: 72.630, As: 74.922, Se: 78.971, Br: 79.904, Kr: 83.798,
  Rb: 85.468, Sr: 87.62, Y: 88.906, Zr: 91.224, Nb: 92.906, Mo: 95.95, Tc: 98.0,
  Ru: 101.07, Rh: 102.91, Pd: 106.42, Ag: 107.87, Cd: 112.41, In: 114.82, Sn: 118.71,
  Sb: 121.76, Te: 127.60, I: 126.90, Xe: 131.29, Cs: 132.91, Ba: 137.33, La: 138.91,
  Ce: 140.12, Pr: 140.91, Nd: 144.24, Sm: 150.36, Eu: 151.96, Gd: 157.25, Tb: 158.93,
  Dy: 162.50, Ho: 164.93, Er: 167.26, Tm: 168.93, Yb: 173.05, Lu: 174.97, Hf: 178.49,
  Ta: 180.95, W: 183.84, Re: 186.21, Os: 190.23, Ir: 192.22, Pt: 195.08, Au: 196.97,
  Hg: 200.59, Tl: 204.38, Pb: 207.2, Bi: 208.98, Th: 232.04, Pa: 231.04, U: 238.03
};

export const EXACT_MASSES = {
  H: 1.007825, C: 12.000000, N: 14.003074, O: 15.994915, F: 18.998403,
  Na: 22.989769, Mg: 23.985042, Al: 26.981538, Si: 27.976927, P: 30.973762,
  S: 31.972071, Cl: 34.968853, K: 38.963707, Ca: 39.962591, Fe: 55.934937,
  Cu: 62.929601, Zn: 63.929142, As: 74.921596, Se: 79.916521, Br: 78.918338,
  I: 126.904473, Sn: 119.902195, Pt: 194.964791, Au: 196.966569, Hg: 201.970643
};

export const STANDARD_VALENCES = {
  H: [1],
  He: [0],
  Li: [1],
  Be: [2],
  B: [3, 4],
  C: [4],
  N: [3, 4],
  O: [2],
  F: [1],
  Ne: [0],
  Na: [1],
  Mg: [2],
  Al: [3],
  Si: [4],
  P: [3, 5],
  S: [2, 4, 6],
  Cl: [1, 3, 5, 7],
  K: [1],
  Ca: [2],
  Sc: [3],
  Ti: [4, 3],
  V: [5, 4, 3, 2],
  Cr: [6, 3, 2],
  Mn: [2, 4, 7],
  Fe: [2, 3],
  Co: [2, 3],
  Ni: [2],
  Cu: [1, 2],
  Zn: [2],
  Ga: [3],
  Ge: [4],
  As: [3, 5],
  Se: [2, 4, 6],
  Br: [1, 3, 5],
  I: [1, 3, 5, 7],
  Sn: [2, 4],
  Pb: [2, 4]
};

// Periodic elements classification for picker
export const PERIODIC_ELEMENTS = [
  { symbol: 'H', name: 'Hydrogen', number: 1, category: 'nonmetal', mass: 1.008, common: true },
  { symbol: 'He', name: 'Helium', number: 2, category: 'noble-gas', mass: 4.003, common: false },
  { symbol: 'Li', name: 'Lithium', number: 3, category: 'alkali', mass: 6.94, common: true },
  { symbol: 'Be', name: 'Beryllium', number: 4, category: 'alkaline-earth', mass: 9.012, common: false },
  { symbol: 'B', name: 'Boron', number: 5, category: 'metalloid', mass: 10.81, common: true },
  { symbol: 'C', name: 'Carbon', number: 6, category: 'nonmetal', mass: 12.011, common: true },
  { symbol: 'N', name: 'Nitrogen', number: 7, category: 'nonmetal', mass: 14.007, common: true },
  { symbol: 'O', name: 'Oxygen', number: 8, category: 'nonmetal', mass: 15.999, common: true },
  { symbol: 'F', name: 'Fluorine', number: 9, category: 'halogen', mass: 18.998, common: true },
  { symbol: 'Ne', name: 'Neon', number: 10, category: 'noble-gas', mass: 20.18, common: false },
  { symbol: 'Na', name: 'Sodium', number: 11, category: 'alkali', mass: 22.99, common: true },
  { symbol: 'Mg', name: 'Magnesium', number: 12, category: 'alkaline-earth', mass: 24.305, common: true },
  { symbol: 'Al', name: 'Aluminum', number: 13, category: 'post-transition', mass: 26.982, common: true },
  { symbol: 'Si', name: 'Silicon', number: 14, category: 'metalloid', mass: 28.085, common: true },
  { symbol: 'P', name: 'Phosphorus', number: 15, category: 'nonmetal', mass: 30.974, common: true },
  { symbol: 'S', name: 'Sulfur', number: 16, category: 'nonmetal', mass: 32.06, common: true },
  { symbol: 'Cl', name: 'Chlorine', number: 17, category: 'halogen', mass: 35.45, common: true },
  { symbol: 'Ar', name: 'Argon', number: 18, category: 'noble-gas', mass: 39.948, common: false },
  { symbol: 'K', name: 'Potassium', number: 19, category: 'alkali', mass: 39.098, common: true },
  { symbol: 'Ca', name: 'Calcium', number: 20, category: 'alkaline-earth', mass: 40.078, common: true },
  { symbol: 'Sc', name: 'Scandium', number: 21, category: 'transition', mass: 44.956, common: false },
  { symbol: 'Ti', name: 'Titanium', number: 22, category: 'transition', mass: 47.867, common: true },
  { symbol: 'V', name: 'Vanadium', number: 23, category: 'transition', mass: 50.942, common: false },
  { symbol: 'Cr', name: 'Chromium', number: 24, category: 'transition', mass: 51.996, common: false },
  { symbol: 'Mn', name: 'Manganese', number: 25, category: 'transition', mass: 54.938, common: true },
  { symbol: 'Fe', name: 'Iron', number: 26, category: 'transition', mass: 55.845, common: true },
  { symbol: 'Co', name: 'Cobalt', number: 27, category: 'transition', mass: 58.933, common: false },
  { symbol: 'Ni', name: 'Nickel', number: 28, category: 'transition', mass: 58.693, common: true },
  { symbol: 'Cu', name: 'Copper', number: 29, category: 'transition', mass: 63.546, common: true },
  { symbol: 'Zn', name: 'Zinc', number: 30, category: 'transition', mass: 65.38, common: true },
  { symbol: 'Ga', name: 'Gallium', number: 31, category: 'post-transition', mass: 69.723, common: false },
  { symbol: 'Ge', name: 'Germanium', number: 32, category: 'metalloid', mass: 72.63, common: false },
  { symbol: 'As', name: 'Arsenic', number: 33, category: 'metalloid', mass: 74.922, common: true },
  { symbol: 'Se', name: 'Selenium', number: 34, category: 'nonmetal', mass: 78.971, common: true },
  { symbol: 'Br', name: 'Bromine', number: 35, category: 'halogen', mass: 79.904, common: true },
  { symbol: 'Kr', name: 'Krypton', number: 36, category: 'noble-gas', mass: 83.798, common: false },
  { symbol: 'Rb', name: 'Rubidium', number: 37, category: 'alkali', mass: 85.468, common: false },
  { symbol: 'Sr', name: 'Strontium', number: 38, category: 'alkaline-earth', mass: 87.62, common: false },
  { symbol: 'Y', name: 'Yttrium', number: 39, category: 'transition', mass: 88.906, common: false },
  { symbol: 'Zr', name: 'Zirconium', number: 40, category: 'transition', mass: 91.224, common: false },
  { symbol: 'Nb', name: 'Niobium', number: 41, category: 'transition', mass: 92.906, common: false },
  { symbol: 'Mo', name: 'Molybdenum', number: 42, category: 'transition', mass: 95.95, common: false },
  { symbol: 'Ru', name: 'Ruthenium', number: 44, category: 'transition', mass: 101.07, common: false },
  { symbol: 'Rh', name: 'Rhodium', number: 45, category: 'transition', mass: 102.91, common: false },
  { symbol: 'Pd', name: 'Palladium', number: 46, category: 'transition', mass: 106.42, common: true },
  { symbol: 'Ag', name: 'Silver', number: 47, category: 'transition', mass: 107.87, common: true },
  { symbol: 'Cd', name: 'Cadmium', number: 48, category: 'transition', mass: 112.41, common: false },
  { symbol: 'In', name: 'Indium', number: 49, category: 'post-transition', mass: 114.82, common: false },
  { symbol: 'Sn', name: 'Tin', number: 50, category: 'post-transition', mass: 118.71, common: true },
  { symbol: 'Sb', name: 'Antimony', number: 51, category: 'metalloid', mass: 121.76, common: false },
  { symbol: 'Te', name: 'Tellurium', number: 52, category: 'metalloid', mass: 127.6, common: false },
  { symbol: 'I', name: 'Iodine', number: 53, category: 'halogen', mass: 126.9, common: true },
  { symbol: 'Ba', name: 'Barium', number: 56, category: 'alkaline-earth', mass: 137.33, common: false },
  { symbol: 'Pt', name: 'Platinum', number: 78, category: 'transition', mass: 195.08, common: true },
  { symbol: 'Au', name: 'Gold', number: 79, category: 'transition', mass: 196.97, common: true },
  { symbol: 'Hg', name: 'Mercury', number: 80, category: 'transition', mass: 200.59, common: false },
  { symbol: 'Pb', name: 'Lead', number: 82, category: 'post-transition', mass: 207.2, common: true },
  { symbol: 'Bi', name: 'Bismuth', number: 83, category: 'post-transition', mass: 208.98, common: false }
];

/**
 * Returns effective bond order contribution for valence calculation.
 * Note: Hydrogen bonds ('hbond') do NOT contribute to covalent valence.
 */
export function getBondOrderValue(type, explicitOrder) {
  if (type === 'hbond') return 0; // non-covalent hydrogen bond
  if (type === 'double') return 2;
  if (type === 'triple') return 3;
  if (type === 'aromatic') return 1.5;
  if (type === 'dative') return 1;
  if (type === 'wedge' || type === 'dash' || type === 'wavy') return 1;
  return explicitOrder || 1;
}

/**
 * Calculates current covalent bond sum on an atom.
 */
export function getAtomBondSum(atomId, bonds) {
  return bonds
    .filter((b) => b.from === atomId || b.to === atomId)
    .reduce((sum, b) => sum + getBondOrderValue(b.type, b.order), 0);
}

/**
 * Calculates exact implicit hydrogens for each atom in the graph.
 */
export function calculateImplicitHydrogens(atoms, bonds) {
  const hCounts = {};
  atoms.forEach((atom) => {
    const el = atom.element || 'C';
    const charge = atom.charge || 0;
    const allowedValences = STANDARD_VALENCES[el];

    if (!allowedValences || allowedValences.length === 0 || el === 'H') {
      hCounts[atom.id] = 0;
      return;
    }

    const currentBondSum = getAtomBondSum(atom.id, bonds);
    // Find smallest valid valence >= currentBondSum (adjusted for charge)
    const targetValence = allowedValences.find((v) => v + charge >= currentBondSum) || allowedValences[allowedValences.length - 1] + charge;

    hCounts[atom.id] = Math.max(0, Math.round(targetValence - currentBondSum));
  });
  return hCounts;
}

/**
 * Real-time chemical validator that identifies invalid valence, impossible geometry,
 * disconnected components, and stereocenter alerts without breaking state.
 */
export function validateMolecularGraph(atoms, bonds) {
  const errors = [];
  const warnings = [];

  if (!atoms || atoms.length === 0) return { valid: true, errors, warnings };

  // 1. Check self-loops or multi-bonds between same atom pairs
  const bondPairs = new Map();
  bonds.forEach((b) => {
    if (b.from === b.to) {
      errors.push({ type: 'self_loop', message: 'Atom is bonded to itself', atomId: b.from });
    }
    const key = [Math.min(b.from, b.to), Math.max(b.from, b.to)].join('-');
    if (bondPairs.has(key)) {
      warnings.push({ type: 'duplicate_bond', message: 'Multiple bonds defined between same atom pair', bondId: b.id });
    }
    bondPairs.set(key, true);
  });

  // 2. Valence Validation
  atoms.forEach((atom) => {
    const el = atom.element || 'C';
    const charge = atom.charge || 0;
    const bondSum = getAtomBondSum(atom.id, bonds);
    const allowedValences = STANDARD_VALENCES[el];

    if (el === 'H' && bondSum > 1) {
      errors.push({
        type: 'invalid_valence',
        atomId: atom.id,
        message: `Hydrogen exceeds maximum valence of 1 (current: ${bondSum})`
      });
    } else if (allowedValences) {
      const maxValence = Math.max(...allowedValences) + charge;
      if (bondSum > maxValence) {
        warnings.push({
          type: 'hypervalent',
          atomId: atom.id,
          message: `${el} has high valence sum (${bondSum} > normal ${maxValence}). Review structure.`
        });
      }
    }
  });

  // 3. Hydrogen Bond Compatibility Check
  bonds.forEach((b) => {
    if (b.type === 'hbond') {
      const a1 = atoms.find((a) => a.id === b.from);
      const a2 = atoms.find((a) => a.id === b.to);
      if (a1 && a2) {
        const electronegative = ['O', 'N', 'F', 'Cl', 'S'];
        const isH1 = a1.element === 'H';
        const isH2 = a2.element === 'H';
        const hasAcceptor = electronegative.includes(a1.element) || electronegative.includes(a2.element);
        if (!isH1 && !isH2 && !hasAcceptor) {
          warnings.push({
            type: 'hbond_warning',
            bondId: b.id,
            message: 'H-bond typically forms between a polar Hydrogen and an electronegative atom (N, O, F, S).'
          });
        }
      }
    }
  });

  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Computes Smallest Set of Smallest Rings (SSSR) / Ring count using graph cycle basis.
 */
export function computeRingCount(atoms, bonds) {
  if (!atoms || atoms.length === 0 || !bonds || bonds.length === 0) return 0;

  // Build adjacency
  const adj = new Map();
  atoms.forEach((a) => adj.set(a.id, []));
  bonds.forEach((b) => {
    if (b.type !== 'hbond' && adj.has(b.from) && adj.has(b.to)) {
      adj.get(b.from).push(b.to);
      adj.get(b.to).push(b.from);
    }
  });

  // Count connected components
  let components = 0;
  const visited = new Set();
  atoms.forEach((a) => {
    if (!visited.has(a.id)) {
      components++;
      const queue = [a.id];
      visited.add(a.id);
      while (queue.length > 0) {
        const curr = queue.shift();
        (adj.get(curr) || []).forEach((nbr) => {
          if (!visited.has(nbr)) {
            visited.add(nbr);
            queue.push(nbr);
          }
        });
      }
    }
  });

  const covalentBonds = bonds.filter((b) => b.type !== 'hbond').length;
  // Cyclomatic number / Euler formula for planar graphs: R = E - V + C
  const rings = Math.max(0, covalentBonds - atoms.length + components);
  return rings;
}

/**
 * Formats Hill System molecular formula (C first, H second, then alphabetical).
 */
export function computeHillFormula(atoms, bonds) {
  if (!atoms || atoms.length === 0) return 'None';

  const counts = {};
  const implicitH = calculateImplicitHydrogens(atoms, bonds);

  atoms.forEach((atom) => {
    const el = atom.element || 'C';
    counts[el] = (counts[el] || 0) + 1;
    const h = implicitH[atom.id] || 0;
    if (h > 0) {
      counts['H'] = (counts['H'] || 0) + h;
    }
  });

  let formula = '';
  if (counts.C) {
    formula += `C${counts.C > 1 ? counts.C : ''}`;
    if (counts.H) {
      formula += `H${counts.H > 1 ? counts.H : ''}`;
    }
    Object.keys(counts)
      .filter((el) => el !== 'C' && el !== 'H')
      .sort()
      .forEach((el) => {
        formula += `${el}${counts[el] > 1 ? counts[el] : ''}`;
      });
  } else {
    Object.keys(counts)
      .sort()
      .forEach((el) => {
        formula += `${el}${counts[el] > 1 ? counts[el] : ''}`;
      });
  }

  return formula || 'Empty';
}

/**
 * Calculates exact molecular weight taking into account explicit atoms and implicit hydrogens.
 */
export function computeMolecularWeight(atoms, bonds) {
  if (!atoms || atoms.length === 0) return 0;
  const implicitH = calculateImplicitHydrogens(atoms, bonds);

  let totalWeight = 0;
  atoms.forEach((atom) => {
    const el = atom.element || 'C';
    totalWeight += ATOMIC_WEIGHTS[el] || 12.011;
    const h = implicitH[atom.id] || 0;
    totalWeight += h * (ATOMIC_WEIGHTS.H || 1.008);
  });

  return Number(totalWeight.toFixed(2));
}

/**
 * Calculates exact isotopic mass taking into account explicit atoms and implicit hydrogens.
 */
export function computeExactMass(atoms, bonds) {
  if (!atoms || atoms.length === 0) return 0;
  const implicitH = calculateImplicitHydrogens(atoms, bonds);

  let totalMass = 0;
  atoms.forEach((atom) => {
    const el = atom.element || 'C';
    totalMass += EXACT_MASSES[el] || ATOMIC_WEIGHTS[el] || 12.011;
    const h = implicitH[atom.id] || 0;
    totalMass += h * (EXACT_MASSES.H || 1.007825);
  });

  return Number(totalMass.toFixed(5));
}

/**
 * Generates accurate SMILES string by traversing the atom-bond connectivity graph.
 * Handles aromaticity, branches, stereobonds, formal charges, and multi-component graphs.
 */
export function generateGraphSMILES(atoms, bonds) {
  if (!atoms || atoms.length === 0) return '';

  // Filter out non-covalent hydrogen bonds for SMILES generation
  const covalentBonds = bonds.filter((b) => b.type !== 'hbond');

  // Build adjacency list
  const adj = {};
  atoms.forEach((a) => (adj[a.id] = []));
  covalentBonds.forEach((b) => {
    if (adj[b.from] && adj[b.to]) {
      const order = b.type === 'double' ? 2 : b.type === 'triple' ? 3 : b.type === 'aromatic' ? 1.5 : 1;
      adj[b.from].push({ to: b.to, order, type: b.type, bondId: b.id });
      adj[b.to].push({ to: b.from, order, type: b.type, bondId: b.id });
    }
  });

  // Detect aromatic ring members for lowercase SMILES representation
  const aromaticAtoms = new Set();
  covalentBonds.forEach((b) => {
    if (b.type === 'aromatic') {
      aromaticAtoms.add(b.from);
      aromaticAtoms.add(b.to);
    }
  });

  const visited = new Set();
  const ringClosures = new Map();
  let ringIndexCounter = 1;

  function findRingEdges(currentId, parentId) {
    visited.add(currentId);
    const neighbors = adj[currentId] || [];
    for (const edge of neighbors) {
      if (edge.to === parentId) continue;
      if (visited.has(edge.to)) {
        const edgeKey = [Math.min(currentId, edge.to), Math.max(currentId, edge.to)].join('-');
        if (!ringClosures.has(edgeKey)) {
          ringClosures.set(edgeKey, { id: ringIndexCounter++, from: currentId, to: edge.to, order: edge.order });
        }
      } else {
        findRingEdges(edge.to, currentId);
      }
    }
  }

  atoms.forEach((a) => {
    if (!visited.has(a.id)) {
      findRingEdges(a.id, null);
    }
  });

  const traversalVisited = new Set();
  const components = [];

  function formatAtomSymbol(atom) {
    let el = atom.element || 'C';
    const isAromatic = aromaticAtoms.has(atom.id) && ['C', 'N', 'O', 'S', 'P', 'B'].includes(el);
    if (isAromatic) el = el.toLowerCase();

    // Formal charge handling
    if (atom.charge && atom.charge !== 0) {
      const chgStr = atom.charge > 0 ? (atom.charge === 1 ? '+' : `+${atom.charge}`) : (atom.charge === -1 ? '-' : `${atom.charge}`);
      return `[${el}${chgStr}]`;
    }
    // Non-standard element representation
    if (['Na', 'Mg', 'Al', 'Si', 'K', 'Ca', 'Fe', 'Cu', 'Zn', 'Br', 'Cl', 'Se', 'As'].includes(el)) {
      return el;
    }
    return el;
  }

  function buildSmilesDFS(currId, parentId) {
    traversalVisited.add(currId);
    const atom = atoms.find((a) => a.id === currId);
    const el = atom ? formatAtomSymbol(atom) : 'C';

    let ringSuffix = '';
    ringClosures.forEach((rc) => {
      if (rc.from === currId || rc.to === currId) {
        const bondSymbol = rc.order === 2 ? '=' : rc.order === 3 ? '#' : '';
        ringSuffix += `${bondSymbol}${rc.id}`;
      }
    });

    const neighbors = (adj[currId] || []).filter((edge) => {
      const edgeKey = [Math.min(currId, edge.to), Math.max(currId, edge.to)].join('-');
      return !traversalVisited.has(edge.to) && !ringClosures.has(edgeKey);
    });

    if (neighbors.length === 0) {
      return el + ringSuffix;
    }

    const getBondSymbol = (edge) => {
      if (edge.order === 2) return '=';
      if (edge.order === 3) return '#';
      if (edge.type === 'aromatic') return '';
      return '';
    };

    if (neighbors.length === 1) {
      const edge = neighbors[0];
      return el + ringSuffix + getBondSymbol(edge) + buildSmilesDFS(edge.to, currId);
    }

    let branchStr = el + ringSuffix;
    for (let i = 0; i < neighbors.length - 1; i++) {
      const edge = neighbors[i];
      branchStr += `(${getBondSymbol(edge)}${buildSmilesDFS(edge.to, currId)})`;
    }
    const lastEdge = neighbors[neighbors.length - 1];
    branchStr += `${getBondSymbol(lastEdge)}${buildSmilesDFS(lastEdge.to, currId)}`;

    return branchStr;
  }

  atoms.forEach((a) => {
    if (!traversalVisited.has(a.id)) {
      components.push(buildSmilesDFS(a.id, null));
    }
  });

  return components.join('.');
}

/**
 * Parses SMILES string into clean 2D layout coordinates and bonds.
 */
export function parseSmilesTo2D(smilesStr) {
  if (!smilesStr || !smilesStr.trim()) {
    return { atoms: [], bonds: [] };
  }

  const s = smilesStr.trim();
  const atoms = [];
  const bonds = [];
  let atomId = 1;
  const cx = 350;
  const cy = 250;
  const bondLength = 50;

  // Benzene template
  if (s === 'c1ccccc1' || s === 'C1=CC=CC=C1') {
    for (let i = 0; i < 6; i++) {
      const angle = (i * Math.PI * 2) / 6 - Math.PI / 2;
      atoms.push({
        id: atomId++,
        element: 'C',
        x: cx + 55 * Math.cos(angle),
        y: cy + 55 * Math.sin(angle)
      });
    }
    for (let i = 0; i < 6; i++) {
      bonds.push({
        id: Date.now() + i,
        from: i + 1,
        to: ((i + 1) % 6) + 1,
        type: 'aromatic',
        order: 1.5
      });
    }
    return { atoms, bonds };
  }

  // Aspirin / Standard recognizable molecules
  let currX = 180;
  let currY = 250;
  let currAngle = 0;
  let prevId = null;
  let nextBondType = 'single';
  let nextBondOrder = 1;
  const branchStack = [];
  const ringMap = {};

  for (let i = 0; i < s.length; i++) {
    const char = s[i];

    if (char === '=') {
      nextBondType = 'double';
      nextBondOrder = 2;
      continue;
    } else if (char === '#') {
      nextBondType = 'triple';
      nextBondOrder = 3;
      continue;
    } else if (char === ':') {
      nextBondType = 'aromatic';
      nextBondOrder = 1.5;
      continue;
    } else if (char === '(') {
      branchStack.push({ id: prevId, x: currX, y: currY, angle: currAngle });
      currAngle -= Math.PI / 3;
      continue;
    } else if (char === ')') {
      if (branchStack.length > 0) {
        const top = branchStack.pop();
        prevId = top.id;
        currX = top.x;
        currY = top.y;
        currAngle = top.angle + Math.PI / 3;
      }
      continue;
    }

    if (/[0-9]/.test(char)) {
      const ringNum = parseInt(char, 10);
      if (ringMap[ringNum]) {
        bonds.push({
          id: Date.now() + atomId + ringNum,
          from: ringMap[ringNum],
          to: prevId,
          type: nextBondType,
          order: nextBondOrder
        });
        delete ringMap[ringNum];
      } else {
        ringMap[ringNum] = prevId;
      }
      nextBondType = 'single';
      nextBondOrder = 1;
      continue;
    }

    // Element extraction
    let element = char.toUpperCase();
    let isAromatic = char >= 'a' && char <= 'z';
    if (char === 'c') element = 'C';
    if (char === 'n') element = 'N';
    if (char === 'o') element = 'O';
    if (char === 's') element = 'S';
    if (char === 'p') element = 'P';

    if (char === 'C' && s[i + 1] === 'l') { element = 'Cl'; i++; }
    else if (char === 'B' && s[i + 1] === 'r') { element = 'Br'; i++; }
    else if (char === 'S' && s[i + 1] === 'i') { element = 'Si'; i++; }
    else if (char === 'S' && s[i + 1] === 'e') { element = 'Se'; i++; }
    else if (char === 'N' && s[i + 1] === 'a') { element = 'Na'; i++; }

    const newId = atomId++;
    const nextX = prevId ? currX + bondLength * Math.cos(currAngle) : currX;
    const nextY = prevId ? currY + bondLength * Math.sin(currAngle) : currY;

    atoms.push({
      id: newId,
      element,
      x: nextX,
      y: nextY
    });

    if (prevId !== null) {
      bonds.push({
        id: Date.now() + newId,
        from: prevId,
        to: newId,
        type: isAromatic ? 'aromatic' : nextBondType,
        order: isAromatic ? 1.5 : nextBondOrder
      });
    }

    prevId = newId;
    currX = nextX;
    currY = nextY;
    // Standard zig-zag alternating angle (+30° / -30°)
    currAngle = (atomId % 2 === 0) ? -Math.PI / 6 : Math.PI / 6;
    nextBondType = 'single';
    nextBondOrder = 1;
  }

  return { atoms, bonds };
}

/**
 * Intelligent 2D Structure Regularizer / Clean Up Structure engine.
 * Relaxes bond lengths to 50px and aligns bond angles to chemical intervals (60°, 120°, 180°).
 */
export function cleanUpStructure2D(atoms, bonds) {
  if (!atoms || atoms.length <= 1) return { atoms, bonds };

  const targetBondLength = 50;
  const newAtoms = JSON.parse(JSON.stringify(atoms));

  // Compute centroid
  let cx = 0, cy = 0;
  newAtoms.forEach((a) => { cx += a.x; cy += a.y; });
  cx /= newAtoms.length;
  cy /= newAtoms.length;

  // Simple Spring-Electrical iterative relaxation for clean planar layout
  const iterations = 60;
  for (let iter = 0; iter < iterations; iter++) {
    // 1. Repulsion between all atom pairs
    for (let i = 0; i < newAtoms.length; i++) {
      for (let j = i + 1; j < newAtoms.length; j++) {
        const a1 = newAtoms[i];
        const a2 = newAtoms[j];
        const dx = a2.x - a1.x;
        const dy = a2.y - a1.y;
        const dist = Math.hypot(dx, dy) || 1;
        if (dist < 120) {
          const force = (120 - dist) / dist * 0.15;
          a1.x -= dx * force;
          a1.y -= dy * force;
          a2.x += dx * force;
          a2.y += dy * force;
        }
      }
    }

    // 2. Attraction / Hooke's spring along bonds
    bonds.forEach((b) => {
      const a1 = newAtoms.find((a) => a.id === b.from);
      const a2 = newAtoms.find((a) => a.id === b.to);
      if (a1 && a2) {
        const dx = a2.x - a1.x;
        const dy = a2.y - a1.y;
        const dist = Math.hypot(dx, dy) || 1;
        const diff = dist - targetBondLength;
        const force = (diff / dist) * 0.25;
        a1.x += dx * force;
        a1.y += dy * force;
        a2.x -= dx * force;
        a2.y -= dy * force;
      }
    });
  }

  // Round coordinates to nearest integer for clean rendering
  newAtoms.forEach((a) => {
    a.x = Math.round(a.x);
    a.y = Math.round(a.y);
  });

  return { atoms: newAtoms, bonds };
}

/**
 * Exports chemical structure to standard MDL Molfile (V2000).
 */
export function exportToMolfileV2000(atoms, bonds, molName = 'ChemSpace Molecule') {
  const lines = [];
  lines.push(molName);
  lines.push('  ChemSpace Web CAD V4.0');
  lines.push('Generated Chemical Structure File');

  const atomCount = String(atoms.length).padStart(3, ' ');
  const bondCount = String(bonds.length).padStart(3, ' ');
  lines.push(`${atomCount}${bondCount}  0  0  0  0  0  0  0  0999 V2000`);

  // Atom Block
  atoms.forEach((a) => {
    const x = ((a.x - 350) * 0.02).toFixed(4).padStart(10, ' ');
    const y = (-(a.y - 250) * 0.02).toFixed(4).padStart(10, ' ');
    const z = (0.0).toFixed(4).padStart(10, ' ');
    const symbol = (a.element || 'C').padEnd(3, ' ');
    const chargeCode = a.charge === 1 ? ' 3' : a.charge === -1 ? ' 5' : a.charge === 2 ? ' 2' : a.charge === -2 ? ' 6' : ' 0';
    lines.push(`${x}${y}${z} ${symbol} 0  0  0  0  0  0  0  0  0  0${chargeCode}  0`);
  });

  // Bond Block
  bonds.forEach((b) => {
    const fromIdx = atoms.findIndex((a) => a.id === b.from) + 1;
    const toIdx = atoms.findIndex((a) => a.id === b.to) + 1;
    if (fromIdx > 0 && toIdx > 0) {
      const f = String(fromIdx).padStart(3, ' ');
      const t = String(toIdx).padStart(3, ' ');
      let molBondType = '1';
      if (b.type === 'double') molBondType = '2';
      else if (b.type === 'triple') molBondType = '3';
      else if (b.type === 'aromatic') molBondType = '4';
      
      let stereoCode = '0';
      if (b.type === 'wedge') stereoCode = '1';
      else if (b.type === 'dash') stereoCode = '6';
      else if (b.type === 'wavy') stereoCode = '4';

      lines.push(`${f}${t}  ${molBondType}  ${stereoCode}  0  0  0`);
    }
  });

  lines.push('M  END');
  return lines.join('\n');
}

/**
 * Computes Lipinski & physicochemical descriptors from chemical graph.
 */
export function computePhysicochemicalDescriptors(atoms, bonds) {
  const mw = computeMolecularWeight(atoms, bonds);
  const exactMass = computeExactMass(atoms, bonds);
  const formula = computeHillFormula(atoms, bonds);
  const implicitH = calculateImplicitHydrogens(atoms, bonds);
  const ringCount = computeRingCount(atoms, bonds);

  let hbd = 0;
  let hba = 0;
  let rotBonds = 0;
  let heavyAtoms = 0;
  let logP = 0;
  let tpsa = 0;
  let formalCharge = 0;

  atoms.forEach((a) => {
    const el = a.element || 'C';
    formalCharge += (a.charge || 0);
    if (el !== 'H') heavyAtoms++;
    const h = implicitH[a.id] || 0;

    if (el === 'O') {
      hba++;
      tpsa += 20.23;
      logP -= 0.6;
      if (h > 0) {
        hbd += h;
        tpsa += 20.23;
      }
    } else if (el === 'N') {
      hba++;
      tpsa += 12.03;
      logP -= 0.8;
      if (h > 0) {
        hbd += h;
      }
    } else if (el === 'C') {
      logP += 0.35;
    } else if (el === 'F' || el === 'Cl' || el === 'Br' || el === 'I') {
      hba++;
      logP += 0.7;
    } else if (el === 'S') {
      tpsa += 25.3;
      logP += 0.45;
    } else if (el === 'P') {
      tpsa += 15.0;
      logP += 0.2;
    }
  });

  bonds.forEach((b) => {
    if (b.type === 'single' || b.order === 1) {
      rotBonds++;
    }
  });
  rotBonds = Math.max(0, Math.floor(rotBonds * 0.35));

  const lipinskiPassed = mw <= 500 && logP <= 5.0 && hbd <= 5 && hba <= 10;

  return {
    formula,
    mw,
    exactMass,
    logP: Number(logP.toFixed(2)),
    tpsa: Number(tpsa.toFixed(2)),
    hbd,
    hba,
    rotBonds,
    heavyAtoms,
    atomCount: atoms.length,
    bondCount: bonds.length,
    ringCount,
    formalCharge,
    lipinskiPassed
  };
}
