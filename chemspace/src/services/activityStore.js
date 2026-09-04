/**
 * ChemSpace Activity & Telemetry Store
 * Manages persistent user activity logs, dynamic experiment telemetry,
 * and project history across all modules.
 */

const ACTIVITY_STORAGE_KEY = 'chemspace_recent_activity';
const PROJECTS_STORAGE_KEY = 'chemspace_project_stats';

const DEFAULT_ACTIVITIES = [
  {
    id: 'act_1',
    module: 'ChemDraw',
    title: 'Created Aspirin Derivative (2D Sketch)',
    detail: 'Formula C9H8O4, MW: 180.16 g/mol, MMFF94 conformer optimized',
    timestamp: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
    type: 'sketch'
  },
  {
    id: 'act_2',
    module: 'RDKit Lab',
    title: 'Executed Lipinski Rule of 5 Matrix',
    detail: 'Evaluated Caffeine pharmacophore, 0 violations detected (Passed)',
    timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    type: 'rdkit'
  },
  {
    id: 'act_3',
    module: 'Spectroscopy',
    title: 'Simulated FT-IR & 1H-NMR Spectra',
    detail: 'Deconvoluted Ethanol spectrum, identified O-H stretch at 3350 cm⁻¹',
    timestamp: new Date(Date.now() - 1000 * 60 * 110).toISOString(),
    type: 'spectroscopy'
  },
  {
    id: 'act_4',
    module: 'IBM RXN',
    title: 'Retrosynthesis Pathway Computed',
    detail: 'Predicted Fischer Esterification route with 94.2% predicted yield',
    timestamp: new Date(Date.now() - 1000 * 60 * 240).toISOString(),
    type: 'reaction'
  },
  {
    id: 'act_5',
    module: 'Quantum Calculator',
    title: 'DFT B3LYP Geometry Optimization',
    detail: 'Benzene total energy -232.245 Hartree, HOMO-LUMO gap 6.10 eV',
    timestamp: new Date(Date.now() - 1000 * 60 * 360).toISOString(),
    type: 'quantum'
  }
];

export function getRecentActivities() {
  try {
    const raw = localStorage.getItem(ACTIVITY_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(ACTIVITY_STORAGE_KEY, JSON.stringify(DEFAULT_ACTIVITIES));
      return DEFAULT_ACTIVITIES;
    }
    return JSON.parse(raw);
  } catch {
    return DEFAULT_ACTIVITIES;
  }
}

export function logActivity(module, title, detail, type = 'general') {
  try {
    const current = getRecentActivities();
    const newActivity = {
      id: `act_${Date.now()}`,
      module,
      title,
      detail,
      timestamp: new Date().toISOString(),
      type
    };
    const updated = [newActivity, ...current.slice(0, 19)];
    localStorage.setItem(ACTIVITY_STORAGE_KEY, JSON.stringify(updated));
    incrementProjectStat(type);
    return newActivity;
  } catch {
    return null;
  }
}

export function clearActivities() {
  localStorage.removeItem(ACTIVITY_STORAGE_KEY);
}

export function getProjectStats() {
  try {
    const raw = localStorage.getItem(PROJECTS_STORAGE_KEY);
    if (!raw) {
      const initial = {
        totalSketches: 14,
        rdkitExecutions: 38,
        spectroscopyRuns: 22,
        quantumComputes: 19,
        reactionsSynthesized: 11
      };
      localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(initial));
      return initial;
    }
    return JSON.parse(raw);
  } catch {
    return {
      totalSketches: 14,
      rdkitExecutions: 38,
      spectroscopyRuns: 22,
      quantumComputes: 19,
      reactionsSynthesized: 11
    };
  }
}

function incrementProjectStat(type) {
  try {
    const stats = getProjectStats();
    if (type === 'sketch') stats.totalSketches += 1;
    else if (type === 'rdkit') stats.rdkitExecutions += 1;
    else if (type === 'spectroscopy') stats.spectroscopyRuns += 1;
    else if (type === 'quantum') stats.quantumComputes += 1;
    else if (type === 'reaction') stats.reactionsSynthesized += 1;
    localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(stats));
  } catch {
    // Ignore storage issues
  }
}
