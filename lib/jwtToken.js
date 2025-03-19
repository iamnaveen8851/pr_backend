const jwt = require("jsonwebtoken");

const generateToken = (payload, jwt_secret) => {
  const token = jwt.sign(payload, jwt_secret, { expiresIn: "2d" });
  return token;
};

module.exports = generateToken;
