const { humanScroll } = require('../utils/humanActionsUtils');

function getMediaworldUrl(product) {
    const baseUrl = 'https://www.mediaworld.it/it';
    const videoCardsAddress = '/category/schede-video-200302.html';
    // Format: NVIDIA%20GeForce%20RTX%204070%20SUPER, NVIDIA%20GeForce%20RTX%204070%20TI
    const encodedName = product.name.replace(/ /g, '%20');
    const searchUrl = `${baseUrl}${videoCardsAddress}?filter=graphicsCard:${encodedName}`

    return [searchUrl];
}

async function scrapeMediaworld(product, page, condition) {
    console.log('>>>> Starting Mediaworld scraper for ', product.name,' <<<<');
    
    let options = [];
    let pageNum = 1
    const currentURL = await page.url();
    await page.keyboard.press('Enter');

    while (true) {
        console.log('> ', pageNum,' loading page');
        try {
            await page.goto(currentURL + `&page=${pageNum}`, { timeout: 10000, waitUntil: 'networkidle2' });
        } catch (error) {
            console.error('> Timeout exceeded');
        }
        console.log('> ', pageNum,' page laoded');
        
        console.log('>', pageNum, 'scrolling to the bottom of the page');
        await humanScroll(page, 60000); // scroll to the bottom of the page or until 30 seconds have passed
        console.log('>', pageNum, 'scrolled to the bottom of the page');
        const html = await page.content();

        console.log('>>>> >> HTML page: ', html);

        try {
            await page.waitForFunction(() => {
                const optionsCount = document.querySelector('div[data-test="mms-search-srp-productlist"]').children.length;
                return optionsCount > 0;
            }, { timeout: 10000 });
        } catch (error) {
            console.log('> ', pageNum,' No more options');
            break;
        }

        // get the option of the product
        const pageOptions = await page.evaluate(() => {
            const optionsCards = document.querySelector('div[data-test="mms-search-srp-productlist"]').children;

            if (optionsCards.length === 0) {
                return [];
            }

            return Array.from(optionsCards).map(card => {
                let price = null;
                let largestFontSize = 0;

                const name = card.querySelector('p[data-test="product-title"]').textContent;
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
                return {name, price, href};
            });
        });

        if (pageOptions.length === 0) {
            console.log('> ', pageNum, ' No more options');
            break;
        }

        console.log('> ', pageNum, ' page options: ', pageOptions.length);

        options = options.concat(pageOptions);
        pageNum++;
    }

    console.log('>> Finished scraping product: ', product.name, ' with ', options.length, ' options scraped <<');
    
    return options.map(option => {
        return {
            ...option,
            condition: 'new'
        }
    });
}

module.exports = {scrapeMediaworld, getMediaworldUrl};