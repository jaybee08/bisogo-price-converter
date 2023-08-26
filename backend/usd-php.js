const puppeteer = require('puppeteer');

const fetchUSDtoPHPExchangeRate = async () => {
  try {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    
    await page.goto(process.env.EXCHANGE_RATE_URL);

    const exchangeRateText = await page.$eval('#answer', element => element.value);
    const exchangeRate = parseFloat(exchangeRateText);
    
    await browser.close();
    
    return exchangeRate;
  } catch (error) {
    console.error('Error fetching USD to PHP exchange rate:', error);
    throw new Error('Failed to fetch USD to PHP exchange rate');
  }
};

module.exports = fetchUSDtoPHPExchangeRate;
