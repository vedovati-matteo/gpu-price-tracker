const {scrapeMediaworld, getMediaworldUrl } = require('../scraper/mediaworldScraper');
const {scrapeHardwarePlanet, getHardwarePlanetUrl } = require('../scraper/hardware-planetScraper');
const {scrapeEbay, getEbayUrl} = require('../scraper/ebayScraper');


// Function to get a random user agent string
function getUserAgent() {
    const userAgents = [
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.5845.140 Safari/537.36',
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:117.0) Gecko/20100101 Firefox/117.0',
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.1938.81 Safari/537.36 Edg/116.0.1938.81',
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.5845.96 Safari/537.36 OPR/101.0.4843.25',
        'Mozilla/5.0 (Windows NT 11.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/117.0.5938.62 Safari/537.36',
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:118.0) Gecko/20100101 Firefox/118.0',
    ];

    return userAgents[Math.floor(Math.random() * userAgents.length)];
}

function getScraperFunctionAndUrl(source) {
    switch (source) {
      case 'mediaworld':
        return {scraper: scrapeMediaworld, getUrl: getMediaworldUrl};
      case 'hardware-planet':
        return {scraper: scrapeHardwarePlanet, getUrl: getHardwarePlanetUrl};
      case 'ebay':
        return {scraper: scrapeEbay, getUrl: getEbayUrl};
      default:
        throw new Error(`Scraper for source '${source}' not implemented`);
    }
  }


module.exports = {
    getUserAgent,
    getScraperFunctionAndUrl
  };