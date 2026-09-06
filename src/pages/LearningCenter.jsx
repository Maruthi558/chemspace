import React, { useState } from 'react';
import { BookOpen, CheckCircle, HelpCircle, Sparkles, Award, ArrowRight, Box } from 'lucide-react';
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
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="bg-slate-900/80 backdrop-blur-md p-6 rounded-2xl border border-cyan-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black bg-gradient-to-r from-cyan-400 via-blue-400 to-violet-400 bg-clip-text text-transparent flex items-center gap-3">
            <BookOpen className="w-7 h-7 text-cyan-400" />
            Chemistry & AI Learning Center
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Interactive educational modules on VSEPR geometry, organic aromaticity, and QSAR machine-learning models.
          </p>
        </div>
        <div className="flex items-center gap-2 font-mono text-xs text-emerald-400 bg-emerald-950/80 px-4 py-2 rounded-xl border border-emerald-500/30">
          <Award className="w-4 h-4 text-emerald-400" /> Score: {score} Correct
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Lesson Navigation */}
        <div className="lg:col-span-4 bg-slate-900/70 border border-slate-800 rounded-2xl p-4 space-y-3">
          <span className="text-xs font-mono text-slate-400 block px-1">Curriculum Modules:</span>
          {LESSONS.map((l) => (
            <button
              key={l.id}
              onClick={() => {
                setSelectedLesson(l);
                setUserAnswer(null);
                setShowExplanation(false);
              }}
              className={`w-full text-left p-3.5 rounded-xl border text-xs transition ${
                l.id === selectedLesson.id
                  ? 'bg-gradient-to-r from-cyan-950 to-slate-900 border-cyan-400 text-cyan-300 shadow-md'
                  : 'bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-800'
              }`}
            >
              <div className="font-bold">{l.title}</div>
              <div className="text-[11px] text-slate-400 mt-1 line-clamp-2">{l.summary}</div>
            </button>
          ))}
        </div>

        {/* Right Lesson Content & Quiz */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4">
            <h2 className="text-xl font-bold text-slate-100">{selectedLesson.title}</h2>
            <p className="text-xs text-slate-300 leading-relaxed font-sans">{selectedLesson.details}</p>

            {/* Interactive 3D Demonstration */}
            <div className="pt-2">
              <span className="text-xs font-mono text-cyan-300 font-bold block mb-2">3D Molecular Demonstration ({demoMolecule.name}):</span>
              <div className="h-64 w-full rounded-xl overflow-hidden border border-slate-800">
                <ThreeMoleculeViewer molecule={demoMolecule} styleMode="ball-stick" />
              </div>
            </div>

            {/* Interactive Quiz Section */}
            <div className="pt-4 border-t border-slate-800 space-y-3">
              <h3 className="text-xs font-mono font-bold text-violet-300 flex items-center gap-1.5">
                <HelpCircle className="w-4 h-4 text-violet-400" /> Interactive Knowledge Check
              </h3>
              <p className="text-xs text-slate-200 font-semibold">{selectedLesson.quiz.question}</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {selectedLesson.quiz.options.map((opt, idx) => {
                  const isCorrect = idx === selectedLesson.quiz.correctAnswer;
                  const isUserChosen = userAnswer === idx;
                  return (
                    <button
                      key={idx}
                      onClick={() => handleSelectOption(idx)}
                      disabled={userAnswer !== null}
                      className={`p-3 rounded-xl border text-left font-mono transition ${
                        showExplanation && isCorrect
                          ? 'bg-emerald-950 border-emerald-500 text-emerald-300'
                          : showExplanation && isUserChosen && !isCorrect
                          ? 'bg-red-950 border-red-500 text-red-300'
                          : 'bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>

              {showExplanation && (
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs text-slate-300 font-sans space-y-1">
                  <strong className="text-emerald-400 block font-mono">Explanation:</strong>
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
