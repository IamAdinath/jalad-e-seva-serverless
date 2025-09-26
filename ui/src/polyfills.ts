// Polyfills for amazon-cognito-identity-js in Vite/browser environment

// Global polyfill
if (typeof global === 'undefined') {
  (window as any).global = window;
}

// Process polyfill
if (typeof process === 'undefined') {
  (window as any).process = {
    env: {},
    nextTick: (fn: Function) => setTimeout(fn, 0),
  };
}

// Buffer polyfill (if needed)
if (typeof Buffer === 'undefined') {
  (window as any).Buffer = {
    from: (str: string) => new TextEncoder().encode(str),
    isBuffer: () => false,
  };
}