const express = require('express');
const cors = require('cors');
const fetchProductsFromShopify = require('./api/product');
const axios = require('axios'); 
const fetchUSDtoPHPExchangeRate = require('./usd-php');
const Shopify = require('shopify-api-node');

const app = express();

// Set up CORS headers to allow requests from your frontend
app.use(cors());
app.use(express.json()); // Parse JSON request bodies

const shopify = new Shopify({
shopName: 'sarrahmay-store.myshopify.com',
apiKey: '6d467337db26318412972b5dddf3a58f',
password: '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',
});


// fetch shopify product
app.get('/api/product', async (req, res) => {
  try {
    const products = await fetchProductsFromShopify();
    const usdToPhpExchangeRate = await fetchUSDtoPHPExchangeRate();

    // Use dynamic import() to import node-fetch
    const fetchModule = await import('node-fetch');
    const fetch = fetchModule.default;
    
    // Update the prices by converting USD to PHP
    const updatedProducts = await Promise.all(products.map(async product => {
      const updatedPriceUSD = parseFloat(product.variants.edges[0]?.node?.price);
      const updatedPricePHP = (updatedPriceUSD * usdToPhpExchangeRate).toFixed(2);

      // Update the product price in Shopify using a GraphQL mutation
      const productId = product.id;
      if (productId) {
        const mutation = `
          mutation {
            productUpdate(input: {
              id: "${productId}",
              variants: [
                {
                  price: "${updatedPricePHP}"
                }
              ]
            }) {
              product {
                id
                title
              }
            }
          }
        `;

        const response = await fetch('https://sarrahmay-store.myshopify.com/admin/api/2023-07/graphql.json', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Shopify-Access-Token': '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',
          },
          body: JSON.stringify({ query: mutation }),
        });

        const data = await response.json();
        const updatedProduct = data.data.productUpdate.product;

        // Log the updated product information for verification
        console.log('Updated Product:', updatedProduct);
      }

      return {
        ...product,
        variants: {
          edges: [
            {
              node: {
                ...product.variants.edges[0]?.node,
                price: updatedPricePHP
              }
            }
          ]
        }
      };
    }));

    res.json(updatedProducts);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'An error occurred while fetching products' });
  }
});



const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
