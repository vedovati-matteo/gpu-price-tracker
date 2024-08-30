const { MongoClient } = require('mongodb');

const uri = process.env.MONGO_URI || 'mongodb://localhost:27017'; 
const client = new MongoClient(uri);

async function connectToDatabase() {
    try {
        await client.connect();
        console.log('Connected to MongoDB');
    } catch (err) {
        console.error('Error connecting to MongoDB:', err);
    }
}

async function storePrices(prices) {
    const database = client.db('price-compare'); 
    const collection = database.collection('products'); 

    await collection.insertMany(prices.map(price => ({ price })));
}

async function closeConnection() {
    await client.close();
}

module.exports = { connectToDatabase, storePrices, closeConnection };