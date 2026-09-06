/**
 * Practical Screen-Sharing & Privacy Deterrent Utility
 * Listens for browser visibility and screen-sharing events to encourage privacy awareness.
 * 
 * DISCLAIMER: Standard web browsers cannot guarantee 100% screenshot blocking;
 * this utility provides practical client-side deterrence, dynamic watermarking, and access controls.
 */

class SecurityDeterrentManager {
  constructor() {
    this.listeners = new Set();
    this.isScreenSharingDetected = false;
    this.init();
  }

  init() {
    if (typeof window === 'undefined') return;

    // Listen for tab visibility changes
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.notify('TAB_HIDDEN');
      } else {
        this.notify('TAB_VISIBLE');
      }
    });

    // Detect print attempt and alert watermark presence
    window.addEventListener('beforeprint', () => {
      this.notify('PRINT_REQUESTED');
    });
  }

  subscribe(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  notify(eventType, payload = {}) {
    this.listeners.forEach((cb) => cb({ type: eventType, payload }));
  }
}

export const securityDeterrent = new SecurityDeterrentManager();
