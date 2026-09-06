/**
 * ChemSpace Real Activity & User-Isolated Workspace Sync
 * Strictly tracks authenticated user activity with zero simulated or fake history.
 * Partitioned strictly by authenticated user UID.
 */

import { saveUserWorkspaceItem, getCurrentUserUid } from './workspaceApi';

function getActivityStorageKey() {
  const uid = getCurrentUserUid();
  return `chemspace_recent_activity_${uid || 'guest'}`;
}

function getProjectsStorageKey() {
  const uid = getCurrentUserUid();
  return `chemspace_project_stats_${uid || 'guest'}`;
}

/**
 * Returns real recent activities for the current user.
 * Never creates fake or mock activities.
 */
export function getRecentActivities() {
  try {
    const key = getActivityStorageKey();
    const raw = localStorage.getItem(key);
    if (!raw) {
      return [];
    }
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

/**
 * Log a genuine user activity (sketching, calculations, reactions, views, exports)
 */
export function logActivity(module, title, detail, type = 'general', smiles = null, metadata = {}) {
  try {
    const key = getActivityStorageKey();
    const current = getRecentActivities();
    const newActivity = {
      id: `act_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      module,
      title,
      detail: detail || '',
      smiles: smiles || null,
      timestamp: new Date().toISOString(),
      type,
      metadata: metadata || {}
    };

    // Keep top 50 real activities
    const updated = [newActivity, ...current.slice(0, 49)];
    localStorage.setItem(key, JSON.stringify(updated));
    incrementProjectStat(type);

    // Map activity type to workspace category
    let category = 'molecules';
    if (type === 'quantum' || type === 'rdkit' || type === 'calculation') category = 'calculations';
    else if (type === 'reaction' || type === 'synthesis') category = 'reactions';
    else if (type === 'spectroscopy' || type === 'chromatography' || type === 'experiment') category = 'experiments';
    else if (type === 'download') category = 'downloads';
    else if (type === 'scientist') category = 'scientists';
    else if (type === 'report' || type === 'file') category = 'files';

    // Synchronize to authenticated user's private workspace
    saveUserWorkspaceItem({
      id: newActivity.id,
      category,
      title,
      smiles,
      module,
      detail,
      data: { activityType: type, ...metadata }
    }).catch(() => {});

    return newActivity;
  } catch {
    return null;
  }
}

/**
 * Returns compact "Recently Used" list:
 * ICON + SHORT NAME + DATE / TIME
 */
export function getRecentlyUsed(limit = 8) {
  const activities = getRecentActivities();
  const routeMap = {
    'ChemDraw': '/chemdraw',
    'RDKit Lab': '/rdkit-lab',
    'Spectroscopy': '/spectroscopy',
    'Quantum Lab': '/quantum-library',
    'IBM RXN': '/ibm-rxn',
    'Chromatography': '/chromatography',
    'Periodic Table': '/periodic-table',
    'Scientists': '/scientists'
  };

  const seen = new Set();
  const result = [];

  for (const act of activities) {
    const key = `${act.module}:${act.title}`;
    if (!seen.has(key)) {
      seen.add(key);
      const d = new Date(act.timestamp);
      const formattedDate = !isNaN(d) ? d.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }) : 'Just now';

      result.push({
        id: act.id,
        module: act.module,
        shortName: act.title,
        date: formattedDate,
        timestamp: act.timestamp,
        type: act.type,
        link: routeMap[act.module] || '/workspace'
      });
      if (result.length >= limit) break;
    }
  }

  return result;
}

export function clearActivities() {
  try {
    const key = getActivityStorageKey();
    localStorage.removeItem(key);
  } catch {}
}

export function getProjectStats() {
  try {
    const key = getProjectsStorageKey();
    const raw = localStorage.getItem(key);
    if (!raw) {
      const zeroStats = {
        totalSketches: 0,
        rdkitExecutions: 0,
        spectroscopyRuns: 0,
        quantumComputes: 0,
        reactionsSynthesized: 0
      };
      return zeroStats;
    }
    return JSON.parse(raw);
  } catch {
    return {
      totalSketches: 0,
      rdkitExecutions: 0,
      spectroscopyRuns: 0,
      quantumComputes: 0,
      reactionsSynthesized: 0
    };
  }
}

function incrementProjectStat(type) {
  try {
    const key = getProjectsStorageKey();
    const stats = getProjectStats();
    if (type === 'sketch') stats.totalSketches = (stats.totalSketches || 0) + 1;
    else if (type === 'rdkit') stats.rdkitExecutions = (stats.rdkitExecutions || 0) + 1;
    else if (type === 'spectroscopy') stats.spectroscopyRuns = (stats.spectroscopyRuns || 0) + 1;
    else if (type === 'quantum') stats.quantumComputes = (stats.quantumComputes || 0) + 1;
    else if (type === 'reaction') stats.reactionsSynthesized = (stats.reactionsSynthesized || 0) + 1;
    localStorage.setItem(key, JSON.stringify(stats));
  } catch {}
}
