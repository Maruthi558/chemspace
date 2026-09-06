/**
 * Advanced Hand Gesture Recognition Engine for ChemSpace
 * Detects:
 * - Air cursor position (smoothed index fingertip)
 * - Pinch (Air click / drag)
 * - Open Palm (Activate / neutral)
 * - Closed Fist (Pause / lock interaction)
 * - Index Pointing (Cursor mode)
 * - Upward / Downward hand movement (Proportional scroll)
 * - Left / Right hand swipes (Navigation)
 * - Two-hand distance expansion / contraction (Continuous Zoom)
 */

export const GESTURE_TYPES = {
  NONE: 'NONE',
  OPEN_PALM: 'OPEN_PALM',
  CLOSED_FIST: 'CLOSED_FIST',
  INDEX_POINT: 'INDEX_POINT',
  PINCH: 'PINCH',
  SWIPE_LEFT: 'SWIPE_LEFT',
  SWIPE_RIGHT: 'SWIPE_RIGHT',
  MOVE_UP: 'MOVE_UP',
  MOVE_DOWN: 'MOVE_DOWN',
  TWO_HAND_ZOOM: 'TWO_HAND_ZOOM'
};

// Hand landmarks indices
export const LANDMARKS = {
  WRIST: 0,
  THUMB_CMC: 1,
  THUMB_MCP: 2,
  THUMB_IP: 3,
  THUMB_TIP: 4,
  INDEX_MCP: 5,
  INDEX_PIP: 6,
  INDEX_DIP: 7,
  INDEX_TIP: 8,
  MIDDLE_MCP: 9,
  MIDDLE_PIP: 10,
  MIDDLE_DIP: 11,
  MIDDLE_TIP: 12,
  RING_MCP: 13,
  RING_PIP: 14,
  RING_DIP: 15,
  RING_TIP: 16,
  PINKY_MCP: 17,
  PINKY_PIP: 18,
  PINKY_DIP: 19,
  PINKY_TIP: 20
};

// Euclidean distance in normalized 3D space
export function distance3D(p1, p2) {
  const dx = p1.x - p2.x;
  const dy = p1.y - p2.y;
  const dz = (p1.z || 0) - (p2.z || 0);
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

// Euclidean distance in 2D space
export function distance2D(p1, p2) {
  const dx = p1.x - p2.x;
  const dy = p1.y - p2.y;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Hand scale normalizer based on wrist-to-middle-MCP distance
 * Ensures gestures are scale-invariant whether the user is close or far from camera
 */
export function getHandScale(landmarks) {
  const wrist = landmarks[LANDMARKS.WRIST];
  const middleMcp = landmarks[LANDMARKS.MIDDLE_MCP];
  return Math.max(0.08, distance2D(wrist, middleMcp));
}

/**
 * Determines if a finger is extended relative to the palm
 */
export function isFingerExtended(landmarks, tipIdx, pipIdx, mcpIdx) {
  const wrist = landmarks[LANDMARKS.WRIST];
  const tipDist = distance2D(landmarks[tipIdx], wrist);
  const pipDist = distance2D(landmarks[pipIdx], wrist);
  const mcpDist = distance2D(landmarks[mcpIdx], wrist);

  return tipDist > pipDist && pipDist > mcpDist;
}

/**
 * Check state of all 5 fingers
 */
export function getFingersState(landmarks) {
  const wrist = landmarks[LANDMARKS.WRIST];
  const handScale = getHandScale(landmarks);

  // Thumb: distance between thumb tip and pinky MCP
  const thumbTip = landmarks[LANDMARKS.THUMB_TIP];
  const pinkyMcp = landmarks[LANDMARKS.PINKY_MCP];
  const thumbIp = landmarks[LANDMARKS.THUMB_IP];
  const thumbExtended = distance2D(thumbTip, pinkyMcp) > distance2D(thumbIp, pinkyMcp);

  const indexExtended = isFingerExtended(
    landmarks,
    LANDMARKS.INDEX_TIP,
    LANDMARKS.INDEX_PIP,
    LANDMARKS.INDEX_MCP
  );
  const middleExtended = isFingerExtended(
    landmarks,
    LANDMARKS.MIDDLE_TIP,
    LANDMARKS.MIDDLE_PIP,
    LANDMARKS.MIDDLE_MCP
  );
  const ringExtended = isFingerExtended(
    landmarks,
    LANDMARKS.RING_TIP,
    LANDMARKS.RING_PIP,
    LANDMARKS.RING_MCP
  );
  const pinkyExtended = isFingerExtended(
    landmarks,
    LANDMARKS.PINKY_TIP,
    LANDMARKS.PINKY_PIP,
    LANDMARKS.PINKY_MCP
  );

  return {
    thumb: thumbExtended,
    index: indexExtended,
    middle: middleExtended,
    ring: ringExtended,
    pinky: pinkyExtended,
    extendedCount:
      (thumbExtended ? 1 : 0) +
      (indexExtended ? 1 : 0) +
      (middleExtended ? 1 : 0) +
      (ringExtended ? 1 : 0) +
      (pinkyExtended ? 1 : 0)
  };
}

export class GestureRecognitionEngine {
  constructor() {
    this.previousPositions = [];
    this.smoothedCursor = { x: 0.5, y: 0.5 };
    this.isPinching = false;
    this.lastPinchTime = 0;
    this.lastSwipeTime = 0;
    this.prevHandDistance = null;
    this.velocity = { vx: 0, vy: 0 };
    this.smoothingAlpha = 0.65; // Higher = faster response, lower = smoother
  }

  setSmoothing(alpha) {
    this.smoothingAlpha = Math.max(0.1, Math.min(0.95, alpha));
  }

  /**
   * Process landmarks and detect primary active gesture
   */
  process(handResults) {
    if (!handResults || !handResults.landmarks || handResults.landmarks.length === 0) {
      this.previousPositions = [];
      this.prevHandDistance = null;
      return {
        gesture: GESTURE_TYPES.NONE,
        handCount: 0,
        isPinching: false,
        cursor: null,
        velocity: { vx: 0, vy: 0 },
        scrollDelta: 0,
        zoomDelta: 0
      };
    }

    const handCount = handResults.landmarks.length;

    // ── TWO-HAND CONTINUOUS ZOOM RECOGNITION ──────────────────────────────────
    if (handCount >= 2) {
      const hand1 = handResults.landmarks[0];
      const hand2 = handResults.landmarks[1];
      const center1 = hand1[LANDMARKS.MIDDLE_MCP];
      const center2 = hand2[LANDMARKS.MIDDLE_MCP];
      const currentDist = distance2D(center1, center2);

      let zoomDelta = 0;
      if (this.prevHandDistance !== null) {
        const diff = currentDist - this.prevHandDistance;
        // Sensitivity threshold
        if (Math.abs(diff) > 0.008) {
          zoomDelta = diff * 12;
        }
      }
      this.prevHandDistance = currentDist;

      const hand1Fingers = getFingersState(hand1);
      const hand2Fingers = getFingersState(hand2);

      if (hand1Fingers.extendedCount >= 3 && hand2Fingers.extendedCount >= 3) {
        return {
          gesture: GESTURE_TYPES.TWO_HAND_ZOOM,
          handCount,
          isPinching: false,
          cursor: null,
          velocity: { vx: 0, vy: 0 },
          scrollDelta: 0,
          zoomDelta
        };
      }
    } else {
      this.prevHandDistance = null;
    }

    // ── SINGLE HAND GESTURE RECOGNITION ─────────────────────────────────────
    const landmarks = handResults.landmarks[0];
    const handScale = getHandScale(landmarks);
    const fingers = getFingersState(landmarks);

    // Track Index Fingertip for Virtual Air Cursor
    // Mirror x coordinate because webcam is mirrored for user's perspective
    const rawIndexTip = landmarks[LANDMARKS.INDEX_TIP];
    const rawX = 1 - rawIndexTip.x;
    const rawY = rawIndexTip.y;

    // Exponential Moving Average (EMA) smoothing for rock-solid cursor
    this.smoothedCursor.x =
      this.smoothingAlpha * rawX + (1 - this.smoothingAlpha) * this.smoothedCursor.x;
    this.smoothedCursor.y =
      this.smoothingAlpha * rawY + (1 - this.smoothingAlpha) * this.smoothedCursor.y;

    // Track hand movement velocity over a rolling window
    const now = performance.now();
    this.previousPositions.push({ x: rawX, y: rawY, time: now });
    if (this.previousPositions.length > 8) {
      this.previousPositions.shift();
    }

    let vx = 0;
    let vy = 0;
    if (this.previousPositions.length >= 3) {
      const oldest = this.previousPositions[0];
      const newest = this.previousPositions[this.previousPositions.length - 1];
      const dt = (newest.time - oldest.time) / 1000;
      if (dt > 0.05) {
        vx = (newest.x - oldest.x) / dt;
        vy = (newest.y - oldest.y) / dt;
      }
    }
    this.velocity = { vx, vy };

    // 1. PINCH DETECTION (Air Click)
    // Normalized distance between thumb tip and index tip
    const thumbTip = landmarks[LANDMARKS.THUMB_TIP];
    const indexTip = landmarks[LANDMARKS.INDEX_TIP];
    const pinchDist = distance2D(thumbTip, indexTip) / handScale;

    // Hysteresis threshold to avoid jittery trigger/release fluttering
    const PINCH_START_THRESHOLD = 0.32;
    const PINCH_END_THRESHOLD = 0.44;

    if (!this.isPinching && pinchDist < PINCH_START_THRESHOLD) {
      this.isPinching = true;
      this.lastPinchTime = now;
    } else if (this.isPinching && pinchDist > PINCH_END_THRESHOLD) {
      this.isPinching = false;
    }

    // 2. CLOSED FIST (Pause / Lock Gesture)
    // All 4 main fingers folded into the palm
    const isFist =
      !fingers.index && !fingers.middle && !fingers.ring && !fingers.pinky;

    if (isFist) {
      return {
        gesture: GESTURE_TYPES.CLOSED_FIST,
        handCount: 1,
        isPinching: false,
        cursor: this.smoothedCursor,
        velocity: { vx: 0, vy: 0 },
        scrollDelta: 0,
        zoomDelta: 0
      };
    }

    // 3. PINCH ACTIVE (Air Click / Dragging)
    if (this.isPinching) {
      return {
        gesture: GESTURE_TYPES.PINCH,
        handCount: 1,
        isPinching: true,
        cursor: this.smoothedCursor,
        velocity: { vx: 0, vy: 0 },
        scrollDelta: 0,
        zoomDelta: 0
      };
    }

    // 4. HORIZONTAL SWIPE GESTURE DETECTION (Navigation)
    // High horizontal velocity with dominant horizontal direction
    const SWIPE_VELOCITY_THRESHOLD = 1.4;
    const SWIPE_COOLDOWN_MS = 650;

    if (
      Math.abs(vx) > SWIPE_VELOCITY_THRESHOLD &&
      Math.abs(vx) > Math.abs(vy) * 1.8 &&
      now - this.lastSwipeTime > SWIPE_COOLDOWN_MS
    ) {
      this.lastSwipeTime = now;
      if (vx < -SWIPE_VELOCITY_THRESHOLD) {
        return {
          gesture: GESTURE_TYPES.SWIPE_LEFT,
          handCount: 1,
          isPinching: false,
          cursor: this.smoothedCursor,
          velocity: { vx, vy },
          scrollDelta: 0,
          zoomDelta: 0
        };
      } else if (vx > SWIPE_VELOCITY_THRESHOLD) {
        return {
          gesture: GESTURE_TYPES.SWIPE_RIGHT,
          handCount: 1,
          isPinching: false,
          cursor: this.smoothedCursor,
          velocity: { vx, vy },
          scrollDelta: 0,
          zoomDelta: 0
        };
      }
    }

    // 5. VERTICAL SCROLL MOVEMENT
    // Open palm or flat hand moving up or down
    if (fingers.extendedCount >= 3) {
      const SCROLL_DEADZONE = 0.25;
      let scrollDelta = 0;

      if (Math.abs(vy) > SCROLL_DEADZONE) {
        // vy > 0 is hand moving downward, which scrolls page down
        scrollDelta = vy * 18;
      }

      if (Math.abs(scrollDelta) > 3) {
        return {
          gesture: scrollDelta > 0 ? GESTURE_TYPES.MOVE_DOWN : GESTURE_TYPES.MOVE_UP,
          handCount: 1,
          isPinching: false,
          cursor: this.smoothedCursor,
          velocity: { vx, vy },
          scrollDelta,
          zoomDelta: 0
        };
      }

      return {
        gesture: GESTURE_TYPES.OPEN_PALM,
        handCount: 1,
        isPinching: false,
        cursor: this.smoothedCursor,
        velocity: { vx, vy },
        scrollDelta: 0,
        zoomDelta: 0
      };
    }

    // 6. INDEX FINGER POINTING (Virtual Air Cursor Mode)
    if (fingers.index && !fingers.middle && !fingers.ring && !fingers.pinky) {
      return {
        gesture: GESTURE_TYPES.INDEX_POINT,
        handCount: 1,
        isPinching: false,
        cursor: this.smoothedCursor,
        velocity: { vx, vy },
        scrollDelta: 0,
        zoomDelta: 0
      };
    }

    return {
      gesture: GESTURE_TYPES.NONE,
      handCount: 1,
      isPinching: false,
      cursor: this.smoothedCursor,
      velocity: { vx, vy },
      scrollDelta: 0,
      zoomDelta: 0
    };
  }

  reset() {
    this.previousPositions = [];
    this.prevHandDistance = null;
    this.isPinching = false;
  }
}
