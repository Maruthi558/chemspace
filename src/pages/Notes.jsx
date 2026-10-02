import React, { useEffect, useState } from 'react';
import { FileText, Plus, Edit2, Trash2, CheckCircle2, AlertCircle, Save, X, Bookmark, Tag } from 'lucide-react';
import { createNote, deleteNote, getNotes, updateNote } from '../services/api';
import ButtonSpinner from '../components/common/ButtonSpinner';

const CATEGORIES = ['Experiment', 'Synthesis Protocol', 'Spectral Analysis', 'Quantum Run', 'Literature Note', 'General'];

export default function Notes() {
  const [notes, setNotes] = useState([]);
  const [form, setForm] = useState({ title: '', content: '', category: 'Experiment' });
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadNotes();
  }, []);

  async function loadNotes() {
    setIsLoading(true);
    try {
      const data = await getNotes();
      setNotes(data || []);
    } catch (err) {
      setError(err.message || 'Unable to load notes');
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.title.trim()) return;

    setIsSubmitting(true);
    setError('');
    try {
      if (editingId) {
        await updateNote(editingId, form);
      } else {
        await createNote(form);
      }
      setForm({ title: '', content: '', category: 'Experiment' });
      setEditingId(null);
      await loadNotes();
    } catch (err) {
      setError(err.message || 'Could not save note');
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete(id) {
    if (!confirm('Are you sure you want to delete this lab notebook entry?')) return;
    try {
      await deleteNote(id);
      await loadNotes();
    } catch (err) {
      setError(err.message || 'Could not delete note');
    }
  }

  function startEdit(note) {
    setEditingId(note.id);
    setForm({ title: note.title, content: note.content, category: note.category || 'Experiment' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function cancelEdit() {
    setEditingId(null);
    setForm({ title: '', content: '', category: 'Experiment' });
  }

  return (
    <div className="workspace-container font-sans select-none space-y-6 max-w-5xl mx-auto">
      {/* Workspace Header */}
      <div className="workspace-header">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-orange-500/10 border border-orange-500/20 text-orange-500">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-bold tracking-wider text-[var(--text-primary)]">
                LABORATORY RESEARCH NOTEBOOK
              </h1>
              <span className="telemetry-pill text-[9px] font-bold">
                {notes.length} ENTRIES LOGGED
              </span>
            </div>
            <p className="text-[10px] text-[var(--text-secondary)] mt-0.5">
              Secure record keeping for chemical reaction yields, procedural observations, and experimental hypotheses.
            </p>
          </div>
        </div>

        <div className="telemetry-pill text-[10px] font-mono">
          <Bookmark className="w-3.5 h-3.5 text-orange-500" />
          <span>Persistent Storage</span>
        </div>
      </div>

      {/* Editor Form Panel */}
      <div className="glass-panel p-6 rounded-3xl border border-[var(--border-subtle)] space-y-4 shadow-xl">
        <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-[var(--text-primary)] uppercase tracking-wide">
              {editingId ? 'Edit Laboratory Note' : 'Create New Notebook Entry'}
            </h2>
          </div>
          {editingId && (
            <button
              onClick={cancelEdit}
              className="text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] flex items-center gap-1 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" /> Cancel
            </button>
          )}
        </div>

        {error && (
          <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-500 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs font-mono">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block mb-1 font-bold text-[var(--text-primary)]">Note Title</label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="e.g. Synthesis of Acetylsalicylic Acid - Trial 3"
                className="w-full bg-[var(--bg-input)] border border-[var(--border-subtle)] focus:border-orange-500 rounded-xl px-3 py-2 text-xs text-[var(--text-primary)] outline-none shadow-sm"
                required
              />
            </div>

            <div>
              <label className="block mb-1 font-bold text-[var(--text-primary)]">Category</label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full bg-[var(--bg-input)] border border-[var(--border-subtle)] focus:border-orange-500 rounded-xl px-3 py-2 text-xs text-[var(--text-primary)] outline-none shadow-sm cursor-pointer"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block mb-1 font-bold text-[var(--text-primary)]">Experimental Observations / Notes</label>
            <textarea
              rows={4}
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              placeholder="Record stoichiometry, catalyst mass, reflux temperatures, crystallization yields, and TLC spot findings..."
              className="w-full bg-[var(--bg-input)] border border-[var(--border-subtle)] focus:border-orange-500 rounded-xl p-3 text-xs text-[var(--text-primary)] outline-none shadow-sm"
              required
            />
          </div>

          <div className="flex justify-end gap-2">
            {editingId && (
              <button
                type="button"
                onClick={cancelEdit}
                className="btn-secondary px-4 py-2 rounded-xl text-xs font-bold"
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-horizontal btn-orange text-xs font-bold shadow-lg px-6 py-2 flex items-center gap-2 cursor-pointer"
            >
              {isSubmitting ? <ButtonSpinner className="text-white" /> : <Save className="w-3.5 h-3.5" />}
              <span>{editingId ? 'Save Note Updates' : 'Add to Notebook'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Notes Grid */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] font-mono">
          Cataloged Research Notes ({notes.length})
        </h3>

        {notes.length === 0 ? (
          <div className="glass-panel p-10 rounded-2xl text-center space-y-2 text-xs text-[var(--text-muted)] border border-[var(--border-subtle)]">
            <FileText className="w-8 h-8 mx-auto opacity-30 text-orange-500" />
            <p>No lab notes recorded yet. Use the form above to add your first observation.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {notes.map((note) => (
              <div
                key={note.id}
                className="glass-panel p-5 rounded-2xl border border-[var(--border-subtle)] hover:border-orange-500/40 transition-all flex flex-col justify-between space-y-3 shadow-md"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="text-sm font-bold text-[var(--text-primary)] tracking-tight">
                      {note.title}
                    </h4>
                    <span className="telemetry-pill text-[9px] font-mono font-bold text-orange-500 shrink-0">
                      {note.category || 'General'}
                    </span>
                  </div>
                  <p className="text-xs text-[var(--text-secondary)] font-sans leading-relaxed whitespace-pre-wrap line-clamp-4">
                    {note.content}
                  </p>
                </div>

                <div className="pt-2 border-t border-[var(--border-subtle)] flex items-center justify-between text-xs font-mono">
                  <span className="text-[10px] text-[var(--text-muted)]">
                    {note.created_at ? new Date(note.created_at).toLocaleDateString() : 'Active Entry'}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => startEdit(note)}
                      className="p-1.5 rounded-lg inner-box hover:border-orange-500/50 text-[var(--text-secondary)] hover:text-orange-500 transition cursor-pointer"
                      title="Edit Note"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(note.id)}
                      className="p-1.5 rounded-lg inner-box hover:border-rose-500/50 text-[var(--text-secondary)] hover:text-rose-500 transition cursor-pointer"
                      title="Delete Note"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
