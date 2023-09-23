// pages/all-scraped-products.js

import React, { useEffect, useState } from 'react';
import Head from 'next/head';

const fetchScrapedProducts = async () => {
  try {
    // Fetch the scraped product data from your API or source
    const response = await fetch('http://localhost:3000/api/scrape'); // Replace with your actual API endpoint
    if (!response.ok) {
      throw new Error('Failed to fetch scraped products data');
    }

    // Parse the JSON response
    const data = await response.json();
    return data.products; // Assuming the response has a "products" key
  } catch (error) {
    console.error('Error fetching scraped products:', error);
    return [];
  }
};


const determineImportStatus = (fetchedProduct, existingShopifyProducts) => {
    // Add your logic here to determine if the product is imported or not.
    // For example, compare properties like title and tags with existing products.
    const isDuplicate = existingShopifyProducts.some((shopifyProduct) =>
      shopifyProduct.title === fetchedProduct.title &&
      shopifyProduct.tags.includes('scrapped-to-shopify')
    );
  
    return isDuplicate ? 'imported' : 'not imported';
  };
  

const AllScrapedProducts = () => {
  const [products, setProducts] = useState([]);
  const [existingShopifyProducts, setExistingShopifyProducts] = useState([]);

 console.log(products);
  useEffect(() => {
    // Fetch the scraped products data and set it to the "products" state
    fetchScrapedProducts().then((data) => setProducts(data));
    
     // Fetch existing Shopify products from your API route
    fetch('http://localhost:3000/api/shopify-products')
    .then((response) => {
        if (!response.ok) {
        throw new Error('Failed to fetch existing Shopify products data');
        }
        return response.json();
    })
    .then((data) => setExistingShopifyProducts(data))
    .catch((error) => {
        console.error('Error fetching existing Shopify products:', error);
        setExistingShopifyProducts([]);
    });


  }, []);

  return (
    <>
      <Head>
        <title>All Scraped Products</title>
      </Head>
      <h2>All Scraped Products</h2>
      <div className="container">
        {/* Render the list of products here */}
        <table style={{ borderCollapse: 'collapse', width: '100%' }}>
        <thead>
            <tr>
            <th style={{ border: '1px solid #ddd', padding: '8px', backgroundColor: '#f2f2f2', color: 'black' }}>Status</th>
            <th style={{ border: '1px solid #ddd', padding: '8px', backgroundColor: '#f2f2f2', color: 'black' }}>ID</th>
            <th style={{ border: '1px solid #ddd', padding: '8px', backgroundColor: '#f2f2f2', color: 'black' }}>Title</th>
            <th style={{ border: '1px solid #ddd', padding: '8px', backgroundColor: '#f2f2f2', color: 'black' }}>Vendor</th>
            <th style={{ border: '1px solid #ddd', padding: '8px', backgroundColor: '#f2f2f2', color: 'black' }}>Handle</th>
            <th style={{ border: '1px solid #ddd', padding: '8px', backgroundColor: '#f2f2f2', color: 'black' }}>Tags</th>
            <th style={{ border: '1px solid #ddd', padding: '8px', backgroundColor: '#f2f2f2', color: 'black' }}>Price</th>
            <th style={{ border: '1px solid #ddd', padding: '8px', backgroundColor: '#f2f2f2', color: 'black' }}>Compare at Price</th>
            <th style={{ border: '1px solid #ddd', padding: '8px', backgroundColor: '#f2f2f2', color: 'black' }}>Description</th>
            <th style={{ border: '1px solid #ddd', padding: '8px', backgroundColor: '#f2f2f2', color: 'black' }}>Image</th>
            </tr>
        </thead>
        <tbody>
            {products.map((product) => (
            <tr key={product.id}>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{determineImportStatus(product, existingShopifyProducts)}</td>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{product.id}</td>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{product.title}</td>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{product.vendor}</td>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{product.handle}</td>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{product.tags}</td>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>${product.variants[0].price}</td>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>${product.variants[0].compare_at_price}</td>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{product.body_html}</td>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                <img width="80" height="80" src={product.images[0]} alt={product.title} />
                </td>
            </tr>
            ))}
        </tbody>
        </table>
      </div>
    </>
  );
};

export default AllScrapedProducts;
