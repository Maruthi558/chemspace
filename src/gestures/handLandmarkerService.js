import { FilesetResolver, HandLandmarker } from '@mediapipe/tasks-vision';

/**
 * HandLandmarkerService handles:
 * - Camera initialization & stream lifecycle
 * - Loading MediaPipe HandLandmarker vision tasks
 * - Real-time landmark inference on requestAnimationFrame
 * - Overlay canvas rendering
 */
class HandLandmarkerService {
  constructor() {
    this.handLandmarker = null;
    this.videoElement = null;
    this.canvasElement = null;
    this.canvasCtx = null;
    this.stream = null;
    this.animationFrameId = null;
    this.isRunning = false;
    this.isLoading = false;
    this.onResultsCallback = null;
    this.lastVideoTime = -1;
  }

  /**
   * Initializes the MediaPipe HandLandmarker vision model
   */
  async initModel() {
    if (this.handLandmarker) return this.handLandmarker;
    if (this.isLoading) {
      while (this.isLoading) {
        await new Promise((resolve) => setTimeout(resolve, 50));
      }
      return this.handLandmarker;
    }

    this.isLoading = true;
    try {
      const vision = await FilesetResolver.forVisionTasks(
        'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm'
      );

      this.handLandmarker = await HandLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath:
            'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task',
          delegate: 'GPU'
        },
        runningMode: 'VIDEO',
        numHands: 2,
        minHandDetectionConfidence: 0.55,
        minHandPresenceConfidence: 0.55,
        minTrackingConfidence: 0.55
      });

      return this.handLandmarker;
    } catch (err) {
      console.warn('[HandLandmarker] GPU delegate fallback to CPU:', err.message);
      const vision = await FilesetResolver.forVisionTasks(
        'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm'
      );
      this.handLandmarker = await HandLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath:
            'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task',
          delegate: 'CPU'
        },
        runningMode: 'VIDEO',
        numHands: 2,
        minHandDetectionConfidence: 0.5,
        minHandPresenceConfidence: 0.5,
        minTrackingConfidence: 0.5
      });
      return this.handLandmarker;
    } finally {
      this.isLoading = false;
    }
  }

  /**
   * Requests webcam stream with optimal resolution for computer vision
   */
  async startCamera(videoElement, canvasElement = null) {
    if (this.isRunning) return;

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      throw new Error('Webcam access is not supported by your browser.');
    }

    this.videoElement = videoElement;
    this.canvasElement = canvasElement;
    if (canvasElement) {
      this.canvasCtx = canvasElement.getContext('2d');
    }

    await this.initModel();

    const constraints = {
      video: {
        width: { ideal: 640 },
        height: { ideal: 480 },
        facingMode: 'user',
        frameRate: { ideal: 30, max: 60 }
      },
      audio: false
    };

    this.stream = await navigator.mediaDevices.getUserMedia(constraints);
    this.videoElement.srcObject = this.stream;
    this.videoElement.playsInline = true;
    this.videoElement.muted = true;

    await new Promise((resolve) => {
      this.videoElement.onloadeddata = () => {
        this.videoElement.play();
        resolve();
      };
    });

    this.isRunning = true;
    this.startDetectionLoop();
  }

  /**
   * Main detection loop using requestAnimationFrame
   */
  startDetectionLoop() {
    const loop = () => {
      if (!this.isRunning) return;

      if (
        this.handLandmarker &&
        this.videoElement &&
        this.videoElement.readyState >= 2
      ) {
        const currentTime = performance.now();
        if (this.videoElement.currentTime !== this.lastVideoTime) {
          this.lastVideoTime = this.videoElement.currentTime;

          try {
            const results = this.handLandmarker.detectForVideo(
              this.videoElement,
              currentTime
            );

            if (this.onResultsCallback) {
              this.onResultsCallback(results, this.videoElement);
            }

            if (this.canvasElement && this.canvasCtx) {
              this.drawLandmarks(results);
            }
          } catch {
            // Non-critical frame skip
          }
        }
      }

      this.animationFrameId = requestAnimationFrame(loop);
    };

    this.animationFrameId = requestAnimationFrame(loop);
  }

  /**
   * Render high-tech ChemSpace holographic skeleton overlay on canvas
   */
  drawLandmarks(results) {
    if (!this.canvasElement || !this.canvasCtx) return;
    const ctx = this.canvasCtx;
    const width = this.canvasElement.width;
    const height = this.canvasElement.height;

    ctx.clearRect(0, 0, width, height);

    if (!results || !results.landmarks || results.landmarks.length === 0) {
      return;
    }

    const CONNECTIONS = [
      [0, 1], [1, 2], [2, 3], [3, 4],
      [0, 5], [5, 6], [6, 7], [7, 8],
      [0, 9], [9, 10], [10, 11], [11, 12],
      [0, 13], [13, 14], [14, 15], [15, 16],
      [0, 17], [17, 18], [18, 19], [19, 20],
      [5, 9], [9, 13], [13, 17]
    ];

    results.landmarks.forEach((handLandmarks, handIdx) => {
      const isRightHand = results.handednesses?.[handIdx]?.[0]?.categoryName === 'Right';
      const mainColor = isRightHand ? '#06b6d4' : '#8b5cf6';
      const accentColor = isRightHand ? '#22d3ee' : '#a78bfa';

      ctx.lineWidth = 2.5;
      ctx.strokeStyle = mainColor;
      ctx.shadowColor = mainColor;
      ctx.shadowBlur = 8;

      CONNECTIONS.forEach(([startIdx, endIdx]) => {
        const start = handLandmarks[startIdx];
        const end = handLandmarks[endIdx];

        ctx.beginPath();
        ctx.moveTo((1 - start.x) * width, start.y * height);
        ctx.lineTo((1 - end.x) * width, end.y * height);
        ctx.stroke();
      });

      handLandmarks.forEach((lm, idx) => {
        const x = (1 - lm.x) * width;
        const y = lm.y * height;
        const isTip = [4, 8, 12, 16, 20].includes(idx);

        ctx.beginPath();
        ctx.arc(x, y, isTip ? 5 : 3, 0, 2 * Math.PI);
        ctx.fillStyle = isTip ? '#10b981' : accentColor;
        ctx.shadowColor = isTip ? '#10b981' : accentColor;
        ctx.shadowBlur = isTip ? 12 : 6;
        ctx.fill();

        if (isTip) {
          ctx.beginPath();
          ctx.arc(x, y, 9, 0, 2 * Math.PI);
          ctx.lineWidth = 1;
          ctx.strokeStyle = 'rgba(16, 185, 129, 0.6)';
          ctx.stroke();
        }
      });
    });

    ctx.shadowBlur = 0;
  }

  /**
   * Stops video detection loop and releases camera hardware
   */
  stopCamera() {
    this.isRunning = false;

    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }

    if (this.stream) {
      this.stream.getTracks().forEach((track) => track.stop());
      this.stream = null;
    }

    if (this.videoElement) {
      this.videoElement.srcObject = null;
    }

    if (this.canvasCtx && this.canvasElement) {
      this.canvasCtx.clearRect(0, 0, this.canvasElement.width, this.canvasElement.height);
    }
  }

  /**
   * Set callback to receive per-frame hand detection results
   */
  setOnResults(callback) {
    this.onResultsCallback = callback;
  }
}

export const handLandmarkerService = new HandLandmarkerService();
