import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Atom } from 'lucide-react';

export default function RotatingAtomButton({ className = '', label = 'Periodic Table' }) {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate('/periodic-table')}
      className={`btn-horizontal btn-secondary group ${className}`}
      title="Open 3D Periodic Table Visualizer"
    >
      <Atom className="w-4 h-4 animate-spin-slow opacity-80 group-hover:opacity-100" />
      <span className="font-extrabold text-xs tracking-wider">{label}</span>
    </button>
  );
}
