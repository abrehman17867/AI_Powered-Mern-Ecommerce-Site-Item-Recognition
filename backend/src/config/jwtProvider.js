const jwt = require("jsonwebtoken");
require('dotenv').config()

const secretKey = process.env.SECRET_KEY;

const generateToken = (userId) => {
  const token = jwt.sign({ userId }, secretKey, { expiresIn: "48h" });
  return token;
};

const getUserIdFromToken = (token) => {
  const decodedToken = jwt.verify(token, secretKey);
  return decodedToken.userId;
};

module.exports = { generateToken, getUserIdFromToken };
