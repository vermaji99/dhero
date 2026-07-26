// Explicit /api/health liveness probe. Returns { status, db } JSON so we can
// immediately tell Vercel -> Function -> Nest -> MongoDB all wired correctly.
const { loadCompiledHandlerOnce, stripApiPrefix } = require('./_shared');

module.exports = async (event, context) => {
  // Health is always GET /health inside Nest.
  const e = Object.assign({}, event);
  if (!e.httpMethod || e.httpMethod.toUpperCase() !== 'GET') {
    // If the explicit route matched but method wasn't GET, let Nest decide via
    // the normal forward path (it will return 405 Method Not Allowed JSON).
  }
  const handler = await loadCompiledHandlerOnce();
  const normalized = stripApiPrefix(e);
  return handler(normalized, context);
};
