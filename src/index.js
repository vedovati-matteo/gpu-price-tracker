const trackProductPrice = require('./services/priceTrackingService');

async function main() {
    const productUrl = 'https://www.example-product-page.com'; 
    await trackProductPrice(productUrl);
}

main().catch(console.error);