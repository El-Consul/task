const Database = require('better-sqlite3');
const db = new Database('./prisma/dev.db');
const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
console.log('Tables:', tables);

// Try to query users
try {
  const users = db.prepare("SELECT * FROM User").all();
  console.log('Users:', users.length);
  users.forEach(u => console.log(' -', u.email, u.role));
} catch(e) {
  console.log('No User table yet');
}

db.close();
