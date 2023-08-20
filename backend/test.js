const fetchProductsFromShopify = require('./api/products');

(async () => {
  try {
    const products = await fetchProductsFromShopify();
    console.log('Fetched products:', products);
  } catch (error) {
    console.error('Error fetching products:', error);
  }
})();
