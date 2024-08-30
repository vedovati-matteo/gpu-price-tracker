const puppeteer = require('puppeteer');

async function scrapeProductPrices(productUrl) {
    const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] }); // { headless: true } for headless mode
    const page = await browser.newPage();

    // Navigate to the target product page
    await page.goto(productUrl); 

    // Wait for 0.5 second
    await new Promise(r => setTimeout(r, 500)); 

    const searchTerm = 'google pixel 8 pro';
    // Type into the search bar
    await page.type('#search-form', searchTerm);

    // Simulate pressing Enter
    await page.keyboard.press('Enter');
    console.log('>>>> Searching for products');

    // Wait for loading to complete
    await page.waitForSelector('[class*="iNMUUS"]'); 
    console.log('>>>> Products laoded');

    const prices = await page.evaluate((searchTerm) => {
        // selsct all divs with class 'iNMUUS'
        const divs = document.querySelectorAll('div.iNMUUS');
        /*
        // filter the releavnt divs
        const validDivs = Array.from(divs).filter(div => {
            const titles = div.querySelector('p[data-test="product-title"]')?.textContent;
            
            if (!titles) return false;
        
            // Convert both the title and search term to lowercase and remove spaces
            const normalizedTitle = titles.toLowerCase().replace(/\s/g, '');
            const normalizedSearchTerm = searchTerm.toLowerCase().replace(/\s/g, '');
        
            return normalizedTitle.includes(normalizedSearchTerm);
        });*/

        // Initialize variables to keep track of the largest price element
        let price = null;
        let largestFontSize = 0;

        // Extract the product title and price from the divs
        const prices = Array.from(divs).map(div => {

            title = div.querySelector('p[data-test="product-title"]').textContent;
            priceDiv = div.querySelector('div[data-test*="product-price"]');
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
            
            return { title, price };
        });

        return prices;
    }, searchTerm);

    await browser.close();
    return prices;
}

module.exports = scrapeProductPrices;