import React, { useState } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import LoadingScreen from './components/LoadingScreen';
import Layout from './components/Layout';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import ChemDraw from './pages/ChemDraw';
import AIChemistryLab from './pages/AIChemistryLab';
import QuantumLab from './pages/QuantumLab';
import IbmRxnPage from './pages/IbmRxnPage';
import Spectroscopy from './pages/Spectroscopy';
import Contact from './pages/Contact';
import PeriodicTable from './pages/PeriodicTable';
import ChemistsPage from './pages/ChemistsPage';
import Auth from './pages/Auth';
import Settings from './pages/Settings';
import ResearchProjects from './pages/ResearchProjects';
import ChromatographyPage from './pages/ChromatographyPage';

export default function App() {
  const [initialLoading, setInitialLoading] = useState(true);

  return (
    <ThemeProvider>
      {initialLoading && (
        <LoadingScreen onFinish={() => setInitialLoading(false)} duration={900} />
      )}
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Landing />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/chemdraw" element={<ChemDraw />} />
            <Route path="/rdkit-lab" element={<AIChemistryLab />} />
            <Route path="/quantum-library" element={<QuantumLab />} />
            <Route path="/quantum-lab" element={<Navigate to="/quantum-library" replace />} />
            <Route path="/ibm-rxn" element={<IbmRxnPage />} />
            <Route path="/spectroscopy" element={<Spectroscopy />} />
            <Route path="/chromatography" element={<ChromatographyPage />} />
            <Route path="/periodic-table" element={<PeriodicTable />} />
            <Route path="/scientists" element={<ChemistsPage />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/research-projects" element={<ResearchProjects />} />
            <Route path="/settings" element={<Settings />} />
          </Route>
          <Route path="/login" element={<Auth />} />
          <Route path="/register" element={<Auth />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}
