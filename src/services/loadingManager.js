/**
 * ChemSpace Global Reactive Loading Manager
 * Manages real-time loading states across route transitions, API requests,
 * and background operations. No fake fixed delays.
 */

class LoadingManager {
  constructor() {
    this.listeners = new Set();
    this.activeRequests = 0;
    this.progress = 0;
    this.isLoading = false;
    this.timer = null;
  }

  subscribe(callback) {
    this.listeners.add(callback);
    callback({ isLoading: this.isLoading, progress: this.progress });
    return () => this.listeners.delete(callback);
  }

  notify() {
    const state = { isLoading: this.isLoading, progress: this.progress };
    this.listeners.forEach((callback) => callback(state));
  }

  start() {
    this.activeRequests += 1;
    if (!this.isLoading) {
      this.isLoading = true;
      this.progress = 15;
      this.notify();

      if (this.timer) clearInterval(this.timer);
      // Gradually trickle progress while operation is actually pending, capped at 90%
      this.timer = setInterval(() => {
        if (this.progress < 90) {
          const increment = Math.max(1, (90 - this.progress) * 0.1);
          this.progress = Math.min(90, this.progress + increment);
          this.notify();
        }
      }, 100);
    }
  }

  finish() {
    this.activeRequests = Math.max(0, this.activeRequests - 1);
    if (this.activeRequests === 0 && this.isLoading) {
      if (this.timer) {
        clearInterval(this.timer);
        this.timer = null;
      }
      this.progress = 100;
      this.notify();

      setTimeout(() => {
        if (this.activeRequests === 0) {
          this.isLoading = false;
          this.progress = 0;
          this.notify();
        }
      }, 250);
    }
  }

  forceReset() {
    if (this.timer) clearInterval(this.timer);
    this.activeRequests = 0;
    this.isLoading = false;
    this.progress = 0;
    this.notify();
  }
}

export const loadingManager = new LoadingManager();
