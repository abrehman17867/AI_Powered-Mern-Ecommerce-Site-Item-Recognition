const mongoose = require("mongoose");
const Category = require("../models/category.model");
const Product = require("../models/product.model");

async function addCategory(categoryData) {
  const { name, parentCategoryId, level } = categoryData;
  const lev = Number(level);

  if (!name || !String(name).trim()) {
    throw new Error("Name is required");
  }
  if (![1, 2, 3].includes(lev)) {
    throw new Error("Level must be 1, 2, or 3");
  }

  const trimmedName = String(name).trim();

  if (lev === 1) {
    if (parentCategoryId) {
      throw new Error("Top-level categories must not have a parent");
    }
    const dup = await Category.findOne({
      name: new RegExp(`^${escapeRegex(trimmedName)}$`, "i"),
      level: 1,
    });
    if (dup) {
      throw new Error("A level-1 category with this name already exists");
    }
    const category = new Category({
      name: trimmedName,
      level: 1,
    });
    return await category.save();
  }

  const parentId = String(parentCategoryId || "").trim();
  if (!mongoose.Types.ObjectId.isValid(parentId)) {
    throw new Error("Select a valid parent category");
  }
  const parent = await Category.findById(parentId);
  if (!parent) {
    throw new Error("Parent category not found");
  }
  if (parent.level !== lev - 1) {
    throw new Error(
      `Parent must be level ${lev - 1}. Selected parent is level ${parent.level}.`
    );
  }

  const dupUnderParent = await Category.findOne({
    parentCategory: parentId,
    level: lev,
    name: new RegExp(`^${escapeRegex(trimmedName)}$`, "i"),
  });
  if (dupUnderParent) {
    throw new Error("A category with this name already exists under that parent");
  }

  const category = new Category({
    name: trimmedName,
    parentCategory: parentId,
    level: lev,
  });
  return await category.save();
}

function escapeRegex(s) {
  return String(s).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

async function getAllCategories() {
  return await Category.find().sort({ level: 1, name: 1 });
}

async function deleteCategory(categoryId) {
  const id = String(categoryId || "").trim();
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error("Invalid category id");
  }

  const children = await Category.countDocuments({ parentCategory: id });
  if (children > 0) {
    throw new Error(
      "This category has subcategories. Delete or move them first."
    );
  }

  const productCount = await Product.countDocuments({ category: id });
  if (productCount > 0) {
    throw new Error(
      "Cannot delete: products are assigned to this category. Reassign or delete those products first."
    );
  }

  const doc = await Category.findByIdAndDelete(id);
  if (!doc) {
    throw new Error("Category not found");
  }
  return { message: "Category deleted" };
}

async function updateCategory(categoryId, categoryData) {
  const id = String(categoryId || "").trim();
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error("Invalid category id");
  }

  const existing = await Category.findById(id);
  if (!existing) {
    throw new Error("Category not found");
  }

  const hasName = Object.prototype.hasOwnProperty.call(categoryData, "name");
  const hasLevel = Object.prototype.hasOwnProperty.call(categoryData, "level");
  const hasParent = Object.prototype.hasOwnProperty.call(
    categoryData,
    "parentCategoryId"
  );

  const trimmedName = hasName
    ? String(categoryData.name || "").trim()
    : existing.name;
  if (!trimmedName) {
    throw new Error("Name is required");
  }

  const lev = hasLevel ? Number(categoryData.level) : existing.level;
  if (![1, 2, 3].includes(lev)) {
    throw new Error("Level must be 1, 2, or 3");
  }

  let parentId = existing.parentCategory ? String(existing.parentCategory) : "";
  if (hasParent) {
    parentId = String(categoryData.parentCategoryId || "").trim();
  } else if (hasLevel && lev === 1) {
    parentId = "";
  }

  if (lev === 1) {
    parentId = "";
  } else {
    if (!mongoose.Types.ObjectId.isValid(parentId)) {
      throw new Error("Select a valid parent category");
    }
    if (parentId === id) {
      throw new Error("Category cannot be its own parent");
    }
    const parent = await Category.findById(parentId);
    if (!parent) {
      throw new Error("Parent category not found");
    }
    if (parent.level !== lev - 1) {
      throw new Error(
        `Parent must be level ${lev - 1}. Selected parent is level ${parent.level}.`
      );
    }
  }

  const duplicateQuery = {
    _id: { $ne: id },
    level: lev,
    name: new RegExp(`^${escapeRegex(trimmedName)}$`, "i"),
  };
  if (lev === 1) {
    duplicateQuery.parentCategory = { $in: [null, undefined] };
  } else {
    duplicateQuery.parentCategory = parentId;
  }
  const duplicate = await Category.findOne(duplicateQuery);
  if (duplicate) {
    throw new Error(
      lev === 1
        ? "A level-1 category with this name already exists"
        : "A category with this name already exists under that parent"
    );
  }

  existing.name = trimmedName;
  existing.level = lev;
  existing.parentCategory = lev === 1 ? undefined : parentId;
  await existing.save();
  return existing;
}

module.exports = {
  addCategory,
  getAllCategories,
  deleteCategory,
  updateCategory,
};
