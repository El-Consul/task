const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

// DATABASE_URL is injected by dotenvx (called via npx dotenvx run)
const prisma = new PrismaClient();

async function run() {
  const hash = await bcrypt.hash('admin123', 10);
  const u = await prisma.user.upsert({
    where: { email: 'admin@realestate.com' },
    update: { password: hash, isActive: true },
    create: {
      email: 'admin@realestate.com',
      password: hash,
      name: 'Admin User',
      role: 'ADMIN',
      permissions: []
    }
  });
  console.log('✅ Admin password reset successfully!');
  console.log('   Email:', u.email);
  console.log('   Role:', u.role);
  console.log('   Active:', u.isActive);
  await prisma.$disconnect();
}

run().catch(e => {
  console.error('❌ Error:', e.message);
  process.exit(1);
});
