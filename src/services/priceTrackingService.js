const {getScraperFunctionAndUrl } = require('../utils/scraperUtils');
const scraperService = require('./scraperService');
const productRepository = require('../repositories/productRepository');
const sourceRepository = require('../repositories/sourceRepository');

async function trackProductPrice(sourceList=null, productList=null) {
    console.log('>>>> Scraper service started');

    await scraperService.init();

    try {
        if (sourceList === null) {
            console.log('Getting sources from database');
            sourceList = await sourceRepository.getSources();
        }
        if (productList === null) {
            console.log('Getting products from database');
            productList = await productRepository.getProducts();
        }

        console.log('>> Scraping from sources:', sourceList.map(source => source.source));
        console.log('>> Scraping for products:', productList.map(product => product.name));
        for (const source of sourceList) {
            const scraperFunctions = getScraperFunctionAndUrl(source.source);
            
            let scrapeInfoList = [];
            for (const product of productList) {
                const searchUrls = scraperFunctions.getUrl(product);

                for (let i = 0; i < searchUrls.length; i++) {
                    const url = searchUrls[i];
                
                    const condition = i === 0 ? 'new' : 'used'; // First one is 'new', rest are 'used'
                
                    scrapeInfoList.push({
                        source: source.source,
                        product: product,
                        url: url,
                        condition: condition
                    });
                }

            }

            console.log('> Scraping ', scrapeInfoList.length, ' urls from ', source.source);
            if (process.send) {
                process.send({ type: 'update-status', status: 'running', progress: {source: source.source, completed: 0, total: scrapeInfoList.length} });
            }

            let i = 0;
            for (const scrapeInfo of scrapeInfoList) {
                await scraperService.scraperService(scrapeInfo, scraperFunctions.scraper, source.proxy);
                i++;
                if (process.send) {
                    process.send({ type: 'update-status', status: 'running', progress: {completed: i} });
                }
            }
        }

        console.log('Price tracking completed successfully');
        
        if (process.exit) {
            process.exit(0);
        }
        return;
    } catch (err) {
        console.error('Error during price tracking:', err);
        
        if (process.exit) {
            process.exit(1);
        }
        return;
    }
}

const [sourceListArg, productListArg] = process.argv.slice(2);

// Parse JSON strings, or set to null if not provided
const sourceList = sourceListArg ? JSON.parse(sourceListArg) : null;
const productList = productListArg ? JSON.parse(productListArg) : null;

trackProductPrice(sourceList, productList);