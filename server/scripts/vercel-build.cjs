/* eslint-disable no-console */
const { spawnSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

// Load DATABASE_URL / JWT_SECRET / etc. from `.env` when present, so the
// script works both locally (npm run vercel-build) AND on Vercel (where
// env vars are injected by the runtime instead of a file).
(function loadDotenvIfAvailable() {
  try {
    const dotenv = require('dotenv');
    const envPath = path.join(__dirname, '..', '.env');
    if (fs.existsSync(envPath)) {
      dotenv.config({ path: envPath, override: false });
    }
  } catch (_) {
    // dotenv is a prod dep of this project so require never fails,
    // but be defensive anyway in case the script is used standalone.
  }
})();

function run(cmd, args, opts = {}) {
  console.log(`\n> ${[cmd, ...args].join(' ')}`);
  const result = spawnSync(cmd, args, {
    stdio: 'inherit',
    shell: process.platform === 'win32',
    ...opts,
  });
  return result.status ?? (result.error ? 1 : 0);
}

function stripQuotes(value) {
  if (!value) return value;
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    return value.slice(1, -1);
  }
  return value;
}

// Clean build artefacts + incremental cache before nest build.
function cleanBuildArtifacts() {
  try { fs.rmSync('dist', { recursive: true, force: true }); } catch (_) {}
  try { fs.rmSync('tsconfig.build.tsbuildinfo', { force: true }); } catch (_) {}
}

function main() {
  const rawUrl = process.env.DATABASE_URL;
  const cleanUrl = stripQuotes(rawUrl);
  if (cleanUrl !== rawUrl && rawUrl) {
    console.warn(
      '[vercel-build] ⚠️  DATABASE_URL had surrounding quotes — stripping them. ' +
      'Tip: Do NOT include surrounding "..." when pasting DATABASE_URL into Vercel Environment Variables.',
    );
    process.env.DATABASE_URL = cleanUrl;
  }

  if (!cleanUrl) {
    console.error('[vercel-build] ❌  DATABASE_URL is not set.');
    console.error(
      '  Set it in Vercel → Project → Settings → Environment Variables → Production.\n' +
      '  Value should start with "mongodb+srv://" (MongoDB Atlas SRV). Do NOT add quotes.',
    );
    process.exit(1);
  }

  if (!cleanUrl.startsWith('mongodb://') && !cleanUrl.startsWith('mongodb+srv://')) {
    console.error('[vercel-build] ❌  P1012: DATABASE_URL does not start with the "mongodb" protocol.');
    console.error('  Current value (sanitized): ' + cleanUrl.replace(/:[^/@]+@/, ':***@'));
    console.error('  Fix: value must start with "mongodb+srv://" (Atlas SRV) or "mongodb://".');
    console.error('  Common causes:');
    console.error('   • You pasted the string including surrounding double-quotes ("...")');
    console.error('   • You accidentally used a PostgreSQL connection string (postgresql://...)');
    console.error('   • The variable is empty or a placeholder.');
    process.exit(1);
  }

  // 1) Prisma generate is HARD required. If it fails, build must fail too.
  const genCode = run(
    process.platform === 'win32' ? '.\\node_modules\\.bin\\prisma.cmd' : './node_modules/.bin/prisma',
    ['generate'],
  );
  if (genCode !== 0) {
    console.error('[vercel-build] ❌  prisma generate failed — cannot build without Prisma client.');
    process.exit(genCode);
  }

  // 2) Prisma db push is BEST-EFFORT.
  //    Fails if the build runner can't reach MongoDB Atlas (firewall,
  //    Atlas 0.0.0.0/0 CIDR missing, DNS, temporary network blip, etc.)
  //    — but the compiled Nest app itself is still valid. We still
  //    want to ship dist/ and keep the deploy green. Operator can retry
  //    schema push later via the CLI after fixing connectivity.
  const pushCode = run(
    process.platform === 'win32' ? '.\\node_modules\\.bin\\prisma.cmd' : './node_modules/.bin/prisma',
    ['db', 'push', '--skip-generate'],
  );
  if (pushCode !== 0) {
    console.warn(
      '[vercel-build] ⚠️  prisma db push failed (exit ' + pushCode + '). ' +
      'Continuing build anyway — the compiled API is still deployable. ' +
      'If indexes/constraints were not yet pushed you can retry later with `prisma db push` locally.',
    );
  }

  // 3) Wipe stale build artefacts so nest build emits all JS files deterministically.
  cleanBuildArtifacts();

  // 4) Nest build — hard required.
  let nestCode;
  if (process.platform === 'win32') {
    nestCode = run('.\\node_modules\\.bin\\nest.cmd', ['build']);
  } else {
    nestCode = run('./node_modules/.bin/nest', ['build']);
  }
  if (nestCode !== 0) {
    console.error('[vercel-build] ❌  nest build failed.');
    process.exit(nestCode);
  }

  console.log('\n[vercel-build] ✅  Build complete. dist/ is ready.');
}

main();
