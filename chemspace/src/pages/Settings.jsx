import React, { useState, useEffect } from 'react';
import {
  Settings as SettingsIcon,
  Key,
  Layers,
  Check,
  Cpu,
  Save,
  Moon,
  Sun,
  Keyboard,
  RefreshCw,
  Trash2,
  Sliders,
  CheckCircle2,
  Activity,
  ShieldAlert
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { checkServerHealth } from '../services/api';
import { clearActivities, logActivity } from '../services/activityStore';

export default function Settings() {
  const { theme, setTheme, preferences, updatePreference, resetPreferences } = useTheme();

  const [apiKey, setApiKey] = useState('cs_api_99482701984712093847');
  const [fastApiEndpoint, setFastApiEndpoint] = useState('http://localhost:8000/api');
  const [saved, setSaved] = useState(false);
  const [serverHealth, setServerHealth] = useState({ online: false, checking: true, latency: 0 });
  const [activeTab, setActiveTab] = useState('general'); // general, shortcuts, diagnostics

  useEffect(() => {
    runLatencyCheck();
  }, []);

  const runLatencyCheck = () => {
    setServerHealth((prev) => ({ ...prev, checking: true }));
    const t0 = performance.now();
    checkServerHealth().then((res) => {
      const elapsed = Math.round(performance.now() - t0);
      setServerHealth({ online: res.online, checking: false, latency: elapsed, ...res });
    });
  };

  function handleSave(e) {
    e.preventDefault();
    setSaved(true);
    logActivity('Settings', 'Saved Platform Preferences', `Theme: ${theme}, Render Mode: ${preferences.defaultRenderMode}`, 'general');
    setTimeout(() => setSaved(false), 2000);
  }

  const handleResetDefaults = () => {
    resetPreferences();
    setTheme('dark');
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="workspace-container font-mono select-none">
      {/* 1. WORKSPACE HEADER */}
      <div className="workspace-header">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-white/5 border border-white/15">
            <SettingsIcon className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-black text-white tracking-wider">PLATFORM CONFIGURATION</span>
              <span className="text-[10px] bg-white text-black font-bold px-1.5 py-0.5 rounded">
                THEME • PREFERENCES • KEYMAP
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-sans">
              Configure RDKit Python REST API endpoints, 3D WebGL graphics settings, theme palettes, and keyboard shortcuts.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="telemetry-pill">
            <span
              className={`w-2 h-2 rounded-full ${serverHealth.checking ? 'bg-amber-400 animate-pulse' : serverHealth.online ? 'bg-emerald-400' : 'bg-red-400'
                }`}
            />
            <span>FASTAPI // {serverHealth.online ? `ONLINE (${serverHealth.latency}ms)` : 'OFFLINE'}</span>
          </div>
        </div>
      </div>

      {/* 2. SETTINGS NAVIGATION TABS */}
      <div className="glass-panel p-2.5 rounded-2xl flex items-center gap-2 border border-white/15">
        <button
          onClick={() => setActiveTab('general')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition ${activeTab === 'general' ? 'bg-white text-black font-black shadow-md' : 'text-slate-400 hover:text-white'
            }`}
        >
          General & Rendering
        </button>
        <button
          onClick={() => setActiveTab('shortcuts')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition ${activeTab === 'shortcuts' ? 'bg-white text-black font-black shadow-md' : 'text-slate-400 hover:text-white'
            }`}
        >
          Keyboard Shortcuts
        </button>
        <button
          onClick={() => setActiveTab('diagnostics')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition ${activeTab === 'diagnostics' ? 'bg-white text-black font-black shadow-md' : 'text-slate-400 hover:text-white'
            }`}
        >
          Diagnostics & Storage
        </button>
      </div>

      {/* 3. SETTINGS CONTENT VIEWS */}
      {activeTab === 'general' && (
        <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-12 gap-5 flex-1">
          {/* Theme & Calculation Preferences */}
          <div className="lg:col-span-6 glass-panel p-5 rounded-2xl space-y-4 border border-white/15">
            <h3 className="text-xs font-bold uppercase tracking-wider flex items-center gap-2 border-b border-inherit pb-3 text-white">
              <Sliders className="w-4 h-4 text-cyan-400" /> Appearance & Engine Preferences
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="opacity-70 block mb-1 font-sans">Active Visual Theme:</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setTheme('dark')}
                    className={`p-3 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-2 ${theme === 'dark'
                        ? 'bg-white text-black border-white shadow-lg'
                        : 'bg-[#02040a] text-slate-400 border-white/10 hover:border-white/30'
                      }`}
                  >
                    <Moon className="w-3.5 h-3.5" /> Dark Mode
                  </button>
                  <button
                    type="button"
                    onClick={() => setTheme('light')}
                    className={`p-3 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-2 ${theme === 'light'
                        ? 'bg-white text-black border-white shadow-lg'
                        : 'bg-[#02040a] text-slate-400 border-white/10 hover:border-white/30'
                      }`}
                  >
                    <Sun className="w-3.5 h-3.5" /> Light Clean
                  </button>
                </div>
              </div>

              <div>
                <label className="opacity-70 block mb-1 font-sans">Calculation Execution Engine:</label>
                <select
                  value={preferences.calcEnginePreference}
                  onChange={(e) => updatePreference('calcEnginePreference', e.target.value)}
                  className="input-control"
                >
                  <option value="auto">Auto (FastAPI Server with WebAssembly Fallback)</option>
                  <option value="local_fastapi">Force FastAPI Python Kernel (127.0.0.1:8000)</option>
                  <option value="client_wasm">Force Client-Side WebAssembly Engine</option>
                </select>
              </div>

              <div>
                <label className="opacity-70 block mb-1 font-sans">Numerical Calculation Precision:</label>
                <select
                  value={preferences.precision}
                  onChange={(e) => updatePreference('precision', parseInt(e.target.value, 10))}
                  className="input-control"
                >
                  <option value={2}>2 Decimal Places (Standard Scientific)</option>
                  <option value={4}>4 Decimal Places (High Precision)</option>
                  <option value={6}>6 Decimal Places (Quantum Physical)</option>
                </select>
              </div>
            </div>
          </div>

          {/* 3D Graphics Preferences & API Credentials */}
          <div className="lg:col-span-6 glass-panel p-5 rounded-2xl space-y-4 flex flex-col justify-between border border-white/15">
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider flex items-center gap-2 border-b border-inherit pb-3 text-white">
                <Layers className="w-4 h-4 text-violet-400" /> 3D WebGL & REST Configuration
              </h3>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="opacity-70 block mb-1 font-sans">Default 3D Molecular Style:</label>
                  <select
                    value={preferences.defaultRenderMode}
                    onChange={(e) => updatePreference('defaultRenderMode', e.target.value)}
                    className="input-control"
                  >
                    <option value="ball-stick">Ball and Stick</option>
                    <option value="space-fill">Space-Filling (CPK radii)</option>
                    <option value="stick">Stick Topology</option>
                    <option value="wireframe">Wireframe</option>
                  </select>
                </div>

                <div>
                  <label className="opacity-70 block mb-1 font-sans">FastAPI REST Backend Endpoint:</label>
                  <input
                    type="text"
                    value={fastApiEndpoint}
                    onChange={(e) => setFastApiEndpoint(e.target.value)}
                    className="input-control"
                  />
                </div>

                <div>
                  <label className="opacity-70 block mb-1 font-sans">Hardware Acceleration Context:</label>
                  <div className="p-3 inner-box text-emerald-400 flex items-center justify-between border border-white/10">
                    <span>WebGL 2.0 GPU Context</span>
                    <span className="font-bold">60 FPS ACTIVE</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="submit"
                className="flex-1 btn-horizontal btn-primary text-xs font-bold"
              >
                {saved ? <Check className="w-4 h-4 text-emerald-400" /> : <Save className="w-4 h-4" />}
                <span>{saved ? 'Preferences Saved' : 'Save Platform Settings'}</span>
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Keyboard Shortcuts Tab */}
      {activeTab === 'shortcuts' && (
        <div className="glass-panel p-5 rounded-2xl space-y-4 border border-white/15">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center gap-2">
              <Keyboard className="w-4 h-4 text-cyan-400" />
              <h3 className="text-sm font-bold text-white">Global Scientific Keyboard Shortcuts</h3>
            </div>
            <span className="text-xs text-slate-400 font-mono">Productivity Cheatsheet</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <div className="p-3.5 rounded-xl inner-box flex items-center justify-between border border-white/10">
              <span className="text-slate-300 font-sans">Execute Python Code in RDKit Lab</span>
              <kbd className="px-2.5 py-1 rounded bg-white/10 font-bold text-cyan-300 border border-white/20">
                Ctrl + Enter
              </kbd>
            </div>

            <div className="p-3.5 rounded-xl inner-box flex items-center justify-between border border-white/10">
              <span className="text-slate-300 font-sans">Simulate Spectra from SMILES Input</span>
              <kbd className="px-2.5 py-1 rounded bg-white/10 font-bold text-cyan-300 border border-white/20">
                Enter
              </kbd>
            </div>

            <div className="p-3.5 rounded-xl inner-box flex items-center justify-between border border-white/10">
              <span className="text-slate-300 font-sans">Undo 2D Chemical Sketch Action</span>
              <kbd className="px-2.5 py-1 rounded bg-white/10 font-bold text-violet-300 border border-white/20">
                Ctrl + Z
              </kbd>
            </div>

            <div className="p-3.5 rounded-xl inner-box flex items-center justify-between border border-white/10">
              <span className="text-slate-300 font-sans">Redo 2D Chemical Sketch Action</span>
              <kbd className="px-2.5 py-1 rounded bg-white/10 font-bold text-violet-300 border border-white/20">
                Ctrl + Y
              </kbd>
            </div>

            <div className="p-3.5 rounded-xl inner-box flex items-center justify-between border border-white/10">
              <span className="text-slate-300 font-sans">Switch Spectroscopy Modality (MS/IR/NMR/UV)</span>
              <kbd className="px-2.5 py-1 rounded bg-white/10 font-bold text-emerald-300 border border-white/20">
                1 - 5 Keys
              </kbd>
            </div>

            <div className="p-3.5 rounded-xl inner-box flex items-center justify-between border border-white/10">
              <span className="text-slate-300 font-sans">Focus Search in Periodic Table</span>
              <kbd className="px-2.5 py-1 rounded bg-white/10 font-bold text-amber-300 border border-white/20">
                / Key
              </kbd>
            </div>
          </div>
        </div>
      )}

      {/* Diagnostics Tab */}
      {activeTab === 'diagnostics' && (
        <div className="glass-panel p-5 rounded-2xl space-y-4 border border-white/15">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-bold text-white">System Diagnostics & Storage State</h3>
            </div>
            <button
              onClick={runLatencyCheck}
              className="btn-horizontal btn-secondary text-xs"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${serverHealth.checking ? 'animate-spin' : ''}`} />
              <span>Ping FastAPI Server</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            <div className="p-4 rounded-xl inner-box space-y-1 border border-white/10">
              <span className="text-[10px] text-slate-400 block font-sans">FastAPI Ping Latency</span>
              <div className="text-xl font-black text-emerald-400">{serverHealth.latency} ms</div>
              <span className="text-[10px] text-slate-500">Localhost loopback</span>
            </div>

            <div className="p-4 rounded-xl inner-box space-y-1 border border-white/10">
              <span className="text-[10px] text-slate-400 block font-sans">RDKit Engine Status</span>
              <div className="text-xl font-black text-cyan-400">
                {serverHealth.rdkit_available ? 'C++ Kernel Active' : 'Client Graph Engine Active'}
              </div>
              <span className="text-[10px] text-slate-500">Graceful fallback engaged</span>
            </div>

            <div className="p-4 rounded-xl inner-box space-y-1 border border-white/10">
              <span className="text-[10px] text-slate-400 block font-sans">Local Storage Cache</span>
              <div className="text-xl font-black text-white">Persistent</div>
              <span className="text-[10px] text-slate-500">Sketches & telemetry stored</span>
            </div>
          </div>

          <div className="pt-3 border-t border-white/10 flex flex-wrap items-center justify-between gap-3">
            <button
              onClick={() => {
                clearActivities();
                setSaved(true);
                setTimeout(() => setSaved(false), 2000);
              }}
              className="btn-horizontal btn-secondary text-xs text-red-400 hover:bg-red-950/40"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear Activity Log History</span>
            </button>

            <button
              onClick={handleResetDefaults}
              className="btn-horizontal btn-secondary text-xs"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reset Platform Defaults</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
