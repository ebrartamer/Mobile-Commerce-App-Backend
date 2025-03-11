const jwt = require('jsonwebtoken');

// Access token oluşturma
const generateAccessToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: '30m' // 30 dakika
  });
};

// Refresh token oluşturma
const generateRefreshToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: '7d' // 7 gün
  });
};

module.exports = { generateAccessToken, generateRefreshToken };
