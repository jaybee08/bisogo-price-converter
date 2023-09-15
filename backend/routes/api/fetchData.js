//fetchData.js
const express = require('express');
const cors = require('cors');
const app = express();

import { Pool } from 'pg';

// Set up CORS headers to allow requests from your frontend
app.use(cors());
app.use(express.json()); // Parse JSON request bodies

// Replace with your database connection details
const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'bisogo_app',
    password: 'bisogo',
  port: 5432, // Default PostgreSQL port
});


export default async (req, res) => {
  try {
    const client = await pool.connect();
    console.log('Connected to the database'); // Add this line
    const result = await client.query('SELECT FROM products');
    client.release();
    console.log('fetchData:', result.rows);
    res.status(200).json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching data from the database' });
  }
};
