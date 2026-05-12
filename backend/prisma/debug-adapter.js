const Database = require('better-sqlite3');
const { PrismaBetterSqlite3 } = require('@prisma/adapter-better-sqlite3');
const { PrismaClient } = require('@prisma/client');

const path = require('path');
const dbPath = path.resolve(__dirname, '..', 'dev.db');
console.log('DB path:', dbPath);

try {
  const conn = new Database(dbPath);
  console.log('SQLite connection OK');
  
  // Check tables exist
  const tables = conn.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
  console.log('Tables:', tables.map(t => t.name));
  
  console.log('Creating adapter...');
  const adapter = new PrismaBetterSqlite3(conn);
  console.log('Adapter OK');
  
  console.log('Creating PrismaClient...');
  const prisma = new PrismaClient({ adapter });
  console.log('PrismaClient OK');
  
  // Try a simple query
  prisma.user.count().then(count => {
    console.log('User count:', count);
    conn.close();
  }).catch(err => {
    console.error('Query error:', err.message);
    conn.close();
  });
} catch(e) {
  console.error('Error at step:', e.message);
  console.error(e.stack);
}
