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

module.exports = { 
  Product,
  Source,
  Price
};