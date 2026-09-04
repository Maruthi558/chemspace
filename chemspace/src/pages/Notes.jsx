import { useEffect, useState } from 'react';
import { createNote, deleteNote, getNotes, updateNote } from '../services/api';

export default function Notes() {
  const [notes, setNotes] = useState([]);
  const [form, setForm] = useState({ title: '', content: '', category: 'Experiment' });
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    loadNotes();
  }, []);

  async function loadNotes() {
    try {
      const data = await getNotes();
      setNotes(data);
    } catch (err) {
      setError(err.message || 'Unable to load notes');
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
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
    }
  }

  async function handleDelete(id) {
    try {
      await deleteNote(id);
      await loadNotes();
    } catch (err) {
      setError(err.message || 'Could not delete note');
    }
  }

  function startEdit(note) {
    setEditingId(note.id);
    setForm({ title: note.title, content: note.content, category: note.category });
  }

  return (
    <div className="page-stack">
      <section className="panel">
        <p className="eyebrow">Lab notes</p>
        <h2>{editingId ? 'Edit note' : 'Create a new note'}</h2>
        <form onSubmit={handleSubmit} className="stack-form">
          <label>
            Title
            <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          </label>
          <label>
            Category
            <input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
          </label>
          <label>
            Details
            <textarea value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} required />
          </label>
          <button className="button" type="submit">{editingId ? 'Save changes' : 'Save note'}</button>
        </form>
        {error && <p className="error-text">{error}</p>}
      </section>

      <div className="card-list">
        {notes.map((note) => (
          <article key={note.id} className="panel">
            <div className="note-actions">
              <h3>{note.title}</h3>
              <div>
                <button className="button button-secondary" onClick={() => startEdit(note)}>Edit</button>
                <button className="button button-secondary" onClick={() => handleDelete(note.id)}>Delete</button>
              </div>
            </div>
            <p className="eyebrow">{note.category}</p>
            <p>{note.content}</p>
          </article>
        ))}
      </div>
    </div>
  );
}
