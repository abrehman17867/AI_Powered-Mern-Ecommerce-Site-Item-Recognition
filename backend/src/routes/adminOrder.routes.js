const express = require("express");
const router = express.Router();
const authenticate = require("../middleware/authenticate");
const orderController = require("../controller/adminOrder.controller");
const isAdmin = require("../middleware/isAdmin");

router.get("/", authenticate,isAdmin, orderController.getAllOrders);
router.put(
  "/:orderId/confirmed",
  authenticate,isAdmin,
  orderController.confirmedOrders
);
router.put("/:orderId/ship", authenticate,isAdmin, orderController.shippOrders);
router.put("/:orderId/deliver", authenticate,isAdmin, orderController.deliverOrders);
router.put("/:orderId/cancel", authenticate,isAdmin, orderController.cancelledOrders);
router.put("/:orderId/delete", authenticate,isAdmin, orderController.deleteOrders);

module.exports = router;
