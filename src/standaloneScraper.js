const scrapeProductPrices = require('./scraper/scraper');

async function main() {
    const productUrl = 'https://www.mediaworld.it/';
    const prices = await scrapeProductPrices(productUrl);

    console.log(prices); // Just log the prices, no storing
}

main().catch(console.error);