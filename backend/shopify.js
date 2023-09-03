const Shopify = require('shopify-api-node');

// Initialize Shopify API client using environment variables
const shopify = new Shopify({
  shopName: process.env.SHOPIFY_SHOP_NAME,
  apiKey: process.env.SHOPIFY_API_KEY,
  password: process.env.SHOPIFY_API_PASSWORD,
});

module.exports = shopify;
