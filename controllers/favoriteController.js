const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const Product = require('../models/Product');
const mongoose = require('mongoose');

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
  
  if (!mongoose.Types.ObjectId.isValid(productId)) {
    res.status(400);
    throw new Error('Geçersiz ürün ID formatı');
  }
  
  const product = await Product.findById(productId);
  if (!product) {
    res.status(404);
    throw new Error('Ürün bulunamadı');
  }
  
  const user = await User.findById(req.user._id);
  if (!user) {
    res.status(404);
    throw new Error('Kullanıcı bulunamadı');
  }
  
  if (user.favorites.includes(productId)) {
    res.status(400);
    throw new Error('Ürün zaten favorilerinizde');
  }
  
  user.favorites.push(productId);
  await user.save();
  
  res.status(201).json({ 
    success: true,
    message: 'Ürün favorilere eklendi', 
    favorites: user.favorites 
  });
});

// @desc    Ürünü favorilerden çıkar
// @route   DELETE /api/favorites/:productId
// @access  Private
const removeFromFavorites = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  
  if (!mongoose.Types.ObjectId.isValid(productId)) {
    res.status(400);
    throw new Error('Geçersiz ürün ID formatı');
  }
  
  const user = await User.findById(req.user._id);
  if (!user) {
    res.status(404);
    throw new Error('Kullanıcı bulunamadı');
  }
  
  if (!user.favorites.includes(productId)) {
    res.status(400);
    throw new Error('Ürün favorilerinizde değil');
  }
  
  user.favorites = user.favorites.filter(
    (favorite) => favorite.toString() !== productId
  );
  
  await user.save();
  
  res.json({ 
    success: true,
    message: 'Ürün favorilerden çıkarıldı', 
    favorites: user.favorites 
  });
});

// @desc    Ürünün favori durumunu kontrol et
// @route   GET /api/favorites/:productId/check
// @access  Private
const checkFavoriteStatus = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  
  if (!mongoose.Types.ObjectId.isValid(productId)) {
    res.status(400);
    throw new Error('Geçersiz ürün ID formatı');
  }
  
  const user = await User.findById(req.user._id);
  if (!user) {
    res.status(404);
    throw new Error('Kullanıcı bulunamadı');
  }
  
  const isFavorite = user.favorites.some(
    (favorite) => favorite.toString() === productId
  );
  
  res.json({ 
    success: true,
    isFavorite 
  });
});

module.exports = {
  getFavorites,
  addToFavorites,
  removeFromFavorites,
  checkFavoriteStatus
}; 