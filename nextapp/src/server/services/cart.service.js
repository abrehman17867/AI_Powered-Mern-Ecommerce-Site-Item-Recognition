const Cart = require("../models/cart.model");
const CartItem = require("../models/cartItem.model");
const Product = require("../models/product.model");

async function createCart(user) {
  try {
    const cart = new Cart({ user });
    const createdCart = await cart.save();
    return createdCart;
  } catch (error) {
    throw new Error(error.message);
  }
}

// async function findUserCart(userId) {
//   try {
//     let cart = await Cart.findOne({ user: userId });
//     let cartItems = await CartItem.find({ cart: cart._id }).populate("product");
//     cart.cartItems = cartItems;
//     // console.log("cart items",cartItems)

//     let totalPrice = 0;
//     let totalDiscountedPrice = 0;
//     let totalItem = 0;

//     for (let cartItem of cart.cartItems) {
//       totalPrice += cartItem.price;
//       totalDiscountedPrice += cartItem.discountedPrice;
//       totalItem += cartItem.quantity;
//     }

//     cart.totalPrice = totalPrice;
//     cart.totalItem = totalItem;
//     cart.discounte = totalPrice - totalDiscountedPrice;
//    return cart;
//   } catch (error) {
//     throw new Error(error.message);
//   }
// }

async function findUserCart(userId) {
  try {
    let cart = await Cart.findOne({ user: userId });
    if (!cart) {
      return {
        cartItems: [],
        totalPrice: 0,
        totalItem: 0,
        discounte: 0,
        totalDiscountedPrice: 0,
      };
    }
    let cartItems = await CartItem.find({ cart: cart._id }).populate("product");
    cart.cartItems = cartItems;

    //console.log("cart items", cartItems);

    let totalPrice = 0;
    let totalDiscountedPrice = 0;
    let totalItem = 0;

    for (let cartItem of cartItems) {
      const qty = Math.max(1, Number(cartItem.quantity) || 1);
      const unitPrice = cartItem.product?.price ?? cartItem.price;
      const unitDisc =
        cartItem.product?.discountedPrice ?? cartItem.discountedPrice;
      cartItem.price = unitPrice;
      cartItem.discountedPrice = unitDisc;
      totalPrice += unitPrice * qty;
      totalDiscountedPrice += unitDisc * qty;
      totalItem += qty;
    }

    cart.totalPrice = totalPrice;
    cart.totalItem = totalItem;
    cart.discounte = totalPrice - totalDiscountedPrice;

    //   console.log("Total Price : ",totalPrice)
    //   console.log("Total Item : ",totalItem)
    //   console.log("Discounte : ",cart.discounte)
    //   console.log("Total Discounted Price : ",totalDiscountedPrice)

    // return {
    //   _id: cart._id,
    //   user: cart.user,
    //   cartItems: cartItems,
    //   totalPrice: cart.totalPrice,
    //   totalItem: cart.totalItem,
    //   discounte: cart.discounte,
    //   totalDiscountedPrice: cart.totalDiscountedPrice,
    // };

    return {
      _id: cart._id,
      user: cart.user,
      cartItems: cartItems,
      totalPrice: totalPrice,
      totalItem: totalItem,
      discounte: totalPrice - totalDiscountedPrice,
      totalDiscountedPrice: totalDiscountedPrice,
    };

    //return cart
  } catch (error) {
    throw new Error(error.message);
  }
}


// async function addCartItem(userId, req) {
//   try {
//     let cart = await Cart.findOne({ user: userId });
//     if (!cart) {
//       cart = new Cart({ user: userId, cartItems: [] });
//       await cart.save();
//     }

//     const product = await Product.findById(req.productId);
//     if (!product) {
//       return "Product not found";
//     }

//     const isPresent = await CartItem.findOne({
//       cart: cart._id,
//       product: product._id,
//       userId,
//     });

//      if (!isPresent) {
//       const cartItem = new CartItem({
//         product: product._id,
//         cart: cart._id,
//         quantity: 1,
//         userId,
//         price: product.price,
//         size: req.size,
//         discountedPrice: product.discountedPrice,
//       });
//       const createdCartItem = await cartItem.save();
//       cart.cartItems.push(createdCartItem);
//       await cart.save();
//       return createdCartItem;
//     }
//     return isPresent;
//   } catch (error) {
//     console.error("Error adding item to cart:", error);
//     throw new Error(error.message);
//   }
// }

async function addCartItem(userId, req) {
  try {
    let cart = await Cart.findOne({ user: userId });
    if (!cart) {
      cart = new Cart({ user: userId, cartItems: [] });
      await cart.save();
    }

    const product = await Product.findById(req.productId);
    if (!product) {
      return "Product not found";
    }

    const existingCartItem = await CartItem.findOne({
      cart: cart._id,
      product: product._id,
      size: req.size,
      userId,
    });

    const addQty = Math.max(1, parseInt(req.quantity, 10) || 1);

    if (existingCartItem) {
      existingCartItem.quantity += addQty;
      await existingCartItem.save();
      return existingCartItem;
    } else {
      const cartItem = new CartItem({
        product: product._id,
        cart: cart._id,
        quantity: addQty,
        userId,
        price: product.price,
        size: req.size,
        discountedPrice: product.discountedPrice,
      });
      const createdCartItem = await cartItem.save();
      cart.cartItems.push(createdCartItem);
      await cart.save();
      return createdCartItem;
    }
  } catch (error) {
    console.error("Error adding item to cart:", error);
    throw new Error(error.message);
  }
}


async function clearUserCart(userId) {
  const cart = await Cart.findOne({ user: userId });
  if (!cart) return;
  await CartItem.deleteMany({ cart: cart._id, userId });
  cart.cartItems = [];
  await cart.save();
}

module.exports = { createCart, findUserCart, addCartItem, clearUserCart };
