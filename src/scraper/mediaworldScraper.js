const puppeteer = require('puppeteer');

async function scrapeMediaworld(product) {
    console.log('>>>> Starting Mediaworld scraper for ', product.name,' <<<<');

    const baseUrl = 'https://www.mediaworld.it/it';
    const videoCardsAddress = '/category/schede-video-200302.html';
    // Format: NVIDIA%20GeForce%20RTX%204070%20SUPER, NVIDIA%20GeForce%20RTX%204070%20TI
    const encodedName = product.name.replace(/ /g, '%20');
    const searchUrl = `${baseUrl}${videoCardsAddress}?filter=graphicsCard:${encodedName}`
    
    const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] }); // { headless: true } for headless mode
    const page = await browser.newPage();

    // Set the viewport to a typical desktop resolution (1920x1080)
    await page.setViewport({ width: 1920, height: 1080 });

    // Set the user agent to a typical desktop browser
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3');

    try {
        await page.goto(searchUrl);
    } catch (error) {
        console.error('> Error loading the page:', error);
        await browser.close();
        return [];
    }
    
    let options = [];
    let pageNum = 1
    while (true) {
        console.log('> ', pageNum,' loading page');
        try {
            await page.goto(searchUrl + `&page=${pageNum}`);
        } catch (error) {
            console.error('> Error loading the page:', error);
            await browser.close();
            return [];
        }
        console.log('> ', pageNum,' page laoded');
        
        // check if there are options on the page
        try {
            await page.waitForFunction(() => {
                const optionsCount = document.querySelector('div[data-test="mms-search-srp-productlist"]').children.length;
                return optionsCount > 0;
            }, { timeout: 10000 });
        } catch (error) {
            console.log('> ', pageNum,' No more options');
            break;
        }

        // scroll to the bottom of the page
        await page.evaluate(async () => {
            let previousHeight;
            try {
                while (true) {
                previousHeight = document.body.scrollHeight;
                window.scrollTo(0, document.body.scrollHeight);
                await new Promise(resolve => setTimeout(resolve, 1000));
            
                // Check if the scroll height has increased significantly
                if (Math.abs(document.body.scrollHeight - previousHeight) < 50) {
                    break; 
                }
                }
            } catch (error) {
                console.error('> ', pageNum, ' Error during scrolling:', error);
            }
        });
        console.log('> ', pageNum, ' scrolled to the bottom of the page');

        // get the option of the product
        const pageOptions = await page.evaluate(() => {
            const optionsCards = document.querySelector('div[data-test="mms-search-srp-productlist"]').children;

            return Array.from(optionsCards).map(card => {
                let price = null;
                let largestFontSize = 0;

                const title = card.querySelector('p[data-test="product-title"]').textContent;
                const href = card.querySelector('a').href;
                const priceDiv = card.querySelector('div[data-test*="product-price"]');
                if (priceDiv) { 
                    priceElements = priceDiv.querySelectorAll('span');
                    Array.from(priceElements).forEach(span => {
                        const fontSize = window.getComputedStyle(span).fontSize;
                        const fontSizeValue = parseFloat(fontSize);

                        if (fontSizeValue > largestFontSize) {
                            largestFontSize = fontSizeValue;
                            price = span.textContent;
                        }
                    });
                } else {
                    price = NaN; // Or any other suitable placeholder
                }
                return {title, price, href};
            });
        });

        console.log('> ', pageNum, ' page options: ', pageOptions.length);

        options = options.concat(pageOptions);
        pageNum++;
    }

    console.log('>> Finished scraping product: ', product.name, ' with ', options.length, ' options scraped <<');

    await browser.close();
    return options;
}

module.exports = scrapeMediaworld;