const scrapeMediaworld = require('./scraper/scraperMediaworld');
const scrape = require('./scraper/scraper');

async function main() {
    const ProductsList = [
        { name: 'NVIDIA GeForce RTX 4070 TI', vram: '16 GB' },
        { name: 'NVIDIA GeForce RTX 4060', vram: '8 GB' }
    ];
    const prices = await scrapeMediaworld(ProductsList);
    //const prices2 = await scrape('https://www.mediaworld.it/');

    console.log(prices); // Just log the prices, no storing
}

main().catch(console.error);