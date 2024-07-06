const User = require("../models/user.model");
const orderService = require("../services/order.service");

const createOrder = async (req, res) => {
  const user = await req.user;
  try {
    let createdOrder = await orderService.createOrder(user, req.body);
    return res.status(201).send(createdOrder);
  } catch (error) {
    return res.status(500).send({ error: error.message });
  }
};

const findOrderById = async (req, res) => {
   const user = await req.user;
  //const user = await User.findById(req.user._id).populate("address");
  try {
    let createdOrder = await orderService.findOrderById(req.params.id);
    return res.status(201).send(createdOrder);
  } catch (error) {
    return res.status(500).send({ error: error.message });
  }
};

// const orderHistory = async (req, res) => {
//   const user = await req.user;
//   try {
//     let createdOrder = await orderService.userOrderHistory(user._id);
//     return res.status(201).send(createdOrder);
//   } catch (error) {
//     return res.status(500).send({ error: error.message });
//   }
// };


const orderHistory = async (req, res) => {
  try {
    const userId = req.user._id;
   // console.log("User ID:", userId);
    const userOrderHistory = await orderService.userOrderHistory(userId);
   // console.log("User Order History:", userOrderHistory);
    if (userOrderHistory.length === 0) {
      return res.status(404).send({ message: "No orders found for this user." });
    }
    return res.status(200).send(userOrderHistory);
  } catch (error) {
    console.error("Error fetching order history:", error);
    
    return res.status(500).send({ error: "Error fetching order history." });
  }
};


module.exports = {
  createOrder,
  findOrderById,
  orderHistory,
};
