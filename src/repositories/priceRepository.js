const Price = require('../models/price');

async function addDailyProductPrices(productId, sourceId, options) {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Set time to midnight for consistent daily checks
  
      // Check if prices for today already exist
      const existingPrice = await Price.findOne({
        productId,
        sourceId,
        date: today
      });
  
      if (existingPrice) {
        // Update existing prices
        existingPrice.options = options;
        await existingPrice.save();
        console.log('Prices updated for today');
      } else {
        // Create new price entry
        const newPrice = new Price({
          productId,
          sourceId,
          date: today,
          options
        });
        await newPrice.save();
        console.log('New prices added for today');
      }
    } catch (err) {
      console.error('Error adding/updating daily product prices:', err);
      throw err; 
    }
}

async function getProductPrices(productId, sourceId = null, date = null) {
    try {
      const query = { productId };
      if (sourceId) {
        query.sourceId = sourceId;
      }
      if (date) {
        query.date = date;
      }
  
      const prices = await Price.find(query);
      return prices;
    } catch (err) {
      console.error('Error getting product prices:', err);
      throw err; 
    }
  }
  
  module.exports = {
    addDailyProductPrices,
    getProductPrices
  };