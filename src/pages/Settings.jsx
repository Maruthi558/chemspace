import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  User,
  Palette,
  Globe,
  Mic,
  Bot,
  EyeOff,
  ShieldCheck,
  Download,
  History as HistoryIcon,
  KeyRound,
  Check,
  Moon,
  Sun,
  Trash2,
  RefreshCw,
  Sliders,
  ExternalLink,
  Volume2,
  FileCode,
  Lock,
  LogOut,
  AlertTriangle,
  ArrowRight,
  Database,
  Search
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { getUserPreferences, saveUserPreferences } from '../services/userPreferences';
import { fetchUserDownloads, triggerFileDownload, deleteDownloadRecord, clearDownloadsHistory, formatBytes } from '../services/downloadsManager';
import { fetchUserWorkspaceHistory, deleteUserWorkspaceItem, clearUserWorkspaceHistory, fetchUserAuditLogs } from '../services/workspaceApi';
import { getSavedScientistProfile, saveScientistProfile } from '../services/firebase';

const CATEGORIES = [
  { id: 'profile', label: 'PROFILE', icon: User },
  { id: 'appearance', label: 'APPEARANCE', icon: Palette },
  { id: 'language', label: 'LANGUAGE', icon: Globe },
  { id: 'voice', label: 'VOICE', icon: Mic },
  { id: 'ai', label: 'AI ASSISTANT', icon: Bot },
  { id: 'privacy', label: 'PRIVACY', icon: EyeOff },
  { id: 'security', label: 'SECURITY', icon: ShieldCheck },
  { id: 'downloads', label: 'DOWNLOADS', icon: Download },
  { id: 'history', label: 'HISTORY', icon: HistoryIcon },
  { id: 'account', label: 'ACCOUNT', icon: KeyRound }
];

export default function Settings() {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const { user, isAuthenticated, isGuest, signOut } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const currentTab = searchParams.get('tab') || 'profile';
  const [activeTab, setActiveTab] = useState(currentTab);

  // User Preferences
  const [prefs, setPrefs] = useState(getUserPreferences());
  const [saveStatus, setSaveStatus] = useState('');

  // Profile data
  const [profile, setProfile] = useState(() => getSavedScientistProfile());
  const [profileSuccess, setProfileSuccess] = useState(false);

  // Downloads state
  const [downloads, setDownloads] = useState([]);
  const [downloadSearch, setDownloadSearch] = useState('');
  const [downloadLoading, setDownloadLoading] = useState(false);

  // History state
  const [historyItems, setHistoryItems] = useState([]);
  const [historyCategory, setHistoryCategory] = useState('all');
  const [historySearch, setHistorySearch] = useState('');
  const [historySort, setHistorySort] = useState('newest');
  const [historyLoading, setHistoryLoading] = useState(false);

  // Security audit logs
  const [auditLogs, setAuditLogs] = useState([]);

  useEffect(() => {
    const tabFromUrl = searchParams.get('tab');
    if (tabFromUrl && CATEGORIES.some((c) => c.id === tabFromUrl)) {
      setActiveTab(tabFromUrl);
    }
  }, [searchParams]);

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    setSearchParams({ tab: tabId });
  };

  // Preference update helper
  const handleUpdatePref = async (updates) => {
    const next = await saveUserPreferences(updates);
    setPrefs(next);
    setSaveStatus('Saved');
    setTimeout(() => setSaveStatus(''), 2000);
  };

  // Load section-specific data
  useEffect(() => {
    if (activeTab === 'downloads') {
      loadDownloads();
    } else if (activeTab === 'history') {
      loadHistory();
    } else if (activeTab === 'security') {
      loadAuditLogs();
    }
  }, [activeTab, downloadSearch, historyCategory, historySearch, historySort]);

  const loadDownloads = async () => {
    setDownloadLoading(true);
    try {
      const res = await fetchUserDownloads({ search: downloadSearch });
      if (res && res.items) setDownloads(res.items);
    } catch {}
    setDownloadLoading(false);
  };

  const loadHistory = async () => {
    setHistoryLoading(true);
    try {
      const res = await fetchUserWorkspaceHistory(historyCategory, historySearch, 50, 0, historySort);
      if (res && res.items) setHistoryItems(res.items);
    } catch {}
    setHistoryLoading(false);
  };

  const loadAuditLogs = async () => {
    try {
      const logs = await fetchUserAuditLogs(10);
      setAuditLogs(logs);
    } catch {}
  };

  const handleSaveProfile = (e) => {
    e.preventDefault();
    saveScientistProfile(profile);
    setProfileSuccess(true);
    setTimeout(() => setProfileSuccess(false), 2000);
  };

  const isDark = theme === 'dark';

  return (
    <div className={`min-h-screen pt-20 pb-16 px-4 sm:px-6 lg:px-8 transition-colors ${
      isDark ? 'bg-[#08080a] text-neutral-200' : 'bg-[#f8f9fa] text-neutral-800'
    }`}>
      <div className="max-w-6xl mx-auto space-y-6">

        {/* Top Control Center Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-200 dark:border-neutral-800">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-mono uppercase tracking-widest font-bold text-cyan-500">
                CONTROL CENTER
              </span>
              {saveStatus && (
                <span className="text-[10px] font-mono text-emerald-500 flex items-center gap-1 font-bold animate-in fade-in">
                  <Check className="w-3 h-3" /> {saveStatus}
                </span>
              )}
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
              Settings &amp; Personalization
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono opacity-60">
              {user ? (user.email || user.name) : 'Guest Researcher'}
            </span>
            <div className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider ${
              isAuthenticated ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
            }`}>
              {isAuthenticated ? 'Authenticated' : 'Guest'}
            </div>
          </div>
        </div>

        {/* 10 Clean Tab Navigation */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 no-scrollbar border-b border-neutral-200 dark:border-neutral-800">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const active = activeTab === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => handleTabChange(cat.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-mono font-bold tracking-wide shrink-0 transition cursor-pointer ${
                  active
                    ? isDark
                      ? 'bg-neutral-800 text-white shadow-sm border border-neutral-700'
                      : 'bg-white text-black shadow-sm border border-neutral-300'
                    : isDark
                      ? 'text-neutral-400 hover:text-white hover:bg-neutral-900'
                      : 'text-neutral-600 hover:text-black hover:bg-neutral-100'
                }`}
              >
                <Icon className="w-3.5 h-3.5 stroke-[1.75]" />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* Active Tab Panel */}
        <div className={`p-6 rounded-3xl border shadow-sm transition-all ${
          isDark ? 'bg-[#0f0f11] border-neutral-800' : 'bg-white border-neutral-200'
        }`}>

          {/* 1. PROFILE */}
          {activeTab === 'profile' && (
            <form onSubmit={handleSaveProfile} className="space-y-6 max-w-2xl">
              <div className="space-y-1">
                <h2 className="text-sm font-bold uppercase tracking-wider font-mono">Scientist Profile</h2>
                <p className="text-xs text-neutral-400">Manage credentials, lab affiliation, and research title.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
                <div>
                  <label className="block mb-1 font-bold">Scientist Name</label>
                  <input
                    type="text"
                    value={profile.name}
                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                    className={`w-full px-3 py-2 rounded-xl border ${
                      isDark ? 'bg-neutral-900 border-neutral-800 text-white' : 'bg-neutral-50 border-neutral-300 text-black'
                    }`}
                  />
                </div>

                <div>
                  <label className="block mb-1 font-bold">Professional Title</label>
                  <input
                    type="text"
                    value={profile.title}
                    onChange={(e) => setProfile({ ...profile, title: e.target.value })}
                    className={`w-full px-3 py-2 rounded-xl border ${
                      isDark ? 'bg-neutral-900 border-neutral-800 text-white' : 'bg-neutral-50 border-neutral-300 text-black'
                    }`}
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block mb-1 font-bold">Research Institution / Workplace</label>
                  <input
                    type="text"
                    value={profile.workplace}
                    onChange={(e) => setProfile({ ...profile, workplace: e.target.value })}
                    className={`w-full px-3 py-2 rounded-xl border ${
                      isDark ? 'bg-neutral-900 border-neutral-800 text-white' : 'bg-neutral-50 border-neutral-300 text-black'
                    }`}
                  />
                </div>

                <div>
                  <label className="block mb-1 font-bold">ORCID Identifier</label>
                  <input
                    type="text"
                    value={profile.orcid || ''}
                    onChange={(e) => setProfile({ ...profile, orcid: e.target.value })}
                    placeholder="0000-0002-1825-0097"
                    className={`w-full px-3 py-2 rounded-xl border ${
                      isDark ? 'bg-neutral-900 border-neutral-800 text-white' : 'bg-neutral-50 border-neutral-300 text-black'
                    }`}
                  />
                </div>

                <div>
                  <label className="block mb-1 font-bold">Lab Room / Cluster</label>
                  <input
                    type="text"
                    value={profile.labRoom || ''}
                    onChange={(e) => setProfile({ ...profile, labRoom: e.target.value })}
                    placeholder="Suite B-402"
                    className={`w-full px-3 py-2 rounded-xl border ${
                      isDark ? 'bg-neutral-900 border-neutral-800 text-white' : 'bg-neutral-50 border-neutral-300 text-black'
                    }`}
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl font-bold font-mono text-xs uppercase tracking-wider bg-cyan-600 hover:bg-cyan-500 text-white transition cursor-pointer"
                >
                  Save Profile
                </button>
                {profileSuccess && (
                  <span className="text-xs font-mono text-emerald-500 font-bold flex items-center gap-1">
                    <Check className="w-4 h-4" /> Updated
                  </span>
                )}
              </div>
            </form>
          )}

          {/* 2. APPEARANCE */}
          {activeTab === 'appearance' && (
            <div className="space-y-6 max-w-xl">
              <div className="space-y-1">
                <h2 className="text-sm font-bold uppercase tracking-wider font-mono">Appearance &amp; Theme</h2>
                <p className="text-xs text-neutral-400">Configure visual style and display preferences.</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setTheme('dark')}
                  className={`p-4 rounded-2xl border flex flex-col items-center gap-3 transition cursor-pointer ${
                    theme === 'dark'
                      ? 'border-cyan-500 bg-cyan-500/10 text-cyan-400'
                      : 'border-neutral-700 hover:border-neutral-600 text-neutral-400'
                  }`}
                >
                  <Moon className="w-6 h-6 stroke-[1.75]" />
                  <div className="text-center font-mono">
                    <div className="text-xs font-bold">Obsidian Dark</div>
                    <div className="text-[10px] opacity-70">High-contrast scientific mode</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setTheme('light')}
                  className={`p-4 rounded-2xl border flex flex-col items-center gap-3 transition cursor-pointer ${
                    theme === 'light'
                      ? 'border-cyan-500 bg-cyan-500/10 text-cyan-500'
                      : 'border-neutral-300 dark:border-neutral-700 hover:border-neutral-400 text-neutral-600 dark:text-neutral-400'
                  }`}
                >
                  <Sun className="w-6 h-6 stroke-[1.75]" />
                  <div className="text-center font-mono">
                    <div className="text-xs font-bold">Ceramic Light</div>
                    <div className="text-[10px] opacity-70">Bright daytime laboratory mode</div>
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* 3. LANGUAGE */}
          {activeTab === 'language' && (
            <div className="space-y-6 max-w-xl">
              <div className="space-y-1">
                <h2 className="text-sm font-bold uppercase tracking-wider font-mono">Language &amp; Translation</h2>
                <p className="text-xs text-neutral-400">Select conversational language. Chemical formulas and IUPAC nomenclature are strictly preserved.</p>
              </div>

              <div className="space-y-2">
                {[
                  { code: 'en', label: 'English', sub: 'Default scientific nomenclature' },
                  { code: 'es', label: 'Español', sub: 'Spanish' },
                  { code: 'fr', label: 'Français', sub: 'French' },
                  { code: 'de', label: 'Deutsch', sub: 'German' },
                  { code: 'zh', label: '中文 (Mandarin)', sub: 'Simplified Chinese' },
                  { code: 'ja', label: '日本語', sub: 'Japanese' }
                ].map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => handleUpdatePref({ language: lang.code })}
                    className={`w-full p-3.5 rounded-2xl border flex items-center justify-between text-left font-mono transition cursor-pointer ${
                      prefs.language === lang.code
                        ? 'border-cyan-500 bg-cyan-500/10 text-cyan-400'
                        : isDark
                          ? 'border-neutral-800 hover:bg-neutral-900 text-neutral-300'
                          : 'border-neutral-200 hover:bg-neutral-50 text-neutral-700'
                    }`}
                  >
                    <div>
                      <div className="text-xs font-bold">{lang.label}</div>
                      <div className="text-[10px] opacity-60">{lang.sub}</div>
                    </div>
                    {prefs.language === lang.code && <Check className="w-4 h-4 text-cyan-400" />}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 4. VOICE */}
          {activeTab === 'voice' && (
            <div className="space-y-6 max-w-xl">
              <div className="space-y-1">
                <h2 className="text-sm font-bold uppercase tracking-wider font-mono">Voice &amp; Speech Interface</h2>
                <p className="text-xs text-neutral-400">Configure speech-to-text recognition and text-to-speech audio playback.</p>
              </div>

              <div className="space-y-4 font-mono text-xs">
                <div className="flex items-center justify-between p-3.5 rounded-2xl border border-neutral-200 dark:border-neutral-800">
                  <div>
                    <div className="font-bold">Voice Output (TTS)</div>
                    <div className="text-[10px] text-neutral-400">Audio playback for scientific answers</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={prefs.voiceEnabled}
                    onChange={(e) => handleUpdatePref({ voiceEnabled: e.target.checked })}
                    className="w-4 h-4 accent-cyan-500 cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between p-3.5 rounded-2xl border border-neutral-200 dark:border-neutral-800">
                  <div>
                    <div className="font-bold">Auto-read Responses</div>
                    <div className="text-[10px] text-neutral-400">Automatically speak AI answers aloud</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={prefs.autoRead}
                    onChange={(e) => handleUpdatePref({ autoRead: e.target.checked })}
                    className="w-4 h-4 accent-cyan-500 cursor-pointer"
                  />
                </div>

                <div className="p-3.5 rounded-2xl border border-neutral-200 dark:border-neutral-800 space-y-2">
                  <div className="flex justify-between font-bold">
                    <span>Speech Rate</span>
                    <span className="text-cyan-400">{prefs.voiceSpeed}x</span>
                  </div>
                  <input
                    type="range"
                    min="0.75"
                    max="1.5"
                    step="0.25"
                    value={prefs.voiceSpeed}
                    onChange={(e) => handleUpdatePref({ voiceSpeed: parseFloat(e.target.value) })}
                    className="w-full accent-cyan-500 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-neutral-500">
                    <span>0.75x (Calm)</span>
                    <span>1.0x (Normal)</span>
                    <span>1.5x (Fast)</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 5. AI ASSISTANT */}
          {activeTab === 'ai' && (
            <div className="space-y-6 max-w-xl">
              <div className="space-y-1">
                <h2 className="text-sm font-bold uppercase tracking-wider font-mono">AI Scientific Assistant</h2>
                <p className="text-xs text-neutral-400">Configure ChemBot reasoning mode and external reference lookup.</p>
              </div>

              <div className="space-y-4 font-mono text-xs">
                <div className="space-y-2">
                  <label className="block font-bold">Response Mode</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'concise', label: 'Concise', sub: 'Brief answers' },
                      { id: 'balanced', label: 'Balanced', sub: 'Default lab flow' },
                      { id: 'detailed', label: 'Detailed', sub: 'In-depth derivations' }
                    ].map((mode) => (
                      <button
                        key={mode.id}
                        type="button"
                        onClick={() => handleUpdatePref({ aiResponseMode: mode.id })}
                        className={`p-3 rounded-xl border text-left transition cursor-pointer ${
                          prefs.aiResponseMode === mode.id
                            ? 'border-cyan-500 bg-cyan-500/10 text-cyan-400'
                            : isDark
                              ? 'border-neutral-800 hover:bg-neutral-900 text-neutral-400'
                              : 'border-neutral-200 hover:bg-neutral-50 text-neutral-600'
                        }`}
                      >
                        <div className="font-bold text-xs">{mode.label}</div>
                        <div className="text-[9px] opacity-70">{mode.sub}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between p-3.5 rounded-2xl border border-neutral-200 dark:border-neutral-800">
                  <div>
                    <div className="font-bold">Live PubChem External Lookup</div>
                    <div className="text-[10px] text-neutral-400">Query verified NCBI PubChem PUG REST API</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={prefs.webSearchEnabled}
                    onChange={(e) => handleUpdatePref({ webSearchEnabled: e.target.checked })}
                    className="w-4 h-4 accent-cyan-500 cursor-pointer"
                  />
                </div>
              </div>
            </div>
          )}

          {/* 6. PRIVACY */}
          {activeTab === 'privacy' && (
            <div className="space-y-6 max-w-xl">
              <div className="space-y-1">
                <h2 className="text-sm font-bold uppercase tracking-wider font-mono">Privacy &amp; Data Protection</h2>
                <p className="text-xs text-neutral-400">Zero-trust user data isolation and screen-capture deterrence.</p>
              </div>

              <div className="space-y-4 font-mono text-xs">
                <div className="flex items-center justify-between p-3.5 rounded-2xl border border-neutral-200 dark:border-neutral-800">
                  <div>
                    <div className="font-bold">Window Blur Privacy Mask</div>
                    <div className="text-[10px] text-neutral-400">Masks workspace when window focus is lost</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={prefs.privacyBlurEnabled}
                    onChange={(e) => handleUpdatePref({ privacyBlurEnabled: e.target.checked })}
                    className="w-4 h-4 accent-cyan-500 cursor-pointer"
                  />
                </div>

                <div className="p-3.5 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 text-emerald-400 space-y-1">
                  <div className="font-bold flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>Strict User Isolation Enforced</span>
                  </div>
                  <div className="text-[11px] opacity-80">
                    All private molecules, calculations, reactions, and downloads belong strictly to your authenticated UID.
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 7. SECURITY */}
          {activeTab === 'security' && (
            <div className="space-y-6 max-w-2xl">
              <div className="space-y-1">
                <h2 className="text-sm font-bold uppercase tracking-wider font-mono">Security &amp; Audit Trail</h2>
                <p className="text-xs text-neutral-400">Authentication state and server-side security event log.</p>
              </div>

              <div className="space-y-4 font-mono text-xs">
                <div className="flex items-center justify-between p-3.5 rounded-2xl border border-neutral-200 dark:border-neutral-800">
                  <div>
                    <div className="font-bold">Dynamic Security Watermark</div>
                    <div className="text-[10px] text-neutral-400">Displays masked UID and timestamp as redistribution deterrent</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={prefs.watermarkEnabled}
                    onChange={(e) => handleUpdatePref({ watermarkEnabled: e.target.checked })}
                    className="w-4 h-4 accent-cyan-500 cursor-pointer"
                  />
                </div>

                <div className="space-y-2">
                  <div className="font-bold text-xs uppercase tracking-wider">Recent Security Events</div>
                  {auditLogs.length === 0 ? (
                    <div className="p-4 rounded-2xl border border-dashed border-neutral-700 text-center text-neutral-500 text-xs">
                      No security incidents logged.
                    </div>
                  ) : (
                    <div className="space-y-1.5">
                      {auditLogs.map((log) => (
                        <div key={log.id} className="p-2.5 rounded-xl border border-neutral-800 bg-neutral-900/40 flex items-center justify-between">
                          <div>
                            <span className="font-bold text-cyan-400">{log.eventType}</span>
                            <span className="text-neutral-400 ml-2">{log.details}</span>
                          </div>
                          <span className="text-[10px] text-neutral-500 shrink-0">{log.date}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* 8. DOWNLOADS */}
          {activeTab === 'downloads' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <h2 className="text-sm font-bold uppercase tracking-wider font-mono">Downloads Manager</h2>
                  <p className="text-xs text-neutral-400">Only files actually generated or downloaded by you appear here.</p>
                </div>

                {downloads.length > 0 && (
                  <button
                    onClick={async () => {
                      if (confirm('Clear all downloads history? (This will not delete exported files from your computer)')) {
                        await clearDownloadsHistory();
                        loadDownloads();
                      }
                    }}
                    className="px-3 py-1.5 rounded-xl font-mono text-xs border border-red-500/30 text-red-400 hover:bg-red-500/10 transition cursor-pointer flex items-center gap-1.5 self-start sm:self-auto"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Clear Downloads
                  </button>
                )}
              </div>

              {/* Search Bar */}
              <div className="relative max-w-sm">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
                <input
                  type="text"
                  value={downloadSearch}
                  onChange={(e) => setDownloadSearch(e.target.value)}
                  placeholder="Search file name or module..."
                  className={`w-full pl-8 pr-3 py-2 rounded-xl border text-xs font-mono ${
                    isDark ? 'bg-neutral-900 border-neutral-800 text-white' : 'bg-neutral-50 border-neutral-300 text-black'
                  }`}
                />
              </div>

              {downloadLoading ? (
                <div className="p-8 text-center text-xs font-mono text-neutral-500">Loading downloads...</div>
              ) : downloads.length === 0 ? (
                <div className="p-12 text-center rounded-2xl border border-dashed border-neutral-800 space-y-2">
                  <Download className="w-8 h-8 text-neutral-600 mx-auto stroke-[1.5]" />
                  <div className="font-mono font-bold text-xs">No Downloads Yet</div>
                  <div className="text-[11px] font-mono text-neutral-500 max-w-xs mx-auto">
                    Export a molecule from ChemDraw, RDKit, or Quantum Chemistry to see it here.
                  </div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs font-mono text-left">
                    <thead>
                      <tr className="border-b border-neutral-800 text-neutral-400">
                        <th className="py-2.5 px-3">FILE NAME</th>
                        <th className="py-2.5 px-3">MODULE</th>
                        <th className="py-2.5 px-3">SIZE</th>
                        <th className="py-2.5 px-3">DATE</th>
                        <th className="py-2.5 px-3 text-right">ACTIONS</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-800/60">
                      {downloads.map((d) => (
                        <tr key={d.id} className="hover:bg-neutral-900/30 transition">
                          <td className="py-3 px-3 font-bold text-neutral-200">{d.fileName}</td>
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
                                loadDownloads();
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
              )}
            </div>
          )}

          {/* 9. HISTORY */}
          {activeTab === 'history' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <h2 className="text-sm font-bold uppercase tracking-wider font-mono">User Activity History</h2>
                  <p className="text-xs text-neutral-400">Strictly your authentic activity records. Zero mock data.</p>
                </div>

                {historyItems.length > 0 && (
                  <button
                    onClick={async () => {
                      if (confirm('Clear user history?')) {
                        await clearUserWorkspaceHistory(historyCategory);
                        loadHistory();
                      }
                    }}
                    className="px-3 py-1.5 rounded-xl font-mono text-xs border border-red-500/30 text-red-400 hover:bg-red-500/10 transition cursor-pointer flex items-center gap-1.5 self-start sm:self-auto"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Clear History
                  </button>
                )}
              </div>

              {/* Categories & Search */}
              <div className="flex flex-wrap items-center gap-2">
                {['all', 'molecules', 'calculations', 'reactions', 'experiments', 'files', 'downloads'].map((c) => (
                  <button
                    key={c}
                    onClick={() => setHistoryCategory(c)}
                    className={`px-3 py-1 rounded-lg text-[11px] font-mono uppercase tracking-wider transition cursor-pointer ${
                      historyCategory === c
                        ? 'bg-cyan-600 text-white font-bold'
                        : 'bg-neutral-800/60 text-neutral-400 hover:text-white'
                    }`}
                  >
                    {c}
                  </button>
                ))}

                <select
                  value={historySort}
                  onChange={(e) => setHistorySort(e.target.value)}
                  className={`ml-auto px-2.5 py-1 rounded-lg border text-xs font-mono ${
                    isDark ? 'bg-neutral-900 border-neutral-800 text-white' : 'bg-neutral-50 border-neutral-300 text-black'
                  }`}
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                </select>
              </div>

              {historyLoading ? (
                <div className="p-8 text-center text-xs font-mono text-neutral-500">Loading history...</div>
              ) : historyItems.length === 0 ? (
                <div className="p-12 text-center rounded-2xl border border-dashed border-neutral-800 space-y-2">
                  <Database className="w-8 h-8 text-neutral-600 mx-auto stroke-[1.5]" />
                  <div className="font-mono font-bold text-xs">No History Records</div>
                  <div className="text-[11px] font-mono text-neutral-500 max-w-xs mx-auto">
                    Your real actions on the platform will be logged here.
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  {historyItems.map((item) => (
                    <div
                      key={item.id}
                      className="p-3.5 rounded-2xl border border-neutral-800/80 bg-neutral-900/30 flex items-center justify-between gap-4 font-mono text-xs"
                    >
                      <div className="space-y-0.5 truncate">
                        <div className="font-bold text-neutral-200 truncate">{item.title}</div>
                        <div className="text-[10px] text-neutral-400 truncate">
                          {item.module} • {item.detail || item.category}
                        </div>
                      </div>

                      <button
                        onClick={async () => {
                          await deleteUserWorkspaceItem(item.id);
                          loadHistory();
                        }}
                        className="p-1.5 rounded-lg text-neutral-500 hover:text-red-400 transition cursor-pointer shrink-0"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 10. ACCOUNT */}
          {activeTab === 'account' && (
            <div className="space-y-6 max-w-xl font-mono text-xs">
              <div className="space-y-1">
                <h2 className="text-sm font-bold uppercase tracking-wider font-mono">Account Security</h2>
                <p className="text-xs text-neutral-400">Authenticated user identity and session controls.</p>
              </div>

              <div className="space-y-3 p-4 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/40">
                <div className="flex justify-between">
                  <span className="text-neutral-500">USER UID</span>
                  <span className="font-bold">{user?.uid || 'GUEST-SESSION'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">EMAIL</span>
                  <span className="font-bold">{user?.email || 'N/A (Guest)'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">ROLE</span>
                  <span className="font-bold">{user?.role || 'Lead Researcher'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">AUTH PROVIDER</span>
                  <span className="font-bold">{user?.provider || 'Firebase / OTP'}</span>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => {
                    signOut();
                    navigate('/login');
                  }}
                  className="px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider bg-red-600/10 hover:bg-red-600/20 text-red-400 border border-red-500/30 flex items-center gap-2 transition cursor-pointer"
                >
                  <LogOut className="w-4 h-4" /> Terminate Session &amp; Sign Out
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
