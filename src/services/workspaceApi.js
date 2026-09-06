/**
 * ChemSpace Secure User-Specific Workspace & History Service
 * Provides authenticated, user-isolated data fetching and persistence.
 */

const API_BASE = '/api/workspace';

function getAuthHeader() {
  const token = localStorage.getItem('chemspace_token');
  if (!token) return {};
  return {
    Authorization: `Bearer ${token}`
  };
}

export function getCurrentUserUid() {
  try {
    const user = JSON.parse(localStorage.getItem('chemspace_user') || 'null');
    return user ? user.uid : null;
  } catch {
    return null;
  }
}

/**
 * Fetch authenticated user's private history records
 */
export async function fetchUserWorkspaceHistory(category = 'all', search = '', limit = 50, offset = 0, sort = 'newest') {
  const uid = getCurrentUserUid();
  if (!uid || uid.startsWith('guest_')) {
    // Return partitioned guest items from local session storage
    return fetchLocalPartitionedHistory(uid || 'guest', category, search, sort);
  }

  try {
    const params = new URLSearchParams({
      category: category || 'all',
      search: search || '',
      sort: sort || 'newest',
      limit: String(limit),
      offset: String(offset)
    });

    const res = await fetch(`${API_BASE}/history?${params}`, {
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader()
      }
    });

    if (!res.ok) {
      if (res.status === 401 || res.status === 403) {
        return fetchLocalPartitionedHistory(uid, category, search, sort);
      }
      throw new Error(`Failed to fetch history: ${res.statusText}`);
    }

    const data = await res.json();
    return data;
  } catch (err) {
    console.warn('Backend workspace fetch failed, using local user partition:', err.message);
    return fetchLocalPartitionedHistory(uid, category, search, sort);
  }
}

/**
 * Save an item to the user's private workspace
 */
export async function saveUserWorkspaceItem(item) {
  const uid = getCurrentUserUid();
  const token = localStorage.getItem('chemspace_token');

  const payload = {
    id: item.id || `hist_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    category: item.category || 'molecules',
    title: item.title,
    smiles: item.smiles || null,
    module: item.module || 'ChemDraw',
    detail: item.detail || '',
    data_json: item.data || {},
    metadata_json: item.metadata || {}
  };

  // Always persist locally to the user's isolated partition
  saveLocalPartitionedItem(uid || 'guest', payload);

  if (!token || token.startsWith('guest_')) {
    return { status: 'success', id: payload.id, message: 'Saved locally to guest workspace.' };
  }

  try {
    const res = await fetch(`${API_BASE}/history`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader()
      },
      body: JSON.stringify(payload)
    });

    if (res.ok) {
      return await res.json();
    }
  } catch (e) {
    // Local fallback already saved
  }

  return { status: 'success', id: payload.id };
}

/**
 * Delete an item from the user's private workspace
 */
export async function deleteUserWorkspaceItem(itemId) {
  const uid = getCurrentUserUid();
  deleteLocalPartitionedItem(uid || 'guest', itemId);

  const token = localStorage.getItem('chemspace_token');
  if (!token || token.startsWith('guest_')) {
    return { status: 'success' };
  }

  try {
    const res = await fetch(`${API_BASE}/history/${itemId}`, {
      method: 'DELETE',
      headers: {
        ...getAuthHeader()
      }
    });
    if (res.ok) return await res.json();
  } catch (e) {
    // Local delete already completed
  }

  return { status: 'success' };
}

/**
 * Clear history with optional category
 */
export async function clearUserWorkspaceHistory(category = null) {
  const uid = getCurrentUserUid();
  clearLocalPartitionedHistory(uid || 'guest', category);

  const token = localStorage.getItem('chemspace_token');
  if (token && !token.startsWith('guest_')) {
    try {
      const url = category && category !== 'all' ? `${API_BASE}/history?category=${encodeURIComponent(category)}` : `${API_BASE}/history`;
      await fetch(url, {
        method: 'DELETE',
        headers: {
          ...getAuthHeader()
        }
      });
    } catch {}
  }
  return { status: 'success' };
}

/**
 * Fetch stats for the user's workspace
 */
export async function fetchUserWorkspaceStats() {
  const uid = getCurrentUserUid();
  const token = localStorage.getItem('chemspace_token');

  if (!token || token.startsWith('guest_')) {
    return getLocalPartitionedStats(uid || 'guest');
  }

  try {
    const res = await fetch(`${API_BASE}/stats`, {
      headers: {
        ...getAuthHeader()
      }
    });
    if (res.ok) {
      const data = await res.json();
      return data.stats;
    }
  } catch {
    // fallback
  }

  return getLocalPartitionedStats(uid || 'guest');
}

/**
 * Fetch security audit logs for the authenticated user
 */
export async function fetchUserAuditLogs(limit = 20) {
  const token = localStorage.getItem('chemspace_token');
  if (!token || token.startsWith('guest_')) {
    return [];
  }

  try {
    const res = await fetch(`${API_BASE}/audit-logs?limit=${limit}`, {
      headers: {
        ...getAuthHeader()
      }
    });
    if (res.ok) {
      const data = await res.json();
      return data.logs || [];
    }
  } catch {}
  return [];
}

/**
 * Lookup compound on PubChem via backend proxy
 */
export async function fetchPubChemData(query) {
  try {
    const res = await fetch(`/api/ai/pubchem?query=${encodeURIComponent(query)}`);
    if (res.ok) {
      return await res.json();
    }
  } catch {}
  return null;
}

// ----------------- LOCAL USER-PARTITIONED FALLBACK ENGINE -----------------

function getPartitionKey(uid) {
  return `chemspace_user_workspace_${uid || 'guest'}`;
}

function fetchLocalPartitionedHistory(uid, category, search, sort = 'newest') {
  try {
    const key = getPartitionKey(uid);
    const raw = localStorage.getItem(key);
    let items = raw ? JSON.parse(raw) : [];

    if (category && category !== 'all') {
      items = items.filter((i) => i.category === category);
    }
    if (search) {
      const q = search.toLowerCase();
      items = items.filter(
        (i) =>
          (i.title && i.title.toLowerCase().includes(q)) ||
          (i.smiles && i.smiles.toLowerCase().includes(q)) ||
          (i.detail && i.detail.toLowerCase().includes(q)) ||
          (i.module && i.module.toLowerCase().includes(q))
      );
    }

    if (sort === 'oldest') {
      items.sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0));
    } else {
      items.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    }

    return {
      status: 'success',
      items,
      total: items.length,
      limit: items.length,
      offset: 0
    };
  } catch {
    return { status: 'success', items: [], total: 0, limit: 0, offset: 0 };
  }
}

function saveLocalPartitionedItem(uid, item) {
  try {
    const key = getPartitionKey(uid);
    const raw = localStorage.getItem(key);
    let items = raw ? JSON.parse(raw) : [];
    
    const idx = items.findIndex((i) => i.id === item.id);
    const entry = {
      ...item,
      createdAt: item.createdAt || Date.now() / 1000,
      updatedAt: Date.now() / 1000
    };

    if (idx >= 0) {
      items[idx] = entry;
    } else {
      items.unshift(entry);
    }

    localStorage.setItem(key, JSON.stringify(items.slice(0, 100)));
  } catch (e) {
    console.error('Local workspace save error:', e);
  }
}

function deleteLocalPartitionedItem(uid, itemId) {
  try {
    const key = getPartitionKey(uid);
    const raw = localStorage.getItem(key);
    if (!raw) return;
    let items = JSON.parse(raw);
    items = items.filter((i) => i.id !== itemId);
    localStorage.setItem(key, JSON.stringify(items));
  } catch {}
}

function clearLocalPartitionedHistory(uid, category) {
  try {
    const key = getPartitionKey(uid);
    if (!category || category === 'all') {
      localStorage.removeItem(key);
    } else {
      const raw = localStorage.getItem(key);
      if (!raw) return;
      let items = JSON.parse(raw);
      items = items.filter((i) => i.category !== category);
      localStorage.setItem(key, JSON.stringify(items));
    }
  } catch {}
}

function getLocalPartitionedStats(uid) {
  try {
    const key = getPartitionKey(uid);
    const raw = localStorage.getItem(key);
    const items = raw ? JSON.parse(raw) : [];
    
    return {
      molecules: items.filter((i) => i.category === 'molecules').length,
      calculations: items.filter((i) => i.category === 'calculations').length,
      reactions: items.filter((i) => i.category === 'reactions').length,
      experiments: items.filter((i) => i.category === 'experiments').length,
      projects: items.filter((i) => i.category === 'projects').length,
      total: items.length
    };
  } catch {
    return { molecules: 0, calculations: 0, reactions: 0, experiments: 0, projects: 0, total: 0 };
  }
}
