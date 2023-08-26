const fetchProductsFromShopify = async () => {
    const query = `
    {
        products(first: 10, sortKey: ID, query: "tag:pod") {
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
                    id
                    title
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
      const { default: fetch } = await import('node-fetch');
  
      const response = await fetch(process.env.SHOPIFY_GRAPHQL_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Access-Token': process.env.SHOPIFY_API_TOKEN,
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
  
