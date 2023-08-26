// frontend/components/PodProduct.js
import React, { useEffect, useState } from 'react';

const PodProducts = () => {
  const [productInfo, setProductInfo] = useState([]);

  useEffect(() => {
    fetchProductInfo();
  }, []);

  async function fetchProductInfo() {
    try {
      // console.log(process.env.REACT_APP_API_URL);
      const response = await fetch('http://localhost:3000/api/product'); // use .env here when deployed
      const responseData = await response.json();
      console.log('Response Data:', responseData);
      const extractedInfo = responseData.map(product => ({
        id: product.id,
        title: product.title,
        price: product.variants.edges[0]?.node?.price || 'Price not available',
        imageSrc: product.images.edges[0]?.node?.transformedSrc || null
      }));
      setProductInfo(extractedInfo);
    } catch (error) {
      console.error('Error fetching product info:', error);
    }
  }
  
  return (
    <div>
      <h2>POD Product Information</h2>
      <ul>
        {productInfo.map(product => (
          <li key={product.id}>
            {product.imageSrc && <img src={product.imageSrc} alt={product.title} style={{ width: '120px', height: '120px' }} />}
            <p>Title: {product.title}</p>
            <p>Product ID: {product.id}</p>
            <p>Price: PHP{product.price}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PodProducts;



