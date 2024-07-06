const Product = require("../models/product.model");
const productService = require("../services/product.service");
const imageService = require('../services/product.service');

const createProduct = async (req, res) => {
  try {
    // console.log("Here")
    const product = await productService.createProduct(req);
    // Ensure that product.photo contains the filename of the uploaded photo
    if (!product.photo) {
      throw new Error("No photo found for the product");
    }
    const imageUrl = `${req.protocol}://${req.get("host")}/uploads/${product.photo}`;
    return res.status(201).send({ ...product.toJSON(), imageUrl });
  } catch (error) {
    return res.status(500).send({ error: error.message });
  }
};


const deleteProduct = async (req, res) => {
  const productId = req.params.id;
  try {
    const product = await productService.deleteProduct(productId);
    return res.status(201).send(product);
  } catch (error) {
    return res.status(500).send({ error: error.message });
  }
};

const updateProduct = async (req, res) => {
  const productId = req.params.id;
  try {
    const product = await productService.updateProduct(productId, req.body);
    return res.status(201).send(product);
  } catch (error) {
    return res.status(500).send({ error: error.message });
  }
};

const findProductById = async (req, res) => {
  const productId = req.params.id;
  try {
    const product = await productService.findProductById(productId);
    return res.status(201).send(product);
  } catch (error) {
    return res.status(500).send({ error: error.message });
  }
};

const getAllProducts = async (req, res) => {
  // const productId = req.params.id;
  try {
    const products = await productService.getAllProducts(req.query);
    return res.status(201).send(products);
  } catch (error) {
    return res.status(500).send({ error: error.message });
  }
};

const createMultipleProduct = async (req, res) => {
  // const productId = req.params.id;
  try {
    const product = await productService.createMultipleProduct(req.body);
    return res.status(201).send({ message: "Products Created Successfully" });
  } catch (error) {
    return res.status(500).send({ error: error.message });
  }
};

const getProductByCategory = async (req, res) => {
  const categoryName = req.params.categoryName;
  try {
    const products = await productService.getProductsByCategory(categoryName, req);
    return res.status(200).send(products);
  } catch (error) {
    return res.status(500).send({ error: error.message });
  }
};

const searchProducts = async (req, res) => {
  try {
      const { query } = req.query;
      
      // Basic search, this can be improved with more advanced search algorithms
      const products = await Product.find({
          $or: [
              { brand: new RegExp(query, 'i') },
              { title: new RegExp(query, 'i') },
              { description: new RegExp(query, 'i') },
              
          ]
      });

      res.status(200).json(products);
  } catch (error) {
      res.status(500).json({ message: error.message });
  }
};

const uploadImage = async (req, res) => {
  try {
      const imagePath = req.file.path;
      const prediction = await imageService.predictImage(imagePath);
      res.json({ prediction });
  } catch (error) {
      console.error('Error processing image:', error);
      res.status(500).json({ error: 'Failed to process image' });
  }
};

const searchProductsByImage = async (req, res) => {
  try {
      const imagePath = req.file.path;

      const products = await productService.searchProductsByImage(imagePath, req);
      return res.status(200).send(products);
  } catch (error) {
      return res.status(500).send({ error: error.message });
  }
};

module.exports = {
  createProduct,
  deleteProduct,
  updateProduct,
  getAllProducts,
  createMultipleProduct,
  findProductById,
  getProductByCategory,
  searchProducts,
  uploadImage,
  searchProductsByImage
};
