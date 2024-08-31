const priceRepository = require('../repositories/priceRepository');
const { extractNumber, hasCorrectVRAM } = require('../utils/utils');

async function scraperService(productsList, source, scraper) {

    for (product of productsList) {
        const orders = await scraper(product);
        vram = product.vram
        orders = orders.map(order => {
            const price = extractNumber(order.price);
            if (vram) {
                if (!hasCorrectVRAM(order.name, vram)) {
                    return null;
                }
            }
            return {
                name: order.name,
                price,
                url: order.url
            }
        }).filter(order => order !== null);

        if (orders.length === 0) {
            console.log(`No orders found for product ${product.name}`);
            continue;
        }

        // Save the prices to the database
        await priceRepository.addDailyProductPrices(product.productId, source, orders);

    }
}

module.exports = {scraperService};