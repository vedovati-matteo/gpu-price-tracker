const puppeteer = require('puppeteer');
const { scrapeMediaworld, getMediaworldUrl } = require('../scraper/mediaworldScraper');
const { extractNumber, isCorrectGPU } = require('../utils/cleanupUtils');

async function test() {
    scrapeInfoList = [
        {
            source: 'mediaworld',
            product: {name: 'NVIDIA GeForce RTX 4060'},
            url: getMediaworldUrl({name: 'NVIDIA GeForce RTX 4060'})[0],
            condition: 'new'
        },
        {
            source: 'mediaworld',
            product: {name: 'NVIDIA GeForce RTX 4070'},
            url: getMediaworldUrl({name: 'NVIDIA GeForce RTX 4070'})[0],
            condition: 'new'
        }
    ]

    console.log(scrapeInfoList);

    for (const scraperInfo of scrapeInfoList) {
        const browser = await puppeteer.launch({headless: true,
            args: [
                '--remote-debugging-port=9222',
                '--remote-debugging-address=0.0.0.0',
                '--no-sandbox',
                '--disable-dev-shm-usage',
                '--disable-gpu',
                '--disable-software-rasterizer',
                '--disable-features=VizDisplayCompositor',
                '--ignore-gpu-blocklist',
                '--use-gl=swiftshader',
                '--disable-vulkan',
                '--disable-webgl'
              ]
        });
        const page = await browser.newPage();
        await page.goto(scraperInfo.url, { timeout: 30000, waitUntil: 'networkidle2' });

        const options = await scrapeMediaworld(scraperInfo.product, page, scraperInfo.condition);

        console.log(options);

        const validOptions = options.map(option => {
            const price = extractNumber(option.price);
            if (!isCorrectGPU(option.name, {name: scraperInfo.product.name, vram: '8 GB'})) return null;
            return { name: option.name, price, href: option.href, condition: option.condition };
        })
        .filter(Boolean);

        if (validOptions.length === 0) {
            console.log(`No orders found for product ${scraperInfo.product.name}`);
            continue;
        }
        console.log('___________________________________----______');
        console.log(validOptions);
    }
}

test();