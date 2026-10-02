import React, { useState } from 'react';
import { BookOpen, CheckCircle2, HelpCircle, Award, ArrowRight, Atom, Check, X } from 'lucide-react';
import ThreeMoleculeViewer from '../components/ThreeMoleculeViewer';
import { MOLECULES } from '../data/moleculeData';

const LESSONS = [
  {
    id: 'bonding',
    title: '1. Chemical Bonding & VSEPR Geometry',
    category: 'General Chemistry',
    summary: 'Valence Shell Electron Pair Repulsion (VSEPR) predicts 3D molecular shapes based on electron pair electrostatic repulsion.',
    details: 'Valence electrons arrange themselves around central atoms to minimize electrostatic repulsion. A steric number of 4 produces tetrahedral geometry (109.5°), whereas 3 lone pairs/bonds form trigonal planar (120°), and water features a bent V-shape (~104.5°) due to 2 non-bonding lone pairs.',
    moleculeId: 'water',
    quiz: {
      question: 'What is the approximate H-O-H bond angle in a water molecule?',
      options: ['180°', '120°', '109.5°', '104.5°'],
      correctAnswer: 3,
      explanation: 'Water has 2 bonding pairs and 2 lone pairs (steric number 4). The strong repulsion of the 2 lone pairs compresses the bond angle from tetrahedral 109.5° down to 104.5°.'
    }
  },
  {
    id: 'aromaticity',
    title: '2. Organic Chemistry & Aromaticity',
    category: 'Organic Chemistry',
    summary: 'Hückel\'s Rule states planar cyclic conjugated systems with (4n+2) pi-electrons possess exceptional aromatic stability.',
    details: 'Benzene (C₆H₆) consists of 6 sp² hybridized carbon atoms forming a planar hexagon. The 6 unhybridized p-orbitals overlap continuously, forming delocalized pi-electron clouds above and below the ring plane.',
    moleculeId: 'benzene',
    quiz: {
      question: 'Which condition is REQUIRED for Hückel\'s Rule of Aromaticity?',
      options: ['Must contain 4n pi electrons', 'Must contain (4n + 2) pi electrons', 'Must contain oxygen atoms', 'Must be tetrahedral'],
      correctAnswer: 1,
      explanation: 'Hückel\'s rule specifies that a planar cyclic conjugated system is aromatic if it contains (4n + 2) delocalized pi electrons (where n = 0, 1, 2, ...).'
    }
  },
  {
    id: 'qsar_ml',
    title: '3. Machine Learning in Drug Discovery (QSAR)',
    category: 'Computational Chemistry',
    summary: 'Quantitative Structure-Activity Relationship (QSAR) correlates chemical molecular descriptors with biological activity.',
    details: 'QSAR models use numerical fingerprints (such as Morgan ECFP4) and physical descriptors (MW, LogP, TPSA) as feature vectors fed into machine learning regressors (Random Forest, Neural Networks) to predict drug potency or aqueous solubility without lab synthesis.',
    moleculeId: 'caffeine',
    quiz: {
      question: 'What does Morgan ECFP4 fingerprint represent in machine learning chemistry?',
      options: ['Atomic mass only', 'Circular topological atom-environment bitvector', 'Temperature curve', 'Crystal lattice density'],
      correctAnswer: 1,
      explanation: 'Extended Connectivity Fingerprints (ECFP4) hash circular topological environments around each atom up to radius 2 into a 2048-bit binary vector.'
    }
  }
];

export default function LearningCenter() {
  const [selectedLesson, setSelectedLesson] = useState(LESSONS[0]);
  const [userAnswer, setUserAnswer] = useState(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [score, setScore] = useState(0);

  const demoMolecule = MOLECULES.find(m => m.id === selectedLesson.moleculeId) || MOLECULES[0];

  function handleSelectOption(index) {
    setUserAnswer(index);
    setShowExplanation(true);
    if (index === selectedLesson.quiz.correctAnswer) {
      setScore(prev => prev + 1);
    }
  }

  return (
    <div className="workspace-container font-sans select-none space-y-6 max-w-6xl mx-auto">
      {/* Workspace Header */}
      <div className="workspace-header">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-orange-500/10 border border-orange-500/20 text-orange-500">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-bold tracking-wider text-[var(--text-primary)]">
                CHEMISTRY & AI LEARNING CENTER
              </h1>
              <span className="telemetry-pill text-[9px] font-bold">
                CURRICULUM & METHODOLOGY
              </span>
            </div>
            <p className="text-[10px] text-[var(--text-secondary)] mt-0.5">
              Interactive educational modules on VSEPR geometry, organic aromaticity, and QSAR machine-learning models.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="telemetry-pill text-[10px] font-mono text-emerald-500 font-bold">
            <Award className="w-4 h-4" /> Score: {score} Correct
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Lesson Navigation */}
        <div className="lg:col-span-4 glass-panel p-4 rounded-3xl border border-[var(--border-subtle)] space-y-3 shadow-xl">
          <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--text-muted)] block px-1">
            Curriculum Modules:
          </span>
          <div className="space-y-2">
            {LESSONS.map((l) => {
              const isSelected = l.id === selectedLesson.id;
              return (
                <button
                  key={l.id}
                  onClick={() => {
                    setSelectedLesson(l);
                    setUserAnswer(null);
                    setShowExplanation(false);
                  }}
                  className={`w-full text-left p-3.5 rounded-2xl border text-xs transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[var(--sidebar-active-bg)] text-[var(--sidebar-active-text)] border-orange-500/50 shadow-md font-bold'
                      : 'inner-box hover:border-[var(--border-strong)] text-[var(--text-primary)]'
                  }`}
                >
                  <div className="font-bold flex items-center justify-between gap-1">
                    <span>{l.title}</span>
                    <span className="text-[9px] font-mono text-orange-500 shrink-0">{l.category}</span>
                  </div>
                  <div className="text-[11px] text-[var(--text-secondary)] mt-1 line-clamp-2 font-normal">
                    {l.summary}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Lesson Content & Quiz */}
        <div className="lg:col-span-8 space-y-6">
          <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-[var(--border-subtle)] space-y-5 shadow-xl">
            <div className="border-b border-[var(--border-subtle)] pb-3">
              <span className="telemetry-pill text-[9px] font-mono text-orange-500 font-bold mb-2 inline-block">
                {selectedLesson.category}
              </span>
              <h2 className="text-lg font-bold text-[var(--text-primary)] tracking-tight">
                {selectedLesson.title}
              </h2>
            </div>

            <p className="text-xs text-[var(--text-secondary)] leading-relaxed font-sans">
              {selectedLesson.details}
            </p>

            {/* Interactive 3D Demonstration */}
            <div className="space-y-2 pt-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-orange-500 flex items-center gap-1.5">
                  <Atom className="w-4 h-4" /> 3D Molecular Demonstration ({demoMolecule.name}):
                </span>
                <span className="text-[10px] font-mono text-[var(--text-muted)]">
                  Formula: {demoMolecule.formula || 'C6H6'}
                </span>
              </div>
              <div className="h-64 w-full rounded-2xl overflow-hidden border border-[var(--border-subtle)] bg-[var(--bg-canvas)] shadow-inner">
                <ThreeMoleculeViewer molecule={demoMolecule} styleMode="ball-stick" />
              </div>
            </div>

            {/* Interactive Quiz Section */}
            <div className="pt-4 border-t border-[var(--border-subtle)] space-y-3">
              <h3 className="text-xs font-mono font-bold text-orange-500 flex items-center gap-1.5">
                <HelpCircle className="w-4 h-4" /> Interactive Knowledge Check
              </h3>
              <p className="text-xs text-[var(--text-primary)] font-semibold">
                {selectedLesson.quiz.question}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {selectedLesson.quiz.options.map((opt, idx) => {
                  const isCorrect = idx === selectedLesson.quiz.correctAnswer;
                  const isUserChosen = userAnswer === idx;
                  let btnStyle = 'inner-box hover:border-orange-500/50 text-[var(--text-primary)]';

                  if (showExplanation) {
                    if (isCorrect) {
                      btnStyle = 'bg-emerald-500/15 border-emerald-500 text-emerald-500 font-bold';
                    } else if (isUserChosen && !isCorrect) {
                      btnStyle = 'bg-rose-500/15 border-rose-500 text-rose-500 font-bold';
                    } else {
                      btnStyle = 'inner-box opacity-50 text-[var(--text-muted)]';
                    }
                  }

                  return (
                    <button
                      key={idx}
                      onClick={() => handleSelectOption(idx)}
                      disabled={userAnswer !== null}
                      className={`p-3 rounded-xl border text-left font-mono transition-all cursor-pointer ${btnStyle}`}
                    >
                      <div className="flex items-center justify-between">
                        <span>{opt}</span>
                        {showExplanation && isCorrect && <Check className="w-4 h-4 text-emerald-500" />}
                        {showExplanation && isUserChosen && !isCorrect && <X className="w-4 h-4 text-rose-500" />}
                      </div>
                    </button>
                  );
                })}
              </div>

              {showExplanation && (
                <div className="p-3.5 rounded-2xl inner-box border border-emerald-500/30 text-xs text-[var(--text-secondary)] font-sans space-y-1 animate-in fade-in">
                  <strong className="text-emerald-500 block font-mono">Scientific Explanation:</strong>
                  <span>{selectedLesson.quiz.explanation}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
