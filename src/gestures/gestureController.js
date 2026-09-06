import { GESTURE_TYPES } from './gestureRecognition';

/**
 * GestureController orchestrates:
 * - Air Cursor coordinate projection to browser viewport
 * - Air-Click synthetic event dispatch (click on buttons, inputs, links)
 * - Proportional page scrolling with inertia and dead zones
 * - Horizontal swipe page / section navigation
 * - Continuous zoom dispatching to 3D viewers & canvas
 * - Mode transition logic (IDLE, CURSOR, SCROLL, SWIPE, ZOOM, PAUSED)
 */
export class GestureController {
  constructor() {
    this.calibration = {
      xMin: 0.15,
      xMax: 0.85,
      yMin: 0.15,
      yMax: 0.85
    };
    this.sensitivity = 1.0;
    this.isPaused = false;
    this.lastClickTime = 0;
    this.lastPinchState = false;
    this.activeElementUnderCursor = null;
    this.scrollVelocity = 0;
    this.screenPos = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
  }

  setSensitivity(val) {
    this.sensitivity = Math.max(0.5, Math.min(2.5, val));
  }

  setCalibration(bounds) {
    this.calibration = { ...this.calibration, ...bounds };
  }

  setPaused(paused) {
    this.isPaused = paused;
  }

  /**
   * Maps normalized camera coordinates (0.0 to 1.0) into viewport screen pixels
   * with boundary padding margins and sensitivity scaling
   */
  mapToScreen(normPos) {
    if (!normPos) return this.screenPos;

    const { xMin, xMax, yMin, yMax } = this.calibration;

    // Normalize within calibrated active range
    let clampedX = (normPos.x - xMin) / (xMax - xMin);
    let clampedY = (normPos.y - yMin) / (yMax - yMin);

    // Apply sensitivity curve centered at (0.5, 0.5)
    clampedX = 0.5 + (clampedX - 0.5) * this.sensitivity;
    clampedY = 0.5 + (clampedY - 0.5) * this.sensitivity;

    // Clamp to screen bounds
    clampedX = Math.max(0.01, Math.min(0.99, clampedX));
    clampedY = Math.max(0.01, Math.min(0.99, clampedY));

    this.screenPos = {
      x: clampedX * window.innerWidth,
      y: clampedY * window.innerHeight
    };

    return this.screenPos;
  }

  /**
   * Executes gesture interaction on each video frame
   */
  handleGesture(result) {
    if (!result) return { mode: 'IDLE', action: 'Searching for hand...' };

    // 1. Check Pause Gesture (Closed Fist)
    if (result.gesture === GESTURE_TYPES.CLOSED_FIST) {
      this.isPaused = true;
      return {
        mode: 'PAUSED',
        action: 'Gesture interaction locked (Closed Fist)',
        isPinching: false,
        cursor: this.screenPos
      };
    }

    // 2. Check Resume Gesture (Open Palm resets paused state)
    if (this.isPaused) {
      if (result.gesture === GESTURE_TYPES.OPEN_PALM) {
        this.isPaused = false;
        return {
          mode: 'IDLE',
          action: 'Gesture interaction resumed (Open Palm)',
          isPinching: false,
          cursor: this.screenPos
        };
      }
      return {
        mode: 'PAUSED',
        action: 'Paused • Show Open Palm to resume',
        isPinching: false,
        cursor: this.screenPos
      };
    }

    // 3. Two-Hand Continuous Zoom Mode
    if (result.gesture === GESTURE_TYPES.TWO_HAND_ZOOM) {
      if (Math.abs(result.zoomDelta) > 0.001) {
        // Dispatch global zoom event for Three.js and ChemDraw canvases
        window.dispatchEvent(
          new CustomEvent('chemspace-gesture-zoom', {
            detail: {
              delta: result.zoomDelta,
              factor: 1 + result.zoomDelta * 0.1,
              zoomIn: result.zoomDelta > 0
            }
          })
        );
      }

      return {
        mode: 'ZOOM',
        action: result.zoomDelta > 0 ? 'Zooming In (Hands Apart)' : 'Zooming Out (Hands Closer)',
        isPinching: false,
        cursor: this.screenPos
      };
    }

    // Map Index Fingertip to Viewport Screen Coordinate
    if (result.cursor) {
      this.mapToScreen(result.cursor);
    }

    // Find element under virtual air cursor
    const element = document.elementFromPoint(this.screenPos.x, this.screenPos.y);
    this.activeElementUnderCursor = element;

    // 4. Air Click / Button Control (Pinch Gesture)
    const now = performance.now();
    let currentAction = 'Tracking Hand';

    if (result.isPinching) {
      if (!this.lastPinchState && now - this.lastClickTime > 350) {
        this.lastClickTime = now;
        this.triggerAirClick(element, this.screenPos.x, this.screenPos.y);
        currentAction = 'Air Click Executed!';
      } else {
        currentAction = 'Pinching / Dragging';
      }
      this.lastPinchState = true;

      // Dispatch drag delta if active
      if (result.velocity && (Math.abs(result.velocity.vx) > 0.1 || Math.abs(result.velocity.vy) > 0.1)) {
        window.dispatchEvent(
          new CustomEvent('chemspace-gesture-rotate', {
            detail: {
              deltaX: result.velocity.vx * 3,
              deltaY: result.velocity.vy * 3
            }
          })
        );
      }

      return {
        mode: 'CURSOR',
        action: currentAction,
        isPinching: true,
        cursor: this.screenPos,
        targetElement: element?.tagName?.toLowerCase()
      };
    } else {
      this.lastPinchState = false;
    }

    // 5. Horizontal Swipe Gestures (Page Navigation)
    if (result.gesture === GESTURE_TYPES.SWIPE_LEFT) {
      window.dispatchEvent(
        new CustomEvent('chemspace-gesture-swipe', { detail: { direction: 'left' } })
      );
      // Trigger browser back or section navigation
      if (window.history && window.history.length > 1) {
        window.history.back();
      }
      return {
        mode: 'NAVIGATION',
        action: 'Swiped Left (Navigate Previous)',
        isPinching: false,
        cursor: this.screenPos
      };
    }

    if (result.gesture === GESTURE_TYPES.SWIPE_RIGHT) {
      window.dispatchEvent(
        new CustomEvent('chemspace-gesture-swipe', { detail: { direction: 'right' } })
      );
      if (window.history) {
        window.history.forward();
      }
      return {
        mode: 'NAVIGATION',
        action: 'Swiped Right (Navigate Next)',
        isPinching: false,
        cursor: this.screenPos
      };
    }

    // 6. Vertical Hand Movement (Proportional Smooth Scrolling)
    if (
      result.gesture === GESTURE_TYPES.MOVE_UP ||
      result.gesture === GESTURE_TYPES.MOVE_DOWN
    ) {
      const scrollAmt = result.scrollDelta * this.sensitivity * 1.5;
      window.scrollBy({
        top: scrollAmt,
        left: 0,
        behavior: 'auto'
      });

      return {
        mode: 'SCROLL',
        action: scrollAmt > 0 ? 'Scrolling Down' : 'Scrolling Up',
        isPinching: false,
        cursor: this.screenPos
      };
    }

    // 7. Virtual Cursor Mode
    if (result.gesture === GESTURE_TYPES.INDEX_POINT) {
      return {
        mode: 'CURSOR',
        action: 'Air Pointing (Move Index Finger)',
        isPinching: false,
        cursor: this.screenPos,
        targetElement: element?.tagName?.toLowerCase()
      };
    }

    return {
      mode: 'IDLE',
      action: 'Tracking Hand Movement',
      isPinching: false,
      cursor: this.screenPos
    };
  }

  /**
   * Triggers realistic browser click and pointer events on the target element
   */
  triggerAirClick(element, x, y) {
    if (!element) return;

    // Find clickable target (support parent buttons, links, or inputs)
    const clickable = element.closest(
      'button, a, input, select, textarea, [role="button"], .cursor-pointer'
    ) || element;

    const eventInit = {
      bubbles: true,
      cancelable: true,
      view: window,
      clientX: x,
      clientY: y,
      screenX: x,
      screenY: y,
      pointerId: 1,
      pointerType: 'touch',
      isPrimary: true
    };

    try {
      clickable.dispatchEvent(new PointerEvent('pointerdown', eventInit));
      clickable.dispatchEvent(new MouseEvent('mousedown', eventInit));

      setTimeout(() => {
        clickable.dispatchEvent(new PointerEvent('pointerup', eventInit));
        clickable.dispatchEvent(new MouseEvent('mouseup', eventInit));
        clickable.dispatchEvent(new MouseEvent('click', eventInit));

        // Direct activation for HTML buttons, links, and input focus
        if (typeof clickable.click === 'function') {
          clickable.click();
        }
        if (typeof clickable.focus === 'function') {
          clickable.focus();
        }
      }, 50);

      // Create a visual air-click pulse effect in the DOM
      this.createClickWave(x, y);
    } catch {
      // ignore
    }
  }

  /**
   * Emits futuristic visual shockwave at air click coordinates
   */
  createClickWave(x, y) {
    const wave = document.createElement('div');
    wave.className = 'chemspace-air-click-ripple';
    wave.style.left = `${x}px`;
    wave.style.top = `${y}px`;
    document.body.appendChild(wave);

    setTimeout(() => {
      if (wave && wave.parentNode) {
        wave.parentNode.removeChild(wave);
      }
    }, 600);
  }
}

export const gestureController = new GestureController();
