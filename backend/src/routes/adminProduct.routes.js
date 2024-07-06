const express = require("express");
const router = express.Router();
const authenticate = require("../middleware/authenticate");
const productController = require("../controller/product.controller");
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const mongoose = require("mongoose");
const Product = require("../models/product.model");

// Define the path for the uploads directory
const uploadDir = path.join(__dirname, '../uploads');

// Ensure the uploads directory exists
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const FileTypeMap = {
  "image/png": "png",
  "image/jpg": "jpg",
  "image/jpeg": "jpeg",
};

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const isValid = FileTypeMap[file.mimetype];
    let uploadError = new Error("Invalid image type");
    if (isValid) {
      uploadError = null;
    }
    cb(uploadError, uploadDir);  // Use the uploadDir variable
  },
  filename: function (req, file, cb) {
    const fileName = file.originalname.split(" ").join("-");
    const extension = FileTypeMap[file.mimetype];
    cb(null, `${fileName}-${Date.now()}.${extension}`);
  },
});

const uploadOptions = multer({ storage: storage });

router.post(
  "/",
  authenticate,
  uploadOptions.single("photo"),
  productController.createProduct
);

router.post("/creates", authenticate, productController.createMultipleProduct);

router.delete("/:id/delete", authenticate, productController.deleteProduct);

router.put("/:id", authenticate, productController.updateProduct);

router.put(
  "/gallery-images/:id",
  authenticate,
  uploadOptions.array("images", 10),
  async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).send("Invalid ProductId");
    }
    const files = req.files;
    let imagesPaths = [];
    const basePath = `${req.protocol}://${req.get("host")}/uploads`;

    if (files) {
      files.map((file) => {
        imagesPaths.push(`${basePath}/${file.filename}`);
      });
    }
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      {
        images: imagesPaths,
      },
      { new: true }
    );
    if (!product) {
      return res.status(500).send("The product cannot be updated!");
    }
    res.send(product);
  }
);

module.exports = router;
