const Rating = require("../models/rating.model");
const productService = require("../services/product.service");

async function createRating(reqData, user) {
  const product = await productService.findProductById(reqData.productId);
  const existingRating = await Rating.findOne({ product: product._id, user: user._id });
  if (existingRating) {
    return { rating: existingRating, message: "You have already rated this product." };
  }

  const rating = new Rating({
    product: product._id,
    user: user._id,
    rating: reqData.rating,
    createdAt: new Date(),
  });

  await rating.save();
  return { rating, message: "Rating created successfully." };
}

async function getAllRatings(productId) {
  const ratings = await Rating.find({ product: productId }).populate("user");
  const totalRating = ratings.length;
  return { ratings, totalRating };
}

module.exports = {
  createRating,
  getAllRatings,
};
