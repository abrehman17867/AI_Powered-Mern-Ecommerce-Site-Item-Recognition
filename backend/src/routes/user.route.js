const express = require("express");
const router = express.Router();
const userController = require("../controller/user.controller");
const authenticate = require("../middleware/authenticate");

router.get("/profile", userController.getUserProfile);
router.put("/:userId/profile/update", authenticate, userController.updateUserProfile);
router.put("/:userId/password", authenticate, userController.changePassword);
router.get("/", userController.getAllUsers);

module.exports = router;
