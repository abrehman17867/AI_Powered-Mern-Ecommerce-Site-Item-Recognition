const { default: mongoose } = require("mongoose");
const Category = require("../models/category.model");
const Product = require("../models/product.model");
const { spawn } = require("child_process");

const createProduct = async (req) => {
  // console.log("found here")
  let topLevel = await Category.findOne({ name: req.body.topLevelCategory });

  if (!topLevel) {
    topLevel = new Category({
      name: req.body.topLevelCategory,
      level: 1,
    });
    await topLevel.save();
  }

  let secondLevel = await Category.findOne({
    name: req.body.secondLevelCategory,
    parentCategory: topLevel._id,
  });

  if (!secondLevel) {
    secondLevel = new Category({
      name: req.body.secondLevelCategory,
      parentCategory: topLevel._id,
      level: 2,
    });
    await secondLevel.save();
  }

  let thirdLevel = await Category.findOne({
    name: req.body.thirdLevelCategory,
    parentCategory: secondLevel._id,
  });

  if (!thirdLevel) {
    thirdLevel = new Category({
      name: req.body.thirdLevelCategory,
      parentCategory: secondLevel._id,
      level: 3,
    });
    await thirdLevel.save();
  }

  const file = req.file;
  if (!file) {
    throw new Error("No image in request");
  }
  const fileName = file.filename;
  // const basePath = `${req.protocol}://${req.get("host")}/uploads/`;

  const imageUrl = `${req.protocol}://${req.get("host")}/uploads/${fileName}`;

  const product = new Product({
    title: req.body.title,
    color: req.body.color,
    description: req.body.description,
    discountedPrice: req.body.discountedPrice,
    discountedPersent: req.body.discountedPersent,
    photo: fileName,
    brand: req.body.brand,
    price: req.body.price,
    sizes: req.body.size,
    quantity: req.body.quantity,
    category: thirdLevel._id,
    imageUrl,
  });

  return await product.save();
};

async function deleteProduct(productId) {
  const product = await findProductById(productId);

  await Product.findByIdAndDelete(productId);
  return "Product deleted Successfully";
}

async function updateProduct(productId) {
  return await Product.findByIdAndUpdate(productId);
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
    minPrice,
    maxPrice,
    minDiscount,
    sort,
    stock,
    pageNumber,
    pageSize,
  } = reqQuery;

  pageSize = pageSize || 10;

  let query = Product.find().populate("category");

  if (category) {
    const existCategory = await Category.findOne({ name: category });
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
  if (sizes) {
    const sizesSet = new Set(sizes);
    query = query.where("sizes.name").in([...sizesSet]);
  }

  if (minPrice && maxPrice) {
    query = query.where("discountedPrice").gte(minPrice).lte(maxPrice);
  }

  //console.log("CHECKING", minDiscount)
  if (minDiscount) {
    query = query.where("discountedPersent").gt(minDiscount);
  }

  if (stock) {
    if (stock == "in_stock") {
      query = query.where("quantity").gt(0);
    } else if (stock == "out_of_stock") {
      query = query.where("quantity").gt(1);
    }
  }

  if (sort) {
    const sortDirection = sort === "price_high" ? -1 : 1;
    query = query.sort({ discountedPrice: sortDirection });
  }

  const totalProducts = await Product.countDocuments(query);
  const skip = (pageNumber - 1) * pageSize;
  query = query.skip(skip).limit(pageSize);
  const products = await query.exec();
  const totalPages = Math.ceil(totalProducts / pageSize);

  return { content: products, curentPage: pageNumber, totalPages };
}

async function createMultipleProduct(products) {
  for (let product of products) {
    await createProduct(product);
  }
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



const predictImage = (imagePath) => {
  return new Promise((resolve, reject) => {
    const pythonProcess = spawn("python", ["predict.py", imagePath]);

    pythonProcess.stdout.on("data", (data) => {
      const prediction = data.toString().trim();
      resolve(prediction);
    });

    pythonProcess.stderr.on("data", (data) => {
      reject(data.toString());
    });

    pythonProcess.on("close", (code) => {
      if (code !== 0) {
        reject(`Python process exited with code ${code}`);
      }
    });
  });
};

async function searchProductsByImage(imagePath, req) {
  try {
    const predictedLabel = await predictImage(imagePath);

    // Search for products with a title, brand, or category name similar to the predicted label
    const regexPattern = new RegExp(predictedLabel, "i");

    const categories = await Category.find({ name: regexPattern });
    const products = await Product.find({
      $or: [
        { title: regexPattern },
        { brand: regexPattern },
        { category: { $in: categories.map((category) => category._id) } },
      ],
    }).populate("category");

    return products;
  } catch (error) {
    throw new Error(`Error searching products by image: ${error.message}`);
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
  predictImage,
  searchProductsByImage,
};
