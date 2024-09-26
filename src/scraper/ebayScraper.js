const { humanScroll } = require('../utils/humanActionsUtils');

function getEbayUrl(product) {
    const baseUrl = 'https://www.ebay.it';
    const videoCardsAddress = '/sch/i.html';
    
    // Fromat: NVIDIA+GeForce+RTX+4070+TI
    const encodedName = product.name.replace(/ /g, '+');
    const condition = ['1000', '3000']; // New and used

    const searchUrls = condition.map(cond => {
        return `${baseUrl}${videoCardsAddress}?_from=R40&_nkw=${encodedName}&LH_PrefLoc=1&LH_BIN=1&rt=nc&LH_ItemCondition=${cond}`;
    });

    return searchUrls;
}

async function scrapeEbay(product, page, condition) {
    console.log('>>>> Starting Ebay scraper for', condition, product.name,' <<<<');

    console.log('Scraping options for condition: ', condition);

    // wait a bit
    await new Promise(r => setTimeout(r, (Math.random() * 400) + 200));

    console.log('> scrolling to the bottom of the page');
    await humanScroll(page, 10000); // scroll to the bottom of the page or until 10 seconds have passed
    console.log('> finished scrolling');

    let options = await page.evaluate(() => {
        const ul = document.querySelector('ul.srp-results.srp-list');
        if (!ul) {
            return [];
        }

        // Get all child li elements
        const allLiElements = ul.querySelectorAll('li');

        // Filter to keep only those with data-viewport, stopping at the first one without
        const filteredLiElements = [];
        for (const li of allLiElements) {
            if (li.hasAttribute('data-viewport')) {
                filteredLiElements.push(li);
            } else if (li.textContent.includes('Risultati trovati con meno parole')) {
                break;
            }
        }

        const options = filteredLiElements.map(li => {
            const name = li.querySelector('.s-item__title').textContent.trim();
            const href = li.querySelector('.s-item__link').href;
            const price = li.querySelector('.s-item__price').textContent.trim();
            return { name, price, href };
        });

        return options;
    });

    console.log('> scraped options for', condition ,'condition: ', options.length);

    options = options.map(option => {
        return {
            ...option,
            condition: condition
        }
    });

    return options;

}

module.exports = {scrapeEbay, getEbayUrl};