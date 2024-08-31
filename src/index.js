const trackProductPrice = require('./services/priceTrackingService');

async function main() {
    
    const result = await trackProductPrice();

    if (result) {
        console.log('Price tracking completed successfully');
    } else {
        console.error('Error during price tracking');
    }

}

main().catch(console.error);