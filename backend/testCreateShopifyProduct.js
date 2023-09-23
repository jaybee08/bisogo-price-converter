const createShopifyProducts = require('./createShopifyProduct');

// Sample product data
// const sampleProductData = {
//   title: 'Sample Product 600',
//   bodyHtml: '<p>This is a sample product description.</p>',
//   handle: 'sample-product',
//   vendor: "Mandaue Foam",
//   tags: "Cleaning Tools, Cleaning Tools & Accessories, HW, Imported, NET-PRICE",
//   variants: [{
//     price: 999,
//     compareAtPrice: 999,
//   }]
// };

// Call the createShopifyProduct function with sample data
createShopifyProducts()
  .then((response) => {
    // Log the response from Shopify
    console.log('Product creation response:', response);
  })
  .catch((error) => {
    console.error('Error creating product:', error);
  });
