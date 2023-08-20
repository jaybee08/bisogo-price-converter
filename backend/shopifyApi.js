const fetch = require('node-fetch');

const fetchProductsFromShopify = async () => {
  const query = `
    {
      products(first: 10, sortKey: ID) {
        edges {
          node {
            id
            title
            handle
            description
            images(first: 1) {
              edges {
                node {
                  transformedSrc
                }
              }
            }
            variants(first: 1) {
              edges {
                node {
                  price
                }
              }
            }
            tags
          }
        }
      }
    }
  `;

  try {
    const response = await fetch('https://sarrahmay-store.myshopify.com/admin/api/2023-07/graphql.json', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': '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',
      },
      body: JSON.stringify({ query }),
    });
  
    const data = await response.json();
    return data.data.products.edges.map(edge => edge.node);
  } catch (error) {
    throw new Error('Failed to fetch products');
  }
};

module.exports = fetchProductsFromShopify;
