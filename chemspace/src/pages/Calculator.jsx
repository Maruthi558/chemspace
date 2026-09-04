import { useState } from 'react';
import { estimateMass } from '../services/api';

export default function Calculator() {
  const [formula, setFormula] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      const data = await estimateMass(formula);
      setResult(data);
      setError('');
    } catch (err) {
      setError(err.message || 'Calculation failed');
    }
  }

  return (
    <div className="page-stack">
      <section className="panel">
        <p className="eyebrow">Molecular calculator</p>
        <h2>Estimate molecular weight from a formula</h2>
        <form onSubmit={handleSubmit} className="inline-form">
          <input value={formula} onChange={(e) => setFormula(e.target.value)} placeholder="e.g. H2O or C6H12O6" />
          <button className="button" type="submit">Calculate</button>
        </form>
        {error && <p className="error-text">{error}</p>}
        {result && <div className="result-card"><h3>{result.formula}</h3><p>Molar mass: {result.molar_mass} g/mol</p></div>}
      </section>
    </div>
  );
}
