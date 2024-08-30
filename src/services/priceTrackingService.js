const scrapeProductPrices = require('../scraper/scraper');
const { connectToDatabase, storePrices, closeConnection } = require('../db/db');

async function trackProductPrice(productUrl) {
    await connectToDatabase();

    const prices = await scrapeProductPrices(productUrl);

    await storePrices(prices);
    await closeConnection();
}

module.exports = trackProductPrice;