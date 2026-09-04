import React, { useState } from 'react';
import { FolderGit2, Plus, ArrowRight, Database, Cpu, Box, Check, FileText } from 'lucide-react';
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
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="bg-slate-900/80 backdrop-blur-md p-6 rounded-2xl border border-cyan-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black bg-gradient-to-r from-amber-400 via-cyan-400 to-violet-400 bg-clip-text text-transparent flex items-center gap-3">
            <FolderGit2 className="w-7 h-7 text-amber-400" />
            Research Projects Workspace
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Organize molecular datasets, QSAR machine-learning models, and chemical synthesis pathways into collaborative research projects.
          </p>
        </div>
        <button
          onClick={() => setShowNewModal(true)}
          className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-cyan-500 text-slate-950 font-extrabold rounded-xl shadow-lg flex items-center gap-2 transition text-xs"
        >
          <Plus className="w-4 h-4" /> Create Research Project
        </button>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {projects.map((proj) => (
          <div key={proj.id} className="glass-panel glass-panel-hover rounded-2xl p-6 border border-slate-800 space-y-4 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-start justify-between gap-2">
                <h3 className="text-base font-bold text-slate-100">{proj.title}</h3>
                <span className={`text-[10px] font-mono px-2.5 py-1 rounded-full border ${proj.status === 'Active' ? 'bg-emerald-950 text-emerald-400 border-emerald-500/30' : 'bg-slate-950 text-slate-400 border-slate-800'}`}>
                  {proj.status}
                </span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">{proj.description}</p>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs font-mono pt-2 border-t border-slate-800">
              <div className="p-2 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
                <span className="text-slate-500">Molecules:</span>
                <span className="text-cyan-400 font-bold">{proj.moleculesCount}</span>
              </div>
              <div className="p-2 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
                <span className="text-slate-500">ML Runs:</span>
                <span className="text-violet-400 font-bold">{proj.experimentsCount}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => navigate('/molecular-lab')}
                className="flex-1 py-2 bg-slate-950 hover:bg-slate-900 border border-slate-800 text-cyan-300 rounded-xl font-bold flex items-center justify-center gap-1.5 transition text-xs"
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
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4">
          <form onSubmit={handleCreateProject} className="w-full max-w-lg bg-slate-900 border border-cyan-500/40 rounded-2xl p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <FolderGit2 className="w-5 h-5 text-cyan-400" /> Create New Research Project
            </h3>
            <div className="space-y-3 text-xs font-mono">
              <div>
                <label className="text-slate-400 block mb-1">Project Title:</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Lead Discovery for Kinase Inhibitors"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 focus:border-cyan-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Description:</label>
                <textarea
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Briefly state project objectives..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 focus:border-cyan-500 focus:outline-none h-24"
                />
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowNewModal(false)}
                className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs font-bold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-cyan-500 text-slate-950 rounded-xl text-xs font-bold shadow-md"
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
