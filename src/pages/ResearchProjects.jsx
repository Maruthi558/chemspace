import React, { useState } from 'react';
import { FolderGit2, Plus, ArrowRight, Database, Cpu, Box, Check, FileText, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const INITIAL_PROJECTS = [
  {
    id: 'proj-1',
    title: 'Lead Optimization of BACE-1 Inhibitors',
    category: 'Drug Discovery',
    status: 'Active',
    moleculesCount: 42,
    experimentsCount: 12,
    description: 'Structure-activity relationship optimization targeting Alzheimer beta-secretase enzyme with bioisosteric modifications.'
  },
  {
    id: 'proj-2',
    title: 'Solubility Prediction & Formulations',
    category: 'QSAR Modeling',
    status: 'Completed',
    moleculesCount: 150,
    experimentsCount: 8,
    description: 'Training deep neural networks to accurately compute ESOL aqueous solubility from 2D molecular graph descriptors.'
  }
];

export default function ResearchProjects() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState(INITIAL_PROJECTS);
  const [showNewModal, setShowNewModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');

  function handleCreateProject(e) {
    e.preventDefault();
    if (!newTitle.trim()) return;
    const newProj = {
      id: `proj-${Date.now()}`,
      title: newTitle,
      category: 'Organic Synthesis',
      status: 'Active',
      moleculesCount: 0,
      experimentsCount: 0,
      description: newDescription || 'New computational chemistry research project.'
    };
    setProjects([newProj, ...projects]);
    setNewTitle('');
    setNewDescription('');
    setShowNewModal(false);
  }

  return (
    <div className="workspace-container font-sans select-none space-y-6 max-w-6xl mx-auto">
      {/* Workspace Header */}
      <div className="workspace-header">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-orange-500/10 border border-orange-500/20 text-orange-500">
            <FolderGit2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-bold tracking-wider text-[var(--text-primary)]">
                RESEARCH PROJECTS WORKSPACE
              </h1>
              <span className="telemetry-pill text-[9px] font-bold">
                COLLABORATIVE CAMPAIGNS
              </span>
            </div>
            <p className="text-[10px] text-[var(--text-secondary)] mt-0.5">
              Organize molecular datasets, QSAR machine-learning models, and chemical synthesis pathways into collaborative research projects.
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowNewModal(true)}
          className="btn-horizontal btn-orange text-xs font-bold shadow-lg px-5 py-2.5 flex items-center gap-2 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>New Research Campaign</span>
        </button>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {projects.map((proj) => (
          <div
            key={proj.id}
            className="glass-panel p-6 rounded-3xl border border-[var(--border-subtle)] space-y-4 flex flex-col justify-between hover:border-orange-500/40 transition-all shadow-xl"
          >
            <div className="space-y-2">
              <div className="flex items-start justify-between gap-2">
                <h3 className="text-base font-bold text-[var(--text-primary)] tracking-tight">
                  {proj.title}
                </h3>
                <span
                  className={`text-[9px] font-mono font-bold px-2.5 py-0.5 rounded-full border ${
                    proj.status === 'Active'
                      ? 'bg-emerald-500/15 text-emerald-500 border-emerald-500/30'
                      : 'inner-box text-[var(--text-muted)]'
                  }`}
                >
                  {proj.status}
                </span>
              </div>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                {proj.description}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs font-mono pt-2 border-t border-[var(--border-subtle)]">
              <div className="p-3 inner-box rounded-xl flex items-center justify-between">
                <span className="text-[var(--text-muted)]">Molecules:</span>
                <span className="text-orange-500 font-bold">{proj.moleculesCount}</span>
              </div>
              <div className="p-3 inner-box rounded-xl flex items-center justify-between">
                <span className="text-[var(--text-muted)]">ML Runs:</span>
                <span className="text-emerald-500 font-bold">{proj.experimentsCount}</span>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={() => navigate('/rdkit-lab')}
                className="w-full py-2.5 inner-box hover:border-orange-500/50 text-orange-500 hover:text-orange-600 rounded-xl font-bold flex items-center justify-center gap-1.5 transition text-xs cursor-pointer shadow-xs"
              >
                <span>Open Project Lab</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* New Project Modal */}
      {showNewModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4">
          <form
            onSubmit={handleCreateProject}
            className="w-full max-w-lg glass-panel border border-[var(--border-subtle)] rounded-3xl p-6 sm:p-8 space-y-4 shadow-2xl animate-in fade-in"
          >
            <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
              <h3 className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-2">
                <FolderGit2 className="w-4 h-4 text-orange-500" /> Create New Research Project
              </h3>
              <button
                type="button"
                onClick={() => setShowNewModal(false)}
                className="text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs font-mono">
              <div>
                <label className="text-[var(--text-primary)] font-bold block mb-1">Project Title:</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Lead Discovery for Kinase Inhibitors"
                  className="w-full bg-[var(--bg-input)] border border-[var(--border-subtle)] focus:border-orange-500 rounded-xl p-2.5 text-[var(--text-primary)] outline-none shadow-sm"
                />
              </div>
              <div>
                <label className="text-[var(--text-primary)] font-bold block mb-1">Description:</label>
                <textarea
                  rows={3}
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Summarize target mechanism, experimental assays, and molecular libraries..."
                  className="w-full bg-[var(--bg-input)] border border-[var(--border-subtle)] focus:border-orange-500 rounded-xl p-2.5 text-[var(--text-primary)] outline-none shadow-sm"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-[var(--border-subtle)]">
              <button
                type="button"
                onClick={() => setShowNewModal(false)}
                className="btn-secondary px-4 py-2 rounded-xl text-xs font-bold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-horizontal btn-orange px-5 py-2 rounded-xl text-xs font-bold shadow-md cursor-pointer"
              >
                Create Project
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
