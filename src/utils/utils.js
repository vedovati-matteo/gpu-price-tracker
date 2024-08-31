const mediaworldScraper = require('../scraper/mediaworldScraper');

function extractNumber(str) {
    // Remove non-numeric characters except for '.' ',' and '-'
    const cleanedStr = str.replace(/[^0-9.,-]/g, '');
  
    let standardizedStr;

    // Check if the hyphen is used as a decimal separator
    if (cleanedStr.includes('-') && cleanedStr.indexOf('-') === cleanedStr.lastIndexOf('-')) {
      // Replace '-' with '.' and remove any remaining commas
      standardizedStr = cleanedStr.replace('-', '.').replace(/,/g, '');
    } else {
      // Replace ',' with '.' if it's not used as a decimal separator
      standardizedStr = cleanedStr.replace(',', '.');
    }
  
    // Convert to a number, handling potential NaN
    const num = parseFloat(standardizedStr);
  
    if (isNaN(num) || num < 0) {
      // Handle cases where the conversion fails or the number is negative
      console.error("Invalid input string:", str);
      return null; // Or throw an error
    }
  
    return num;
  }

function hasCorrectVRAM(gpuName, expectedVRAM) {
  const lowercaseGpuName = gpuName.toLowerCase();
  const lowercaseExpectedVRAM = expectedVRAM.toLowerCase();

  const vramVariations = [
      lowercaseExpectedVRAM, // Exact match
      lowercaseExpectedVRAM.replace("gb", "g"), // Replace 'gb' with 'g'
      lowercaseExpectedVRAM.replace(" ", ""), // Remove spaces
      lowercaseExpectedVRAM.replace("gb", " g"), // Add space before 'g'
  ];

  // Check if any of the variations are present in the GPU name
  return vramVariations.some(variation => lowercaseGpuName.includes(variation));
}

function getScraperFunction(source) {
  switch (source) {
    case 'mediaworld':
      return mediaworldScraper;
    // Add cases for other sources here
    default:
      throw new Error(`Scraper for source '${source}' not implemented`);
  }
}

module.exports = {
    extractNumber,
    hasCorrectVRAM,
    getScraperFunction
  };