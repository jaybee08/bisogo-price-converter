const { Pool } = require('pg');
const fs = require('fs');

// Replace with your database connection details
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'bisogo_app',
  password: 'bisogo',
  port: 5432, // Default PostgreSQL port
});

// Test the connection
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('Error connecting to the database:', err);
  } else {
    console.log('Connected to the database:', res.rows[0].now);
  }
});

module.exports = pool;
