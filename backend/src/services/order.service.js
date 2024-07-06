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
              const orderItem = new OrderItem({
                  product: item.product,
                  quantity: item.quantity,
                  size: item.size,
                  price: item.price,
                  discountedPrice: item.discountedPrice,
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
          shippingAddress: address._id,  // Save the address ID
          orderDate: Date.now(),
          orderStatus: 'PENDING',
      });

      const savedOrder = await createdOrder.save();
      return savedOrder;
  } catch (error) {
      throw new Error(`Error creating order: ${error.message}`);
  }
}

async function findOrderById(orderId) {
  const order = await Order.findById(orderId)
    .populate("user")
    .populate({ path: "orderItems", populate: { path: "product" } })
    .populate("shippingAddress");

  return order;
}

async function userOrderHistory(userId) {
  try {
    const orders = await Order.find({ user: userId })
      .populate({ path: "orderItems", populate: { path: "product" } })
      .populate("shippingAddress")
      .lean();

    return orders;
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

  return await order.save();
}

async function shipOrder(orderId) {
  const order = await findOrderById(orderId);
  order.orderStatus = "SHIPPED";

  return await order.save();
}

async function deliverOrder(orderId) {
  const order = await findOrderById(orderId);
  order.orderStatus = "DELIVERED";

  return await order.save();
}

async function cancelledOrder(orderId) {
  const order = await findOrderById(orderId);
  order.orderStatus = "CANCELLED";

  return await order.save();
}

async function findOrderById(orderId) {
  const order = await Order.findById(orderId)
    .populate("user")
    .populate({ path: "orderItems", populate: { path: "product" } })
    .populate("shippingAddress");

  return order;
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
    .populate({ path: "orderItems", populate: { path: "product" } })
    .lean();
}

async function deleteOrder(orderId) {
  const order = await findOrderById(orderId);
  await Order.findByIdAndDelete(order._id);
}

module.exports = {
  createOrder,
  placeOrder,
  confirmedOrder,
  shipOrder,
  deliverOrder,
  cancelledOrder,
  findOrderById,
  userOrderHistory,
  getAllOrders,
  deleteOrder,
};
