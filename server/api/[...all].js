// Vercel Serverless Function — catch-all route under /api/* (forwarded to compiled NestJS handler)
// This file exists in the source tree so Vercel sees it at clone time and skips pre-build
// "functions" pattern validation that broke the old dist/vercel.js setup.
const path = require('path');
let cachedHandler;

module.exports = async (event, context) => {
  if (!cachedHandler) {
    // Nest build emits the compiled @vendia/serverless-express entry to dist/vercel.js
    // Root Directory is `server`, so ../dist/vercel.js resolves to server/dist/vercel.js.
    const entry = require(path.join(process.cwd(), 'dist', 'vercel.js'));
    cachedHandler = entry.handler;
  }
  return cachedHandler(event, context);
};
