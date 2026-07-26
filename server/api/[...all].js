// Catch-all: every route under /api lands here. We strip the /api prefix
// and forward to the compiled NestJS handler in dist/vercel.js.
const { loadCompiledHandlerOnce, stripApiPrefix } = require('./_shared');

module.exports = async (event, context) => {
  const handler = await loadCompiledHandlerOnce();
  const normalized = stripApiPrefix(event);
  return handler(normalized, context);
};
