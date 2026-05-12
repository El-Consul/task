require('dotenv').config();
const { createClient } = require('@libsql/client');
const { PrismaLibSql } = require('@prisma/adapter-libsql');
const { PrismaClient } = require('@prisma/client');
const path = require('path');

const dbPath = path.resolve(__dirname, '..', 'dev.db');
const fileUrl = 'file:' + dbPath.replace(/\\/g, '/');
console.log('File URL:', fileUrl);

const client = createClient({ url: fileUrl });
const adapter = new PrismaLibSql(client);
const prisma = new PrismaClient({ adapter });

async function run() {
  const count = await prisma.user.count();
  console.log('User count:', count);
  
  const users = await prisma.user.findMany({ select: { email: true, role: true } });
  users.forEach(u => console.log(' -', u.email, u.role));
  
  console.log('✅ LibSQL adapter works!');
}

run().catch(e => { console.error('❌ Full error:'); console.error(e); });
