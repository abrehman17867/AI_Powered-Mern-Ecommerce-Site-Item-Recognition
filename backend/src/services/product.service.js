const { default: mongoose } = require("mongoose");
const Category = require("../models/category.model");
const Product = require("../models/product.model");
const { analyzeImageForCatalog } = require("./catalogVision.service");

function escapeRegExp(str) {
  return String(str).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function normalizeSizes(sizesPayload) {
  let parsed = sizesPayload;
  if (typeof parsed === "string") {
    try {
      parsed = JSON.parse(parsed);
    } catch {
      parsed = [];
    }
  }
  if (!Array.isArray(parsed)) {
    return [];
  }
  return parsed
    .map((s) => ({
      name: String(s?.name || "").trim(),
      quantity: Number(s?.quantity || 0),
    }))
    .filter((s) => s.name);
}

async function resolveLeafCategoryId(payload) {
  const leafRaw = payload?.leafCategoryId;
  const leafId =
    leafRaw &&
    String(leafRaw).trim() &&
    mongoose.Types.ObjectId.isValid(String(leafRaw).trim())
      ? String(leafRaw).trim()
      : null;

  if (leafId) {
    const leaf = await Category.findById(leafId);
    if (!leaf) {
      throw new Error("Selected category was not found.");
    }
    if (leaf.level !== 3) {
      throw new Error(
        "Choose the most specific subcategory (level 3), matching the customer site (e.g. Sneakers under Shoes)."
      );
    }
    return leaf._id;
  }

  if (
    !payload?.topLevelCategory ||
    !payload?.secondLevelCategory ||
    !payload?.thirdLevelCategory
  ) {
    throw new Error(
      "Select a full category path from the lists, or provide legacy top/second/third category names."
    );
  }

  let topLevel = await Category.findOne({ name: payload.topLevelCategory });
  if (!topLevel) {
    topLevel = await Category.create({
      name: payload.topLevelCategory,
      level: 1,
    });
  }

  let secondLevel = await Category.findOne({
    name: payload.secondLevelCategory,
    parentCategory: topLevel._id,
  });
  if (!secondLevel) {
    secondLevel = await Category.create({
      name: payload.secondLevelCategory,
      parentCategory: topLevel._id,
      level: 2,
    });
  }

  let thirdLevel = await Category.findOne({
    name: payload.thirdLevelCategory,
    parentCategory: secondLevel._id,
  });
  if (!thirdLevel) {
    thirdLevel = await Category.create({
      name: payload.thirdLevelCategory,
      parentCategory: secondLevel._id,
      level: 3,
    });
  }

  return thirdLevel._id;
}

const createProduct = async (req) => {
  const thirdLevelId = await resolveLeafCategoryId(req.body);

  const file = req.file;
  if (!file) {
    throw new Error("No image in request");
  }
  const fileName = file.filename;
  // const basePath = `${req.protocol}://${req.get("host")}/uploads/`;

  const imageUrl = `${req.protocol}://${req.get("host")}/uploads/${fileName}`;

  const sizesPayload = normalizeSizes(req.body.size);

  const product = new Product({
    title: req.body.title,
    color: req.body.color,
    description: req.body.description,
    discountedPrice: req.body.discountedPrice,
    discountedPersent: req.body.discountedPersent,
    photo: fileName,
    brand: req.body.brand,
    price: req.body.price,
    sizes: sizesPayload,
    quantity: req.body.quantity,
    category: thirdLevelId,
    imageUrl,
  });

  return await product.save();
};

async function deleteProduct(productId) {
  const product = await findProductById(productId);

  await Product.findByIdAndDelete(productId);
  return "Product deleted Successfully";
}

async function updateProduct(productId, payload, file, req) {
  const product = await findProductById(productId);
  const updateData = {};
  const fields = [
    "title",
    "color",
    "description",
    "discountedPrice",
    "discountedPersent",
    "brand",
    "price",
    "quantity",
  ];

  fields.forEach((field) => {
    if (payload[field] !== undefined) {
      updateData[field] = payload[field];
    }
  });

  if (payload.size !== undefined) {
    updateData.sizes = normalizeSizes(payload.size);
  }

  if (
    payload.leafCategoryId ||
    payload.topLevelCategory ||
    payload.secondLevelCategory ||
    payload.thirdLevelCategory
  ) {
    updateData.category = await resolveLeafCategoryId(payload);
  }

  if (file) {
    const fileName = file.filename;
    updateData.photo = fileName;
    updateData.imageUrl = `${req.protocol}://${req.get("host")}/uploads/${fileName}`;
  }

  const updated = await Product.findByIdAndUpdate(product._id, updateData, {
    new: true,
  }).populate("category");
  return updated;
}

async function findProductById(id) {
  //console.log("Id before trim : ",id)
  const trimmedId = id.trim();
  //console.log("Id after trim : ",trimmedId)

  if (!mongoose.Types.ObjectId.isValid(trimmedId)) {
    throw new Error(`Invalid product ID: ${trimmedId}`);
  }

  const product = await Product.findById(trimmedId).populate("category").exec();

  if (!product) {
    throw new Error(`Product not found with ID: ${trimmedId}`);
  }

  return product;
}

async function getAllProducts(reqQuery) {
  let {
    category,
    color,
    sizes,
    size,
    brand,
    minPrice,
    maxPrice,
    minDiscount,
    sort,
    stock,
    pageNumber,
    pageSize,
  } = reqQuery;

  const sizesParam = sizes || size;
  pageNumber = Math.max(1, parseInt(pageNumber, 10) || 1);
  pageSize = Math.min(48, Math.max(1, parseInt(pageSize, 10) || 12));

  let query = Product.find().populate("category");

  if (category) {
    const catTrim = String(category).trim();
    let existCategory = null;
    if (mongoose.Types.ObjectId.isValid(catTrim)) {
      existCategory = await Category.findById(catTrim);
    }
    if (!existCategory) {
      existCategory = await Category.findOne({
        name: new RegExp(`^${escapeRegExp(catTrim)}$`, "i"),
      });
    }
    if (existCategory) {
      query = query.where("category").equals(existCategory._id);
    } else {
      return { content: [], curentPage: 1, totalPages: 0 };
    }
  }
  // console.log("product color issss :",color)
  if (color) {
    const colorSet = new Set(
      color.split(",").map((color) => color.trim().toLowerCase())
    );
    const colorRegex =
      colorSet.size > 0 ? new RegExp([...colorSet].join("|"), "i") : null;
    query = query.where("color").regex(colorRegex);
  }
  if (sizesParam) {
    const sizeList = String(sizesParam)
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    if (sizeList.length > 0) {
      query = query.where("sizes.name").in(sizeList);
    }
  }

  if (brand) {
    const brands = String(brand)
      .split(",")
      .map((b) => b.trim())
      .filter(Boolean);
    if (brands.length > 0) {
      query = query.where("brand").in(brands);
    }
  }

  const minP = Number(minPrice);
  const maxP = Number(maxPrice);
  if (!Number.isNaN(minP) && !Number.isNaN(maxP)) {
    query = query.where("discountedPrice").gte(minP).lte(maxP);
  }

  //console.log("CHECKING", minDiscount)
  if (minDiscount) {
    query = query.where("discountedPersent").gt(minDiscount);
  }

  if (stock) {
    if (stock === "in_stock") {
      query = query.where("quantity").gt(0);
    } else if (stock === "out_of_stock") {
      query = query.where("quantity").lte(0);
    }
  }

  switch (sort) {
    case "price_high":
      query = query.sort({ discountedPrice: -1 });
      break;
    case "newest":
      query = query.sort({ createdAt: -1 });
      break;
    case "oldest":
      query = query.sort({ createdAt: 1 });
      break;
    case "discount":
      query = query.sort({ discountedPersent: -1 });
      break;
    case "rating":
      query = query.sort({ numRatings: -1 });
      break;
    case "name_asc":
      query = query.sort({ title: 1 });
      break;
    case "name_desc":
      query = query.sort({ title: -1 });
      break;
    case "price_low":
    default:
      query = query.sort({ discountedPrice: 1 });
      break;
  }

  const totalProducts = await Product.countDocuments(query.getFilter());
  const skip = (pageNumber - 1) * pageSize;
  const products = await query.skip(skip).limit(pageSize).exec();
  const totalPages = Math.max(1, Math.ceil(totalProducts / pageSize) || 1);

  return {
    content: products,
    curentPage: pageNumber,
    totalPages,
    totalProducts,
    pageSize,
  };
}

async function createMultipleProduct(products) {
  if (!Array.isArray(products)) {
    throw new Error("Products payload must be an array.");
  }
  const created = [];
  for (const item of products) {
    const categoryId = await resolveLeafCategoryId(item);
    const product = await Product.findOneAndUpdate(
      { title: item.title, brand: item.brand },
      {
        title: item.title,
        color: item.color,
        description: item.description,
        discountedPrice: item.discountedPrice,
        discountedPersent: item.discountedPersent,
        photo: item.photo || "",
        imageUrl: item.imageUrl || "",
        brand: item.brand,
        price: item.price,
        sizes: normalizeSizes(item.size || item.sizes || []),
        quantity: item.quantity,
        category: categoryId,
      },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );
    created.push(product);
  }
  return created;
}

async function getProductsByCategory(categoryName, req) {
  const category = await Category.findOne({ name: categoryName });
  if (!category) {
    throw new Error(`Category '${categoryName}' not found`);
  }
  const products = await Product.find({ category: category._id }).populate(
    "category"
  );

  // Add imageUrl to each product
  const productsWithImageUrl = products.map((product) => ({
    ...product.toJSON(),
    imageUrl: `${req.protocol}://${req.get("host")}/uploads/${product.photo}`,
  }));

  return productsWithImageUrl;
}

// async function searchProducts(searchQuery, req) {
//   const regexPattern = new RegExp(searchQuery, "i");

//   // Find categories that match the search query
//   const categories = await Category.find({ name: regexPattern });

//   // If no categories match, return an empty array
//   if (categories.length === 0) {
//     return [];
//   }

//   // Find products that match the search query or belong to matching categories
//   const products = await Product.find({
//     $or: [
//       { title: regexPattern },
//       { brand: regexPattern },
//     //   { category: { $in: categories.map((category) => category._id) } },
//     ],
//   }).populate("category");

//   return products;
// }

// Function to handle image prediction


const searchProducts = async (query) => {
  try {
      const products = await Product.find({
          $or: [
            { brand: new RegExp(query, 'i') },
            { title: new RegExp(query, 'i') },
            { description: new RegExp(query, 'i') },
           
          ]
      })
      return products;
  } catch (error) {
      throw new Error(error.message);
  }
};



async function searchProductsByImage(imagePath, req) {
  try {
    const { keywords, predictedLabel, method } =
      await analyzeImageForCatalog(imagePath);

    const regexes = keywords.map((w) => new RegExp(escapeRegExp(w), "i"));

    const categoryIds = new Set();
    for (const rx of regexes) {
      const cats = await Category.find({ name: rx });
      cats.forEach((c) => categoryIds.add(String(c._id)));
    }

    const orClause = [];
    regexes.forEach((rx) => {
      orClause.push(
        { title: rx },
        { brand: rx },
        { description: rx },
        { color: rx }
      );
    });
    if (categoryIds.size > 0) {
      orClause.push({ category: { $in: [...categoryIds] } });
    }

    let products = await Product.find(
      orClause.length > 0 ? { $or: orClause } : {}
    )
      .populate("category")
      .limit(48)
      .lean();

    if (products.length === 0 && keywords.some((k) => /shoe|sandal|boot|heel|sneaker|loafer|flat/i.test(k))) {
      products = await Product.find({
        $or: [
          { title: /shoe|sneaker|boot|heel|loafer|flat|runner/i },
          { description: /shoe|footwear|sneaker/i },
        ],
      })
        .populate("category")
        .limit(24)
        .lean();
    }

    return {
      predictedLabel,
      products,
      searchKeywords: keywords,
      matchMethod: method,
    };
  } catch (error) {
    const msg = String(error.message || error)
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean)
      .pop();
    throw new Error(msg || "Image search failed");
  }
}

module.exports = {
  createProduct,
  deleteProduct,
  updateProduct,
  getAllProducts,
  findProductById,
  createMultipleProduct,
  getProductsByCategory,
  searchProducts,
  searchProductsByImage,
};
