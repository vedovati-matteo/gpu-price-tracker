const puppeteer = require('puppeteer');
const mongoose = require('mongoose');
const { spawn } = require('child_process');
const priceRepository = require('../repositories/priceRepository');
const { extractNumber, isCorrectGPU } = require('../utils/cleanupUtils');
const { getProxies } = require('../utils/proxyUtils');
const { getUserAgent } = require('../utils/scraperUtils');
const { checkProxy } = require('./proxyService');
const { checkCaptcha, solveCaptcha } = require('./captchaService');

class ScraperService {
  constructor() {
    this.proxyList = [];
    this.proxyListWithCaptcha = [];
  }

  async init() {
    await mongoose.connect(process.env.MONGO_URI);
    this.proxyList = await getProxies();
  }
  
  async launchBrowser(headless = true) {
    console.log('Launching browser with headless mode:', headless);
    let browser;
    try {
      if (process.env.CLIENT_PROXY) {
        browser = await puppeteer.launch({
          headless,
          args: [
            '--proxy-server=' + process.env.CLIENT_PROXY,
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-gpu',
            '--disable-dev-shm-usage',
            '--display=:99'  // Ensure Puppeteer is using the Xvfb display
          ],
          defaultViewport: null,
        });
      } else {
        browser = await puppeteer.launch({
          headless,
          args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-gpu',
            '--disable-dev-shm-usage',
            '--display=:99'  // Ensure Puppeteer is using the Xvfb display
          ],
          defaultViewport: null,
        });
      }
      
      console.log('Browser launched successfully');
      return browser;
    } catch (error) {
      console.error('Failed to launch browser:', error);
      throw error;
    }
  }

  async setupPage(browser, url) {
    const page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080 });
    await page.setUserAgent(getUserAgent());
    
    try {
      await page.goto(url, { timeout: 30000, waitUntil: 'networkidle2' });
      console.log('Page loaded successfully!');
      return { work: true, page };
    } catch (error) {
      console.error('Page not loaded:', error);
      return { work: false };
    }
  }

  async saveOptions(options, product, source) {
    if (options === null) {
        console.log(`No orders found for product ${product.name}`);
        return;
    }

    const validOptions = options
      .map(option => {
        const price = extractNumber(option.price);
        if (!isCorrectGPU(option.name, product)) return null;
        return { name: option.name, price, href: option.href, condition: option.condition };
      })
      .filter(Boolean);

    if (validOptions.length === 0) {
      console.log(`No orders found for product ${product.name}`);
      return;
    }

    await priceRepository.addDailyProductPrices(product.productId, source, validOptions);
    console.log(`Saved ${validOptions.length} prices for product ${product.name}`);
  }

  // Function to check if the page has finished loading
  async waitForPageLoad(page) {
    await page.evaluate(() => {
        return new Promise((resolve) => {
            if (document.readyState === 'complete') {
                resolve();
            } else {
                window.addEventListener('load', resolve);
            }
        });
    });
  }

  async handleProxy(scraperInfo, scraper, proxy, headless = true) {
    const page = await checkProxy(proxy, scraperInfo.url, headless);
    if (!page.work) return false;
    try {
      // Wait for the page to load
      await this.waitForPageLoad(page.page);

      // Wait a bit longer to ensure dynamic content is loaded
      await new Promise(resolve => setTimeout(resolve, 2000));
    } catch (error) {
      console.error('Page not loaded: ', error);
      return false;
    }

    const captchaInfo = await checkCaptcha(page.page);
    if (captchaInfo.isCaptchaPresent) {
      console.log('Captcha detected:', captchaInfo.captchaType);
      if (headless) {
        this.proxyListWithCaptcha.push(proxy);
        await page.browser.close();
        return false;
      }
      const solved = await solveCaptcha(page.page, captchaInfo.captchaType);
      if (!solved) {
        console.log('Captcha not solved, skipping proxy');
        await page.browser.close();
        return false;
      }
    }

    const options = await scraper(scraperInfo.product, page.page, scraperInfo.condition);
    await page.browser.close();

    await this.saveOptions(options, scraperInfo.product, scraperInfo.source);
    return true;
  }

  async scraperService(scraperInfo, scraper, proxyNeeded = false) {
    if (proxyNeeded && (this.proxyList.length > 0 || this.proxyListWithCaptcha.length > 0)) {
      console.log('Trying to use proxy');
      
      while (this.proxyList.length > 0) {
        const proxy = this.proxyList.shift();
        if (await this.handleProxy(scraperInfo, scraper, proxy)) {
          this.proxyList.push(proxy);
          return;
        }
      }

      while (this.proxyListWithCaptcha.length > 0) {
        console.log('Using captcha proxies');
        const proxy = this.proxyListWithCaptcha.shift();
        if (await this.handleProxy(scraperInfo, scraper, proxy, false)) {
          this.proxyListWithCaptcha.push(proxy);
          return;
        }
      }

      console.log('No more proxies to use');
    }

    // If proxy not needed or no more proxies, run without proxy
    const browser = await this.launchBrowser();
    const { work, page } = await this.setupPage(browser, scraperInfo.url);
    
    if (work) {
      const captchaInfo = await checkCaptcha(page);
      if (captchaInfo.isCaptchaPresent) {
        console.log('Captcha detected:', captchaInfo.captchaType);
        await browser.close();
        
        const newBrowser = await this.launchBrowser(false);
        const newPage = await this.setupPage(newBrowser, scraperInfo.url);
        
        if (newPage.work) {
          const newCaptchaInfo = await checkCaptcha(newPage.page);
          if (newCaptchaInfo.isCaptchaPresent) {
            console.log('Captcha still present:', newCaptchaInfo.captchaType);
            const solved = await solveCaptcha(newPage.page, newCaptchaInfo.captchaType);
            if (!solved) {
              console.log('Captcha not solved');
              await newBrowser.close();
              return;
            }
          }
          
          const options = await scraper(scraperInfo.product, newPage.page, scraperInfo.condition);
          await newBrowser.close();
          await this.saveOptions(options, scraperInfo.product, scraperInfo.source);
        }
      } else {
        const options = await scraper(scraperInfo.product, page, scraperInfo.condition);
        await browser.close();
        await this.saveOptions(options, scraperInfo.product, scraperInfo.source);
      }
    }
  }
}

module.exports = new ScraperService();