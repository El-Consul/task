const { Client } = require('pg');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
require('dotenv').config();

async function createUser() {
  const connectionString = process.env.DATABASE_URL;
  const client = new Client({ connectionString });

  try {
    await client.connect();
    console.log('--- Connecting to Database ---');

    const email = 'test@test.com';
    const password = '123456';
    const name = 'Test User';
    const role = 'ADMIN';
    const now = new Date();

    console.log(`Creating user: ${email}...`);
    const hashedPass = await bcrypt.hash(password, 10);

    const query = `
      INSERT INTO "User" (id, email, password, name, role, "createdAt", "updatedAt")
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      ON CONFLICT (email) 
      DO UPDATE SET password = $3, "updatedAt" = $7
      RETURNING email, role;
    `;

    const res = await client.query(query, [
      crypto.randomUUID(),
      email,
      hashedPass,
      name,
      role,
      now,
      now
    ]);

    console.log('-------------------------------');
    console.log('✅ SUCCESS! User is ready.');
    console.log(`Email: ${res.rows[0].email}`);
    console.log(`Password: ${password}`);
    console.log('-------------------------------');
    console.log('Now, restart your backend and try to login!');

  } catch (err) {
    console.error('❌ ERROR:', err.message);
  } finally {
    await client.end();
  }
}

createUser();
