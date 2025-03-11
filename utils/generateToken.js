const jwt = require('jsonwebtoken');

// Access token oluşturma
const generateAccessToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: '2h' // 2 saat
  });
};

// Refresh token oluşturma
const generateRefreshToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: '30d' // 30 gün
  });
};

module.exports = { generateAccessToken, generateRefreshToken };
