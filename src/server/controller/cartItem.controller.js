const cartItemService = require("../services/cartItem.service");
const cartService = require("../services/cart.service");

// These endpoints return the whole refreshed cart rather than just the touched
// item. The client used to follow every mutation with a second GET /api/cart
// to pick up the new totals, so a single quantity tap cost two sequential
// round trips with the row frozen in between.
const updateCartItem = async (req, res) => {
  const user = await req.user;
  try {
    await cartItemService.updateCartItem(user._id, req.params.id, req.body);
    const cart = await cartService.findUserCart(user._id);
    return res.status(200).send(cart);
  } catch (error) {
    return res.status(500).send({ error: error.message });
  }
};

const removeCartItem = async (req, res) => {
  const user = await req.user;
  try {
    await cartItemService.removeCartItem(user._id, req.params.id);
    const cart = await cartService.findUserCart(user._id);
    return res.status(200).send(cart);
  } catch (error) {
    return res.status(500).send({ error: error.message });
  }
};

module.exports = {
  updateCartItem,
  removeCartItem,
};
