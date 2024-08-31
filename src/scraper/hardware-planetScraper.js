const puppeteer = require('puppeteer');

async function scrapeHardwarePlanet(product) {
    console.log('>>>> Starting Hardware Palnet scraper for ', product.name,' <<<<');

    const baseUrl = 'https://www.hardware-planet.it';
    const videoCardsAddress = '/55-schede-video-nvidia';
    
    // Fromat: GeForce+RTX+4070+SUPER, GeForce+RTX+4070+Ti
    let encodedName = product.name.replace('NVIDIA', '').trim();
    encodedName = encodedName.replace(/\s+/g, '+');
    encodedName = encodedName.replace('TI', 'Ti');

    const searchUrl = `${baseUrl}${videoCardsAddress}?q=Processore+grafico-${encodedName}`
    
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

    console.log('> scrolling to the bottom of the page');
    // scroll to the bottom of the page
    await page.evaluate(async () => {
        const distance = 100; // Distance to scroll each step (in pixels)
        const delay = 100;    // Delay between scrolls (in milliseconds)
        const maxAttempts = 10; // Number of attempts to scroll at the bottom before stopping (2 seconds / 100 ms intervals)
        let attempts = 0; // Counter for attempts at the bottom

        while (attempts < maxAttempts) {
            const previousScrollTop = document.documentElement.scrollTop;
            window.scrollBy(0, distance);
            await new Promise(resolve => setTimeout(resolve, delay));
            
            const currentScrollTop = document.documentElement.scrollTop;
            const scrollHeight = document.documentElement.scrollHeight;
            const windowHeight = window.innerHeight;

            if (currentScrollTop + windowHeight >= scrollHeight) {
                // If we are at the bottom and the scroll position hasn't changed
                if (currentScrollTop === previousScrollTop) {
                    attempts++; // Increase the counter if we're still at the bottom
                } else {
                    attempts = 0; // Reset the counter if the scroll position changes (new content loaded)
                }
            } else {
                attempts = 0; // Reset if not at the bottom
            }
        }
    });
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

    await browser.close();
    return options;

}

module.exports = scrapeHardwarePlanet;