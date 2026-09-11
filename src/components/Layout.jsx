import React, { useEffect, useState, useRef } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  PenTool,
  Cpu,
  Activity,
  Award,
  Atom,
  Search,
  Bot,
  Radio,
  Zap,
  LogIn,
  LogOut,
  Grid,
  Sun,
  Moon,
  PanelLeftClose,
  PanelLeftOpen,
  Home,
  User,
  ShieldCheck,
  History,
  FlaskConical,
  FolderLock,
  Hand,
  Menu,
  X,
  ChevronRight,
  Sliders
} from 'lucide-react';
import CopilotWindow from './AICopilot/CopilotWindow';
import GoogleAuthModal from './GoogleAuthModal';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useGestures } from '../context/GestureContext';
import GestureControlPanel from './Gestures/GestureControlPanel';
import ChemSpaceLogo from './ChemSpaceLogo';
import { getRecentActivities } from '../services/activityStore';
import { logoutUser } from '../services/firebase';

const NAV_GROUPS = [
  {
    title: 'Workspace',
    items: [
      { to: '/', label: 'Overview', icon: Home, badge: 'Hub', formula: 'CHEMSPACE' },
      { to: '/workspace', label: 'My Workspace', icon: FolderLock, badge: 'Data', formula: 'MY // DATA' },
    ]
  },
  {
    title: 'Molecular Labs',
    items: [
      { to: '/chemdraw', label: 'ChemDraw 2D/3D', icon: PenTool, badge: 'CAD', formula: 'CH₃-COOH' },
      { to: '/rdkit-lab', label: 'RDKit Lab', icon: Cpu, badge: 'Python', formula: 'C₉H₈O₄' },
      { to: '/spectroscopy', label: 'Spectroscopy', icon: Radio, badge: 'Spectra', formula: 'FTIR • NMR' },
      { to: '/chromatography', label: 'Chromatography', icon: FlaskConical, badge: 'HPLC', formula: 'Rf • tR' },
    ]
  },
  {
    title: 'Computation',
    items: [
      { to: '/quantum-library', label: 'Quantum DFT', icon: Zap, badge: 'DFT', formula: 'ΔE (HOMO-LUMO)' },
      { to: '/ibm-rxn', label: 'IBM RXN', icon: Activity, badge: 'Synth', formula: 'R-COOH + R\'-OH' },
    ]
  },
  {
    title: 'Knowledge',
    items: [
      { to: '/periodic-table', label: 'Periodic Table', icon: Grid, badge: '118 El', formula: 'H¹ → Og¹¹⁸' },
      { to: '/scientists', label: 'Pioneers', icon: Award, badge: 'Nobel', formula: '1834 → 2026' },
    ]
  }
];

export default function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const { isEnabled: gesturesEnabled } = useGestures();

  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    try {
      return localStorage.getItem('chemspace_sidebar_collapsed') === 'true';
    } catch {
      return false;
    }
  });

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [googleModalOpen, setGoogleModalOpen] = useState(false);
  const [gesturePanelOpen, setGesturePanelOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('chemspace_user')) || null;
    } catch {
      return null;
    }
  });

  const [recentActivities, setRecentActivities] = useState([]);
  const searchInputRef = useRef(null);

  useEffect(() => {
    setRecentActivities(getRecentActivities().slice(0, 1));
  }, [location.pathname]);

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  // Keyboard shortcut listener (/ or Ctrl+K) to focus search
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (
        (e.key === '/' || (e.key === 'k' && (e.ctrlKey || e.metaKey))) &&
        document.activeElement?.tagName !== 'INPUT' &&
        document.activeElement?.tagName !== 'TEXTAREA'
      ) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const toggleSidebar = () => {
    setSidebarCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('chemspace_sidebar_collapsed', String(next));
      } catch {
        // ignore
      }
      return next;
    });
  };

  useEffect(() => {
    const updateUserData = () => {
      try {
        const stored = JSON.parse(localStorage.getItem('chemspace_user')) || null;
        setUser(stored);
      } catch {
        setUser(null);
      }
    };

    updateUserData();
    window.addEventListener('chemspace-auth-changed', updateUserData);
    window.addEventListener('storage', updateUserData);
    return () => {
      window.removeEventListener('chemspace-auth-changed', updateUserData);
      window.removeEventListener('storage', updateUserData);
    };
  }, [googleModalOpen]);

  useEffect(() => {
    const handleOpenCopilot = () => {
      setAiModalOpen(true);
    };
    window.addEventListener('chemspace-open-copilot', handleOpenCopilot);
    return () => window.removeEventListener('chemspace-open-copilot', handleOpenCopilot);
  }, []);

  function handleSearchSubmit(e) {
    if (e) e.preventDefault();
    const query = searchQuery.trim().toLowerCase();
    if (!query) return;

    if (query.includes('draw') || query.includes('sketch') || query.includes('structure')) {
      navigate('/chemdraw');
    } else if (query.includes('rdkit') || query.includes('python') || query.includes('descriptor')) {
      navigate('/rdkit-lab');
    } else if (query.includes('spectr') || query.includes('nmr') || query.includes('ir') || query.includes('ftir')) {
      navigate('/spectroscopy');
    } else if (query.includes('quantum') || query.includes('dft') || query.includes('orbital') || query.includes('homo')) {
      navigate('/quantum-library');
    } else if (query.includes('rxn') || query.includes('reaction') || query.includes('retro') || query.includes('synthesis')) {
      navigate('/ibm-rxn');
    } else if (query.includes('periodic') || query.includes('element') || query.includes('table')) {
      navigate('/periodic-table');
    } else if (query.includes('scientist') || query.includes('nobel') || query.includes('pioneer')) {
      navigate('/scientists');
    } else if (query.includes('workspace') || query.includes('file') || query.includes('history') || query.includes('saved')) {
      navigate('/workspace');
    } else if (query.includes('chromatograph') || query.includes('hplc')) {
      navigate('/chromatography');
    } else {
      navigate(`/chemdraw?search=${encodeURIComponent(query)}`);
    }
  }

  async function handleLogout() {
    await logoutUser();
    setUser(null);
    navigate('/login');
  }

  const isDark = theme === 'dark';

  return (
    <div className="h-screen w-screen overflow-hidden flex flex-col md:flex-row font-sans bg-[var(--bg-page)] text-[var(--text-primary)] relative">

      {/* ───────────────────────────────────────────────────────────────────────
          MOBILE TOP APP BAR (< 768px)
         ─────────────────────────────────────────────────────────────────────── */}
      <header className={`flex md:hidden sticky top-0 z-40 w-full items-center justify-between px-4 py-3 border-b backdrop-blur-xl transition-colors ${
        isDark ? 'bg-[#090a0f]/95 border-white/10' : 'bg-white/95 border-slate-200'
      }`}>
        <div
          onClick={() => navigate('/')}
          className="flex items-center cursor-pointer select-none touch-target"
        >
          <ChemSpaceLogo size="md" showText={true} />
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={toggleTheme}
            className="w-9 h-9 rounded-lg flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border-subtle)] transition"
            aria-label="Toggle theme"
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          <button
            onClick={() => setMobileMenuOpen(true)}
            className="w-9 h-9 rounded-lg flex items-center justify-center text-[var(--text-primary)] border border-[var(--border-subtle)] bg-[var(--bg-hover)] transition"
            aria-label="Open mobile menu"
          >
            <Menu className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* ───────────────────────────────────────────────────────────────────────
          MOBILE SLIDE-OVER NAVIGATION DRAWER
         ─────────────────────────────────────────────────────────────────────── */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden" role="dialog" aria-modal="true">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Drawer content */}
          <div className={`relative w-4/5 max-w-xs h-full flex flex-col justify-between p-4 border-r shadow-2xl z-10 transition-transform ${
            isDark ? 'bg-[#0d0f15] border-white/10 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            <div>
              {/* Header */}
              <div className="flex items-center justify-between pb-3.5 border-b border-[var(--border-subtle)]">
                <ChemSpaceLogo size="sm" showText={true} />
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center opacity-70 hover:opacity-100 border border-[var(--border-subtle)]"
                  aria-label="Close menu"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Navigation links grouped */}
              <nav className="py-3 space-y-4 overflow-y-auto max-h-[calc(100vh-230px)] no-scrollbar">
                {NAV_GROUPS.map((group) => (
                  <div key={group.title} className="space-y-1">
                    <div className="px-2 text-[10px] font-mono uppercase tracking-wider text-[var(--text-muted)] font-semibold">
                      {group.title}
                    </div>
                    {group.items.map((item) => {
                      const Icon = item.icon;
                      const isActive = location.pathname === item.to;
                      return (
                        <NavLink
                          key={item.to}
                          to={item.to}
                          onClick={() => setMobileMenuOpen(false)}
                          className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition touch-target ${
                            isActive
                              ? (isDark ? 'bg-white text-slate-950 font-bold' : 'bg-slate-900 text-white font-bold')
                              : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]'
                          }`}
                        >
                          <Icon className="w-4 h-4 shrink-0" />
                          <span className="flex-1 truncate">{item.label}</span>
                          {item.badge && (
                            <span className="text-[9px] font-mono opacity-60 px-1.5 py-0.5 rounded border border-current">
                              {item.badge}
                            </span>
                          )}
                        </NavLink>
                      );
                    })}
                  </div>
                ))}
              </nav>
            </div>

            {/* Bottom tools & User profile */}
            <div className="pt-3 border-t border-[var(--border-subtle)] space-y-2">
              <button
                onClick={() => { setMobileMenuOpen(false); setAiModalOpen(true); }}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-xs font-mono border border-emerald-500/25 bg-emerald-500/10 text-emerald-400 font-semibold"
              >
                <Bot className="w-3.5 h-3.5" />
                <span>ChemAI Copilot</span>
              </button>

              {user ? (
                <div className="flex items-center justify-between p-2 rounded-lg bg-[var(--bg-inner)] border border-[var(--border-subtle)]">
                  <div className="flex items-center gap-2 truncate">
                    <div className="w-6 h-6 rounded-md bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-[10px] font-bold shrink-0">
                      {user.name ? user.name.slice(0, 1).toUpperCase() : 'U'}
                    </div>
                    <span className="text-xs truncate font-medium">{user.name || user.email}</span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="p-1.5 rounded-md opacity-60 hover:opacity-100 text-rose-400"
                    title="Sign Out"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => { setMobileMenuOpen(false); navigate('/login'); }}
                  className="w-full py-2.5 rounded-lg bg-[var(--btn-primary-bg)] text-[var(--btn-primary-text)] font-semibold text-xs flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Sign In / Sign Up</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────────────────
          DESKTOP SIDEBAR (>= 768px)
         ─────────────────────────────────────────────────────────────────────── */}
      <aside
        className={`hidden md:flex h-full max-h-screen z-30 flex-col justify-between border-r transition-all duration-300 ease-in-out select-none backdrop-blur-xl shrink-0 overflow-hidden ${
          sidebarCollapsed ? 'w-18' : 'w-60'
        } ${
          isDark
            ? 'bg-[#0d0f15] border-white/10 text-slate-200'
            : 'bg-white border-slate-200 text-slate-800'
        }`}
      >
        {/* Sidebar Top Header */}
        <div className="p-3.5 border-b border-inherit shrink-0">
          <div className={`flex items-center ${sidebarCollapsed ? 'justify-center' : 'justify-between'} gap-2`}>
            <div
              onClick={() => navigate('/')}
              className="flex items-center cursor-pointer group overflow-hidden"
              title="ChemSpace Platform"
            >
              <ChemSpaceLogo size="md" showText={!sidebarCollapsed} />
            </div>

            {!sidebarCollapsed && (
              <button
                onClick={toggleSidebar}
                className="p-1 rounded-md border border-[var(--border-subtle)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition shrink-0"
                title="Collapse Sidebar"
                aria-label="Collapse Sidebar"
              >
                <PanelLeftClose className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Sidebar Middle Navigation */}
        <nav className={`flex-1 py-3 ${sidebarCollapsed ? 'px-2 items-center' : 'px-3'} space-y-4 overflow-y-auto no-scrollbar`}>
          {sidebarCollapsed && (
            <button
              onClick={toggleSidebar}
              className="p-2 mb-2 w-full flex items-center justify-center rounded-lg border border-[var(--border-subtle)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition"
              title="Expand Sidebar"
              aria-label="Expand Sidebar"
            >
              <PanelLeftOpen className="w-4 h-4" />
            </button>
          )}

          {NAV_GROUPS.map((group) => (
            <div key={group.title} className="space-y-1">
              {!sidebarCollapsed && (
                <div className="px-2 py-0.5 text-[9.5px] font-mono uppercase tracking-wider text-[var(--text-muted)] font-semibold">
                  {group.title}
                </div>
              )}
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.to;

                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={`flex items-center ${sidebarCollapsed ? 'justify-center w-10 h-10 p-0 mx-auto' : 'gap-2.5 px-2.5 py-2 w-full'} rounded-lg text-xs font-medium transition-all group relative ${
                      isActive
                        ? isDark
                          ? 'bg-white text-slate-950 font-bold shadow-sm'
                          : 'bg-slate-900 text-white font-bold shadow-sm'
                        : isDark
                        ? 'text-slate-400 hover:text-white hover:bg-white/5'
                        : 'text-slate-600 hover:text-slate-950 hover:bg-slate-100'
                    }`}
                    title={sidebarCollapsed ? item.label : undefined}
                  >
                    <Icon className="w-4 h-4 shrink-0" />

                    {!sidebarCollapsed && (
                      <div className="flex items-center justify-between w-full truncate gap-1.5">
                        <span className="truncate">{item.label}</span>
                        {item.badge && !isActive && (
                          <span className="text-[8px] font-mono opacity-50 px-1.5 py-0.5 rounded border border-current">
                            {item.badge}
                          </span>
                        )}
                      </div>
                    )}
                  </NavLink>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Sidebar Bottom Controls */}
        <div className="p-3 border-t border-inherit space-y-2 shrink-0">
          <button
            onClick={toggleTheme}
            className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center' : 'justify-between'} p-2 rounded-lg border border-[var(--border-subtle)] text-xs transition ${
              isDark ? 'hover:bg-white/5' : 'hover:bg-slate-100'
            }`}
            title={`Toggle Theme (${theme})`}
          >
            <div className="flex items-center gap-2">
              {isDark ? <Moon className="w-3.5 h-3.5 text-slate-300" /> : <Sun className="w-3.5 h-3.5 text-amber-500" />}
              {!sidebarCollapsed && <span className="text-[11px] font-medium">{isDark ? 'Obsidian' : 'Ceramic'}</span>}
            </div>
          </button>

          <button
            onClick={() => setAiModalOpen(true)}
            className={`w-full flex items-center justify-center gap-2 p-2 rounded-lg border border-emerald-500/20 bg-emerald-500/10 text-emerald-400 text-xs font-mono transition hover:bg-emerald-500/20 font-semibold`}
            title="ChemAI Copilot"
          >
            <Bot className="w-3.5 h-3.5 shrink-0" />
            {!sidebarCollapsed && <span>ChemAI Assistant</span>}
          </button>

          {/* User authentication pill */}
          {user ? (
            <div className={`p-2 rounded-lg border border-[var(--border-subtle)] flex items-center justify-between ${
              isDark ? 'bg-black/30' : 'bg-slate-50'
            }`}>
              <div className="flex items-center gap-2 truncate">
                <div className="w-6 h-6 rounded-md bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-[10px] font-bold shrink-0">
                  {user.name ? user.name.slice(0, 1).toUpperCase() : 'U'}
                </div>
                {!sidebarCollapsed && (
                  <div className="flex flex-col truncate">
                    <span className="text-[11px] font-bold truncate leading-tight">{user.name || 'Scientist'}</span>
                    <span className="text-[9px] font-mono opacity-60 truncate">{user.role || 'Active'}</span>
                  </div>
                )}
              </div>
              {!sidebarCollapsed && (
                <button
                  onClick={handleLogout}
                  className="p-1 text-slate-400 hover:text-rose-400 transition"
                  title="Sign Out"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ) : (
            <button
              onClick={() => navigate('/login')}
              className="w-full py-2 px-3 rounded-lg bg-[var(--btn-primary-bg)] text-[var(--btn-primary-text)] font-semibold text-xs flex items-center justify-center gap-2 transition hover:opacity-90 shadow-sm"
            >
              <LogIn className="w-3.5 h-3.5 shrink-0" />
              {!sidebarCollapsed && <span>Sign In / Sign Up</span>}
            </button>
          )}
        </div>
      </aside>

      {/* ───────────────────────────────────────────────────────────────────────
          MAIN WORKSPACE WRAPPER (Independent Scroll Container)
          Assigned id="main-scroll-container" so hand gesture vision scrolling works!
         ─────────────────────────────────────────────────────────────────────── */}
      <div id="main-scroll-container" className="flex-1 h-full min-w-0 w-full flex flex-col overflow-y-auto overflow-x-hidden relative z-10">
        {/* Desktop Top Header Bar */}
        <header className={`hidden md:flex h-13 border-b px-5 items-center justify-between backdrop-blur-xl shrink-0 sticky top-0 z-20 ${
          isDark ? 'bg-[#090a0f]/90 border-white/10' : 'bg-white/90 border-slate-200'
        }`}>
          {/* Quick Search */}
          <form onSubmit={handleSearchSubmit} className="relative w-80">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 opacity-40 pointer-events-none" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tools, molecules, SMILES..."
              className="w-full pl-8 pr-10 py-1.5 text-xs rounded-lg bg-[var(--bg-input)] border border-[var(--border-subtle)] focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 transition text-[var(--text-primary)]"
            />
            {searchQuery ? (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 text-slate-400 hover:text-white"
                title="Clear search"
              >
                <X className="w-3 h-3" />
              </button>
            ) : (
              <kbd className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[9px] font-mono px-1.5 py-0.5 rounded border border-inherit bg-[var(--bg-inner)] text-[var(--text-muted)] pointer-events-none select-none">
                /
              </kbd>
            )}
          </form>

          {/* Quick Action Badges & Gestures */}
          <div className="flex items-center gap-2.5">
            {gesturesEnabled && (
              <div className="flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/25">
                <Hand className="w-3 h-3 animate-pulse" />
                <span>Gestures Active</span>
              </div>
            )}

            <button
              onClick={() => setGesturePanelOpen(true)}
              className="px-2.5 py-1.5 rounded-lg border border-[var(--border-subtle)] text-[11px] font-mono text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition flex items-center gap-1.5"
            >
              <Hand className="w-3.5 h-3.5" />
              <span>Vision Controls</span>
            </button>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 w-full min-w-0">
          <Outlet />
        </main>
      </div>

      {/* Global Modals */}
      {aiModalOpen && <CopilotWindow isOpen={aiModalOpen} onClose={() => setAiModalOpen(false)} />}
      {googleModalOpen && <GoogleAuthModal onClose={() => setGoogleModalOpen(false)} />}
      {gesturePanelOpen && <GestureControlPanel isOpen={gesturePanelOpen} onClose={() => setGesturePanelOpen(false)} />}
    </div>
  );
}
