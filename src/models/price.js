const mongoose = require('mongoose');

const priceSchema = new mongoose.Schema({
  productId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Product', // Reference to the Product model
    required: true 
  },
  sourceId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Source',  // Reference to the Source model
    required: true 
  },
  date: { type: Date, required: true },
  options: [
    {
      name: { type: String, required: true },
      price: { type: Number, required: true },
      href: { type: String, required: true }
    }
  ]
});

module.exports = mongoose.model('Source', priceSchema);