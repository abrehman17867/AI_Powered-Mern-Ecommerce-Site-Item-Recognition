const Review = require("../models/review.model");
const productService = require("../services/product.service");

async function createReview(reqData, user) {
  const product = await productService.findProductById(reqData.productId);
  const existingReview= await Review.findOne({ product: product._id, user: user._id });
  if (existingReview) {
    return { review: existingReview, message: "You have already review this product." };
  }
  const review = new Review({
    user: user._id,
    product: product._id,
    review: reqData.review,
    createdAt: new Date(),
  });

  await review.save();
  return { review, message: "Review created successfully." };

}

// async function getAllReview(productId) {
//   const product = await productService.findProductById(productId);
//   return await Review.find({ product: productId }).populate("user");
// }

async function getAllReview(productId) {
  const product = await productService.findProductById(productId);
  if (!product) {
    throw new Error("Product not found");
  }

  const reviews = await Review.find({ product: productId }).populate("user");
  const totalReviews = await Review.countDocuments({ product: productId });

  return { reviews, totalReviews };
}


module.exports = {
  createReview,
  getAllReview,
};

