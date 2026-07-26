// Shared loader: cold-start bootstraps the compiled Nest/Vercel handler once
// and forwards HTTP events (Vercel API Gateway payload) to it. Every function
// under server/api/*.js uses this same cached handler so we don't start a new
// Nest app per function file.

const path = require('path');

let cachedHandlerPromise;

function writeToLog(line) {
  const ts = new Date().toISOString();
  // Vercel Function Logs show everything written to stdout / stderr in the
  // project -> Logs tab. Using stderr ensures startup failures aren't missed.
  process.stderr.write(`[leadflow-vercel ${ts}] ${line}\n`);
}

function loadCompiledHandlerOnce() {
  if (cachedHandlerPromise) return cachedHandlerPromise;

  cachedHandlerPromise = (async () => {
    const entryPath = path.join(process.cwd(), 'dist', 'vercel.js');
    writeToLog(`loading compiled handler from cwd=${process.cwd()} path=${entryPath}`);
    try {
      // Clear Node's require cache for safety during redeploys (defensive).
      delete require.cache[require.resolve(entryPath)];
    } catch {
      // ignore if not in cache yet
    }

    let entry;
    try {
      entry = require(entryPath);
    } catch (err) {
      writeToLog(`FATAL require('dist/vercel.js') failed: ${err && err.stack ? err.stack : err}`);
      throw err;
    }

    if (!entry || typeof entry.handler !== 'function') {
      const e = new Error(
        `dist/vercel.js did not export handler. typeof entry.handler = ${typeof (entry && entry.handler)}`,
      );
      writeToLog(`FATAL: ${e.message}`);
      throw e;
    }

    writeToLog('compiled handler loaded OK. Warming up Nest bootstrap on first call...');
    return entry.handler;
  })();

  return cachedHandlerPromise;
}

function stripApiPrefix(event) {
  const e = Object.assign({}, event);
  if (e.path && typeof e.path === 'string') {
    if (e.path === '/api') e.path = '/';
    else if (e.path.startsWith('/api/')) e.path = e.path.slice('/api'.length);
  }
  if (e.rawPath && typeof e.rawPath === 'string') {
    if (e.rawPath === '/api') e.rawPath = '/';
    else if (e.rawPath.startsWith('/api/')) e.rawPath = e.rawPath.slice('/api'.length);
  }
  if (e.requestContext && e.requestContext.http && e.requestContext.http.path) {
    const p = e.requestContext.http.path;
    const ctxPatch = Object.assign({}, e.requestContext);
    ctxPatch.http = Object.assign({}, ctxPatch.http);
    if (p === '/api') ctxPatch.http.path = '/';
    else if (p.startsWith('/api/')) ctxPatch.http.path = p.slice('/api'.length);
    e.requestContext = ctxPatch;
  }
  return e;
}

module.exports = {
  loadCompiledHandlerOnce,
  stripApiPrefix,
  writeToLog,
};
