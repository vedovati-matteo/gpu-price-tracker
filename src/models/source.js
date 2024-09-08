const mongoose = require('mongoose');

const sourceSchema = new mongoose.Schema({
  source: { type: String, required: true, unique: true },
  proxy: { type: Boolean }
});

module.exports = mongoose.model('Source', sourceSchema);