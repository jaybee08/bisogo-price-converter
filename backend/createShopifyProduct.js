require('dotenv').config();
const e = require('express');
const scrapeCleaningLaundryCollection = require('./scrape-collections/mf-scrapeCollection');
const fetchProductsFromShopify = require('./routes/api/shopify-products');

// Shopify Store Information
const shopifyShopName = process.env.SHOPIFY_SHOP_NAME;

// GraphQL Endpoint
const shopifyGraphQLEndpoint = `https://${shopifyShopName}/admin/api/2023-07/graphql.json`;

// HTTP Headers
const headers = {
  'Content-Type': 'application/json',
  'X-Shopify-Access-Token': process.env.SHOPIFY_API_TOKEN,
};

// GraphQL Query for creating a product
const graphqlQuery = `
  mutation CreateProduct($input: ProductInput!, $images: [CreateMediaInput!]) {
    productCreate(input: $input, media: $images) {
      product {
        id
        title
        descriptionHtml
        handle
        tags
        vendor
        variants(first: 100) {
          edges {
            node {
              price
              compareAtPrice
              sku
              inventoryPolicy
              inventoryQuantity
              inventoryItem {
                tracked
                id
              }
              weight
              weightUnit
            }
          }
        }
        options {
          id
          name
          values
        }
        images(first: 100) {
          edges {
            node {
              url
              altText
            }
          }
        }
      }
      userErrors {
        field
        message
      }
    }
  }
`;

const createShopifyProducts = async () => {
    try {
      const { default: fetch } = await import('node-fetch');
      // Scrape product data using Puppeteer
      const scrapedData = await scrapeCleaningLaundryCollection();
  
      if (scrapedData && scrapedData.products.length > 0) {
        // Initialize an array to store GraphQL variables for new products
        const graphqlVariablesArray = [];
  
        // Fetch existing Shopify products
        const existingShopifyProducts = await fetchProductsFromShopify();
  
        // Iterate over each product in scrapedData
        for (const product of scrapedData.products) {
          // Check if any existing Shopify product has the same title and "scrapped-to-shopify" tag
          const isDuplicate = existingShopifyProducts.some((shopifyProduct) =>
            shopifyProduct.title === product.title && shopifyProduct.tags.includes('scrapped-to-shopify')
          );
  
          // If it's not a duplicate, proceed to create the product
          if (!isDuplicate) {
            // Calculate the new price and compareAtPrice by adding 50
            const newPrice = parseFloat(product.variants[0].price || 0) + 50;
            const newCompareAtPrice = parseFloat(product.variants[0].compare_at_price || 0) + 50;
            // Map the scraped product data to GraphQL variables format for each product
            const graphqlVariables = {
              input: {
                title: product.title,
                bodyHtml: product.body_html,
                vendor: product.vendor,
                tags: `${product.tags}, scrapped-to-shopify`,
                variants: [
                  {
                    price: newPrice.toFixed(2),
                    compareAtPrice: newCompareAtPrice.toFixed(2),
                    // Add other variant properties as needed
                    inventoryPolicy: product.variants[0].inventoryPolicy,
                    sku: `MF-${product.variants[0].sku}`,
                    weight: 1,
                    weightUnit: product.variants[0].weightUnit,
                    inventoryItem: {
                      tracked: true,
                    },
                    inventoryQuantities: {
                      locationId: "gid://shopify/Location/65974665471",
                      availableQuantity: 100
                    },
                  },
                ],
                images: product.images.map((src) => ({ src, altText: null })),
              },
            };
  
            // Push the graphqlVariables for the current product into the array
            graphqlVariablesArray.push(graphqlVariables);
          } else {
            console.log(`Product "${product.title}" already exists with the tag "scrapped-to-shopify". Skipping.`);
          }
        }
  
        // Now graphqlVariablesArray contains data for new products, and you can loop through it to create GraphQL requests for each new product
        for (const graphqlVariables of graphqlVariablesArray) {
          // Make the GraphQL request to create the product using node-fetch
          const response = await fetch(shopifyGraphQLEndpoint, {
            method: 'POST',
            headers,
            body: JSON.stringify({
              query: graphqlQuery,
              variables: graphqlVariables,
            }),
          });
  
          // Convert the response to JSON
          const responseData = await response.json();
          console.log('Response:', responseData);
  
          // Handle the response for each product as needed
          if (responseData && responseData.data.productCreate) {
            const productData = responseData.data.productCreate.product;
            if (productData) {
              // Product created successfully
              console.log('Returned:', productData);
            } else if (responseData.data.productCreate.userErrors.length > 0) {
              // Product creation failed with user errors
              console.error(`Failed to create product. User errors: ${JSON.stringify(responseData.data.productCreate.userErrors)}`);
            } else {
              // Product creation failed with an unknown error
              console.error('Failed to create product. Unknown error.');
            }
          } else {
            // Handle the case where responseData is undefined
            console.error('No response data received from the GraphQL request.');
          }
        }
      } else {
        console.error('No product data scraped.');
      }
    } catch (error) {
      // Handle any errors that occur during the request
      console.error(error.message);
    }
  };
  
module.exports = createShopifyProducts;
