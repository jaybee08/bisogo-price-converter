const puppeteer = require('puppeteer');
const axios = require('axios');
// const cheerio = require('cheerio'); // Import Cheerio


// Handle unhandled Promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

const scrapeCollections = async () => {
  let browser;
  try {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    const collectionUrls = [
      'https://mandauefoam.ph/collections/cleaning-laundry',
      // Add more collection URLs here
    ];

    const allProductDetails = [];

    for (const collectionUrl of collectionUrls) {
      // Navigate to the collection page
      await page.goto(collectionUrl, { timeout: 120000 });

      // Wait for the product items to be loaded using waitForFunction
      await page.waitForFunction(() => {
        const productItems = document.querySelectorAll('.product-card');
        return productItems.length > 0;
      }, { timeout: 120000 });

      // Extract product URLs
      const productUrls = await page.$$eval('.product-card__title a', (elements) => {
        return elements.map((element) => element.href);
      });

      // Fetch and scrape JSON data for each product URL
      const productDetails = await Promise.all(productUrls.map(async (url) => {
        try {
          // Concatenate '.json' to the product URL
          const jsonUrl = `${url}.json`;

          // Fetch JSON data using Axios
          const response = await axios.get(jsonUrl);

          // Extract the JSON data
          const productData = response.data;

          // Extract specific properties and add additional information
          const {
            id,
            title,
            body_html,
            handle,
            tags,
            variants,
            vendor,
            images,
          } = productData.product;

          const additionalInfo = {
            productUrl: url,
          };

          return {
            id,
            title,
            body_html,
            handle,
            tags,
            vendor,
            variants,
            images: images.map((image) => image.src),
            ...additionalInfo,
          };
        } catch (error) {
          console.error(`Error scraping product details for URL ${url}:`, error.message);
          return null;
        }
      }));

      // Filter out null values (failed requests) and add to the results
      const filteredProductDetails = productDetails.filter((details) => details !== null);
      allProductDetails.push(...filteredProductDetails);
    }

    // Close the Puppeteer browser
    await browser.close();

    return {
      products: allProductDetails.slice(0, 5),
    };
    
  } catch (error) {
    console.error('Error scraping collections:', error);
    throw new Error('Failed to scrape collections');
  } finally {
    if (browser) {
      await browser.close();
    }
  }
};

module.exports = scrapeCollections;