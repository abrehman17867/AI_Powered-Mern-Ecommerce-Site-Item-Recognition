const cartService = require("../services/cart.service");

const findUserCart = async (req, res) => {
  const user = req.user;
  try {
    const cart = await cartService.findUserCart(user._id);
    return res.status(200).send(cart);
  } catch (error) {
    return res.status(500).send({ error: error.message });
  }
};

// Returns the refreshed cart so the client does not need a follow-up GET.
const addItemToCart = async (req, res) => {
  const user = req.user;
  try {
    await cartService.addCartItem(user._id, req.body);
    const cart = await cartService.findUserCart(user._id);
    return res.status(200).send(cart);
  } catch (error) {
    return res.status(500).send({ error: error.message });
  }
};

module.exports = {
  findUserCart,
  addItemToCart,
};
