const puppeteer = require('puppeteer');

async function navigateWithRetries(page, url, maxRetries = 3) {
    for (let i = 0; i <= maxRetries; i++) {
        try {
            await page.goto(url);
            return; // Success, exit the function
        } catch (error) {
            if (i === maxRetries) throw error; // Rethrow if all retries fail
            console.log(`Retry ${i + 1} after error: ${error.message}`);
            await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds
        }
    }
}

async function scrapeMediaworld(productsList) {
    // exampèle of an url: https://www.mediaworld.it/it/category/schede-video-200302.html?filter=graphicsCard:NVIDIA%20GeForce%20RTX%204070
    // https://www.mediaworld.it/it/search.html?query=rtx%204070
    console.log('>>>> Starting Mediaworld scraper <<<<');

    const baseUrl = 'https://www.mediaworld.it/it';
    const videoCardsAddress = '/category/schede-video-200302.html';
    const searchAddressList = productsList.map(product => {
        const name = product.name;
        const vram = product.vram;
        encodedName = name.replace(/ /g, '%20');
        url = `${baseUrl}${videoCardsAddress}?filter=graphicsCard:${encodedName}`
        return {name, url, vram};
    });
    
    const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] }); // { headless: true } for headless mode
    const page = await browser.newPage();

    // Set the viewport to a typical desktop resolution (1920x1080)
    await page.setViewport({ width: 1920, height: 1080 });

    // Set the user agent to a typical desktop browser
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3');

    let allProducts = [];

    for (const productObj of searchAddressList) {
        console.log('>> Scraping product: ', productObj.name);
        await page.goto(productObj.url);
        
        let products = [];
        let pageNum = 1
        while (true) {
            console.log('> loading page number ', pageNum);
            await page.goto(productObj.url + `&page=${pageNum}`);
            console.log('> page laoded');
            try {
                await page.waitForFunction(() => {
                    const productCount = document.querySelector('div[data-test="mms-search-srp-productlist"]').children.length;
                    return productCount > 0;
                }, { timeout: 10000 });
            } catch (error) {
                console.log('> No more products');
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
                    console.error('> Error during scrolling:', error);
                }
            });
            console.log('> scrolled to the bottom of the page');

            // get the products
            const pageProducts = await page.evaluate(() => {
                const prodCards = document.querySelector('div[data-test="mms-search-srp-productlist"]').children;

                return Array.from(prodCards).map(card => {
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
                        price = 'N/A'; // Or any other suitable placeholder
                    }
                    return {title, price, href};
                });
            });

            console.log('> page products: ', pageProducts.length);

            products = products.concat(pageProducts);
            pageNum++;
        }

        console.log('>> Finished scraping product: ', productObj.name, ' with ', products.length, ' products');
        allProducts = allProducts.concat({name: productObj.name, products});
    }

    await browser.close();
    return allProducts;
}

module.exports = scrapeMediaworld;