const { Client } = require('pg');
require('dotenv').config();

async function check() {
  const connectionString = process.env.DATABASE_URL;
  const client = new Client({ connectionString });
  try {
    await client.connect();
    const res = await client.query('SELECT email, role FROM "User"');
    console.log('Users in DB:', res.rows);
  } catch (err) {
    console.error(err);
  } finally {
    await client.end();
  }
}
check();
