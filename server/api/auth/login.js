// Explicit /api/auth/login function file. Vercel auto-routes POST /api/auth/login
// to this file at import time. This guarantees that the login route — which is
// the very first route the frontend hits — can never fail because of a missing
// catch-all discovery. We simply forward to the compiled Nest handler after
// normalizing the path.
const { loadCompiledHandlerOnce, stripApiPrefix } = require('../_shared');

module.exports = async (event, context) => {
  const handler = await loadCompiledHandlerOnce();
  const normalized = stripApiPrefix(event);
  return handler(normalized, context);
};
