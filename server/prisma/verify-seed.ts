// Ad-hoc verification script — counts + samples every collection in MongoDB Atlas
// Run with: node -r ts-node/register/transpile-only prisma/verify-seed.ts
import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const dbName = process.env.DATABASE_URL?.match(/\/([^/?]+)\??/)?.[1] || 'unknown';
  console.log(`Verifying demo data in MongoDB database: ${dbName}`);
  console.log('DATABASE_URL host:', process.env.DATABASE_URL?.match(/@([^/?]+)/)?.[1]);
  console.log('---');

  const [users, leads, notes, activities] = await Promise.all([
    prisma.user.findMany({ select: { id: true, email: true, fullName: true, role: true, createdAt: true } }),
    prisma.lead.findMany({ select: { id: true, fullName: true, email: true, status: true, source: true, assignedToId: true, createdAt: true } }),
    prisma.note.findMany({ select: { id: true, leadId: true, authorId: true, content: true, createdAt: true } }),
    prisma.activity.findMany({ select: { id: true, leadId: true, actorId: true, type: true, description: true, createdAt: true } }),
  ]);

  console.log(`Users:      ${users.length} documents`);
  for (const u of users) {
    console.log(`  - ${u.role.padEnd(6)} ${u.email}  (${u.fullName})  id=…${u.id.slice(-6)}`);
  }
  console.log();
  console.log(`Leads:      ${leads.length} documents`);
  for (const l of leads) {
    const assigned = l.assignedToId ? `assigned=…${l.assignedToId.slice(-6)}` : 'unassigned';
    console.log(`  - ${l.status.padEnd(9)} ${l.source.padEnd(12)} ${l.email.padEnd(21)} ${assigned}`);
  }
  console.log();
  console.log(`Notes:      ${notes.length} documents`);
  console.log(`Activities: ${activities.length} documents`);
  for (const a of activities) {
    const targetLead = leads.find(l => l.id === a.leadId)?.email || '—';
    console.log(`  - ${a.type.padEnd(12)} lead=${targetLead.padEnd(21)} ${a.description ?? ''}`);
  }
  console.log();

  // Explicit assertions so this script exits non-zero if anything is missing
  const checks = [
    ['User count >= 2', users.length >= 2],
    ['Admin user exists', users.some(u => u.role === 'ADMIN' && u.email === 'admin.demo@example.com')],
    ['Member user exists', users.some(u => u.role === 'MEMBER' && u.email === 'member.demo@example.com')],
    ['Lead count === 5', leads.length === 5],
    ['At least one NEW lead', leads.some(l => l.status === 'NEW')],
    ['At least one CONTACTED lead', leads.some(l => l.status === 'CONTACTED')],
    ['At least one QUALIFIED lead', leads.some(l => l.status === 'QUALIFIED')],
    ['At least one WON lead', leads.some(l => l.status === 'WON')],
    ['At least one LOST lead', leads.some(l => l.status === 'LOST')],
    ['Jane & Bob leads have assigned member', leads.filter(l => ['jane@example.com','bob@example.com'].includes(l.email)).every(l => !!l.assignedToId)],
    ['At least one LEAD_CREATED activity per freshly-seeded lead (>=5)', activities.filter(a => a.type === 'LEAD_CREATED').length >= 5],
  ];
  let failed = 0;
  for (const [name, ok] of checks) {
    const marker = ok ? '✅' : '❌';
    if (!ok) failed++;
    console.log(`${marker} ${name}`);
  }
  console.log();
  if (failed > 0) {
    console.error(`${failed} verification check(s) failed — seed is incomplete.`);
    process.exit(1);
  } else {
    console.log('All 11 verification checks passed. Demo data is present in MongoDB Atlas.');
  }
}

main()
  .catch(err => { console.error(err); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
