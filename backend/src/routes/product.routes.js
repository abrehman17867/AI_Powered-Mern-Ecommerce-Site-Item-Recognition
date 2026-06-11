const express = require("express");
const router = express.Router();
const authenticate = require("../middleware/authenticate");
const productController = require("../controller/product.controller");
const categoryController= require ("../controller/category.controller")
const multer = require('multer');
const path = require('path');


const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploadsImage/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    },
});

const upload = multer({ storage });

// Endpoint to handle image upload and prediction
router.post('/search-by-image/upload', upload.single('image'), productController.searchProductsByImage);

router.get("/", productController.getAllProducts);
router.get("/id/:id", productController.findProductById);
router.get("/category/:categoryName", productController.getProductByCategory);
router.get("/categories", categoryController.getAllCategories);
router.get("/search", productController.searchProducts);

module.exports = router;
