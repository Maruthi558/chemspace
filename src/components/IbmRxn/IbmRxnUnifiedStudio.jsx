import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Activity,
  Play,
  ArrowRight,
  Sparkles,
  Layers,
  Cpu,
  PenTool,
  Atom,
  CheckCircle2,
  Send,
  AlertTriangle,
  Clock,
  Workflow,
  GitBranch,
  FileCode2,
  Download,
  Upload,
  Bot,
  RotateCcw,
  Boxes,
  Plus,
  Trash2,
  Maximize2,
  Check,
  Eye,
  Sliders,
  CornerDownRight,
  Microscope,
  FlaskConical
} from 'lucide-react';
import {
  ORGANIC_REACTION_CLASSES,
  predictForwardReaction,
  generateRetrosynthesisTree,
  validateReactionSMILES
} from '../../services/chemicalReactionEngine';
import { recordDownload } from '../../services/downloadsManager';
import ReactionCanvasDrawer from './ReactionCanvasDrawer';
import RetrosynthesisTreeExplorer from './RetrosynthesisTreeExplorer';
import ReactionStepDetailModal from './ReactionStepDetailModal';
import ReagentSelectorModal from './ReagentSelectorModal';
import MechanismWorkspace from './MechanismWorkspace';
import ThreeMoleculeViewer from '../ThreeMoleculeViewer';
import { logActivity } from '../../services/activityStore';
import { useTheme } from '../../context/ThemeContext';

export default function IbmRxnUnifiedStudio() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // 1. Studio Workspace Mode ('forward' | 'retrosynthesis' | 'drawer' | 'planner' | 'mechanism')
  const [studioMode, setStudioMode] = useState('forward');

  // Mechanism Workspace context — carries reaction data from other modes
  const [mechanismReactionContext, setMechanismReactionContext] = useState(null);

  // 2. Forward Prediction State
  const [reactantsList, setReactantsList] = useState([
    { id: 1, name: 'Salicylic Acid', smiles: 'O=C(O)c1ccccc1O' },
    { id: 2, name: 'Acetic Anhydride', smiles: 'CC(=O)OC(=O)C' }
  ]);
  const [reagentsInput, setReagentsInput] = useState('H2SO4 (conc.)');
  const [catalystsInput, setCatalystsInput] = useState('Sulfuric Acid');
  const [solventInput, setSolventInput] = useState('Ethyl Acetate');
  const [temperatureInput, setTemperatureInput] = useState('85 °C');
  const [isPredicting, setIsPredicting] = useState(false);
  const [forwardPredictionResult, setForwardPredictionResult] = useState(null);
  const [predictionError, setPredictionError] = useState(null);
  const [isReagentModalOpen, setIsReagentModalOpen] = useState(false);
  const [canvasInitialSmiles, setCanvasInitialSmiles] = useState('O=C(O)c1ccccc1O');

  // 3. Retrosynthesis State
  const [targetSmilesInput, setTargetSmilesInput] = useState('CC(=O)Oc1ccccc1C(=O)O');
  const [isRetrosynthesizing, setIsRetrosynthesizing] = useState(false);
  const [retrosynthesisResult, setRetrosynthesisResult] = useState(null);
  const [selectedStepModal, setSelectedStepModal] = useState(null);

  // 4. Automated Synthesis Stages
  const [synthesisStages, setSynthesisStages] = useState([
    { id: 1, name: 'Reagent Preparation & Stoichiometry Weighing', status: 'completed', duration: '15 min', notes: 'Measured 1.0 eq salicylic acid and 1.5 eq acetic anhydride.' },
    { id: 2, name: 'Acid-Catalyzed Reflux & Heating', status: 'active', duration: '45 min', notes: 'Heating to 85 °C with constant stirring.' },
    { id: 3, name: 'Ice-Water Quench & Phase Separation', status: 'pending', duration: '20 min', notes: 'Induce crystallization by pouring into ice water.' },
    { id: 4, name: 'Recrystallization from Hot Ethanol', status: 'pending', duration: '60 min', notes: 'Yields pure white acetylsalicylic acid needles.' },
    { id: 5, name: 'Spectroscopic QC (FTIR / 1H-NMR)', status: 'pending', duration: '10 min', notes: 'Verify absence of phenolic O-H stretch and presence of dual carbonyl peaks.' }
  ]);

  // Run initial prediction on load
  useEffect(() => {
    handleRunForwardPrediction();
    handleRunRetrosynthesis();
  }, []);

  const handleRunForwardPrediction = () => {
    setIsPredicting(true);
    setPredictionError(null);

    setTimeout(() => {
      try {
        const result = predictForwardReaction({
          reactants: reactantsList,
          reagents: reagentsInput,
          catalysts: catalystsInput,
          solvent: solventInput,
          temperature: temperatureInput
        });

        if (result.error) {
          setPredictionError(result.error);
          setForwardPredictionResult(null);
        } else {
          setForwardPredictionResult(result);
          logActivity('IBM RXN', 'Predicted Reaction Outcome', `Product: ${result.product.name} (${result.estimatedYield})`, 'reaction');
        }
      } catch (err) {
        setPredictionError('Error processing reaction prediction: ' + err.message);
      } finally {
        setIsPredicting(false);
      }
    }, 400);
  };

  const handleRunRetrosynthesis = () => {
    if (!targetSmilesInput.trim()) return;
    setIsRetrosynthesizing(true);

    setTimeout(() => {
      try {
        const result = generateRetrosynthesisTree(targetSmilesInput);
        if (result.error) {
          setRetrosynthesisResult(null);
        } else {
          setRetrosynthesisResult(result);
          logActivity('IBM RXN', 'Generated Retrosynthesis Plan', `Target: ${result.targetName}`, 'reaction');
        }
      } catch (err) {
        console.warn('Retrosynthesis error:', err);
      } finally {
        setIsRetrosynthesizing(false);
      }
    }, 450);
  };

  const handleAddReactant = () => {
    const count = reactantsList.length + 1;
    setReactantsList([
      ...reactantsList,
      { id: Date.now(), name: `Reactant ${count}`, smiles: 'CCO' }
    ]);
  };

  const handleRemoveReactant = (id) => {
    setReactantsList(reactantsList.filter((r) => r.id !== id));
  };

  const handleUpdateReactantSmiles = (id, smiles) => {
    setReactantsList(reactantsList.map((r) => (r.id === id ? { ...r, smiles } : r)));
  };

  const handleApplyCanvasReactant = (smiles) => {
    if (!smiles) return;
    setReactantsList([
      ...reactantsList,
      { id: Date.now(), name: 'Canvas Sketched Molecule', smiles }
    ]);
    setStudioMode('forward');
  };

  const handleApplyCanvasTarget = (smiles) => {
    if (!smiles) return;
    setTargetSmilesInput(smiles);
    setStudioMode('retrosynthesis');
    setTimeout(() => {
      handleRunRetrosynthesis();
    }, 100);
  };

  const handleExportReactionSMILES = () => {
    const rSmi = forwardPredictionResult?.reactionSmiles || `${reactantsList.map((r) => r.smiles).join('.')}>${reagentsInput}>${forwardPredictionResult?.product?.smiles || ''}`;
    const filename = `reaction_${Date.now()}.smi`;
    const blob = new Blob([rSmi], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    recordDownload({
      filename,
      fileType: 'smi',
      sourceModule: 'IBM RXN',
      contentBlob: rSmi,
      fileSize: blob.size
    });
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target.result;
      if (typeof content === 'string') {
        const valRes = validateReactionSMILES(content.trim());
        if (valRes.valid) {
          if (valRes.isReactionSmiles) {
            setReactantsList(valRes.reactants.map((s, i) => ({ id: Date.now() + i, name: `Imported Reactant ${i + 1}`, smiles: s })));
            if (valRes.reagents.length > 0) setReagentsInput(valRes.reagents.join(', '));
            setStudioMode('forward');
          } else {
            setTargetSmilesInput(content.trim());
            setStudioMode('retrosynthesis');
          }
        }
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="workspace-container font-mono select-none space-y-6">
      {/* 1. TOP WORKSPACE HEADER & MODE CONTROLS */}
      <div className="workspace-header">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
            <Workflow className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-black tracking-wider text-[var(--text-primary)]">
                IBM RXN AI REACTION PLANNING &amp; SYNTHESIS STUDIO
              </h1>
              <span className="telemetry-pill text-[9px] font-bold">
                TRANSFORMER KERNEL v4.0
              </span>
            </div>
            <p className="text-[10px] text-[var(--text-secondary)] font-sans mt-0.5">
              Forward organic transformation prediction, multi-step retrosynthesis planning, 2D reaction drawing &amp; automated synthesis workflows.
            </p>
          </div>
        </div>

        {/* Studio Mode Tabs */}
        <div className="flex items-center gap-1.5 bg-white/5 p-1 rounded-2xl border border-[var(--border-subtle)] overflow-x-auto custom-scrollbar">
          {[
            { id: 'forward', label: 'Forward Prediction', icon: Activity },
            { id: 'retrosynthesis', label: 'Retrosynthesis', icon: GitBranch },
            { id: 'drawer', label: 'Reaction CAD', icon: PenTool },
            { id: 'mechanism', label: 'Mechanism Workspace', icon: CornerDownRight },
            { id: 'planner', label: 'Synthesis Stages', icon: Clock }
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setStudioMode(id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                studioMode === id
                  ? id === 'mechanism'
                    ? 'bg-violet-500 text-white shadow-md font-black shadow-violet-500/30'
                    : 'bg-cyan-500 text-slate-950 shadow-md font-black'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          MODE 1: FORWARD REACTION PREDICTION
      ══════════════════════════════════════════════════════════════════════ */}
      {studioMode === 'forward' && (
        <div className="space-y-6">
          {/* Reaction Equation Flow Banner (Reactants + Reagents -> Product) */}
          <div className="glass-panel p-6 rounded-3xl border border-[var(--border-subtle)] space-y-5 shadow-2xl bg-gradient-to-r from-cyan-500/5 via-violet-500/5 to-transparent">
            <div className="flex items-center justify-between border-b border-inherit pb-3">
              <span className="text-xs font-black uppercase text-[var(--text-primary)] flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                Reaction Definition (Reactants + Reagents → Product)
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleExportReactionSMILES}
                  className="px-2.5 py-1 rounded-xl bg-white/5 hover:bg-white/10 text-cyan-400 text-xs font-bold transition flex items-center gap-1 border border-white/5"
                  title="Export Reaction SMILES"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export .SMI</span>
                </button>

                <label className="px-2.5 py-1 rounded-xl bg-white/5 hover:bg-white/10 text-[var(--text-secondary)] hover:text-white text-xs font-bold transition flex items-center gap-1 border border-white/5 cursor-pointer">
                  <Upload className="w-3.5 h-3.5" />
                  <span>Import File</span>
                  <input type="file" accept=".smi,.mol,.sdf,.txt" onChange={handleFileUpload} className="hidden" />
                </label>
              </div>
            </div>

            {/* Visual Reactants + Reagents Input Blocks */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
              {/* Reactants Column (5 cols) */}
              <div className="lg:col-span-5 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-cyan-400 font-bold uppercase">Reactant Molecules:</span>
                  <button
                    onClick={handleAddReactant}
                    className="text-[10px] text-cyan-300 hover:text-cyan-200 font-bold flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" /> Add Reactant
                  </button>
                </div>

                <div className="space-y-2">
                  {reactantsList.map((r, idx) => (
                    <div
                      key={r.id}
                      className="p-3 rounded-2xl inner-box border border-[var(--border-subtle)] space-y-1 relative group"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <strong className="text-cyan-300">{r.name}</strong>
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => {
                              setCanvasInitialSmiles(r.smiles);
                              setStudioMode('drawer');
                            }}
                            className="px-2 py-0.5 rounded-lg bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/30 text-cyan-400 text-[10px] font-bold transition flex items-center gap-1"
                            title="Draw/Edit this molecule in Reaction Canvas"
                          >
                            <PenTool className="w-2.5 h-2.5" /> Draw
                          </button>
                          {reactantsList.length > 1 && (
                            <button
                              onClick={() => handleRemoveReactant(r.id)}
                              className="text-slate-400 hover:text-rose-400 transition"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </div>
                      <input
                        type="text"
                        value={r.smiles}
                        onChange={(e) => handleUpdateReactantSmiles(r.id, e.target.value)}
                        placeholder="Enter SMILES (e.g. O=C(O)c1ccccc1O)"
                        className="input-control px-2.5 py-1 text-xs rounded-xl w-full font-mono font-bold text-[var(--text-primary)]"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Reaction Arrow + Conditions (3 cols) */}
              <div className="lg:col-span-3 p-4 rounded-2xl inner-box border border-cyan-500/20 text-center space-y-2 relative">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-amber-400 font-bold uppercase block">Conditions &amp; Reagents:</span>
                  <button
                    onClick={() => setIsReagentModalOpen(true)}
                    className="px-2 py-0.5 rounded-lg bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/30 text-cyan-400 text-[10px] font-bold transition flex items-center gap-1"
                    title="Open Categorized Reagent Library"
                  >
                    <Sliders className="w-3 h-3" /> Palette
                  </button>
                </div>

                <input
                  type="text"
                  value={reagentsInput}
                  onChange={(e) => setReagentsInput(e.target.value)}
                  placeholder="Reagents (e.g. H2SO4, AlCl3, NaBH4)"
                  className="input-control px-2 py-1 text-xs rounded-lg w-full text-center font-bold text-amber-300"
                />
                <input
                  type="text"
                  value={solventInput}
                  onChange={(e) => setSolventInput(e.target.value)}
                  placeholder="Solvent (e.g. DCM, THF, DMF)"
                  className="input-control px-2 py-1 text-xs rounded-lg w-full text-center text-[10px]"
                />
                <input
                  type="text"
                  value={temperatureInput}
                  onChange={(e) => setTemperatureInput(e.target.value)}
                  placeholder="Temperature / Time (e.g. 85 °C, Reflux)"
                  className="input-control px-2 py-1 text-xs rounded-lg w-full text-center text-[10px]"
                />

                <button
                  onClick={handleRunForwardPrediction}
                  disabled={isPredicting}
                  className="w-full py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-slate-950 font-black text-xs font-mono transition flex items-center justify-center gap-1.5 shadow-lg shadow-cyan-500/20 mt-2"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>{isPredicting ? 'Predicting...' : 'Run Forward Prediction'}</span>
                </button>
              </div>

              {/* Predicted Product (4 cols) */}
              <div className="lg:col-span-4 p-4 rounded-2xl inner-box border border-emerald-500/30 space-y-2 bg-gradient-to-br from-emerald-500/5 to-transparent">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-emerald-400 font-bold uppercase">Predicted Major Product:</span>
                  {forwardPredictionResult && (
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-400 font-bold border border-emerald-500/30">
                      {forwardPredictionResult.estimatedYield} Yield
                    </span>
                  )}
                </div>

                {forwardPredictionResult?.product ? (
                  <div className="space-y-2">
                    <strong className="text-sm text-emerald-300 font-bold block">
                      {forwardPredictionResult.product.name}
                    </strong>
                    <div className="p-2 rounded-xl bg-black/40 border border-white/5 text-[10px] text-slate-300 break-all font-mono">
                      {forwardPredictionResult.product.smiles}
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-[var(--text-muted)] pt-1">
                      <span>Formula: <strong>{forwardPredictionResult.product.formula}</strong></span>
                      <span>MW: <strong>{forwardPredictionResult.product.molWeight} g/mol</strong></span>
                    </div>

                    {/* Cross-Module Quick Dispatch */}
                    <div className="flex items-center gap-1.5 pt-2 flex-wrap">
                      <button
                        onClick={() => {
                          setMechanismReactionContext({
                            reactionSmiles: forwardPredictionResult?.reactionSmiles || reactantsList.map(r => r.smiles).join('.') + '>>' + forwardPredictionResult?.product?.smiles,
                            reactionClass: forwardPredictionResult?.reactionClass || 'Organic Reaction',
                            reactionType: forwardPredictionResult?.reactionType || 'Unknown',
                            reagents: reagentsInput,
                            solvent: solventInput,
                            temperature: temperatureInput,
                            productSmiles: forwardPredictionResult?.product?.smiles,
                            productName: forwardPredictionResult?.product?.name,
                            mechanismSteps: forwardPredictionResult?.mechanismSteps || []
                          });
                          setStudioMode('mechanism');
                        }}
                        className="px-2 py-1 rounded-lg bg-violet-500/15 hover:bg-violet-500/25 border border-violet-500/30 text-violet-300 text-[10px] font-bold transition flex items-center gap-1"
                        title="Open Reaction Mechanism Workspace"
                      >
                        <CornerDownRight className="w-3 h-3" /> Examine Mechanism
                      </button>
                      <button
                        onClick={() => navigate('/chemdraw')}
                        className="px-2 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-cyan-300 text-[10px] font-bold transition flex items-center gap-1"
                        title="Open product in ChemDraw"
                      >
                        <PenTool className="w-3 h-3" /> ChemDraw
                      </button>
                      <button
                        onClick={() => navigate('/spectroscopy')}
                        className="px-2 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-violet-300 text-[10px] font-bold transition flex items-center gap-1"
                        title="Simulate Product Spectroscopy"
                      >
                        <Activity className="w-3 h-3" /> Spectroscopy
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="p-6 text-center text-xs text-slate-500 italic">
                    Click "Run Forward Prediction" to generate the major organic product.
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Forward Reaction Transformation & Mechanistic Breakdown */}
          {forwardPredictionResult && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-xs font-mono">
              <div className="glass-panel p-4 rounded-2xl space-y-2 border border-[var(--border-subtle)]">
                <span className="text-[10px] text-cyan-400 font-bold uppercase">Reaction Classification</span>
                <div className="text-sm font-black text-[var(--text-primary)]">{forwardPredictionResult.reactionClass}</div>
                <div className="text-[10px] text-[var(--text-muted)]">{forwardPredictionResult.reactionType}</div>
                <div className="text-[10px] text-emerald-400 font-bold pt-1">Confidence: {forwardPredictionResult.confidenceScore}</div>
                <button
                  onClick={() => {
                    setMechanismReactionContext({
                      reactionClass: forwardPredictionResult.reactionClass,
                      reactionType: forwardPredictionResult.reactionType,
                      reagents: reagentsInput,
                      solvent: solventInput,
                      temperature: temperatureInput,
                      productSmiles: forwardPredictionResult?.product?.smiles,
                      productName: forwardPredictionResult?.product?.name,
                      mechanismSteps: forwardPredictionResult?.mechanismSteps || []
                    });
                    setStudioMode('mechanism');
                  }}
                  className="mt-2 w-full py-1.5 rounded-xl bg-violet-500/15 hover:bg-violet-500/25 border border-violet-500/30 text-violet-300 text-[10px] font-black transition flex items-center justify-center gap-1"
                >
                  <CornerDownRight className="w-3 h-3" /> Open Mechanism Workspace
                </button>
              </div>

              <div className="glass-panel p-4 rounded-2xl space-y-2 border border-[var(--border-subtle)] md:col-span-2">
                <span className="text-[10px] text-violet-400 font-bold uppercase">Step-by-Step Reaction Mechanism</span>
                <ol className="list-decimal pl-4 space-y-1.5 text-xs text-[var(--text-secondary)] font-sans">
                  {forwardPredictionResult.mechanismSteps?.map((step, idx) => (
                    <li key={idx} className="leading-relaxed">{step}</li>
                  ))}
                </ol>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          MODE 2: RETROSYNTHESIS PLANNER
      ══════════════════════════════════════════════════════════════════════ */}
      {studioMode === 'retrosynthesis' && (
        <div className="space-y-6">
          {/* Retrosynthesis Target Input Banner */}
          <div className="glass-panel p-5 rounded-3xl border border-[var(--border-subtle)] space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-inherit pb-2">
              <span className="text-xs font-black uppercase text-[var(--text-primary)] flex items-center gap-1.5">
                <GitBranch className="w-4 h-4 text-cyan-400" />
                Target Molecule Retrosynthetic Synthesis Planner
              </span>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <div className="flex-1 space-y-1">
                <span className="text-[10px] text-[var(--text-muted)]">Target Molecule SMILES:</span>
                <input
                  type="text"
                  value={targetSmilesInput}
                  onChange={(e) => setTargetSmilesInput(e.target.value)}
                  placeholder="Enter Target SMILES (e.g. CC(=O)Oc1ccccc1C(=O)O)"
                  className="input-control px-3 py-2 text-xs rounded-xl w-full font-bold text-cyan-300 font-mono"
                />
              </div>

              <button
                onClick={handleRunRetrosynthesis}
                disabled={isRetrosynthesizing}
                className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-slate-950 font-black text-xs font-mono transition flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 sm:mt-5"
              >
                <GitBranch className="w-4 h-4" />
                <span>{isRetrosynthesizing ? 'Planning Disconnections...' : 'Plan Retrosynthesis'}</span>
              </button>
            </div>
          </div>

          {/* Interactive Tree Explorer */}
          <RetrosynthesisTreeExplorer
            retrosynthesisData={retrosynthesisResult}
            onSelectStepDetail={setSelectedStepModal}
            onOpenMechanism={(stepData) => {
              setMechanismReactionContext({
                reactionClass: stepData?.reactionType || 'Retrosynthesis Step',
                reactionType: stepData?.disconnection || '',
                reagents: stepData?.reagents || '',
                solvent: stepData?.solvents || '',
                temperature: stepData?.temperature || '',
                mechanismNotes: stepData?.mechanismNotes || '',
                mechanismSteps: stepData?.mechanismNotes ? [stepData.mechanismNotes] : []
              });
              setStudioMode('mechanism');
            }}
          />
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          MODE 3b: REACTION MECHANISM WORKSPACE
      ══════════════════════════════════════════════════════════════════════ */}
      {studioMode === 'mechanism' && (
        <div className="space-y-6">
          {/* Context banner when launched from another mode */}
          {mechanismReactionContext && (
            <div className="glass-panel p-3 rounded-2xl border border-violet-500/30 bg-violet-500/5 flex items-center justify-between gap-4 text-xs">
              <div className="flex items-center gap-2.5">
                <CornerDownRight className="w-4 h-4 text-violet-400 shrink-0" />
                <div>
                  <span className="font-black text-violet-300">{mechanismReactionContext.reactionClass}</span>
                  {mechanismReactionContext.reagents && (
                    <span className="text-slate-400 ml-2">· Reagents: {mechanismReactionContext.reagents}</span>
                  )}
                  {mechanismReactionContext.temperature && (
                    <span className="text-slate-400 ml-2">· {mechanismReactionContext.temperature}</span>
                  )}
                </div>
              </div>
              <button
                onClick={() => setMechanismReactionContext(null)}
                className="text-slate-500 hover:text-slate-300 text-[10px] font-bold transition"
              >
                Clear Context
              </button>
            </div>
          )}
          <MechanismWorkspace
            activeReactionContext={mechanismReactionContext}
            onNavigateToForward={() => setStudioMode('forward')}
            onNavigateToRetrosynthesis={() => setStudioMode('retrosynthesis')}
          />
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          MODE 3: REACTION CAD CANVAS DRAWER
      ══════════════════════════════════════════════════════════════════════ */}
      {studioMode === 'drawer' && (
        <div className="space-y-6">
          <ReactionCanvasDrawer
            initialSmiles="c1ccccc1O"
            onApplyToReaction={handleApplyCanvasReactant}
            onApplyAsTarget={handleApplyCanvasTarget}
            title="Interactive 2D Reaction Sketcher & CAD Canvas"
          />
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          MODE 4: AUTOMATED SYNTHESIS STAGES
      ══════════════════════════════════════════════════════════════════════ */}
      {studioMode === 'planner' && (
        <div className="space-y-6">
          <div className="glass-panel p-6 rounded-3xl border border-[var(--border-subtle)] space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-inherit pb-3">
              <span className="text-xs font-black uppercase text-[var(--text-primary)] flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-cyan-400" />
                Laboratory Synthesis Execution Stages
              </span>
              <span className="telemetry-pill text-[9px] font-bold text-emerald-400">
                STAGE 2 ACTIVE (45 MIN REFLUX)
              </span>
            </div>

            <div className="space-y-3">
              {synthesisStages.map((stage) => (
                <div
                  key={stage.id}
                  className={`p-4 rounded-2xl inner-box border flex items-start justify-between gap-4 transition ${
                    stage.status === 'active'
                      ? 'border-cyan-500/50 bg-cyan-500/5 shadow-md'
                      : stage.status === 'completed'
                      ? 'border-emerald-500/30 bg-emerald-500/5'
                      : 'border-[var(--border-subtle)] opacity-75'
                  }`}
                >
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2">
                      <span className={`w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center ${
                        stage.status === 'completed'
                          ? 'bg-emerald-500 text-slate-950 font-black'
                          : stage.status === 'active'
                          ? 'bg-cyan-500 text-slate-950 font-black animate-pulse'
                          : 'bg-white/10 text-slate-400'
                      }`}>
                        {stage.status === 'completed' ? '✓' : stage.id}
                      </span>
                      <strong className="text-xs text-[var(--text-primary)] font-bold">{stage.name}</strong>
                    </div>
                    <p className="text-xs text-[var(--text-secondary)] font-sans pl-7">{stage.notes}</p>
                    <div className="pl-7 pt-1">
                      <button
                        onClick={() => {
                          setMechanismReactionContext({
                            reactionClass: stage.name,
                            reactionType: 'Synthesis Stage',
                            reagents: reagentsInput,
                            temperature: temperatureInput,
                            mechanismSteps: [stage.notes]
                          });
                          setStudioMode('mechanism');
                        }}
                        className="px-2 py-0.5 rounded-lg bg-violet-500/10 hover:bg-violet-500/20 border border-violet-500/20 text-violet-300 text-[10px] font-bold transition flex items-center gap-1"
                      >
                        <CornerDownRight className="w-2.5 h-2.5" /> Inspect Mechanism
                      </button>
                    </div>
                  </div>

                  <span className="text-[10px] font-mono text-cyan-400 font-bold shrink-0">
                    {stage.duration}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Step Detail Modal */}
      {selectedStepModal && (
        <ReactionStepDetailModal
          step={selectedStepModal}
          onClose={() => setSelectedStepModal(null)}
        />
      )}

      {/* Categorized Reagent / Condition Palette Modal */}
      <ReagentSelectorModal
        isOpen={isReagentModalOpen}
        onClose={() => setIsReagentModalOpen(false)}
        onSelectReagent={(reagent) => {
          setReagentsInput((prev) => (prev ? `${prev}, ${reagent.formula || reagent.name}` : (reagent.formula || reagent.name)));
          if (reagent.solvent) setSolventInput(reagent.solvent);
          if (reagent.temperature) setTemperatureInput(reagent.temperature);
        }}
        onSelectCondition={(cond) => {
          setTemperatureInput(cond);
        }}
      />
    </div>
  );
}
