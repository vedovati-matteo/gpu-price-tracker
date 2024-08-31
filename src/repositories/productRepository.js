const Product = require('../models/product'); 

async function getProducts() {
  try {
    const products = await Product.find(); 
    return products;
  } catch (err) {
    console.error('Error getting products:', err);
    throw err;
  }
}

async function addProduct(productData) {
    try {
      const newProduct = new Product(productData); 
      const savedProduct = await newProduct.save();
      return savedProduct;
    } catch (err) {
      console.error('Error adding product:', err);
      throw err;
    }
  }
  
  module.exports = {
    getProducts,
    addProduct
  };