import React, { useState, useRef } from 'react';
import {
  Activity,
  BarChart2,
  Radio,
  Sun,
  Eye,
  Search,
  Sparkles,
  Download,
  AlertTriangle,
  X,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Info,
  Printer,
  FileText,
  Atom,
  CheckCircle2,
  Sliders,
  ChevronRight
} from 'lucide-react';
import { calculateFullSpectroscopyDossier } from '../services/spectroscopyEngine';
import { logActivity } from '../services/activityStore';

export default function SpectroscopySuite() {
  // Input & Simulation State
  const [smilesInput, setSmilesInput] = useState('CC(=O)OC1=CC=CC=C1C(=O)O');
  const [dossier, setDossier] = useState(() => calculateFullSpectroscopyDossier('CC(=O)OC1=CC=CC=C1C(=O)O'));
  const [activeTechnique, setActiveTechnique] = useState('ir'); // ir, uv, nmr, ms
  const [nmrSubTab, setNmrSubTab] = useState('1h'); // 1h, 13c
  const [irDisplayMode, setIrDisplayMode] = useState('transmittance'); // transmittance, absorbance
  const [searchFilter, setSearchFilter] = useState('');

  // Interactive Chart Controls
  const [zoomLevel, setZoomLevel] = useState(1.0);
  const [crosshairPos, setCrosshairPos] = useState(null); // { x, y, valX, valY }
  const [hoveredPeak, setHoveredPeak] = useState(null);

  // Beer-Lambert Simulator State
  const [concentration, setConcentration] = useState(0.0025);
  const [pathLength, setPathLength] = useState(1.0);

  // Loading & Error States
  const [isCalculating, setIsCalculating] = useState(false);
  const [errorModal, setErrorModal] = useState(null); // { title, reason }
  const [exportSuccess, setExportSuccess] = useState(false);

  const chartSvgRef = useRef(null);

  // Core Simulation Function
  function handleAnalyze(targetSmiles) {
    const query = (targetSmiles !== undefined ? targetSmiles : smilesInput).trim();
    if (!query) {
      showErrorModal('Invalid molecular structure.', 'Please provide a non-empty canonical SMILES or structure string.');
      return;
    }

    setIsCalculating(true);
    setTimeout(() => {
      const result = calculateFullSpectroscopyDossier(query);
      if (!result.valid) {
        setIsCalculating(false);
        showErrorModal('Invalid molecular structure.', result.reason || 'The provided SMILES syntax could not be parsed or contains invalid chemical valencies.');
        return;
      }

      setDossier(result);
      setIsCalculating(false);
      setZoomLevel(1.0);

      logActivity(
        'Spectroscopy',
        `Simulated Spectra (${result.metadata.name})`,
        `Calculated FT-IR, UV-Vis, 1H/13C NMR & EI-MS for ${result.metadata.formula}`,
        'spectroscopy'
      );
    }, 300);
  }

  function showErrorModal(title, reason) {
    setErrorModal({
      title: title || 'Invalid molecular structure.',
      reason: reason || 'Please verify the chemical structure syntax and try again.'
    });
  }

  // Print-Ready Laboratory PDF Report
  function handleDownloadPdfReport() {
    window.print();
    setExportSuccess(true);
    setTimeout(() => setExportSuccess(false), 2200);
  }

  // Interactive Crosshair Mouse Handler
  function handleChartMouseMove(e) {
    if (!chartSvgRef.current) return;
    const rect = chartSvgRef.current.getBoundingClientRect();
    const clientX = e.clientX - rect.left;
    const clientY = e.clientY - rect.top;
    const width = rect.width;
    const height = rect.height;

    if (clientX < 45 || clientX > width - 20 || clientY < 20 || clientY > height - 30) {
      setCrosshairPos(null);
      return;
    }

    let valX = 0;
    let valY = 0;

    if (activeTechnique === 'ir') {
      const ratio = (clientX - 45) / (width - 65);
      valX = `${Math.round(4000 - ratio * 3600)} cm⁻¹`;
      const ratioY = (height - 30 - clientY) / (height - 50);
      valY = irDisplayMode === 'transmittance' ? `${Math.round(ratioY * 100)}%T` : (ratioY * 1.5).toFixed(2);
    } else if (activeTechnique === 'uv') {
      const ratio = (clientX - 45) / (width - 65);
      valX = `${Math.round(200 + ratio * 400)} nm`;
      const ratioY = (height - 30 - clientY) / (height - 50);
      valY = `${(ratioY * 2.0).toFixed(3)} AU`;
    } else if (activeTechnique === 'nmr') {
      const maxShift = nmrSubTab === '1h' ? 14 : 220;
      const ratio = (width - 20 - clientX) / (width - 65);
      valX = `δ ${(ratio * maxShift).toFixed(2)} ppm`;
      valY = 'Intensity 1.0';
    } else if (activeTechnique === 'ms') {
      const maxMz = Math.max(dossier.massSpec.nominalMass + 30, 150);
      const ratio = (clientX - 45) / (width - 65);
      valX = `m/z ${Math.round(ratio * maxMz)}`;
      const ratioY = (height - 30 - clientY) / (height - 50);
      valY = `${Math.round(ratioY * 100)}% Abundance`;
    }

    setCrosshairPos({ x: clientX, y: clientY, valX, valY });
  }

  // Absorbance computation for Beer-Lambert
  const computedAbsorbance = (dossier.uvVis.extinction * concentration * pathLength).toFixed(3);
  const computedTransmittance = Math.max(0, Math.min(100, Math.pow(10, -parseFloat(computedAbsorbance)) * 100)).toFixed(1);

  return (
    <div className="workspace-container font-mono select-none">
      {/* 1. WORKSPACE HEADER */}
      <div className="workspace-header">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-white/5 border border-inherit">
            <Radio className="w-5 h-5 text-inherit" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-black tracking-wider uppercase">
                SPECTROSCOPY ANALYSIS WORKSTATION
              </span>
              <span className="text-[10px] bg-slate-900 text-white dark:bg-white dark:text-black font-bold px-1.5 py-0.5 rounded">
                COMPUTATIONAL PREDICTOR
              </span>
            </div>
            <p className="text-[11px] opacity-70 font-sans">
              High-resolution FT-IR, UV-Visible, 1H/13C NMR spin deconvolution, and EI Mass Spectrometry.
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <div className="telemetry-pill text-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>SAMPLE: {dossier.metadata.name} ({dossier.metadata.formula})</span>
          </div>

          <button
            onClick={handleDownloadPdfReport}
            className="btn-horizontal btn-primary text-xs"
            title="Download Print-Ready Scientific Laboratory Report"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Download PDF Report</span>
          </button>
        </div>
      </div>

      {/* 2. PRIMARY SMILES INPUT BAR */}
      <div className="glass-panel p-4 rounded-2xl flex flex-col md:flex-row items-center gap-3 shadow-lg">
        <div className="flex items-center gap-2 w-full flex-1">
          <span className="text-xs font-bold shrink-0 opacity-80">SMILES Structure:</span>
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Enter canonical SMILES (e.g. CCO, c1ccccc1, CC(=O)OC1=CC=CC=C1C(=O)O)..."
              value={smilesInput}
              onChange={(e) => setSmilesInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAnalyze()}
              className="input-control text-xs font-mono font-bold"
            />
          </div>
          <button
            onClick={() => handleAnalyze()}
            disabled={isCalculating}
            className="btn-horizontal btn-primary text-xs shrink-0"
          >
            <Sparkles className={`w-3.5 h-3.5 ${isCalculating ? 'animate-spin' : ''}`} />
            <span>{isCalculating ? 'Computing Spectra...' : 'Analyze Structure'}</span>
          </button>
        </div>
      </div>

      {/* 3. SCIENTIFIC METADATA & PROGRESS SUMMARY BAR */}
      <div className="p-3 px-4 rounded-xl inner-box text-xs font-sans flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-[11px] opacity-80">
          <Info className="w-4 h-4 text-cyan-400 shrink-0" />
          <span>
            <strong>Computational Simulation:</strong> All spectral lines and assignments are predicted via quantum-chemical / empirical analytical algorithms.
          </span>
        </div>
        <div className="flex items-center gap-4 text-[11px] font-mono font-bold">
          <span>Formula: <strong className="text-emerald-400">{dossier.metadata.formula}</strong></span>
          <span>MW: <strong className="text-cyan-400">{dossier.metadata.mw} g/mol</strong></span>
          <span>Exact Mass: <strong className="text-amber-400">{dossier.metadata.monoisotopicMass} u</strong></span>
        </div>
      </div>

      {/* 4. FOUR MAIN WORKSPACE MODALITY TABS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Tab 1: FT-IR */}
        <button
          onClick={() => setActiveTechnique('ir')}
          className={`p-4 rounded-2xl border transition flex items-center gap-3 text-left ${
            activeTechnique === 'ir'
              ? 'bg-slate-900 text-white dark:bg-white dark:text-black border-slate-900 dark:border-white shadow-xl font-black'
              : 'bg-white/50 dark:bg-[#02040a] border-inherit opacity-70 hover:opacity-100'
          }`}
        >
          <Radio className={`w-5 h-5 ${activeTechnique === 'ir' ? 'text-rose-400 dark:text-rose-600' : 'text-rose-400'}`} />
          <div>
            <div className="font-bold text-xs">1. FT-IR Spectroscopy</div>
            <div className="text-[10px] opacity-70">4000 - 400 cm⁻¹ • Bands</div>
          </div>
        </button>

        {/* Tab 2: UV-Vis */}
        <button
          onClick={() => setActiveTechnique('uv')}
          className={`p-4 rounded-2xl border transition flex items-center gap-3 text-left ${
            activeTechnique === 'uv'
              ? 'bg-slate-900 text-white dark:bg-white dark:text-black border-slate-900 dark:border-white shadow-xl font-black'
              : 'bg-white/50 dark:bg-[#02040a] border-inherit opacity-70 hover:opacity-100'
          }`}
        >
          <Sun className={`w-5 h-5 ${activeTechnique === 'uv' ? 'text-amber-400 dark:text-amber-600' : 'text-amber-400'}`} />
          <div>
            <div className="font-bold text-xs">2. UV-Visible Spec</div>
            <div className="text-[10px] opacity-70">λmax {dossier.uvVis.lambdaMax} nm • Transitions</div>
          </div>
        </button>

        {/* Tab 3: NMR */}
        <button
          onClick={() => setActiveTechnique('nmr')}
          className={`p-4 rounded-2xl border transition flex items-center gap-3 text-left ${
            activeTechnique === 'nmr'
              ? 'bg-slate-900 text-white dark:bg-white dark:text-black border-slate-900 dark:border-white shadow-xl font-black'
              : 'bg-white/50 dark:bg-[#02040a] border-inherit opacity-70 hover:opacity-100'
          }`}
        >
          <Eye className={`w-5 h-5 ${activeTechnique === 'nmr' ? 'text-violet-400 dark:text-violet-600' : 'text-violet-400'}`} />
          <div>
            <div className="font-bold text-xs">3. NMR Spectroscopy</div>
            <div className="text-[10px] opacity-70">¹H & ¹³C / DEPT-135 Shifts</div>
          </div>
        </button>

        {/* Tab 4: Mass Spec */}
        <button
          onClick={() => setActiveTechnique('ms')}
          className={`p-4 rounded-2xl border transition flex items-center gap-3 text-left ${
            activeTechnique === 'ms'
              ? 'bg-slate-900 text-white dark:bg-white dark:text-black border-slate-900 dark:border-white shadow-xl font-black'
              : 'bg-white/50 dark:bg-[#02040a] border-inherit opacity-70 hover:opacity-100'
          }`}
        >
          <BarChart2 className={`w-5 h-5 ${activeTechnique === 'ms' ? 'text-cyan-400 dark:text-cyan-600' : 'text-cyan-400'}`} />
          <div>
            <div className="font-bold text-xs">4. Mass Spectrometry</div>
            <div className="text-[10px] opacity-70">EI 70 eV • Isotope Cluster</div>
          </div>
        </button>
      </div>

      {/* 5. MAIN INTERACTIVE SPECTRAL VIEWPORT & TOOLBAR */}
      <div className="glass-panel p-5 rounded-2xl space-y-4 shadow-2xl">
        {/* Viewport Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-inherit pb-3">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold flex items-center gap-2">
              {activeTechnique === 'ir' && <Radio className="w-4 h-4 text-rose-400" />}
              {activeTechnique === 'uv' && <Sun className="w-4 h-4 text-amber-400" />}
              {activeTechnique === 'nmr' && <Eye className="w-4 h-4 text-violet-400" />}
              {activeTechnique === 'ms' && <BarChart2 className="w-4 h-4 text-cyan-400" />}
              {activeTechnique === 'ir' && `FT-IR Vibrational Spectrum — ${dossier.metadata.name}`}
              {activeTechnique === 'uv' && `UV-Visible Electronic Spectrum — ${dossier.metadata.name}`}
              {activeTechnique === 'nmr' && `${nmrSubTab === '1h' ? '¹H-NMR Proton' : '¹³C-NMR Carbon'} Spectrum — ${dossier.metadata.name}`}
              {activeTechnique === 'ms' && `EI Mass Spectrum & Isotope Pattern — ${dossier.metadata.name}`}
            </span>
          </div>

          {/* Sub-controls */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            {activeTechnique === 'ir' && (
              <div className="flex items-center gap-1 inner-box p-1 rounded-lg">
                <button
                  onClick={() => setIrDisplayMode('transmittance')}
                  className={`px-2.5 py-1 rounded text-[10px] font-bold ${
                    irDisplayMode === 'transmittance' ? 'bg-slate-900 text-white dark:bg-white dark:text-black' : 'opacity-70'
                  }`}
                >
                  % Transmittance
                </button>
                <button
                  onClick={() => setIrDisplayMode('absorbance')}
                  className={`px-2.5 py-1 rounded text-[10px] font-bold ${
                    irDisplayMode === 'absorbance' ? 'bg-slate-900 text-white dark:bg-white dark:text-black' : 'opacity-70'
                  }`}
                >
                  Absorbance (A)
                </button>
              </div>
            )}

            {activeTechnique === 'nmr' && (
              <div className="flex items-center gap-1 inner-box p-1 rounded-lg">
                <button
                  onClick={() => setNmrSubTab('1h')}
                  className={`px-2.5 py-1 rounded text-[10px] font-bold ${
                    nmrSubTab === '1h' ? 'bg-slate-900 text-white dark:bg-white dark:text-black' : 'opacity-70'
                  }`}
                >
                  ¹H NMR (400 MHz)
                </button>
                <button
                  onClick={() => setNmrSubTab('13c')}
                  className={`px-2.5 py-1 rounded text-[10px] font-bold ${
                    nmrSubTab === '13c' ? 'bg-slate-900 text-white dark:bg-white dark:text-black' : 'opacity-70'
                  }`}
                >
                  ¹³C NMR / DEPT
                </button>
              </div>
            )}

            {/* Zoom Controls */}
            <div className="flex items-center gap-1 inner-box p-1 rounded-lg">
              <button
                onClick={() => setZoomLevel((z) => Math.max(0.6, z - 0.2))}
                className="p-1 opacity-70 hover:opacity-100"
                title="Zoom Out"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="text-[10px] px-1 font-bold">{Math.round(zoomLevel * 100)}%</span>
              <button
                onClick={() => setZoomLevel((z) => Math.min(2.5, z + 0.2))}
                className="p-1 opacity-70 hover:opacity-100"
                title="Zoom In"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setZoomLevel(1.0)}
                className="p-1 opacity-70 hover:opacity-100"
                title="Reset Zoom"
              >
                <RotateCcw className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>

        {/* INTERACTIVE SVG SPECTRUM CANVAS */}
        <div
          className="w-full h-80 bg-[#02040a] rounded-xl border border-inherit p-4 relative overflow-hidden cursor-crosshair"
          onMouseMove={handleChartMouseMove}
          onMouseLeave={() => setCrosshairPos(null)}
        >
          <svg
            ref={chartSvgRef}
            className="w-full h-full"
            viewBox="0 0 600 240"
            preserveAspectRatio="none"
          >
            <line x1="50" y1="20" x2="50" y2="200" stroke="#334155" strokeWidth="1.5" />
            <line x1="50" y1="200" x2="580" y2="200" stroke="#334155" strokeWidth="1.5" />

            {/* ================= FT-IR SPECTRUM ================= */}
            {activeTechnique === 'ir' && (
              <>
                {[4000, 3500, 3000, 2500, 2000, 1500, 1000, 500].map((w) => {
                  const x = 580 - ((w - 400) / 3600) * 530;
                  return (
                    <g key={w}>
                      <line x1={x} y1="196" x2={x} y2="204" stroke="#64748b" strokeWidth="1.2" />
                      <text x={x} y="218" fill="#64748b" fontSize="8" textAnchor="middle">
                        {w} cm⁻¹
                      </text>
                    </g>
                  );
                })}

                {[100, 75, 50, 25, 0].map((val) => {
                  const y = 20 + ((100 - val) / 100) * 180;
                  return (
                    <g key={val}>
                      <line x1="45" y1={y} x2="580" y2={y} stroke="#1e293b" strokeDasharray="3 3" />
                      <text x="40" y={y + 3} fill="#64748b" fontSize="8" textAnchor="end">
                        {irDisplayMode === 'transmittance' ? `${val}%T` : (val / 50).toFixed(1)}
                      </text>
                    </g>
                  );
                })}

                {/* Characteristic Diagnostic Region Highlight Bands */}
                <rect x={580 - ((3700 - 400) / 3600) * 530} y="20" width={((3700 - 3200) / 3600) * 530} height="180" fill="rgba(244, 63, 94, 0.05)" />
                <rect x={580 - ((1850 - 400) / 3600) * 530} y="20" width={((1850 - 1650) / 3600) * 530} height="180" fill="rgba(56, 189, 248, 0.05)" />

                <path
                  d={dossier.ir.curve.reduce((acc, pt, i) => {
                    const x = 580 - ((pt.wavenumber - 400) / 3600) * 530;
                    const y = irDisplayMode === 'transmittance'
                      ? 20 + ((100 - pt.transmittance) / 100) * 180
                      : 200 - (pt.absorbance / 1.5) * 180;
                    return `${acc} ${i === 0 ? 'M' : 'L'} ${x} ${y}`;
                  }, '')}
                  fill="none"
                  stroke="#f43f5e"
                  strokeWidth="2.2"
                />

                {dossier.ir.keyBands.map((band) => {
                  const x = 580 - ((band.wavenumber - 400) / 3600) * 530;
                  return (
                    <g key={band.wavenumber}>
                      <line x1={x} y1="20" x2={x} y2="200" stroke="rgba(244, 63, 94, 0.2)" strokeDasharray="2 2" />
                      <circle cx={x} cy={75} r="3" fill="#f43f5e" />
                      <text x={x} y="65" fill="#ffffff" fontSize="8" fontWeight="bold" textAnchor="middle">
                        {band.wavenumber}
                      </text>
                    </g>
                  );
                })}
              </>
            )}

            {/* ================= UV-VIS SPECTRUM ================= */}
            {activeTechnique === 'uv' && (
              <>
                {[200, 250, 300, 350, 400, 450, 500, 550, 600].map((l) => {
                  const x = 50 + ((l - 200) / 400) * 530;
                  return (
                    <g key={l}>
                      <line x1={x} y1="196" x2={x} y2="204" stroke="#64748b" strokeWidth="1.2" />
                      <text x={x} y="218" fill="#64748b" fontSize="8" textAnchor="middle">
                        {l} nm
                      </text>
                    </g>
                  );
                })}

                {[0, 0.5, 1.0, 1.5, 2.0].map((a) => {
                  const y = 200 - (a / 2.0) * 180;
                  return (
                    <g key={a}>
                      <line x1="45" y1={y} x2="580" y2={y} stroke="#1e293b" strokeDasharray="3 3" />
                      <text x="40" y={y + 3} fill="#64748b" fontSize="8" textAnchor="end">
                        {a.toFixed(1)} AU
                      </text>
                    </g>
                  );
                })}

                <path
                  d={dossier.uvVis.curve.reduce((acc, pt, i) => {
                    const x = 50 + ((pt.wavelength - 200) / 400) * 530;
                    const y = 200 - (pt.absorbance / 2.0) * 180;
                    return `${acc} ${i === 0 ? 'M' : 'L'} ${x} ${y}`;
                  }, '')}
                  fill="none"
                  stroke="#fbbf24"
                  strokeWidth="2.5"
                />

                <line
                  x1={50 + ((dossier.uvVis.lambdaMax - 200) / 400) * 530}
                  y1="20"
                  x2={50 + ((dossier.uvVis.lambdaMax - 200) / 400) * 530}
                  y2="200"
                  stroke="#fbbf24"
                  strokeDasharray="3 3"
                />
                <circle
                  cx={50 + ((dossier.uvVis.lambdaMax - 200) / 400) * 530}
                  cy={35}
                  r="4"
                  fill="#fbbf24"
                />
                <text
                  x={50 + ((dossier.uvVis.lambdaMax - 200) / 400) * 530}
                  y="25"
                  fill="#ffffff"
                  fontSize="9"
                  fontWeight="bold"
                  textAnchor="middle"
                >
                  λmax = {dossier.uvVis.lambdaMax} nm
                </text>
              </>
            )}

            {/* ================= NMR SPECTRUM ================= */}
            {activeTechnique === 'nmr' && (
              <>
                {nmrSubTab === '1h' ? (
                  <>
                    {[0, 2, 4, 6, 8, 10, 12, 14].map((s) => {
                      const x = 580 - (s / 14) * 530;
                      return (
                        <g key={s}>
                          <line x1={x} y1="196" x2={x} y2="204" stroke="#64748b" strokeWidth="1.2" />
                          <text x={x} y="218" fill="#64748b" fontSize="8" textAnchor="middle">
                            {s} ppm
                          </text>
                        </g>
                      );
                    })}

                    <line x1="580" y1="20" x2="580" y2="200" stroke="#a78bfa" strokeWidth="1.5" />
                    <text x="580" y="15" fill="#a78bfa" fontSize="8" textAnchor="middle">
                      TMS (0.00)
                    </text>

                    {dossier.nmr.protonSignals.map((p, idx) => {
                      const x = 580 - (p.shift / 14) * 530;
                      const height = 50 + (p.integration || 1) * 30;
                      const y = 200 - height;
                      return (
                        <g key={idx}>
                          <line x1={x} y1="200" x2={x} y2={y} stroke="#a78bfa" strokeWidth="2.5" />
                          <circle cx={x} cy={y} r="3.5" fill="#a78bfa" />
                          <text x={x} y={y - 8} fill="#ffffff" fontSize="9" fontWeight="bold" textAnchor="middle">
                            {p.shift} ppm ({p.multiplicityShort})
                          </text>
                        </g>
                      );
                    })}
                  </>
                ) : (
                  <>
                    {[0, 40, 80, 120, 160, 200].map((s) => {
                      const x = 580 - (s / 220) * 530;
                      return (
                        <g key={s}>
                          <line x1={x} y1="196" x2={x} y2="204" stroke="#64748b" strokeWidth="1.2" />
                          <text x={x} y="218" fill="#64748b" fontSize="8" textAnchor="middle">
                            {s} ppm
                          </text>
                        </g>
                      );
                    })}

                    {dossier.nmr.carbonSignals.map((c, idx) => {
                      const x = 580 - (c.shift / 220) * 530;
                      return (
                        <g key={idx}>
                          <line x1={x} y1="200" x2={x} y2="70" stroke="#34d399" strokeWidth="2.5" />
                          <circle cx={x} cy={70} r="3.5" fill="#34d399" />
                          <text x={x} y="58" fill="#ffffff" fontSize="9" fontWeight="bold" textAnchor="middle">
                            {c.shift} ppm
                          </text>
                        </g>
                      );
                    })}
                  </>
                )}
              </>
            )}

            {/* ================= MASS SPEC ================= */}
            {activeTechnique === 'ms' && (
              <>
                {[100, 75, 50, 25, 0].map((val) => {
                  const y = 200 - (val / 100) * 180;
                  return (
                    <g key={val}>
                      <line x1="45" y1={y} x2="580" y2={y} stroke="#1e293b" strokeDasharray="3 3" />
                      <text x="40" y={y + 3} fill="#64748b" fontSize="8" textAnchor="end">
                        {val}%
                      </text>
                    </g>
                  );
                })}

                {dossier.massSpec.peaks.map((p) => {
                  const maxMz = Math.max(dossier.massSpec.nominalMass + 30, 150);
                  const x = 50 + (p.mz / maxMz) * 530;
                  const y = 200 - (p.intensity / 100) * 180;
                  const isHovered = hoveredPeak === p.mz;

                  return (
                    <g
                      key={p.mz}
                      onMouseEnter={() => setHoveredPeak(p.mz)}
                      onMouseLeave={() => setHoveredPeak(null)}
                      className="cursor-pointer"
                    >
                      <line
                        x1={x}
                        y1="200"
                        x2={x}
                        y2={y}
                        stroke={p.mz === dossier.massSpec.basePeakMz ? '#38bdf8' : '#e2e8f0'}
                        strokeWidth={isHovered ? 4.5 : 2.5}
                      />
                      <circle cx={x} cy={y} r={isHovered ? 4 : 2.5} fill={isHovered ? '#38bdf8' : '#ffffff'} />
                      <text
                        x={x}
                        y={y - 6}
                        fill={isHovered ? '#38bdf8' : '#cbd5e1'}
                        fontSize="9"
                        fontWeight="bold"
                        textAnchor="middle"
                      >
                        m/z {p.mz}
                      </text>
                    </g>
                  );
                })}
              </>
            )}

            {/* Crosshair Cursor Lines */}
            {crosshairPos && (
              <g pointerEvents="none">
                <line x1={crosshairPos.x} y1="20" x2={crosshairPos.x} y2="200" stroke="#ffffff" strokeWidth="0.8" strokeDasharray="2 2" />
                <line x1="50" y1={crosshairPos.y} x2="580" y2={crosshairPos.y} stroke="#ffffff" strokeWidth="0.8" strokeDasharray="2 2" />
              </g>
            )}
          </svg>

          {/* Interactive Live Cursor Tooltip */}
          {crosshairPos && (
            <div
              className="absolute pointer-events-none p-1.5 px-2.5 rounded-lg bg-slate-900/90 border border-white/20 text-[10px] text-white shadow-xl z-20"
              style={{ left: Math.min(crosshairPos.x + 10, 460), top: Math.max(crosshairPos.y - 40, 10) }}
            >
              <div>X: <strong>{crosshairPos.valX}</strong></div>
              <div>Y: <strong>{crosshairPos.valY}</strong></div>
            </div>
          )}
        </div>

        {/* 6. MODALITY SPECIFIC CONTROLS & CARDS */}
        {activeTechnique === 'uv' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            <div className="p-4 inner-box rounded-xl space-y-2">
              <label className="opacity-70 block font-sans">
                Sample Concentration (c): <strong className="text-amber-400 font-bold">{concentration} M</strong>
              </label>
              <input
                type="range"
                min="0.0005"
                max="0.01"
                step="0.0005"
                value={concentration}
                onChange={(e) => setConcentration(parseFloat(e.target.value))}
                className="w-full accent-amber-400"
              />
              <div className="text-[10px] opacity-60">Range: 0.5 mM to 10 mM</div>
            </div>

            <div className="p-4 inner-box rounded-xl space-y-2">
              <label className="opacity-70 block font-sans">
                Optical Cuvette Pathlength (l): <strong className="text-amber-400 font-bold">{pathLength} cm</strong>
              </label>
              <input
                type="range"
                min="0.5"
                max="2.0"
                step="0.1"
                value={pathLength}
                onChange={(e) => setPathLength(parseFloat(e.target.value))}
                className="w-full accent-amber-400"
              />
              <div className="text-[10px] opacity-60">Standard quartz cuvette: 1.0 cm</div>
            </div>

            <div className="p-4 inner-box rounded-xl flex flex-col justify-between">
              <span className="opacity-70 font-sans">Beer-Lambert Extinction:</span>
              <div className="text-xl font-black text-amber-400">
                A = {computedAbsorbance} AU
              </div>
              <span className="text-[10px] opacity-70">Transmittance: {computedTransmittance}%</span>
            </div>
          </div>
        )}

        {/* MASS SPEC ISOTOPE ABUNDANCE CLUSTER CARD */}
        {activeTechnique === 'ms' && (
          <div className="p-4 inner-box rounded-xl space-y-2 text-xs">
            <div className="flex items-center justify-between font-bold border-b border-inherit pb-2">
              <span className="flex items-center gap-2">
                <Atom className="w-4 h-4 text-cyan-400" />
                Natural Isotopic Cluster Pattern (M, M+1, M+2)
              </span>
              <span className="text-[10px] opacity-70 font-mono">
                Exact Mass: {dossier.massSpec.monoisotopicMass} u
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
              {dossier.massSpec.isotopeCluster.map((iso) => (
                <div key={iso.mz} className="p-2.5 rounded-lg inner-box flex items-center justify-between">
                  <div>
                    <span className="font-bold font-mono">{iso.label}</span>
                    <span className="text-[10px] opacity-70 block font-mono">m/z {iso.mz}</span>
                  </div>
                  <span className="text-cyan-400 font-black text-sm">{iso.relativeAbundance}%</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 7. DETAILED SCIENTIFIC PEAK ASSIGNMENT TABLE */}
        <div className="space-y-3 pt-2">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-inherit pb-2">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-cyan-400" />
              <h4 className="text-xs font-bold uppercase tracking-wider">
                Detailed Peak Assignment & Structural Deconvolution Table
              </h4>
            </div>

            {/* Filter Search */}
            <div className="relative w-48">
              <Search className="w-3 h-3 absolute left-2.5 top-2 opacity-50" />
              <input
                type="text"
                placeholder="Filter assignments..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                className="input-control text-[11px] pl-7 py-1"
              />
            </div>
          </div>

          <div className="overflow-x-auto max-h-56 overflow-y-auto pr-1">
            <table className="w-full text-left text-xs border-collapse font-sans">
              <thead>
                <tr className="border-b border-inherit text-[10px] uppercase font-mono opacity-70">
                  {activeTechnique === 'ir' && (
                    <>
                      <th className="py-2 px-3">Wavenumber</th>
                      <th className="py-2 px-3">Range</th>
                      <th className="py-2 px-3">Intensity</th>
                      <th className="py-2 px-3">Functional Assignment</th>
                      <th className="py-2 px-3">Zone</th>
                    </>
                  )}
                  {activeTechnique === 'uv' && (
                    <>
                      <th className="py-2 px-3">Transition</th>
                      <th className="py-2 px-3">Wavelength (nm)</th>
                      <th className="py-2 px-3">Energy (eV)</th>
                      <th className="py-2 px-3">Energy (kcal/mol)</th>
                      <th className="py-2 px-3">Molar Absorptivity</th>
                    </>
                  )}
                  {activeTechnique === 'nmr' && (
                    <>
                      <th className="py-2 px-3">Shift (ppm)</th>
                      <th className="py-2 px-3">{nmrSubTab === '1h' ? 'Multiplicity' : 'Carbon Type'}</th>
                      <th className="py-2 px-3">{nmrSubTab === '1h' ? 'Integral' : 'DEPT-135 Phase'}</th>
                      <th className="py-2 px-3">{nmrSubTab === '1h' ? 'Coupling (J)' : 'Shift PPM'}</th>
                      <th className="py-2 px-3">Structural Assignment</th>
                    </>
                  )}
                  {activeTechnique === 'ms' && (
                    <>
                      <th className="py-2 px-3">m/z Ratio</th>
                      <th className="py-2 px-3">Abundance %</th>
                      <th className="py-2 px-3">Fragment Assignment</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 opacity-90">
                {activeTechnique === 'ir' &&
                  dossier.ir.keyBands
                    .filter((b) => !searchFilter || b.assignment.toLowerCase().includes(searchFilter.toLowerCase()))
                    .map((b, idx) => (
                      <tr key={idx} className="hover:bg-white/5 font-mono">
                        <td className="py-2 px-3 font-bold text-rose-400">{b.wavenumber} cm⁻¹</td>
                        <td className="py-2 px-3 opacity-70">{b.range}</td>
                        <td className="py-2 px-3">{b.intensity}</td>
                        <td className="py-2 px-3 font-sans">{b.assignment}</td>
                        <td className="py-2 px-3 text-[10px] text-cyan-400">{b.zone}</td>
                      </tr>
                    ))}

                {activeTechnique === 'uv' &&
                  dossier.uvVis.transitions
                    .filter((t) => !searchFilter || t.transition.toLowerCase().includes(searchFilter.toLowerCase()))
                    .map((t, idx) => (
                      <tr key={idx} className="hover:bg-white/5 font-mono">
                        <td className="py-2 px-3 font-bold text-amber-400">{t.transition}</td>
                        <td className="py-2 px-3 font-bold">{t.lambda} nm</td>
                        <td className="py-2 px-3 text-cyan-400">{t.energyEv} eV</td>
                        <td className="py-2 px-3 opacity-70">{t.energyKcal} kcal/mol</td>
                        <td className="py-2 px-3">{t.intensity}</td>
                      </tr>
                    ))}

                {activeTechnique === 'nmr' &&
                  (nmrSubTab === '1h'
                    ? dossier.nmr.protonSignals
                        .filter((p) => !searchFilter || p.assignment.toLowerCase().includes(searchFilter.toLowerCase()))
                        .map((p, idx) => (
                          <tr key={idx} className="hover:bg-white/5 font-mono">
                            <td className="py-2 px-3 font-bold text-violet-400">δ {p.shift}</td>
                            <td className="py-2 px-3">{p.multiplicity}</td>
                            <td className="py-2 px-3 text-emerald-400 font-bold">{p.integration}H</td>
                            <td className="py-2 px-3 opacity-70">{p.coupling}</td>
                            <td className="py-2 px-3 font-sans">{p.assignment}</td>
                          </tr>
                        ))
                    : dossier.nmr.carbonSignals
                        .filter((c) => !searchFilter || c.assignment.toLowerCase().includes(searchFilter.toLowerCase()))
                        .map((c, idx) => (
                          <tr key={idx} className="hover:bg-white/5 font-mono">
                            <td className="py-2 px-3 font-bold text-emerald-400">δ {c.shift}</td>
                            <td className="py-2 px-3">{c.type}</td>
                            <td className="py-2 px-3 text-cyan-400">{c.dept}</td>
                            <td className="py-2 px-3 opacity-70">{c.ppm}</td>
                            <td className="py-2 px-3 font-sans">{c.assignment}</td>
                          </tr>
                        )))}

                {activeTechnique === 'ms' &&
                  dossier.massSpec.peaks
                    .filter((p) => !searchFilter || p.label.toLowerCase().includes(searchFilter.toLowerCase()))
                    .map((p, idx) => (
                      <tr key={idx} className="hover:bg-white/5 font-mono">
                        <td className="py-2 px-3 font-bold text-cyan-400">m/z {p.mz}</td>
                        <td className="py-2 px-3 font-bold">{p.intensity}%</td>
                        <td className="py-2 px-3 font-sans">{p.label}</td>
                      </tr>
                    ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* 8. ERROR DIALOG MODAL (NON-CRASHING ERROR HANDLING) */}
      {errorModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="glass-panel p-6 rounded-2xl max-w-md w-full border border-red-500/40 shadow-2xl space-y-4">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-red-950/60 border border-red-500/40 text-red-400">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-bold text-white">{errorModal.title}</h3>
                <p className="text-xs text-red-300 font-sans mt-1 leading-relaxed">
                  {errorModal.reason}
                </p>
              </div>
              <button
                onClick={() => setErrorModal(null)}
                className="opacity-70 hover:opacity-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 bg-red-950/20 rounded-xl border border-red-500/20 text-[11px] font-sans text-slate-300 space-y-1">
              <span className="font-bold text-red-400 block font-mono">Diagnostics & Suggestions:</span>
              <ul className="list-disc list-inside space-y-0.5 text-slate-400">
                <li>Ensure organic valence rules are satisfied</li>
                <li>Verify matching brackets and parentheses</li>
                <li>Check ring closure indices (e.g. c1...c1)</li>
              </ul>
            </div>

            <button
              onClick={() => setErrorModal(null)}
              className="w-full btn-horizontal btn-primary text-xs py-2"
            >
              Dismiss and Return to Workstation
            </button>
          </div>
        </div>
      )}

      {/* Export Confirmation Toast */}
      {exportSuccess && (
        <div className="fixed bottom-6 right-6 z-50 p-3 px-4 rounded-xl bg-emerald-950/90 border border-emerald-500 text-emerald-300 text-xs font-mono flex items-center gap-2 shadow-2xl">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>Report Generated Successfully</span>
        </div>
      )}
    </div>
  );
}
