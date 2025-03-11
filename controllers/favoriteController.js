const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const Product = require('../models/Product');

// @desc    Favori ürünleri getir
// @route   GET /api/favorites
// @access  Private
const getFavorites = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate('favorites');
  
  if (!user) {
    res.status(404);
    throw new Error('Kullanıcı bulunamadı');
  }
  
  res.json(user.favorites);
});

// @desc    Ürünü favorilere ekle
// @route   POST /api/favorites
// @access  Private
const addToFavorites = asyncHandler(async (req, res) => {
  const { productId } = req.body;
  
  if (!productId) {
    res.status(400);
    throw new Error('Ürün ID\'si gerekli');
  }
  
  // Ürünü kontrol et
  const product = await Product.findById(productId);
  if (!product) {
    res.status(404);
    throw new Error('Ürün bulunamadı');
  }
  
  const user = await User.findById(req.user._id);
  
  // Ürün zaten favorilerde mi kontrol et
  if (user.favorites.includes(productId)) {
    res.status(400);
    throw new Error('Ürün zaten favorilerinizde');
  }
  
  // Favorilere ekle
  user.favorites.push(productId);
  await user.save();
  
  res.status(201).json({ message: 'Ürün favorilere eklendi', favorites: user.favorites });
});

// @desc    Ürünü favorilerden çıkar
// @route   DELETE /api/favorites/:productId
// @access  Private
const removeFromFavorites = asyncHandler(async (req, res) => {
  const productId = req.params.productId;
  
  const user = await User.findById(req.user._id);
  
  // Ürün favorilerde mi kontrol et
  if (!user.favorites.includes(productId)) {
    res.status(400);
    throw new Error('Ürün favorilerinizde değil');
  }
  
  // Favorilerden çıkar
  user.favorites = user.favorites.filter(
    (favorite) => favorite.toString() !== productId
  );
  
  await user.save();
  
  res.json({ message: 'Ürün favorilerden çıkarıldı', favorites: user.favorites });
});

// @desc    Ürünün favori durumunu kontrol et
// @route   GET /api/favorites/:productId/check
// @access  Private
const checkFavoriteStatus = asyncHandler(async (req, res) => {
  const productId = req.params.productId;
  
  const user = await User.findById(req.user._id);
  
  const isFavorite = user.favorites.some(
    (favorite) => favorite.toString() === productId
  );
  
  res.json({ isFavorite });
});

module.exports = {
  getFavorites,
  addToFavorites,
  removeFromFavorites,
  checkFavoriteStatus
}; 