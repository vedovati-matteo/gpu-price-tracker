const { humanScroll } = require('../utils/humanActionsUtils');

function getHardwarePlanetUrl(product) {
    const baseUrl = 'https://www.hardware-planet.it';
    const videoCardsAddress = '/55-schede-video-nvidia';
    
    // Fromat: GeForce+RTX+4070+SUPER, GeForce+RTX+4070+Ti
    let encodedName = product.name.replace('NVIDIA', '').trim();
    encodedName = encodedName.replace(/\s+/g, '+');
    encodedName = encodedName.replace('TI', 'Ti');

    const searchUrl = `${baseUrl}${videoCardsAddress}?q=Processore+grafico-${encodedName}`

    return [searchUrl];
}

async function scrapeHardwarePlanet(product, page, condition) {
    console.log('>>>> Starting Hardware Palnet scraper for ', product.name,' <<<<');

    console.log('> scrolling to the bottom of the page');
    await humanScroll(page, 20000); // scroll to the bottom of the page or until 20 seconds have passed
    console.log('> scrolled to the bottom of the page');

    const options = await page.evaluate(() => {
        optionsCards = document.querySelector('div.products').children;

        return Array.from(optionsCards).map(card => {
            const name = card.querySelector('.product-title a').textContent.trim();
            const href = card.querySelector('.product-title a').href;
            const price = card.querySelector('.product-price-and-shipping .price').textContent.trim();
            return { name, price, href };
        });
    });

    

    console.log('>> Finished scraping product: ', product.name, ' with ', options.length, ' options scraped <<');

    return options.map(option => {
        return {
            ...option,
            condition: 'new'
        }
    });

}

module.exports = {scrapeHardwarePlanet, getHardwarePlanetUrl};