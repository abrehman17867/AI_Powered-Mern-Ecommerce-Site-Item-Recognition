const categoryService = require("../services/category.service");

const addCategory = async (req, res) => {
  try {
    const category = await categoryService.addCategory(req.body);
    return res.status(201).send(category);
  } catch (error) {
    return res.status(500).send({ error: error.message });
  }
};

const getAllCategories = async (req, res) => {
  try {
    const categories = await categoryService.getAllCategories();
    return res.status(200).send(categories);
  } catch (error) {
    return res.status(500).send({ error: error.message });
  }
};

module.exports = {
  addCategory,
  getAllCategories,
};
