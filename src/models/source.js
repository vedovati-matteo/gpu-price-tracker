const mongoose = require('mongoose');

const sourceSchema = new mongoose.Schema({
  source: { type: String, required: true, unique: true },
  baseUrl: { type: String, required: true }
});

module.exports = mongoose.model('Source', sourceSchema);