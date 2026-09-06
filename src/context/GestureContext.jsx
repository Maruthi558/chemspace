import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { handLandmarkerService } from '../gestures/handLandmarkerService';
import { GestureRecognitionEngine } from '../gestures/gestureRecognition';
import { gestureController } from '../gestures/gestureController';

const GestureContext = createContext(null);

export function GestureProvider({ children }) {
  const [isSupported] = useState(() => {
    return (
      typeof window !== 'undefined' &&
      Boolean(navigator.mediaDevices && navigator.mediaDevices.getUserMedia)
    );
  });

  const [isEnabled, setIsEnabled] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [handDetected, setHandDetected] = useState(false);
  const [handCount, setHandCount] = useState(0);
  const [currentMode, setCurrentMode] = useState('IDLE');
  const [currentAction, setCurrentAction] = useState('Camera Ready');
  const [cursorPos, setCursorPos] = useState({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
  const [isPinching, setIsPinching] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [previewVisible, setPreviewVisible] = useState(true);
  const [previewMinimized, setPreviewMinimized] = useState(false);
  const [sensitivity, setSensitivityState] = useState(() => {
    try {
      return parseFloat(localStorage.getItem('chemspace_gesture_sensitivity')) || 1.0;
    } catch {
      return 1.0;
    }
  });

  const [tutorialOpen, setTutorialOpen] = useState(false);
  const [calibrationOpen, setCalibrationOpen] = useState(false);
  const [cameraError, setCameraError] = useState('');

  const recognitionEngineRef = useRef(new GestureRecognitionEngine());
  const hiddenVideoRef = useRef(null);
  const previewCanvasRef = useRef(null);

  // Synchronize sensitivity with controller
  const handleSetSensitivity = useCallback((val) => {
    setSensitivityState(val);
    gestureController.setSensitivity(val);
    try {
      localStorage.setItem('chemspace_gesture_sensitivity', String(val));
    } catch {
      // ignore
    }
  }, []);

  // Frame processing callback from handLandmarkerService
  const handleHandResults = useCallback((results) => {
    if (!results || !results.landmarks || results.landmarks.length === 0) {
      setHandDetected(false);
      setHandCount(0);
      setCurrentMode('IDLE');
      setCurrentAction('Searching for hand...');
      recognitionEngineRef.current.reset();
      return;
    }

    setHandDetected(true);
    setHandCount(results.landmarks.length);

    // 1. Run gesture classification
    const recognized = recognitionEngineRef.current.process(results);

    // 2. Run controller interactions (cursor, click, scroll, swipe, zoom)
    const interaction = gestureController.handleGesture(recognized);

    setCurrentMode(interaction.mode);
    setCurrentAction(interaction.action);
    setIsPinching(interaction.isPinching);
    setIsPaused(interaction.mode === 'PAUSED');

    if (interaction.cursor) {
      setCursorPos({ ...interaction.cursor });
    }
  }, []);

  // Enable gesture recognition
  const enableGestures = useCallback(async (videoEl, canvasEl) => {
    setCameraError('');
    try {
      const video = videoEl || hiddenVideoRef.current;
      const canvas = canvasEl || previewCanvasRef.current;
      if (!video) throw new Error('Video element not mounted');

      handLandmarkerService.setOnResults(handleHandResults);
      await handLandmarkerService.startCamera(video, canvas);

      setIsEnabled(true);
      setCameraActive(true);
      setPreviewVisible(true);
      setCurrentAction('Calibrating & Tracking...');
    } catch (err) {
      console.error('[GestureContext] Failed to start camera:', err);
      setCameraError(err.message || 'Camera permission denied or camera unavailable.');
      setIsEnabled(false);
      setCameraActive(false);
    }
  }, [handleHandResults]);

  // Disable gesture recognition and release camera resources
  const disableGestures = useCallback(() => {
    handLandmarkerService.stopCamera();
    recognitionEngineRef.current.reset();
    setIsEnabled(false);
    setCameraActive(false);
    setHandDetected(false);
    setHandCount(0);
    setCurrentMode('IDLE');
    setCurrentAction('Gesture system off');
  }, []);

  const toggleGestures = useCallback(() => {
    if (isEnabled) {
      disableGestures();
    } else {
      enableGestures();
    }
  }, [isEnabled, enableGestures, disableGestures]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      handLandmarkerService.stopCamera();
    };
  }, []);

  const value = {
    isSupported,
    isEnabled,
    cameraActive,
    handDetected,
    handCount,
    currentMode,
    currentAction,
    cursorPos,
    isPinching,
    isPaused,
    previewVisible,
    setPreviewVisible,
    previewMinimized,
    setPreviewMinimized,
    sensitivity,
    setSensitivity: handleSetSensitivity,
    tutorialOpen,
    openTutorial: () => setTutorialOpen(true),
    closeTutorial: () => setTutorialOpen(false),
    calibrationOpen,
    openCalibration: () => setCalibrationOpen(true),
    closeCalibration: () => setCalibrationOpen(false),
    cameraError,
    enableGestures,
    disableGestures,
    toggleGestures,
    hiddenVideoRef,
    previewCanvasRef
  };

  return (
    <GestureContext.Provider value={value}>
      {children}
      {/* Hidden baseline video element for MediaPipe stream processing */}
      <video
        ref={hiddenVideoRef}
        className="hidden"
        playsInline
        muted
        autoPlay
      />
    </GestureContext.Provider>
  );
}

export function useGestures() {
  const context = useContext(GestureContext);
  if (!context) {
    throw new Error('useGestures must be used within a GestureProvider');
  }
  return context;
}
