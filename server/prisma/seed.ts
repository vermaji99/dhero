
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding...');

  // Create demo admin
  const adminPassword = process.env.ADMIN_PASSWORD || 'demo-admin-123';
  const hashedAdminPassword = await bcrypt.hash(adminPassword, 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin.demo@example.com' },
    update: {},
    create: {
      email: 'admin.demo@example.com',
      password: hashedAdminPassword,
      fullName: 'Admin User',
      role: 'ADMIN',
    },
  });

  console.log('Created admin:', admin.email);

  // Create demo member
  const memberPassword = process.env.MEMBER_PASSWORD || 'demo-member-123';
  const hashedMemberPassword = await bcrypt.hash(memberPassword, 10);

  const member = await prisma.user.upsert({
    where: { email: 'member.demo@example.com' },
    update: {},
    create: {
      email: 'member.demo@example.com',
      password: hashedMemberPassword,
      fullName: 'Member User',
      role: 'MEMBER',
    },
  });

  console.log('Created member:', member.email);

  // Create some demo leads
  const demoLeads = [
    {
      fullName: 'John Doe',
      email: 'john@example.com',
      phone: '+1234567890',
      company: 'Acme Corp',
      source: 'WEBSITE',
      message: 'Interested in your product',
      status: 'NEW',
      assignedToId: null,
    },
    {
      fullName: 'Jane Smith',
      email: 'jane@example.com',
      phone: '+0987654321',
      company: 'Tech Solutions',
      source: 'LINKEDIN',
      message: 'Would like to schedule a demo',
      status: 'CONTACTED',
      assignedToId: member.id,
    },
    {
      fullName: 'Bob Johnson',
      email: 'bob@example.com',
      company: 'Startup Inc',
      source: 'GOOGLE',
      status: 'QUALIFIED',
      assignedToId: member.id,
    },
    {
      fullName: 'Alice Williams',
      email: 'alice@example.com',
      source: 'REFERRAL',
      status: 'WON',
      assignedToId: null,
    },
    {
      fullName: 'Charlie Brown',
      email: 'charlie@example.com',
      source: 'OTHER',
      status: 'LOST',
      assignedToId: null,
    },
  ];

  for (const leadData of demoLeads) {
    // Check if lead exists by email (we have to use findFirst since unique is only id now)
    const existingLead = await prisma.lead.findFirst({
      where: { email: leadData.email },
    });

    const lead = existingLead
      ? await prisma.lead.update({
          where: { id: existingLead.id },
          data: leadData,
        })
      : await prisma.lead.create({ data: leadData });

    // Create activity for lead creation if new
    if (!existingLead) {
      await prisma.activity.create({
        data: {
          leadId: lead.id,
          type: 'LEAD_CREATED',
          description: 'Lead created during seeding',
        },
      });
    }

    console.log('Created lead:', lead.email);
  }

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
