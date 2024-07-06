const Category = require("../models/category.model");

async function addCategory(categoryData) {
  const { name, parentCategoryId, level } = categoryData;
  const category = new Category({
    name,
    parentCategory: parentCategoryId,
    level,
  });
  return await category.save();
}

async function getAllCategories() {
  return await Category.find();
}

module.exports = {
  addCategory,
  getAllCategories,
};
