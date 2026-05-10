const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function run() {
  const hash = await bcrypt.hash('admin123', 10);
  
  const existing = await prisma.user.findUnique({ where: { email: 'admin@realestate.com' } });
  
  if (existing) {
    await prisma.user.update({
      where: { email: 'admin@realestate.com' },
      data: { password: hash, isActive: true }
    });
    console.log('✅ Admin password reset!');
  } else {
    await prisma.user.create({
      data: {
        email: 'admin@realestate.com',
        password: hash,
        name: 'Admin User',
        role: 'ADMIN',
        permissions: '[]',
        isActive: true
      }
    });
    console.log('✅ Admin created!');
  }
  await prisma.$disconnect();
}

run().catch(e => {
  console.error('❌', e);
  process.exit(1);
});
