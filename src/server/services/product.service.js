const { default: mongoose } = require("mongoose");
const Category = require("../models/category.model");
const Product = require("../models/product.model");
const { analyzeImageForCatalog } = require("./catalogVision.service");

function escapeRegExp(str) {
  return String(str).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function isDataUri(value) {
  return typeof value === "string" && value.startsWith("data:");
}

/**
 * Replaces embedded base64 images with a reference to /api/products/:id/image.
 *
 * Images live in MongoDB as data URIs, which would otherwise add ~125KB to
 * every product in every list response. Serving them from their own endpoint
 * keeps list payloads small and lets the browser cache images separately.
 * The frontend renders `imageUrl` straight into <img src>, so a URL works
 * exactly as the data URI did.
 */
function withImageRefs(doc, { imagesOmitted = false } = {}) {
  if (!doc) return doc;
  const json = typeof doc.toJSON === "function" ? doc.toJSON() : doc;
  const id = json?._id;
  if (!id) return json;

  if (imagesOmitted) {
    // List queries skip the image fields entirely (see IMAGE_FIELDS), so point
    // at the endpoint unconditionally. It serves embedded images, redirects for
    // documents holding an http(s) URL, and 404s when there is no image.
    json.imageUrl = `/api/products/${id}/image`;
  } else if (isDataUri(json.imageUrl)) {
    json.imageUrl = `/api/products/${id}/image`;
  }

  if (Array.isArray(json.images)) {
    json.images = json.images.map((img, index) =>
      isDataUri(img) ? `/api/products/${id}/image?i=${index}` : img
    );
  }
  return json;
}

// Excluded from list queries: each embedded image is ~125KB, so fetching a
// page of 12 pulled ~1.5MB out of Atlas just to discard it before responding.
const IMAGE_FIELDS = "-imageUrl -images";

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

  // Serverless hosts have no writable/servable /uploads directory, so the image
  // is stored on the document itself as a base64 data URI (same as the seeded
  // catalog). Falls back to the legacy static-path URL when running on a host
  // that does persist uploads to disk.
  const imageUrl = file.dataUri
    ? file.dataUri
    : `${req.protocol}://${req.get("host")}/uploads/${fileName}`;

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
    updateData.imageUrl = file.dataUri
      ? file.dataUri
      : `${req.protocol}://${req.get("host")}/uploads/${fileName}`;
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

  return withImageRefs(product);
}

async function getAllProducts(reqQuery) {
  let {
    category,
    color,
    colors,
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
  // The catalog toolbar sends "colors"; older callers send "color".
  const colorParam = colors || color;
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
  if (colorParam) {
    const colorSet = new Set(
      String(colorParam).split(",").map((c) => c.trim().toLowerCase()).filter(Boolean)
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
    // The UI offers "20%+ off", so the bound is inclusive.
    query = query.where("discountedPersent").gte(Number(minDiscount));
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
  const products = await query
    .select(IMAGE_FIELDS)
    .skip(skip)
    .limit(pageSize)
    .exec();
  const totalPages = Math.max(1, Math.ceil(totalProducts / pageSize) || 1);

  return {
    content: products.map((p) => withImageRefs(p, { imagesOmitted: true })),
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
  const products = await Product.find({ category: category._id })
    .populate("category")
    .select(IMAGE_FIELDS);

  // Embedded images become /api/products/:id/image references; legacy documents
  // that only have a photo filename fall back to the static /uploads path.
  const productsWithImageUrl = products.map((product) => {
    const json = withImageRefs(product, { imagesOmitted: true });
    return {
      ...json,
      imageUrl:
        json.imageUrl ||
        (json.photo ? `${req.protocol}://${req.get("host")}/uploads/${json.photo}` : ""),
    };
  });

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


const SEARCH_LIMIT = 48;

const searchProducts = async (query) => {
  try {
      const term = String(query ?? "").trim();
      if (!term) {
          return [];
      }

      const pattern = new RegExp(escapeRegExp(term), 'i');

      const products = await Product.find({
          $or: [
            { brand: pattern },
            { title: pattern },
            { description: pattern },

          ]
      })
        .select(IMAGE_FIELDS)
        .limit(SEARCH_LIMIT)
        .lean();
      return products.map((p) => withImageRefs(p, { imagesOmitted: true }));
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

    // Every seeded description reads "... shoes from the Men/Shoes collection",
    // so ORing over description matched ~44 of 77 products for a single shoe
    // photo. Match on the fields that actually identify a product, then rank.
    const orClause = [];
    regexes.forEach((rx) => {
      orClause.push({ title: rx }, { brand: rx }, { color: rx });
    });
    if (categoryIds.size > 0) {
      orClause.push({ category: { $in: [...categoryIds] } });
    }

    const candidates = await Product.find(
      orClause.length > 0 ? { $or: orClause } : {}
    )
      .populate("category")
      .select(IMAGE_FIELDS)
      .limit(200)
      .lean();

    // A category or title hit is real evidence; brand/colour/description are
    // only strong enough to order the ones that already qualify.
    const scoreOf = (p) => {
      let score = 0;
      for (const rx of regexes) {
        if (p.category && rx.test(p.category.name || "")) score += 6;
        if (rx.test(p.title || "")) score += 4;
        if (rx.test(p.brand || "")) score += 1;
        if (rx.test(p.color || "")) score += 1;
        if (rx.test(p.description || "")) score += 0.5;
      }
      return score;
    };

    const MIN_SCORE = 4; // i.e. at least one title or category match
    let products = candidates
      .map((product) => ({ product, score: scoreOf(product) }))
      .filter((x) => x.score >= MIN_SCORE)
      .sort((a, b) => b.score - a.score)
      .slice(0, 48)
      .map((x) => x.product);

    if (products.length === 0 && keywords.some((k) => /shoe|sandal|boot|heel|sneaker|loafer|flat/i.test(k))) {
      products = await Product.find({
        $or: [
          { title: /shoe|sneaker|boot|heel|loafer|flat|runner/i },
          { description: /shoe|footwear|sneaker/i },
        ],
      })
        .populate("category")
        .select(IMAGE_FIELDS)
        .limit(24)
        .lean();
    }

    return {
      predictedLabel,
      products: products.map((p) => withImageRefs(p, { imagesOmitted: true })),
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


/**
 * Distinct facet values across the whole catalog.
 *
 * The filter sidebar used to build its brand list from whatever products the
 * current page happened to contain, so it changed as you paged and never
 * showed brands that were filtered out. Colours were a hard-coded list that
 * had no relation to the catalog at all.
 */
async function getCatalogFacets() {
  const [brands, colors, sizes] = await Promise.all([
    Product.distinct("brand"),
    Product.distinct("color"),
    Product.distinct("sizes.name"),
  ]);

  const clean = (list) =>
    [...new Set((list || []).map((v) => String(v || "").trim()).filter(Boolean))].sort((a, b) =>
      a.localeCompare(b)
    );

  return { brands: clean(brands), colors: clean(colors), sizes: clean(sizes) };
}

module.exports = {
  getCatalogFacets,
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
