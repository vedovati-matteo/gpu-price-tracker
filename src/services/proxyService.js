const { getUserAgent } = require('../utils/scraperUtils');
const puppeteer = require('puppeteer');

async function checkProxy(proxy, url, headless = true) {
    console.log('Checking proxy:', proxy);
    const browser = await puppeteer.launch({
        headless: headless,
        args: [
            '--remote-debugging-port='+process.env.PUPPETEER_DEBUG_PORT,
            '--remote-debugging-address=0.0.0.0',
            '--no-sandbox',
            '--disable-dev-shm-usage',
            '--disable-gpu',
            '--disable-software-rasterizer',
            '--disable-features=VizDisplayCompositor',
            '--ignore-gpu-blocklist',
            '--use-gl=swiftshader',
            '--disable-vulkan',
            '--disable-webgl',
            '--display=:99'
          ]
        //dumpio: true
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080 });
    await page.setUserAgent(getUserAgent());

    try {
        await page.goto(url, { timeout: 30000 , waitUntil: 'networkidle2'}); 
        console.log('Page loaded successfully!');
        console.log('Proxy:', proxy, 'works!');
        return {work: true, browser: browser, page: page};
    } catch (error) {
        console.error('Proxy:', proxy, 'does not work!');
        await browser.close();
        return {work: false};
    }
}

module.exports = {checkProxy};