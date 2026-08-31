const ratingService = require("../services/rating.service");

const createRating = async (req, res) => {
  const user = req.user;
  try {
    const result = await ratingService.createRating(req.body, user);
    if (result.message === "You have already rated this product.") {
      return res.status(200).send({ message: result.message, rating: result.rating });
    }
    return res.status(201).send({ message: result.message, rating: result.rating });
  } catch (error) {
    return res.status(500).send({ error: error.message });
  }
};

// const getAllRatings = async (req, res) => {
//   const productId = req.params.productId;
//   try {
//     const {ratings} = await ratingService.getAllRatings(productId);
//     if (ratings.length === 0) {
//       return res.status(200).send({ message: "This product has no ratings." });
//     }
//     return res.status(200).send(ratings);
//   } catch (error) {
//     return res.status(500).send({ error: error.message });
//   }
// };


const getAllRatings = async (req, res) => {
  const productId = req.params.productId;
  try {
    const { ratings, totalRating } = await ratingService.getAllRatings(productId);
    if (ratings.length === 0) {
      return res.status(200).send({ message: "This product has no ratings.", totalRating: 0 });
    }
    return res.status(200).send({ ratings, totalRating });
  } catch (error) {
    return res.status(500).send({ error: error.message });
  }
};

module.exports = {
  createRating,
  getAllRatings,
};
