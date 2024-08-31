const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  productId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  vram: { type: String },
});

module.exports = mongoose.model('Product', productSchema);