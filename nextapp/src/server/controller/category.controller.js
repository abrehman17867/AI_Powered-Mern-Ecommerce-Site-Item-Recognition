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

const deleteCategory = async (req, res) => {
  try {
    const result = await categoryService.deleteCategory(req.params.id);
    return res.status(200).send(result);
  } catch (error) {
    return res.status(500).send({ error: error.message });
  }
};

const updateCategory = async (req, res) => {
  try {
    const result = await categoryService.updateCategory(req.params.id, req.body);
    return res.status(200).send(result);
  } catch (error) {
    return res.status(500).send({ error: error.message });
  }
};

module.exports = {
  addCategory,
  getAllCategories,
  deleteCategory,
  updateCategory,
};
