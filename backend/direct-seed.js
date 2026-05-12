const { Client } = require('pg');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
require('dotenv').config();

async function seed() {
  const connectionString = process.env.DATABASE_URL;
  const client = new Client({ connectionString });

  try {
    await client.connect();
    console.log('Connected to PostgreSQL');

    const adminPass = await bcrypt.hash('admin123', 10);
    const email = 'admin@realestate.com';
    const name = 'Admin User';
    const role = 'ADMIN';
    const now = new Date();

    const res = await client.query(
      'INSERT INTO "User" (id, email, password, name, role, "createdAt", "updatedAt") VALUES ($1, $2, $3, $4, $5, $6, $7) ON CONFLICT (email) DO UPDATE SET password = $3, "updatedAt" = $7 RETURNING *',
      [crypto.randomUUID(), email, adminPass, name, role, now, now]
    );

    console.log('✅ Admin user created/updated:', res.rows[0].email);

    // Seed some departments if needed
    const depts = [
      ['A-101', 'Unit A-101', 150000, 'AVAILABLE'],
      ['B-202', 'Unit B-202', 200000, 'AVAILABLE']
    ];

    for (const [code, name, price, status] of depts) {
      await client.query(
        'INSERT INTO "Department" (id, code, name, price, status, "createdAt", "updatedAt") VALUES ($1, $2, $3, $4, $5, $6, $7) ON CONFLICT (code) DO NOTHING',
        [crypto.randomUUID(), code, name, price, status, now, now]
      );
    }
    console.log('✅ Departments seeded');

  } catch (err) {
    console.error('Error seeding database:', err);
  } finally {
    await client.end();
  }
}

seed();
