import React, { useEffect, useState } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  PenTool,
  Cpu,
  Activity,
  Award,
  Atom,
  Search,
  Bot,
  Settings,
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
  Sparkles,
  FlaskConical,
  FolderLock
} from 'lucide-react';
import CopilotWindow from './AICopilot/CopilotWindow';
import GoogleAuthModal from './GoogleAuthModal';
import RotatingAtomButton from './RotatingAtomButton';
import Background3DCanvas from './Background3DCanvas';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import GuestBanner from './GuestBanner';
import { getRecentActivities } from '../services/activityStore';
import { logoutUser } from '../services/firebase';

const NAV_ITEMS = [
  { to: '/', label: 'Overview', icon: Home, badge: 'Hub', formula: 'CHEMSPACE', desc: 'System Hub' },
  { to: '/workspace', label: 'My Workspace', icon: FolderLock, badge: 'Private', formula: 'MY // DATA', desc: 'Personal History' },
  { to: '/chemdraw', label: 'ChemDraw', icon: PenTool, badge: '2D/3D', formula: 'CH₃-COOH', desc: 'CAD Sketcher' },
  { to: '/rdkit-lab', label: 'RDKit Lab', icon: Cpu, badge: 'Python', formula: 'C₉H₈O₄', desc: 'Cheminformatics' },
  { to: '/spectroscopy', label: 'Spectroscopy', icon: Radio, badge: 'Spectra', formula: 'FTIR • NMR', desc: 'Spectral Analysis' },
  { to: '/chromatography', label: 'Chromatography', icon: FlaskConical, badge: 'HPLC/GC', formula: 'Rf • tR • N', desc: 'Separation' },
  { to: '/quantum-library', label: 'Quantum', icon: Zap, badge: 'DFT', formula: 'ΔE (HOMO-LUMO)', desc: 'Quantum Solvers' },
  { to: '/ibm-rxn', label: 'IBM RXN', icon: Activity, badge: 'Synthesis', formula: 'R-COOH + R\'-OH', desc: 'Retrosynthesis' },
  { to: '/periodic-table', label: 'Periodic Table', icon: Grid, badge: '118 El', formula: 'H¹ → Og¹¹⁸', desc: 'Elements' },
  { to: '/scientists', label: 'Discoveries', icon: Award, badge: 'Nobel', formula: '1834 → 2026', desc: 'Pioneers' },
];

export default function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const { isGuest, exitGuestSession } = useAuth();

  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    try {
      return localStorage.getItem('chemspace_sidebar_collapsed') === 'true';
    } catch {
      return false;
    }
  });

  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [googleModalOpen, setGoogleModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('chemspace_user')) || null;
    } catch {
      return null;
    }
  });

  const [recentActivities, setRecentActivities] = useState([]);

  useEffect(() => {
    setRecentActivities(getRecentActivities().slice(0, 1));
  }, [location.pathname]);

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
    e.preventDefault();
    if (!searchQuery.trim()) return;
    navigate(`/chemdraw`);
  }

  async function handleLogout() {
    if (isGuest) {
      exitGuestSession();
    } else {
      await logoutUser();
    }
    setUser(null);
    navigate('/login');
  }

  const isDark = theme === 'dark';
  const latestActivity = recentActivities[0];

  return (
    <div className="relative min-h-screen w-full flex font-sans overflow-x-hidden transition-colors duration-200 bg-[var(--bg-page)] text-[var(--text-primary)]">
      {/* 3D WebGL Adaptive Background Canvas */}
      <Background3DCanvas />

      {/* 1. FULL-HEIGHT CONTINUOUS LEFT SIDEBAR */}
      <aside
        className={`sticky top-0 h-screen min-h-screen max-h-screen z-50 flex flex-col justify-between border-r transition-all duration-300 ease-in-out select-none backdrop-blur-2xl shrink-0 overflow-hidden shadow-2xl ${
          sidebarCollapsed ? 'w-20' : 'w-64'
        } ${
          isDark
            ? 'bg-[#05070b]/95 border-white/10 text-slate-200'
            : 'bg-white/95 border-slate-200 text-slate-800'
        }`}
      >
        {/* Sidebar Top: 3D App Branding & Collapse Toggle */}
        <div className="p-4 border-b border-inherit shrink-0">
          <div className={`flex items-center ${sidebarCollapsed ? 'justify-center' : 'justify-between'} gap-2`}>
            <div
              onClick={() => navigate('/')}
              className="flex items-center gap-3 cursor-pointer group overflow-hidden"
              title="ChemNova Scientific Platform"
            >
              <div
                className={`w-10 h-10 rounded-2xl flex items-center justify-center border transition-all duration-200 shadow-md shrink-0 ${
                  isDark
                    ? 'bg-gradient-to-br from-cyan-500/20 to-violet-500/20 border-cyan-500/30 text-cyan-400 group-hover:border-cyan-400 group-hover:scale-105'
                    : 'bg-slate-900 text-white border-slate-800 group-hover:bg-black group-hover:scale-105'
                }`}
              >
                <Atom className="w-5 h-5 animate-spin-slow" />
              </div>

              {!sidebarCollapsed && (
                <div className="flex flex-col truncate">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-black tracking-wider text-[var(--text-primary)] truncate">
                      CHEMNOVA
                    </span>
                    <span className="text-[8px] bg-cyan-500/15 text-cyan-500 font-black px-1.5 py-0.2 rounded-full uppercase border border-cyan-500/20">
                      3D PRO
                    </span>
                  </div>
                  <span className="text-[9px] font-mono text-[var(--text-muted)] tracking-tight truncate uppercase font-bold">
                    SCIENTIFIC PLATFORM
                  </span>
                </div>
              )}
            </div>

            {/* Sidebar Collapse Toggle Button */}
            {!sidebarCollapsed && (
              <button
                onClick={toggleSidebar}
                className={`p-2 rounded-xl border transition-all duration-200 shrink-0 ${
                  isDark
                    ? 'bg-white/5 border-white/10 hover:bg-white/10 text-slate-400 hover:text-white'
                    : 'bg-slate-100 border-slate-200 hover:bg-slate-200 text-slate-600 hover:text-black'
                }`}
                title="Collapse Sidebar"
              >
                <PanelLeftClose className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Sidebar Middle: Navigation Links Naturally Distributed */}
        <nav className={`flex-1 flex flex-col justify-evenly py-3 ${sidebarCollapsed ? 'px-2 items-center' : 'px-3'} space-y-1 overflow-y-auto no-scrollbar`}>
          {sidebarCollapsed && (
            <button
              onClick={toggleSidebar}
              className={`p-2.5 mb-2 rounded-xl border transition-all duration-200 ${
                isDark
                  ? 'bg-white/5 border-white/10 hover:bg-white/10 text-slate-400 hover:text-white'
                  : 'bg-slate-100 border-slate-200 hover:bg-slate-200 text-slate-600 hover:text-black'
              }`}
              title="Expand Sidebar"
            >
              <PanelLeftOpen className="w-4 h-4" />
            </button>
          )}

          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.to;

            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={`flex items-center ${sidebarCollapsed ? 'justify-center w-12 h-12 p-0' : 'gap-3 px-3.5 py-2.5 w-full'} rounded-2xl text-xs font-bold transition-all duration-200 group relative ${
                  isActive
                    ? isDark
                      ? 'bg-white text-black shadow-lg shadow-white/10 font-black'
                      : 'bg-slate-900 text-white shadow-lg shadow-slate-900/20 font-black'
                    : isDark
                    ? 'text-slate-400 hover:text-white hover:bg-white/5'
                    : 'text-slate-600 hover:text-slate-950 hover:bg-slate-100'
                }`}
                title={sidebarCollapsed ? item.label : undefined}
              >
                <Icon
                  className={`w-4 h-4 shrink-0 transition-transform duration-200 group-hover:scale-110 ${
                    isActive
                      ? isDark
                        ? 'text-black'
                        : 'text-white'
                      : 'text-inherit opacity-80'
                  }`}
                />

                {!sidebarCollapsed && (
                  <div className="flex items-center justify-between w-full truncate gap-1.5">
                    <div className="flex flex-col truncate text-left">
                      <span className="truncate leading-tight font-bold">{item.label}</span>
                      <span className={`text-[8.5px] font-mono tracking-tight transition-colors truncate ${
                        isActive
                          ? isDark ? 'text-cyan-600 font-bold' : 'text-cyan-200 font-bold'
                          : 'text-[var(--text-muted)] group-hover:text-cyan-400'
                      }`}>
                        {item.formula}
                      </span>
                    </div>
                    {item.badge && !isActive && (
                      <span
                        className={`text-[8.5px] font-mono font-bold px-1.5 py-0.5 rounded-lg border transition-colors shrink-0 ${
                          isDark
                            ? 'bg-white/5 border-white/10 text-slate-400 group-hover:border-cyan-500/30 group-hover:text-cyan-300'
                            : 'bg-slate-100 border-slate-200 text-slate-500 group-hover:border-cyan-500/30 group-hover:text-cyan-700'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </div>
                )}
              </NavLink>
            );
          })}

          {/* Compact Recent Item Indicator (Expanded Only) */}
          {!sidebarCollapsed && latestActivity && (
            <div className="px-1 pt-1 pb-0.5">
              <div
                onClick={() => {
                  if (latestActivity.type === 'sketch') navigate('/chemdraw');
                  else if (latestActivity.type === 'rdkit') navigate('/rdkit-lab');
                  else if (latestActivity.type === 'spectroscopy') navigate('/spectroscopy');
                  else if (latestActivity.type === 'quantum') navigate('/quantum-library');
                  else if (latestActivity.type === 'reaction') navigate('/ibm-rxn');
                }}
                className="p-2.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 cursor-pointer transition-all flex items-center justify-between gap-2"
                title={`Jump to recent activity: ${latestActivity.title}`}
              >
                <div className="flex items-center gap-2 truncate">
                  <History className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  <div className="flex flex-col truncate">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tight truncate">Recent Session</span>
                    <span className="text-[10px] font-semibold text-[var(--text-primary)] truncate">{latestActivity.module}</span>
                  </div>
                </div>
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shrink-0" />
              </div>
            </div>
          )}
        </nav>

        {/* Sidebar Bottom: Theme Toggle, ChemAI, User Profile / Branding Area */}
        <div className="p-3 border-t border-inherit space-y-2 shrink-0 bg-inherit">
          {/* Single Smooth Theme Switcher */}
          <button
            onClick={toggleTheme}
            className={`w-full flex items-center justify-between p-2.5 rounded-xl border text-xs font-bold transition-all ${
              isDark
                ? 'bg-white/5 border-white/10 text-slate-300 hover:text-white hover:border-white/30'
                : 'bg-slate-100 border-slate-200 text-slate-700 hover:text-black hover:border-slate-400'
            }`}
            title={`Switch to ${isDark ? 'Light' : 'Dark'} Theme`}
          >
            <div className="flex items-center gap-2.5">
              <div className="relative w-4 h-4 flex items-center justify-center">
                {isDark ? (
                  <Moon className="w-4 h-4 text-cyan-400 rotate-0 transition-transform duration-300" />
                ) : (
                  <Sun className="w-4 h-4 text-amber-500 rotate-90 transition-transform duration-300" />
                )}
              </div>
              {!sidebarCollapsed && (
                <span>{isDark ? 'Obsidian Dark' : 'Ceramic Light'}</span>
              )}
            </div>

            {!sidebarCollapsed && (
              <span className="text-[10px] font-mono opacity-60 uppercase">
                {theme}
              </span>
            )}
          </button>

          {/* ChemAI Assistant Trigger */}
          <button
            onClick={() => setAiModalOpen(true)}
            className={`w-full flex items-center gap-2.5 p-2.5 rounded-xl border text-xs font-bold transition-all ${
              isDark
                ? 'bg-gradient-to-r from-cyan-500/10 to-violet-500/10 border-cyan-500/20 text-cyan-300 hover:border-cyan-400/40 shadow-sm'
                : 'bg-gradient-to-r from-cyan-50 to-blue-50 border-cyan-200 text-cyan-800 hover:border-cyan-400 shadow-sm'
            }`}
            title="Open ChemAI Copilot"
          >
            <Bot className="w-4 h-4 text-cyan-400 shrink-0 animate-pulse" />
            {!sidebarCollapsed && <span className="font-black">ChemAI Copilot</span>}
          </button>

          {/* User Profile & Platform Identity Section */}
          <div className="pt-1">
            {user ? (
              <div className={`p-2.5 rounded-2xl border flex items-center justify-between gap-2 ${
                isDark ? 'bg-white/5 border-white/10' : 'bg-slate-100 border-slate-200'
              }`}>
                <div
                  onClick={() => {
                    if (user.isGuest) {
                      navigate('/login?mode=signup');
                    } else {
                      navigate('/settings?tab=scientist');
                    }
                  }}
                  className="flex items-center gap-2.5 cursor-pointer overflow-hidden flex-1"
                  title={user.isGuest ? "Guest Mode - Click to create a permanent account" : `${user.name || 'Scientist'} • ${user.workplace || 'ChemNova Lab'}`}
                >
                  <div className={`w-8 h-8 rounded-xl p-0.5 shadow-sm shrink-0 flex items-center justify-center font-black text-xs ${
                    user.isGuest 
                      ? isDark ? 'bg-neutral-800 text-white border border-neutral-700' : 'bg-neutral-200 text-black border border-neutral-300'
                      : 'bg-neutral-900 dark:bg-white text-white dark:text-black'
                  }`}>
                    {user.isGuest ? 'GT' : (user.avatar ? (
                      <img src={user.avatar} alt="User" className="w-full h-full rounded-[10px] object-cover" />
                    ) : (
                      user.name ? user.name.slice(0, 2).toUpperCase() : 'SC'
                    ))}
                  </div>

                  {!sidebarCollapsed && (
                    <div className="flex flex-col truncate">
                      <span className="text-xs font-bold text-[var(--text-primary)] truncate font-sans">
                        {user.name || (user.isGuest ? 'Guest Researcher' : 'Dr. Maruthi Chemist')}
                      </span>
                      <div className="flex items-center gap-1.5 text-[9px] font-mono truncate">
                        {user.isGuest ? (
                          <span className={`font-bold flex items-center gap-0.5 ${isDark ? 'text-neutral-400' : 'text-neutral-600'}`}>
                            GUEST EXPLORER
                          </span>
                        ) : (
                          <>
                            <span className="font-bold truncate max-w-[95px]">
                              {user.workplace || 'ChemSpace Lab'}
                            </span>
                            <span className="text-emerald-500 shrink-0 flex items-center gap-0.5 font-bold">
                              <ShieldCheck className="w-2.5 h-2.5" /> VERIFIED
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {!sidebarCollapsed && (
                  <div className="flex items-center gap-1 shrink-0">
                    {user.isGuest ? (
                      <button
                        onClick={() => navigate('/login?mode=signup')}
                        className={`px-2 py-1 rounded-lg text-[10px] font-bold tracking-tight transition cursor-pointer ${
                          isDark ? 'bg-white text-black hover:bg-neutral-200' : 'bg-black text-white hover:bg-neutral-800'
                        }`}
                        title="Create Account"
                      >
                        Sign Up
                      </button>
                    ) : (
                      <button
                        onClick={() => navigate('/settings?tab=scientist')}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-white transition"
                        title="Scientist Profile & Working Conditions"
                      >
                        <Settings className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <button
                      onClick={handleLogout}
                      className="p-1.5 rounded-lg text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition"
                      title={user.isGuest ? "Exit Guest Mode" : "Sign Out"}
                    >
                      <LogOut className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className={`p-2 rounded-2xl border flex items-center justify-between gap-2 ${
                isDark ? 'bg-white/5 border-white/10' : 'bg-slate-100 border-slate-200'
              }`}>
                <div
                  onClick={() => setGoogleModalOpen(true)}
                  className="flex items-center gap-2.5 cursor-pointer flex-1 overflow-hidden"
                  title="Sign In to Save Sketches"
                >
                  <div className="w-8 h-8 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 flex items-center justify-center shrink-0">
                    <User className="w-4 h-4" />
                  </div>

                  {!sidebarCollapsed && (
                    <div className="flex flex-col truncate">
                      <span className="text-xs font-bold text-[var(--text-primary)] truncate">Guest Scientist</span>
                      <span className="text-[9px] text-[var(--text-muted)] font-mono">Sign in for cloud sync</span>
                    </div>
                  )}
                </div>

                {!sidebarCollapsed && (
                  <button
                    onClick={() => setGoogleModalOpen(true)}
                    className="px-2.5 py-1.5 rounded-xl bg-cyan-500 text-black font-black text-[10px] uppercase tracking-wider shrink-0 shadow-md hover:bg-cyan-400 transition"
                  >
                    Sign In
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* 2. MAIN APPLICATION CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden min-h-screen">
        {/* Top Desktop Scientific Header Bar */}
        <header
          className={`sticky top-0 z-40 px-6 py-3 border-b backdrop-blur-2xl flex items-center justify-between gap-4 transition-colors duration-200 ${
            isDark
              ? 'bg-[#030407]/85 border-white/10 text-white'
              : 'bg-white/85 border-slate-200 text-slate-900'
          }`}
        >
          {/* Left: Active Workspace Breadcrumb */}
          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="opacity-50 uppercase font-bold">CHEMNOVA</span>
            <span className="opacity-30">/</span>
            <span className="font-black uppercase tracking-wider text-inherit">
              {location.pathname === '/'
                ? 'OVERVIEW'
                : location.pathname.replace('/', '').toUpperCase()}
            </span>
          </div>

          {/* Center: Global Search Bar */}
          <div className="hidden md:flex items-center flex-1 max-w-md mx-4">
            <form onSubmit={handleSearchSubmit} className="relative w-full">
              <Search className="w-3.5 h-3.5 opacity-50 absolute left-3.5 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search tools, formulas, reactions, SMILES..."
                className="input-control rounded-full pl-9 pr-4 py-1.5 text-xs font-mono"
              />
            </form>
          </div>

          {/* Right: Telemetry & Rotating Atom Launcher */}
          <div className="flex items-center gap-2.5">
            {/* Active Scientist Workplace & Working Condition Pill */}
            {user && (
              <div
                onClick={() => navigate('/settings?tab=scientist')}
                className="hidden lg:flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-mono bg-cyan-500/10 text-cyan-300 border border-cyan-500/25 cursor-pointer hover:border-cyan-400 hover:bg-cyan-500/20 transition shadow-sm"
                title="Scientist Workplace & Laboratory Working Conditions (Click to edit)"
              >
                <FlaskConical className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                <span className="font-bold truncate max-w-[150px] text-white">
                  {user.workplace ? user.workplace.split(' ')[0] + ' ' + (user.workplace.split(' ')[1] || '') : 'ChemNova Lab'}
                </span>
                <span className="opacity-40">•</span>
                <span className="text-emerald-400 font-semibold truncate max-w-[120px]">
                  {user.workingCondition ? user.workingCondition.split('•')[0].trim() : 'STP 25°C'}
                </span>
              </div>
            )}

            <RotatingAtomButton className="hidden sm:inline-flex" />

            <div className="telemetry-pill">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="hidden sm:inline">CLUSTER // ONLINE (60 FPS)</span>
            </div>
          </div>
        </header>

        {/* 3. FULL-PAGE WORKSPACE VIEWPORT MOUNT */}
        <main className="flex-1 w-full max-w-[1720px] mx-auto px-4 lg:px-8 py-4 z-10 flex flex-col">
          <GuestBanner />
          <Outlet />
        </main>

        {/* 4. FOOTER */}
        <footer
          className={`w-full border-t py-6 px-6 lg:px-8 text-xs font-mono transition-colors duration-200 ${
            isDark
              ? 'bg-[#050608]/90 border-white/10 text-slate-500'
              : 'bg-white/90 border-slate-200 text-slate-500'
          }`}
        >
          <div className="max-w-[1720px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Atom className="w-4 h-4 text-inherit" />
              <span className="font-bold">CHEMNOVA SCIENTIFIC PLATFORM</span>
              <span>// v4.0 DESKTOP OS</span>
            </div>
            <div className="flex flex-wrap items-center gap-4 text-[11px]">
              <NavLink to="/contact" className="hover:text-inherit transition">Documentation</NavLink>
              <NavLink to="/settings" className="hover:text-inherit transition">API Keys</NavLink>
              <NavLink to="/periodic-table" className="hover:text-inherit transition">Periodic Table</NavLink>
              <NavLink to="/scientists" className="hover:text-inherit transition">Nobel Pioneers</NavLink>
            </div>
            <div className="text-[10px] opacity-70">
              Powered by RDKit • Three.js WebGL • FastAPI
            </div>
          </div>
        </footer>
      </div>

      {/* Modals */}
      {aiModalOpen && <CopilotWindow onClose={() => setAiModalOpen(false)} />}
      {googleModalOpen && <GoogleAuthModal onClose={() => setGoogleModalOpen(false)} />}
    </div>
  );
}
