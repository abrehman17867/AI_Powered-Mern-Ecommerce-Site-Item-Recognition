const reviewService = require("../services/review.service");

// const createReview = async (req, res) => {
//   const user = req.user;
//   try {
//     const review = await reviewService.createReview(req.body, user);
//     return res.status(201).send(review);
//   } catch (error) {
//     return res.status(500).send({ error: error.message });
//   }
// };

const createReview = async (req, res) => {
  const user = req.user;
  try {
    const result = await reviewService.createReview(req.body, user);
    if (result.message === "You have already reviewd this product.") {
      return res.status(200).send({ message: result.message, review: result.review });
    }
    return res.status(201).send({ message: result.message, review: result.review });
  } catch (error) {
    return res.status(500).send({ error: error.message });
  }
};

// const getAllReviews = async (req, res) => {
//   const productId = req.params.productId;
//   try {
//     const reviews = await reviewService.getAllReview(productId);
//     return res.status(200).send(reviews);
//   } catch (error) {
//     return res.status(500).send({ error: error.message });
//   }
// };

const getAllReviews = async (req, res) => {
  const productId = req.params.productId;
  try {
    const { reviews, totalReviews } = await reviewService.getAllReview(productId);
    return res.status(200).send({ reviews, totalReviews });
  } catch (error) {
    return res.status(500).send({ error: error.message });
  }
};

module.exports = {
  createReview,
  getAllReviews,
};


