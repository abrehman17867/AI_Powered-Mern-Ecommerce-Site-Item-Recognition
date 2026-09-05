const crypto = require("crypto");
const cartService = require("../services/cart.service");
const Address = require("../models/address.model");
const Order = require("../models/order.model");
const OrderItem = require("../models/orderItems");



// async function createOrder(user, shippingAddress) {
//   try {
//       if (!user || !user._id) {
//           throw new Error("Invalid user data. User ID is missing.");
//       }

//       const cart = await cartService.findUserCart(user._id);
//       if (!cart) {
//           throw new Error("Cart not found for the user.");
//       }

//       let address;
//       if (shippingAddress && shippingAddress._id) {
//           address = await Address.findById(shippingAddress._id);
//           if (!address) {
//               address = new Address(shippingAddress);
//               await address.save();
//           }
//       } else if (shippingAddress) {
//           address = new Address(shippingAddress);
//           await address.save();
//       } else {
//           throw new Error("Invalid shipping address data.");
//       }

//       const orderItems = [];
//       if (cart.cartItems && cart.cartItems.length > 0) {
//           for (const item of cart.cartItems) {
//               const orderItem = new OrderItem({
//                   product: item.product,
//                   quantity: item.quantity,
//                   size: item.size,
//                   price: item.price,
//                   discountedPrice: item.discountedPrice,
//                   userId: user._id,
//               });
//               const createdOrderItem = await orderItem.save();
//               orderItems.push(createdOrderItem);
//           }
//       } else {
//           throw new Error("Cart is empty. Cannot create an order without items.");
//       }

//       if (orderItems.length === 0) {
//           throw new Error("No items added to the order.");
//       }

//       const createdOrder = new Order({
//           user: user._id,
//           orderItems,
//           totalPrice: cart.totalPrice,
//           totalDiscountedPrice: cart.totalDiscountedPrice,
//           discounte: cart.discounte,
//           totalItem: cart.totalItem,
//           shippingAddress: address,
//           orderDate: Date.now(),
//           orderStatus: 'PENDING',
//       });

//       const savedOrder = await createdOrder.save();
//       return savedOrder;
//   } catch (error) {
//       throw new Error(`Error creating order: ${error.message}`);
//   }
// }

async function createOrder(user, shippingAddress) {
  try {
      if (!user || !user._id) {
          throw new Error("Invalid user data. User ID is missing.");
      }

      const cart = await cartService.findUserCart(user._id);
      if (!cart) {
          throw new Error("Cart not found for the user.");
      }

      let address;
      if (shippingAddress && shippingAddress._id) {
          address = await Address.findById(shippingAddress._id);
          if (!address) {
              throw new Error("Shipping address not found.");
          }
      } else if (shippingAddress) {
          address = new Address({
              ...shippingAddress,
              user: user._id,
          });
          await address.save();
      } else {
          throw new Error("Invalid shipping address data.");
      }

      const orderItems = [];
      if (cart.cartItems && cart.cartItems.length > 0) {
          for (const item of cart.cartItems) {
              const product = item.product;
              const qty = Math.max(1, Number(item.quantity) || 1);
              const unitPrice = product?.price ?? item.price;
              const unitDisc = product?.discountedPrice ?? item.discountedPrice;
              const orderItem = new OrderItem({
                  product: product?._id ?? item.product,
                  quantity: qty,
                  size: item.size,
                  price: unitPrice,
                  discountedPrice: unitDisc,
                  userId: user._id,
              });
              const createdOrderItem = await orderItem.save();
              orderItems.push(createdOrderItem);
          }
      } else {
          throw new Error("Cart is empty. Cannot create an order without items.");
      }

      const createdOrder = new Order({
          user: user._id,
          orderItems,
          totalPrice: cart.totalPrice,
          totalDiscountedPrice: cart.totalDiscountedPrice,
          discounte: cart.discounte,
          totalItem: cart.totalItem,
          shippingAddress: address._id,
          orderDate: Date.now(),
          orderStatus: "PENDING",
      });

      createdOrder.trackingNumber = await generateTrackingNumber();
      appendStatus(createdOrder, "PENDING", "Order placed");

      const savedOrder = await createdOrder.save();
      await cartService.clearUserCart(user._id);
      return savedOrder;
  } catch (error) {
      throw new Error(`Error creating order: ${error.message}`);
  }
}


// Tracking references are quoted over the phone and typed by hand, so the
// alphabet omits the characters people confuse: I/1, O/0, S/5, B/8.
const TRACKING_ALPHABET = "ACDEFGHJKLMNPQRTUVWXYZ234679";

function randomTrackingNumber() {
  let body = "";
  for (let i = 0; i < 9; i += 1) {
    body += TRACKING_ALPHABET[crypto.randomInt(0, TRACKING_ALPHABET.length)];
  }
  return `EC-${body.slice(0, 3)}-${body.slice(3, 6)}-${body.slice(6, 9)}`;
}

/**
 * Allocate a tracking number that is not already taken.
 *
 * The field carries a unique index, so a collision would surface as a write
 * error; retrying a handful of times is cheaper than locking.
 */
async function generateTrackingNumber() {
  for (let attempt = 0; attempt < 6; attempt += 1) {
    const candidate = randomTrackingNumber();
    const clash = await Order.exists({ trackingNumber: candidate });
    if (!clash) return candidate;
  }
  throw new Error("Could not allocate a tracking number");
}

/**
 * Record a status transition, keeping the history append-only and free of
 * consecutive duplicates.
 */
function appendStatus(order, status, note) {
  const history = order.statusHistory || [];
  const last = history[history.length - 1];
  if (last && last.status === status) return;
  history.push({ status, at: new Date(), note });
  order.statusHistory = history;
}

/** Backfills a tracking number for orders placed before the field existed. */
async function ensureTrackingNumber(order) {
  if (order.trackingNumber) return order.trackingNumber;
  order.trackingNumber = await generateTrackingNumber();
  return order.trackingNumber;
}

// Product images are stored as base64 data URIs on the document, so every
// populate of a product would otherwise ship the full image inline. Order
// views only need the product metadata.
const ORDER_PRODUCT_FIELDS = "-imageUrl -images";
const ORDER_USER_FIELDS = "-password";

/**
 * Shapes an order for the wire: points each product image at the streaming
 * endpoint (the documents hold multi-hundred-KB base64 data URIs) and drops
 * the buyer's password hash, which populate("user") would otherwise include.
 */
function serializeOrder(order) {
  if (!order) return order;
  const json = typeof order.toJSON === "function" ? order.toJSON() : order;
  for (const item of json.orderItems || []) {
    const product = item?.product;
    if (product?._id) product.imageUrl = `/api/products/${product._id}/image`;
  }
  if (json.user?.password) delete json.user.password;
  return json;
}

async function findOrderById(orderId) {
  const order = await Order.findById(orderId)
    .populate({ path: "user", select: ORDER_USER_FIELDS })
    .populate({
      path: "orderItems",
      populate: { path: "product", select: ORDER_PRODUCT_FIELDS },
    })
    .populate("shippingAddress");

  return order;
}

async function userOrderHistory(userId) {
  try {
    const orders = await Order.find({ user: userId })
      .populate({
        path: "orderItems",
        populate: { path: "product", select: ORDER_PRODUCT_FIELDS },
      })
      .populate("shippingAddress")
      .lean();

    return orders.map(serializeOrder);
  } catch (error) {
    throw new Error(error.message);
  }
}

async function placeOrder(orderId) {
  try {
      const order = await findOrderById(orderId);
      if (!order) {
          throw new Error("Order not found.");
      }

      order.paymentDetails.status = "COMPLETED";
      const updatedOrder = await order.save();
      return updatedOrder;
  } catch (error) {
      console.error("Error placing order:", error);
      throw new Error("Unable to place order. Please try again later.");
  }
}

async function confirmedOrder(orderId) {
  const order = await findOrderById(orderId);
  order.orderStatus = "CONFIRMED";
  await ensureTrackingNumber(order);
  appendStatus(order, "CONFIRMED", "Order confirmed");

  return serializeOrder(await order.save());
}

async function shipOrder(orderId) {
  const order = await findOrderById(orderId);
  order.orderStatus = "SHIPPED";
  await ensureTrackingNumber(order);
  appendStatus(order, "SHIPPED", "Shipped");

  return serializeOrder(await order.save());
}

async function deliverOrder(orderId) {
  const order = await findOrderById(orderId);
  order.orderStatus = "DELIVERED";
  await ensureTrackingNumber(order);
  appendStatus(order, "DELIVERED", "Delivered");

  return serializeOrder(await order.save());
}

async function cancelledOrder(orderId) {
  const order = await findOrderById(orderId);
  order.orderStatus = "CANCELLED";
  await ensureTrackingNumber(order);
  appendStatus(order, "CANCELLED", "Order cancelled");

  return serializeOrder(await order.save());
}




// async function userOrderHistory(userId) {
//   try {
//     const orders = await Order.find({ user: userId })
//       .populate({ path: "orderItems", populate: { path: "product" } })
//       .lean();

//     return orders;
//   } catch (error) {
//     throw new Error(error.message);
//   }
// }

async function getAllOrders() {
  return await Order.find()
    .populate({
      path: "orderItems",
      populate: { path: "product", select: ORDER_PRODUCT_FIELDS },
    })
    .populate({ path: "user", select: ORDER_USER_FIELDS })
    .lean()
    .then((orders) => orders.map(serializeOrder));
}

async function deleteOrder(orderId) {
  const order = await findOrderById(orderId);
  await Order.findByIdAndDelete(order._id);
}

module.exports = {
  createOrder,
  generateTrackingNumber,
  ensureTrackingNumber,
  appendStatus,
  placeOrder,
  confirmedOrder,
  shipOrder,
  deliverOrder,
  cancelledOrder,
  findOrderById,
  serializeOrder,
  userOrderHistory,
  getAllOrders,
  deleteOrder,
};
