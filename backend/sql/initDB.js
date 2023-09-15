const fs = require('fs');
const pgp = require('pg-promise')();
const db = pgp('postgres://postgres:bisogo@localhost:5432/bisogo_app');

async function runSQLFile(filePath) {
  try {
    const sql = fs.readFileSync(filePath, 'utf-8');
    await db.none(sql);
    console.log(`Executed SQL file: ${filePath}`);
  } catch (error) {
    console.error(`Error executing SQL file ${filePath}:`, error);
  }
}

async function initializeDatabase() {
  await runSQLFile('schema.sql');
  await runSQLFile('sample_data.sql');
  pgp.end();
}

initializeDatabase();
