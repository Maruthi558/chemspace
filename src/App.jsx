import React, { Suspense } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { GestureProvider } from './context/GestureContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import PrivacyOverlay from './components/PrivacyOverlay';
import VirtualAirCursor from './components/Gestures/VirtualAirCursor';
import FloatingCameraPreview from './components/Gestures/FloatingCameraPreview';
import GestureTutorialModal from './components/Gestures/GestureTutorialModal';
import GestureCalibrationModal from './components/Gestures/GestureCalibrationModal';

// Lazy-loaded routes for ultra-fast initial page paint and optimal bundle code-splitting
const Landing = React.lazy(() => import('./pages/Landing'));
const Dashboard = React.lazy(() => import('./pages/Dashboard'));
const ChemDraw = React.lazy(() => import('./pages/ChemDraw'));
const AIChemistryLab = React.lazy(() => import('./pages/AIChemistryLab'));
const QuantumLab = React.lazy(() => import('./pages/QuantumLab'));
const IbmRxnPage = React.lazy(() => import('./pages/IbmRxnPage'));
const Spectroscopy = React.lazy(() => import('./pages/Spectroscopy'));
const Contact = React.lazy(() => import('./pages/Contact'));
const PeriodicTable = React.lazy(() => import('./pages/PeriodicTable'));
const ChemistsPage = React.lazy(() => import('./pages/ChemistsPage'));
const Auth = React.lazy(() => import('./pages/Auth'));
const Settings = React.lazy(() => import('./pages/Settings'));
const ResearchProjects = React.lazy(() => import('./pages/ResearchProjects'));
const ChromatographyPage = React.lazy(() => import('./pages/ChromatographyPage'));
const UserWorkspace = React.lazy(() => import('./pages/UserWorkspace'));

function RouteFallback() {
  return (
    <div className="flex items-center justify-center min-h-[50vh] w-full select-none">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 rounded-2xl border border-white/10 dark:border-white/10 border-slate-300/40 flex items-center justify-center bg-white/5 dark:bg-white/5 bg-slate-100/60 shadow-sm">
          <div className="w-5 h-5 rounded-full border-2 border-cyan-500 border-t-transparent animate-spin" />
        </div>
        <span className="text-[11px] font-mono tracking-wider opacity-60 text-slate-400">Loading module...</span>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <GestureProvider>
          <PrivacyOverlay />
          <VirtualAirCursor />
          <FloatingCameraPreview />
          <GestureTutorialModal />
          <GestureCalibrationModal />
          <BrowserRouter>
            <Suspense fallback={<RouteFallback />}>
              <Routes>
                {/* Protected Workspace Routes */}
                <Route
                  element={
                    <ProtectedRoute>
                      <Layout />
                    </ProtectedRoute>
                  }
                >
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
                  <Route path="/workspace" element={<UserWorkspace />} />
                  <Route path="/history" element={<UserWorkspace />} />
                  <Route path="/settings" element={<Settings />} />
                </Route>

                {/* Public Authentication Gateways */}
                <Route path="/login" element={<Auth />} />
                <Route path="/register" element={<Auth />} />

                {/* Fallback Redirect */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Suspense>
          </BrowserRouter>
        </GestureProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
