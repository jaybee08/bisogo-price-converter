// backend/server.js
const express = require('express');
const cors = require('cors');
const fetchProductsFromShopify = require('./api/product');


const app = express();

// Set up CORS headers to allow requests from your frontend
app.use(cors());

// Other middleware and routes can be added here

// Example route for fetching products
app.get('/api/product', async (req, res) => {
  try {
    // Add your GraphQL fetching logic here
    // You can use libraries like `node-fetch` or `axios` to make requests
    // to the Shopify GraphQL API and return the fetched data in the response
    const products = await fetchProductsFromShopify();
    res.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'An error occurred while fetching products' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
