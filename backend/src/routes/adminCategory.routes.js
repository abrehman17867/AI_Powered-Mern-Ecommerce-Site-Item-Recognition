const express = require("express");
const router = express.Router();
const authenticate = require("../middleware/authenticate");
const isAdmin = require("../middleware/isAdmin");
const categoryController = require("../controller/category.controller");

router.post("/", authenticate, isAdmin, categoryController.addCategory);
router.patch("/:id", authenticate, isAdmin, categoryController.updateCategory);
router.delete("/:id", authenticate, isAdmin, categoryController.deleteCategory);

module.exports = router;
