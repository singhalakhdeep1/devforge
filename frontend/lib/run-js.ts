/**
 * Runs JavaScript in a throwaway Web Worker. A worker has no DOM, no cookies and no
 * access to the app's memory (including the access token), and it is terminated
 * after a timeout, so an infinite loop cannot freeze the page.
 */

const WORKER_SOURCE = `
self.onmessage = (event) => {
  const lines = [];
  const format = (value) => {
    if (typeof value === 'string') return value;
    if (value instanceof Error) return value.stack || String(value);
    try { return typeof value === 'undefined' ? 'undefined' : JSON.stringify(value, null, 2); } catch { return String(value); }
  };
  const push = (prefix) => (...args) => lines.push(prefix + args.map(format).join(' '));
  const console = { log: push(''), info: push(''), debug: push(''), warn: push('[warn] '), error: push('[error] ') };

  try {
    const fn = new Function('console', event.data.code);
    const result = fn(console);
    Promise.resolve(result).then(
      () => self.postMessage({ output: lines.join('\\n'), error: null }),
      (err) => self.postMessage({ output: lines.join('\\n'), error: err && err.stack ? err.stack : String(err) })
    );
  } catch (err) {
    self.postMessage({ output: lines.join('\\n'), error: err && err.stack ? err.stack : String(err) });
  }
};
`

export interface JsRunResult {
  output: string
  error: string | null
  timedOut: boolean
  durationMs: number
}

export function runJavaScript(code: string, timeoutMs = 5000): Promise<JsRunResult> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(new Blob([WORKER_SOURCE], { type: 'text/javascript' }))
    const worker = new Worker(url)
    const started = performance.now()

    const finish = (result: Omit<JsRunResult, 'durationMs'>) => {
      clearTimeout(timer)
      worker.terminate()
      URL.revokeObjectURL(url)
      resolve({ ...result, durationMs: Math.round(performance.now() - started) })
    }

    const timer = setTimeout(() => finish({ output: '', error: `Execution stopped after ${timeoutMs / 1000}s (possible infinite loop)`, timedOut: true }), timeoutMs)

    worker.onmessage = (e: MessageEvent<{ output: string; error: string | null }>) => finish({ ...e.data, timedOut: false })
    worker.onerror = (e) => finish({ output: '', error: e.message, timedOut: false })
    worker.postMessage({ code })
  })
}
