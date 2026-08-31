// const gateway = require("../config/gatewayClient");
// const orderService = require("../services/order.service");

// const createPaymentLink = async (orderId) => {
//   try {
//     const order = await orderService.findOrderById(orderId);

//     const paymentLinkRequest = {
//       amount: order.totalPrice,
//       currency: "USD",
//       options: {
//         submitForSettlement: true,
//       },
//       orderId: order._id.toString(), 
//       customer: {
//         firstName: order.user.firstName,
//         lastName: order.user.lastName,
//         email: order.user.email,
//         phone: order.user.mobile,
//       },
//       returnUrl: `http://localhost:3000/payment/${orderId}`,
//       cancelUrl: `http://localhost:3000/payment/cancel/${orderId}`,
//     };

//     const { clientToken } = await gateway.clientToken.generate();


//     const paymentLinkId = clientToken.substring(0, 16); 
//     const payment_link_url = `http://paymentgateway.com/${paymentLinkId}`; 

//     const resData = {
//       paymentLinkId,
//       payment_link_url,
//     };

//     return resData;
//   } catch (error) {
//     throw new Error(error.message);
//   }
// };

// const updatePaymentInformation = async (reqData) => {
//   const orderId = reqData.order_id;
//   const transactionId = reqData.transaction_id;

//   try {
//     const order = await orderService.findOrderById(orderId);

//     // You can handle the update logic based on transaction status
//     // For simplicity, I'm just marking the payment as completed
//     order.paymentDetails.transactionId = transactionId;
//     order.paymentDetails.status = "COMPLETED";
//     order.orderStatus = "PLACED";

//     await order.save();

//     const resData = { message: "Your order is placed", success: true };
//     return resData;
//   } catch (error) {
//     throw new Error(error.message);
//   }
// };

// module.exports = {
//   createPaymentLink,
//   updatePaymentInformation,
// };

