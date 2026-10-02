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
import { SkeletonTable } from '../components/loading/SkeletonLoader';

export default function UserWorkspace() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { theme } = useTheme();

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
      const recent = getRecentlyUsed(6);
      setRecentlyUsed(recent);

      const s = await fetchUserWorkspaceStats();
      if (s) setStats(s);

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
    <div className="workspace-container font-sans select-none space-y-6 max-w-6xl mx-auto">
      <SecurityWatermark label="CONFIDENTIAL LAB WORKSPACE" showBanner={true} />

      {/* Page Header */}
      <div className="workspace-header">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-orange-500/10 border border-orange-500/20 text-orange-500">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-bold tracking-wider text-[var(--text-primary)]">
                PERSONAL RESEARCH WORKSPACE
              </h1>
              <span className="telemetry-pill text-[9px] font-bold text-emerald-500">
                USER ISOLATED
              </span>
            </div>
            <p className="text-[10px] text-[var(--text-secondary)] mt-0.5">
              Secure persistent session logs, computation archives, molecular exports, and downloaded artifacts.
            </p>
          </div>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center p-1 rounded-2xl inner-box font-mono text-xs shadow-inner">
          <button
            onClick={() => setActiveTab('history')}
            className={`px-4 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
              activeTab === 'history'
                ? 'bg-orange-500 text-white shadow-md'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            Activity History
          </button>
          <button
            onClick={() => setActiveTab('downloads')}
            className={`px-4 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
              activeTab === 'downloads'
                ? 'bg-orange-500 text-white shadow-md'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            Downloads Manager
          </button>
        </div>
      </div>

      {/* 4. COMPACT RECENTLY USED SECTION */}
      {recentlyUsed.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-wider text-[var(--text-muted)] font-bold px-1">
            <Clock className="w-3.5 h-3.5 text-orange-500" />
            <span>Recently Active Modules</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
            {recentlyUsed.map((item) => (
              <button
                key={item.id}
                onClick={() => navigate(item.link)}
                className="p-3 rounded-2xl glass-panel border border-[var(--border-subtle)] hover:border-orange-500/50 text-left flex flex-col justify-between transition-all cursor-pointer group shadow-sm hover:-translate-y-0.5"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[9px] font-mono uppercase tracking-wider font-bold text-orange-500">
                    {item.module}
                  </span>
                  <ArrowRight className="w-3 h-3 text-[var(--text-muted)] group-hover:text-orange-500 group-hover:translate-x-0.5 transition" />
                </div>
                <div className="text-xs font-bold font-mono text-[var(--text-primary)] truncate">
                  {item.shortName}
                </div>
                <div className="text-[10px] font-mono text-[var(--text-muted)] mt-1">
                  {item.date}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* MAIN WORKSPACE CONTENT */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-[var(--border-subtle)] space-y-6 shadow-xl">
        {/* Search, Filter & Actions Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-md">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={activeTab === 'history' ? "Search activity history..." : "Search downloads..."}
              className="w-full bg-[var(--bg-input)] border border-[var(--border-subtle)] focus:border-orange-500 rounded-xl pl-9 pr-3 py-2 text-xs font-mono text-[var(--text-primary)] outline-none shadow-sm"
            />
          </form>

          <div className="flex items-center gap-2">
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="bg-[var(--bg-input)] border border-[var(--border-subtle)] focus:border-orange-500 rounded-xl px-3 py-2 text-xs font-mono text-[var(--text-primary)] outline-none shadow-sm cursor-pointer"
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
                className="px-3 py-2 rounded-xl font-mono text-xs border border-rose-500/30 text-rose-500 hover:bg-rose-500/10 transition cursor-pointer flex items-center gap-1.5"
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
                className="px-3 py-2 rounded-xl font-mono text-xs border border-rose-500/30 text-rose-500 hover:bg-rose-500/10 transition cursor-pointer flex items-center gap-1.5"
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
                      ? 'bg-orange-500 text-white font-bold shadow-sm'
                      : 'inner-box hover:border-orange-500/50 text-[var(--text-secondary)]'
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
            <SkeletonTable rows={4} cols={4} />
          ) : historyItems.length === 0 ? (
            <div className="p-16 text-center rounded-2xl border border-dashed border-[var(--border-subtle)] space-y-2">
              <Database className="w-8 h-8 text-[var(--text-muted)] mx-auto stroke-[1.5]" />
              <div className="font-mono font-bold text-xs text-[var(--text-primary)]">No History Records Found</div>
              <div className="text-[11px] font-mono text-[var(--text-secondary)] max-w-xs mx-auto">
                Your authentic actions across ChemDraw, RDKit, Quantum, and IBM RXN will appear here.
              </div>
            </div>
          ) : (
            <div className="space-y-2.5">
              {historyItems.map((item) => (
                <div
                  key={item.id}
                  className="p-4 rounded-2xl inner-box hover:border-orange-500/40 transition flex items-center justify-between gap-4 font-mono text-xs shadow-xs"
                >
                  <div className="space-y-1 truncate">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-orange-500/10 text-orange-500 border border-orange-500/20">
                        {item.module}
                      </span>
                      <span className="font-bold text-[var(--text-primary)] truncate">{item.title}</span>
                    </div>
                    <div className="text-[11px] text-[var(--text-secondary)] truncate">
                      {item.detail || item.smiles || 'Scientific record'}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={async () => {
                        await deleteUserWorkspaceItem(item.id);
                        loadData();
                      }}
                      className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-rose-500 transition cursor-pointer"
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
            <SkeletonTable rows={4} cols={5} />
          ) : downloads.length === 0 ? (
            <div className="p-16 text-center rounded-2xl border border-dashed border-[var(--border-subtle)] space-y-2">
              <Download className="w-8 h-8 text-[var(--text-muted)] mx-auto stroke-[1.5]" />
              <div className="font-mono font-bold text-xs text-[var(--text-primary)]">No Downloads Yet</div>
              <div className="text-[11px] font-mono text-[var(--text-secondary)] max-w-xs mx-auto">
                Files and molecular exports generated in your lab will be tracked here.
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs font-mono text-left">
                <thead>
                  <tr className="border-b border-[var(--border-subtle)] text-[var(--text-muted)]">
                    <th className="py-2.5 px-3">FILE NAME</th>
                    <th className="py-2.5 px-3">SOURCE MODULE</th>
                    <th className="py-2.5 px-3">SIZE</th>
                    <th className="py-2.5 px-3">DATE / TIME</th>
                    <th className="py-2.5 px-3 text-right">ACTIONS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-subtle)]">
                  {downloads.map((d) => (
                    <tr key={d.id} className="hover:bg-[var(--bg-inner)] transition">
                      <td className="py-3 px-3 font-bold text-[var(--text-primary)]">{d.fileName}</td>
                      <td className="py-3 px-3 text-[var(--text-secondary)]">{d.sourceModule}</td>
                      <td className="py-3 px-3 text-[var(--text-secondary)]">{formatBytes(d.fileSize)}</td>
                      <td className="py-3 px-3 text-[var(--text-muted)]">{d.date}</td>
                      <td className="py-3 px-3 text-right space-x-2">
                        <button
                          onClick={() => triggerFileDownload(d)}
                          className="px-2.5 py-1 rounded-lg bg-orange-500/10 hover:bg-orange-500/20 text-orange-500 border border-orange-500/20 font-bold transition cursor-pointer"
                        >
                          Download Again
                        </button>
                        <button
                          onClick={async () => {
                            await deleteDownloadRecord(d.id);
                            loadData();
                          }}
                          className="p-1 rounded-lg text-[var(--text-muted)] hover:text-rose-500 transition cursor-pointer"
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
  );
}
