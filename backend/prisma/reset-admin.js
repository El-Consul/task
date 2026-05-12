const Database = require('better-sqlite3');
const bcrypt = require('bcrypt');
const path = require('path');

const dbPath = path.resolve(__dirname, '..', 'dev.db');
console.log('DB:', dbPath);

const db = new Database(dbPath);

async function run() {
  const hash = await bcrypt.hash('admin123', 10);
  
  // Check if admin exists
  const existing = db.prepare("SELECT id, email, role FROM User WHERE email = ?").get('admin@realestate.com');
  
  if (existing) {
    db.prepare("UPDATE User SET password = ?, isActive = 1 WHERE email = ?").run(hash, 'admin@realestate.com');
    console.log('✅ Admin password reset!');
    console.log('   Email:', existing.email);
    console.log('   Role:', existing.role);
  } else {
    const id = require('crypto').randomUUID();
    db.prepare(
      "INSERT INTO User (id, email, password, name, role, permissions, isActive, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, 1, datetime('now'), datetime('now'))"
    ).run(id, 'admin@realestate.com', hash, 'Admin User', 'ADMIN', '[]');
    console.log('✅ Admin created!');
    console.log('   Email: admin@realestate.com');
    console.log('   Role: ADMIN');
  }

  // Show all users
  const users = db.prepare("SELECT email, role, isActive FROM User").all();
  console.log('\nAll users:');
  users.forEach(u => console.log(`  - ${u.email} (${u.role}) active=${u.isActive}`));

  db.close();
}

run().catch(e => {
  console.error('❌', e.message);
  process.exit(1);
});
