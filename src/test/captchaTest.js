const puppeteer = require('puppeteer');
const readline = require('readline');
const scraperService = require('../services/scraperService');

async function captchaTest(sourceList=null, productList=null) {

    console.log('>>>> Catpcah test started');

    scraperService.init();

    captchaDemoUrls = [
        'https://2captcha.com/demo/hcaptcha?difficulty=moderate',
        'https://2captcha.com/demo/recaptcha-v2-enterprise',
        'https://2captcha.com/demo/recaptcha-v3',
        'https://2captcha.com/demo/cloudflare-turnstile'
    ]

    console.log('>> Scraping from sources:', sourceList.map(source => source.source));
    for (const source of sourceList) {
        let scrapeInfoList = [];
        for (const url of captchaDemoUrls) {
            scrapeInfoList.push({
                source: 'captcha',
                product: 'test',
                url: url,
                condition: 'test'
            });
        }

        console.log('> Scraping ', scrapeInfoList.length, ' urls from ', source.source);
        if (process.send) {
            process.send({ type: 'update-status', status: 'running', progress: {source: source.source, completed: 0, total: scrapeInfoList.length} });
        }

        let i = 0;
        for (const scrapeInfo of scrapeInfoList) {
            await scraperService.scraperService(scrapeInfo, scraperTest, source.proxy);
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
    
}

async function scraperTest(product, page, condition) {
    return null;
}

const [sourceListArg, productListArg] = process.argv.slice(2);

// Parse JSON strings, or set to null if not provided
const sourceList = sourceListArg ? JSON.parse(sourceListArg) : null;
const productList = productListArg ? JSON.parse(productListArg) : null;

captchaTest(sourceList, productList);
