const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
require('dotenv').config();

const prisma = new PrismaClient({
  datasource: {
    url: process.env.DATABASE_URL
  }
});

async function main() {
  console.log('🌱 Seeding database...');

  const adminPass = await bcrypt.hash('admin123', 10);
  await prisma.user.upsert({
    where: { email: 'admin@realestate.com' },
    update: {},
    create: { email: 'admin@realestate.com', password: adminPass, name: 'Admin User', role: 'ADMIN' },
  });

  console.log('✅ Admin user created!');
}

main()
  .catch((e) => console.error(e))
  .finally(() => prisma.$disconnect());
