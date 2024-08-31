const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  productId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  additionalInfo: {
    type: Map,
    of: String 
  }
});

module.exports = mongoose.model('Product', productSchema);