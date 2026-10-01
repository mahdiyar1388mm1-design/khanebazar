// Runtime API polyfills for old Chrome/WebView builds. Syntax downleveling is
// handled by the esbuild target in vite.config.ts; this file only covers APIs
// the bundle calls unconditionally.

// queueMicrotask: Chrome 71+
if (typeof window.queueMicrotask !== "function") {
  (window as any).queueMicrotask = (callback: () => void) => {
    Promise.resolve()
      .then(callback)
      .catch((err) => {
        setTimeout(() => {
          throw err;
        }, 0);
      });
  };
}

// AbortController: Chrome 66+. Only needs to exist and track state — fetch on
// old builds ignores the `signal` option entirely.
if (typeof (window as any).AbortController !== "function") {
  class AbortSignalPoly {
    aborted = false;
    onabort: (() => void) | null = null;
  }
  class AbortControllerPoly {
    signal = new AbortSignalPoly();
    abort() {
      if (this.signal.aborted) return;
      this.signal.aborted = true;
      if (this.signal.onabort) this.signal.onabort();
    }
  }
  (window as any).AbortController = AbortControllerPoly;
  (window as any).AbortSignal = AbortSignalPoly;
}
