const { Product, Source, Price } = require('../db/db'); 
const productRepository = require('../repositories/productRepository');
const sourceRepository = require('../repositories/sourceRepository'); 
const priceRepository = require('../repositories/priceRepository');

const { scraperService } = require('./scraperService');
const { getScraperFunction } = require('../utils/utils');


async function trackProductPrice(source=null, product=null) {
    try {
        if (source && product) {
            // 1. Get products to track (you might have a different logic for selecting products)
            const productsToTrack = [product];
        
            // 1. Track prices for the sepcific product
            console.log(`==-- Scraping prices from ${source.source} --==`);
            const scraper = getScraperFunction(source.source);
            await scraperService(productsToTrack, source, scraper);
        
            console.log('Price tracking completed successfully');
        }

        if (source) {
            // 1. Get products to track (you might have a different logic for selecting products)
            const productsToTrack = await productRepository.getProducts(); 
        
            // 2. Track prices for each product
            console.log(`==-- Scraping prices from ${source.source} --==`);
            const scraper = getScraperFunction(source.source);
            await scraperService(productsToTrack, source, scraper);
        
            console.log('Price tracking completed successfully');
        }
        
        // 1. Get products to track (you might have a different logic for selecting products)
        const productsToTrack = await productRepository.getProducts(); 
    
        // 2. Get sources to scrape from
        const sourcesToScrape = await sourceRepository.getSources();
    
        for (const source of sourcesToScrape) {
            // 3. Track prices for each product
            console.log(`==-- Scraping prices from ${source.source} --==`);
            const scraper = getScraperFunction(source.source);
            await scraperService(productsToTrack, source, scraper);
        }
    
        console.log('Price tracking completed successfully');

        return true;
    } catch (err) {
        console.error('Error during price tracking:', err);
        // Handle the error appropriately (e.g., log it, send notifications, etc.)
        return false;
    }
}

module.exports = trackProductPrice;