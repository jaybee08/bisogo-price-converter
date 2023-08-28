require('dotenv').config();
const Shopify = require('shopify-api-node');
const express = require('express');
const cors = require('cors');
const fetchProductsFromShopify = require('./api/product');
const fetchUSDtoPHPExchangeRate = require('./usd-php');
const axios = require('axios');
const puppeteer = require('puppeteer'); // Import Puppeteer module
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

// Set up CORS headers to allow requests from your frontend
app.use(cors());
app.use(express.json()); // Parse JSON request bodies

const shopify = new Shopify({
  shopName: process.env.SHOPIFY_SHOP_NAME,
  apiKey: process.env.SHOPIFY_API_KEY,
  password: process.env.SHOPIFY_PASSWORD,
});


// Fetch shopify product information
app.get('/api/product', async (req, res) => {
  try {
    const products = await fetchProductsFromShopify();

    // Send the fetched product information to the frontend
    res.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'An error occurred while fetching products' });
  }
});


// webhook update price/calculate
app.post('/webhooks/shopify', async (req, res) => {
  try {
    // Handle the incoming webhook data
    const webhookData = req.body; // Contains the webhook payload

    // Extract the necessary information from the webhook payload
    const { id, variants, event, product_id } = webhookData; // Example: Product ID, variants, event, and product ID

    // Check if the webhook is for a new product creation event
    if (event === 'products/create') {
      const variant = variants[0]; // Consider the first variant, adjust as needed
      const usdToPhpExchangeRate = await fetchUSDtoPHPExchangeRate();

      // Calculate the new price in PHP
      const updatedPriceUSD = parseFloat(variant.price);
      const updatedPricePHP = (updatedPriceUSD * usdToPhpExchangeRate).toFixed(2);

      // Update the variant price in Shopify using a GraphQL mutation
      const mutation = `
        mutation {
          productVariantUpdate(input: {
            id: "gid://shopify/ProductVariant/${variant.id}",
            price: "${updatedPricePHP}"
          }) {
            productVariant {
              id
              title
            }
          }
        }
      `;

      try {
        const response = await axios.post(
          process.env.SHOPIFY_GRAPHQL_URL,
          { query: mutation },
          {
            headers: {
              'Content-Type': 'application/json',
              'X-Shopify-Access-Token': process.env.SHOPIFY_API_TOKEN,
            },
          }
        );

        const responseData = response.data;

        if (responseData.errors) {
          console.error('Error updating variant price:', responseData.errors);
        } else if (responseData.data && responseData.data.productVariantUpdate) {
          const updatedVariant = responseData.data.productVariantUpdate.productVariant;
          console.log('Updated Variant:', updatedVariant);

          // Add a "price_converted" tag to the product
          const tagMutation = `
            mutation {
              tagsAdd(id: "gid://shopify/Product/${product_id}", tags: "price_converted") {
                node {
                  id
                  tags
                }
              }
            }
          `;

          try {
            const tagResponse = await axios.post(
              process.env.SHOPIFY_GRAPHQL_URL,
              { query: tagMutation },
              {
                headers: {
                  'Content-Type': 'application/json',
                  'X-Shopify-Access-Token': process.env.SHOPIFY_API_TOKEN,
                },
              }
            );

            const tagData = tagResponse.data;
            if (tagData.errors) {
              console.error('Error adding tag:', tagData.errors);
            } else if (tagData.data && tagData.data.tagsAdd) {
              console.log('Tag added:', tagData.data.tagsAdd.node);
            }
          } catch (tagError) {
            console.error('Error adding tag:', tagError);
          }
        } else {
          console.error('Unexpected response format:', responseData);
        }
      } catch (error) {
        console.error('Error making request:', error);
      }
    }

    // Respond with a success status
    res.status(200).send('Webhook received and processed.');
  } catch (error) {
    console.error('Webhook processing error:', error);
    res.status(500).json({ error: 'An error occurred while processing the webhook.' });
  }
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
