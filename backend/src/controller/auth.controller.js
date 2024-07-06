const userService = require("../services/user.service");
const jwtProvider = require("../config/jwtProvider");
const bcrypt = require("bcrypt");
const cartService = require("../services/cart.service");

const register = async (req, res) => {
  try {
    const userData = {
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      password: req.body.password,
      mobile: req.body.mobile,
      role: req.body.role || "CUSTOMER",
    };

    // Prevent regular users from registering as admin
    if (userData.role === "ADMIN" && !req.user) {
      return res.status(403).send({ message: "Cannot register as admin" });
    }

    const addressData = {
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      streetAddress: req.body.streetAddress,
      city: req.body.city,
      state: req.body.state,
      zipCode: req.body.zipCode,
      mobile: req.body.mobile,
    };

    const user = await userService.createUser(userData, addressData);
    const jwt = jwtProvider.generateToken(user._id);

    await cartService.createCart(user);
    return res.status(200).send({ jwt, message: "register success" });
  } catch (error) {
    return res.status(500).send({ error: error.message });
  }
};

const login = async (req, res) => {
  const { password, email } = req.body;

  try {
    const user = await userService.getUserByEmail(email);
    if (!user) {
      return res
        .status(404)
        .send({ message: "User not found with email: " + email });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).send({ message: "Invalid Password..." });
    }

    const jwt = jwtProvider.generateToken(user._id);

    const role = user.role;
    let message;
    if (role === "ADMIN") {
      message = "Admin login success";
    } else {
      message = "Customer login success";
    }

    return res.status(200).send({ jwt, role, message });
  } catch (error) {
    return res.status(500).send({ error: error.message });
  }
};

module.exports = { register, login };
