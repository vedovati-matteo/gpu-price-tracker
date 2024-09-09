const Price = require('../models/price');

async function addDailyProductPrices(productId, source, options) {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Set time to midnight for consistent daily checks
  
      // Check if prices for today already exist
      const existingPrice = await Price.findOne({
        productId,
        source,
        date: today
      });
  
      if (existingPrice) {
        // Check if any of the new options have different conditions than existing ones
        const newConditions = new Set(options.map(option => option.condition));
        const existingConditions = new Set(existingPrice.options.map(option => option.condition));

        const hasNewConditions = [...newConditions].some(condition => !existingConditions.has(condition));

        if (hasNewConditions) {
            // Add new options with different conditions
            existingPrice.options = existingPrice.options.concat(
                options.filter(option => !existingConditions.has(option.condition))
            );
        } else {
            // Update existing options if conditions match
            existingPrice.options = options;
        }

        await existingPrice.save();
        console.log('Prices updated for today');
    } else {
        // Create new price entry
        const newPrice = new Price({
            productId,
            source,
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

async function getProductPrices(productId, source = null, date = null) {
    try {
      const query = { productId };
      if (source) {
        query.source = source;
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