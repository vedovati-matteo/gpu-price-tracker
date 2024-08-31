const mongoose = require('mongoose');

const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/price-compare'; 

mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true 
})
.then(() => {
    console.log('Connected to MongoDB');
})
.catch(err => {
    console.error('Error connecting to MongoDB:', err);   
});

// Import your models here
const Product = require('../models/product');
const Source = require('../models/source');
const Price = require('../models/price');


async function storePrices(prices) {
  try {
    // Assuming 'prices' is an array of objects containing product, source, and price data

    for (const priceData of prices) {
      // Find or create the Product and Source documents
      const product = await Product.findOne({ productId: priceData.productId }) || 
                      await Product.create({ productId: priceData.productId, name: priceData.productName }); 

      const source = await Source.findOne({ source: priceData.source }) || 
                     await Source.create({ source: priceData.source, baseUrl: priceData.sourceBaseUrl });

      // Create the Price document
      await Price.create({
        productId: product._id,
        sourceId: source._id,
        date: new Date(),
        options: priceData.options 
      });
    }

    console.log('Prices stored successfully');
  } catch (err) {
    console.error('Error storing prices:', err);
  }
}

module.exports = { 
  // No need to export connectToDatabase or closeConnection as Mongoose handles it
  storePrices,
  Product, // Export the models so they can be used in other parts of your application
  Source,
  Price
};