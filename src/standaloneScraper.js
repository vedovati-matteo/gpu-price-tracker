const scrapeMediaworld = require('./scraper/mediaworldScraper');
const scrapeHardwarePlanet = require('./scraper/hardware-planetScraper');
const { extractNumber, hasCorrectVRAM } = require('./utils/utils');

async function main() {
    const productsList = [
        { name: 'NVIDIA GeForce RTX 4070 TI', vram: '16 GB' },
        { name: 'NVIDIA GeForce RTX 4060', vram: '8 GB' }
    ];

    const product = productsList[0]

    let options = await scrapeHardwarePlanet(product);

    vram = product.vram
    options = options.map(order => {
        const price = extractNumber(order.price);
        if (vram) {
            if (!hasCorrectVRAM(order.name, vram)) {
                return null;
            }
        }
        return {
            name: order.name,
            price,
            href: order.href
        }
    }).filter(order => order !== null);

    console.log(options); // Just log the prices, no storing
}

main().catch(console.error);