import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FolderLock,
  Search,
  Atom,
  PenTool,
  Cpu,
  Radio,
  Zap,
  Activity,
  FlaskConical,
  Trash2,
  ExternalLink,
  ShieldCheck,
  Calendar,
  Lock,
  Download,
  Filter,
  RefreshCw,
  Plus,
  FileCode,
  Layers,
  ArrowRight,
  Database,
  Clock,
  UserCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
  fetchUserWorkspaceHistory,
  deleteUserWorkspaceItem,
  clearUserWorkspaceHistory,
  fetchUserWorkspaceStats
} from '../services/workspaceApi';
import { getRecentlyUsed } from '../services/activityStore';
import {
  fetchUserDownloads,
  triggerFileDownload,
  deleteDownloadRecord,
  clearDownloadsHistory,
  formatBytes
} from '../services/downloadsManager';
import SecurityWatermark from '../components/SecurityWatermark';

export default function UserWorkspace() {
  const navigate = useNavigate();
  const { user, isGuest, isAuthenticated } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [activeTab, setActiveTab] = useState('history'); // 'history' | 'downloads'
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState('newest');
  const [historyItems, setHistoryItems] = useState([]);
  const [downloads, setDownloads] = useState([]);
  const [recentlyUsed, setRecentlyUsed] = useState([]);
  const [stats, setStats] = useState({
    molecules: 0,
    calculations: 0,
    reactions: 0,
    experiments: 0,
    projects: 0,
    total: 0
  });
  const [loading, setLoading] = useState(true);

  const CATEGORIES = [
    { id: 'all', label: 'All Records', icon: Database },
    { id: 'molecules', label: 'Molecules', icon: Atom },
    { id: 'calculations', label: 'Calculations', icon: Zap },
    { id: 'reactions', label: 'Reactions', icon: Activity },
    { id: 'experiments', label: 'Experiments', icon: FlaskConical },
    { id: 'files', label: 'Files', icon: FileCode },
    { id: 'downloads', label: 'Downloads', icon: Download }
  ];

  const loadData = async () => {
    setLoading(true);
    try {
      // 1. Load real recently used
      const recent = getRecentlyUsed(6);
      setRecentlyUsed(recent);

      // 2. Load workspace stats
      const s = await fetchUserWorkspaceStats();
      if (s) setStats(s);

      // 3. Load active section
      if (activeTab === 'history') {
        const res = await fetchUserWorkspaceHistory(activeCategory, searchQuery, 50, 0, sortOrder);
        if (res && res.items) setHistoryItems(res.items);
      } else {
        const dlRes = await fetchUserDownloads({ search: searchQuery, sort: sortOrder });
        if (dlRes && dlRes.items) setDownloads(dlRes.items);
      }
    } catch (e) {
      console.error('Workspace load error:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [activeTab, activeCategory, sortOrder, user?.uid]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadData();
  };

  return (
    <div className={`min-h-screen pt-20 pb-16 px-4 sm:px-6 lg:px-8 transition-colors ${
      isDark ? 'bg-[#08080a] text-neutral-200' : 'bg-[#f8f9fa] text-neutral-800'
    }`}>
      <SecurityWatermark label="CONFIDENTIAL LAB WORKSPACE" showBanner={true} />

      <div className="max-w-6xl mx-auto space-y-6">

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-200 dark:border-neutral-800">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-mono uppercase tracking-widest font-bold text-cyan-500">
                PERSONAL WORKSPACE
              </span>
              <span className="text-[10px] font-mono text-emerald-500 flex items-center gap-1 font-bold">
                <ShieldCheck className="w-3 h-3" /> User Isolated
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
              My Research &amp; Activity
            </h1>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center p-1 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-100 dark:bg-neutral-900 font-mono text-xs">
            <button
              onClick={() => setActiveTab('history')}
              className={`px-4 py-2 rounded-xl font-bold transition cursor-pointer ${
                activeTab === 'history'
                  ? isDark ? 'bg-neutral-800 text-white shadow-sm' : 'bg-white text-black shadow-sm'
                  : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              Activity History
            </button>
            <button
              onClick={() => setActiveTab('downloads')}
              className={`px-4 py-2 rounded-xl font-bold transition cursor-pointer ${
                activeTab === 'downloads'
                  ? isDark ? 'bg-neutral-800 text-white shadow-sm' : 'bg-white text-black shadow-sm'
                  : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              Downloads Manager
            </button>
          </div>
        </div>

        {/* 4. COMPACT RECENTLY USED SECTION */}
        {recentlyUsed.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-wider text-neutral-500 font-bold">
              <Clock className="w-3 h-3" />
              <span>Recently Used</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
              {recentlyUsed.map((item) => (
                <button
                  key={item.id}
                  onClick={() => navigate(item.link)}
                  className={`p-3 rounded-2xl border text-left flex flex-col justify-between transition cursor-pointer group ${
                    isDark
                      ? 'bg-neutral-900/60 border-neutral-800 hover:border-cyan-500/50 hover:bg-neutral-900'
                      : 'bg-white border-neutral-200 hover:border-cyan-500/50 hover:shadow-sm'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-cyan-500">
                      {item.module}
                    </span>
                    <ArrowRight className="w-3 h-3 text-neutral-500 group-hover:text-cyan-400 group-hover:translate-x-0.5 transition" />
                  </div>
                  <div className="text-xs font-bold font-mono text-neutral-900 dark:text-neutral-200 truncate">
                    {item.shortName}
                  </div>
                  <div className="text-[10px] font-mono text-neutral-500 mt-1">
                    {item.date}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* MAIN WORKSPACE CONTENT */}
        <div className={`p-6 rounded-3xl border shadow-sm transition-all space-y-6 ${
          isDark ? 'bg-[#0f0f11] border-neutral-800' : 'bg-white border-neutral-200'
        }`}>

          {/* Search, Filter & Actions Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-md">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={activeTab === 'history' ? "Search activity history..." : "Search downloads..."}
                className={`w-full pl-8 pr-3 py-2 rounded-xl border text-xs font-mono ${
                  isDark ? 'bg-neutral-900 border-neutral-800 text-white' : 'bg-neutral-50 border-neutral-300 text-black'
                }`}
              />
            </form>

            <div className="flex items-center gap-2">
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className={`px-3 py-2 rounded-xl border text-xs font-mono ${
                  isDark ? 'bg-neutral-900 border-neutral-800 text-white' : 'bg-neutral-50 border-neutral-300 text-black'
                }`}
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
              </select>

              {activeTab === 'history' && historyItems.length > 0 && (
                <button
                  onClick={async () => {
                    if (confirm('Clear history records for this category?')) {
                      await clearUserWorkspaceHistory(activeCategory);
                      loadData();
                    }
                  }}
                  className="px-3 py-2 rounded-xl font-mono text-xs border border-red-500/30 text-red-400 hover:bg-red-500/10 transition cursor-pointer flex items-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Clear
                </button>
              )}

              {activeTab === 'downloads' && downloads.length > 0 && (
                <button
                  onClick={async () => {
                    if (confirm('Clear download history?')) {
                      await clearDownloadsHistory();
                      loadData();
                    }
                  }}
                  className="px-3 py-2 rounded-xl font-mono text-xs border border-red-500/30 text-red-400 hover:bg-red-500/10 transition cursor-pointer flex items-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Clear
                </button>
              )}
            </div>
          </div>

          {/* History Category Selector */}
          {activeTab === 'history' && (
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
              {CATEGORIES.map((cat) => {
                const Icon = cat.icon;
                const active = activeCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-bold tracking-wide shrink-0 transition cursor-pointer ${
                      active
                        ? 'bg-cyan-600 text-white'
                        : isDark
                          ? 'bg-neutral-900 text-neutral-400 hover:text-white'
                          : 'bg-neutral-100 text-neutral-600 hover:text-black'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{cat.label}</span>
                  </button>
                );
              })}
            </div>
          )}

          {/* TAB 1: HISTORY ITEMS */}
          {activeTab === 'history' && (
            loading ? (
              <div className="p-12 text-center text-xs font-mono text-neutral-500">Loading history records...</div>
            ) : historyItems.length === 0 ? (
              <div className="p-16 text-center rounded-2xl border border-dashed border-neutral-800 space-y-2">
                <Database className="w-8 h-8 text-neutral-600 mx-auto stroke-[1.5]" />
                <div className="font-mono font-bold text-xs">No History Records Found</div>
                <div className="text-[11px] font-mono text-neutral-500 max-w-xs mx-auto">
                  Your authentic actions across ChemDraw, RDKit, Quantum, and IBM RXN will appear here.
                </div>
              </div>
            ) : (
              <div className="space-y-2.5">
                {historyItems.map((item) => (
                  <div
                    key={item.id}
                    className={`p-4 rounded-2xl border transition flex items-center justify-between gap-4 font-mono text-xs ${
                      isDark
                        ? 'bg-neutral-900/40 border-neutral-800 hover:border-neutral-700'
                        : 'bg-neutral-50/70 border-neutral-200 hover:border-neutral-300'
                    }`}
                  >
                    <div className="space-y-1 truncate">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                          {item.module}
                        </span>
                        <span className="font-bold text-neutral-900 dark:text-neutral-200 truncate">{item.title}</span>
                      </div>
                      <div className="text-[11px] text-neutral-500 truncate">
                        {item.detail || item.smiles || 'Scientific record'}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={async () => {
                          await deleteUserWorkspaceItem(item.id);
                          loadData();
                        }}
                        className="p-1.5 rounded-lg text-neutral-500 hover:text-red-400 transition cursor-pointer"
                        title="Delete record"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}

          {/* TAB 2: DOWNLOADS ITEMS */}
          {activeTab === 'downloads' && (
            loading ? (
              <div className="p-12 text-center text-xs font-mono text-neutral-500">Loading downloads...</div>
            ) : downloads.length === 0 ? (
              <div className="p-16 text-center rounded-2xl border border-dashed border-neutral-800 space-y-2">
                <Download className="w-8 h-8 text-neutral-600 mx-auto stroke-[1.5]" />
                <div className="font-mono font-bold text-xs">No Downloads Yet</div>
                <div className="text-[11px] font-mono text-neutral-500 max-w-xs mx-auto">
                  Files and molecular exports generated in your lab will be tracked here.
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs font-mono text-left">
                  <thead>
                    <tr className="border-b border-neutral-800 text-neutral-400">
                      <th className="py-2.5 px-3">FILE NAME</th>
                      <th className="py-2.5 px-3">SOURCE MODULE</th>
                      <th className="py-2.5 px-3">SIZE</th>
                      <th className="py-2.5 px-3">DATE / TIME</th>
                      <th className="py-2.5 px-3 text-right">ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-800/60">
                    {downloads.map((d) => (
                      <tr key={d.id} className="hover:bg-neutral-900/30 transition">
                        <td className="py-3 px-3 font-bold text-neutral-900 dark:text-neutral-200">{d.fileName}</td>
                        <td className="py-3 px-3 text-neutral-400">{d.sourceModule}</td>
                        <td className="py-3 px-3 text-neutral-400">{formatBytes(d.fileSize)}</td>
                        <td className="py-3 px-3 text-neutral-500">{d.date}</td>
                        <td className="py-3 px-3 text-right space-x-2">
                          <button
                            onClick={() => triggerFileDownload(d)}
                            className="px-2.5 py-1 rounded-lg bg-cyan-600/10 hover:bg-cyan-600/20 text-cyan-400 border border-cyan-500/20 font-bold transition cursor-pointer"
                          >
                            Download Again
                          </button>
                          <button
                            onClick={async () => {
                              await deleteDownloadRecord(d.id);
                              loadData();
                            }}
                            className="p-1 rounded-lg text-neutral-500 hover:text-red-400 transition cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          )}

        </div>
      </div>
    </div>
  );
}
