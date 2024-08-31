const Source = require('../models/source');

async function getSources() {
  try {
    const sources = await Source.find();
    return sources;
  } catch (err) {
    console.error('Error getting sources:', err);
    throw err; 
  }
}

async function addSource(sourceData) {
  try {
    const newSource = new Source(sourceData);
    const savedSource = await newSource.save();
    return savedSource;
  } catch (err) {
    console.error('Error adding source:', err);
    throw err; 
  }
}

module.exports = {
  getSources,
  addSource
};