const puppeteer = require('puppeteer');
const axios = require('axios');
// const cheerio = require('cheerio'); // Import Cheerio


// Handle unhandled Promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

const scrapeCleaningLaundryCollection = async () => {
  try {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    // Navigate to the Cleaning & Laundry collection page
    await page.goto('https://mandauefoam.ph/collections/cleaning-laundry', { timeout: 120000 });

    // Wait for the product items to be loaded using waitForFunction
    await page.waitForFunction(() => {
      const productItems = document.querySelectorAll('.product-card');
      return productItems.length > 0;
    }, { timeout: 120000 });

    // Extract product URLs
    const productUrls = await page.$$eval('.product-card__title a', (elements) => {
      return elements.map((element) => element.href);
    });

    // Close the Puppeteer browser
    await browser.close();

    // Fetch and scrape JSON data for each product URL
    const productDetails = await Promise.all(productUrls.map(async (url) => {
      try {
        // Concatenate '.json' to the product URL
        const jsonUrl = `${url}.json`;

        // Fetch JSON data using Axios
        const response = await axios.get(jsonUrl);

        // Extract the JSON data
        const productData = response.data;

        // Extract specific properties, including price and compare_at_price
        const {
          id,
          title,
          body_html,
          handle,
          tags,
          variants,
          vendor,
          images,
        } = productData.product; // Assuming the JSON structure follows the "product" key

        // Use Cheerio to remove HTML markup from body_html
        // const $ = cheerio.load(body_html);
        // const strippedBodyHtml = $.text();


        // Add additional information as needed
        const additionalInfo = {
          productUrl: url,
        };

        return {
          id,
          title,
          //body_html: strippedBodyHtml, // Use the stripped body_html
          body_html,
          handle,
          tags,
          vendor,
          variants,
          images: images.map((image) => image.src), // Extract image sources
          ...additionalInfo,
        };
      } catch (error) {
        console.error(`Error scraping product details for URL ${url}:`, error.message);
        return null; // Return null for failed requests
      }
    }));

    // Filter out null values (failed requests) and return the product details
    const filteredProductDetails = productDetails.filter((details) => details !== null);

    return {
      products: filteredProductDetails.slice(0, 5), // remove .slice(0, 1) to scrape all products
    };
  } catch (error) {
    console.error('Error scraping Cleaning & Laundry collection:', error);
    throw new Error('Failed to scrape Cleaning & Laundry collection');
  }
};

module.exports = scrapeCleaningLaundryCollection;