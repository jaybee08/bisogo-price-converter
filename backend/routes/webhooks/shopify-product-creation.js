const express = require('express');
const app = express();

const productCreationRouter = express.Router();
const fetchUSDtoPHPExchangeRate = require('../../usd-php');

// Product update/creation shopify webhook
const WEBHOOK_PROCESS_INTERVAL = 120 * 1000; // 120 seconds
let lastPriceUpdateTimestamp = null;

// set app to use the productCreationRouter
app.post('/webhooks/shopify', async (req, res) => {
  try {
    // Check the X-Shopify-Topic header to determine the type of webhook
    const webhookTopic = req.headers['x-shopify-topic'];
    const webhookData = req.body;

    if (webhookTopic === 'products/create') {
      console.log('Received product creation webhook.');
      // Process product creation here
    } else if (webhookTopic === 'products/update') {
      // Check if the webhook is specifically for a price update
      const myCustomHeader = req.headers['my-custom-header'];
      if (myCustomHeader !== 'price_update') {
        const currentTime = new Date().getTime();
        console.log('price update wehbook triggered');
        if (!lastPriceUpdateTimestamp || (currentTime - lastPriceUpdateTimestamp >= WEBHOOK_PROCESS_INTERVAL)) {
          lastPriceUpdateTimestamp = currentTime;
          // Handle price update logic here
          console.log('Received price update webhook.');
					
            // Fetch USD to PHP exchange rate
            let usdToPhpExchangeRate;
            try {
                usdToPhpExchangeRate = await fetchUSDtoPHPExchangeRate();
            } catch (error) {
                console.error('Error fetching USD to PHP exchange rate:', error.message);
                return res.status(500).json({ error: 'An error occurred while fetching USD to PHP exchange rate' });
            }

          // Extract necessary data from webhook payload
          const { variants, id } = webhookData;
          const variant = variants[0]; // Consider the first variant, adjust as needed

          // Calculate the new price in PHP
          const updatedPriceUSD = parseFloat(variant.price);
          const updatedPricePHP = (updatedPriceUSD * usdToPhpExchangeRate).toFixed(2);

          // Update the price in Shopify using a GraphQL mutation
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
            } else {
              console.error('Unexpected response format:', responseData);
            }
          } catch (error) {
            console.error('Error making request:', error);
          }

        } else {
          console.log('Received price update webhook within time interval, skipping processing.');
        }
      } else {
        console.log('Received regular product update webhook.');
        // Process regular product update here
      }
    }

    // Respond with a success status
    res.status(200).send('Webhook received and processed.');
  } catch (error) {
    console.error('Webhook processing error:', error);
    res.status(500).json({ error: 'An error occurred while processing the webhook.' });
  }
});

module.exports = productCreationRouter;