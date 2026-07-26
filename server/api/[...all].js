// Vercel serverless catch-all — NO rewrites required. Zero-config.
//
// Vercel auto-discovers source files under api/*.js at clone time
// (Root Directory = 'server' ⇒ api/[...all].js maps to /api/*).
// So ANY request to https://<project>.vercel.app/api/X lands here.
//
// This wrapper does 3 things:
//   1. Cold-start loads the compiled NestJS handler from dist/vercel.js
//      (written to disk by npm run vercel-build => nest build).
//   2. Explicitly strips a leading /api prefix from event.path before
//      forwarding, because:
//        - Vercel preserves /api/... inside `event.path` when going
//          through the auto-discovered api/ folder convention.
//        - NestJS routes are registered WITHOUT setGlobalPrefix on the
//          Vercel handler (see src/vercel.ts), so a login route is
//          POST /auth/login (not /api/auth/login).
//        - Stripping /api here makes both local curl
//          'https://<host>/api/auth/login' AND any rewrite that happens
//          to pass an already-stripped path work identically.
//   3. Forwards OPTIONS / CORS preflight requests like any other request
//      (the Nest enableCors() call handles the actual CORS headers).

let cachedHandler;

function loadCompiledHandler() {
  const path = require('path');
  const entry = require(path.join(process.cwd(), 'dist', 'vercel.js'));
  return entry.handler;
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
  // AWS API Gateway / Lambda URL payload version 2.0 style support
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

module.exports = async (event, context) => {
  if (!cachedHandler) {
    cachedHandler = loadCompiledHandler();
  }
  const normalized = stripApiPrefix(event);
  return cachedHandler(normalized, context);
};
