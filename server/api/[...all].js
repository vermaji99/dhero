// Vercel serverless catch-all — the actual Vercel Function that gets discovered at clone time.
// - Lives in server/api/[...all].js (source-controlled, no CLI-56 pre-build validation failure).
// - At runtime, lazy-loads the compiled Nest+@vendia/serverless-express entry from
//   process.cwd() + /dist/vercel.js, which npm run vercel-build generates.
// - Uses the rewrites rule in vercel.json to forward EVERY route (/*) to /api/[...all],
//   so Nest's globalPrefix 'api' still works for URLs like /api/auth/login, /api/leads, etc.

let cachedHandler;

function loadCompiledHandler() {
  // Vercel runs this function with the project Root Directory as cwd.
  // Root Directory = 'server' ⇒ cwd = .../dhero/server  ⇒ dist/vercel.js exists here.
  const path = require('path');
  const entry = require(path.join(process.cwd(), 'dist', 'vercel.js'));
  return entry.handler;
}

module.exports = async (event, context) => {
  if (!cachedHandler) {
    cachedHandler = loadCompiledHandler();
  }
  return cachedHandler(event, context);
};
