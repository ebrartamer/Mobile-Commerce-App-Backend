const asyncHandler = require('express-async-handler');
const Cart = require('../models/Cart');
const Product = require('../models/Product');

// @desc    Kullanıcının sepetini getir
// @route   GET /api/cart
// @access  Private
const getCart = asyncHandler(async (req, res) => {
  let cart = await Cart.findOne({ user: req.user._id });

  // Eğer sepet yoksa boş bir sepet oluştur
  if (!cart) {
    cart = await Cart.create({
      user: req.user._id,
      items: [],
      totalItems: 0,
      totalPrice: 0,
      totalDiscountedPrice: 0
    });
  }

  res.json(cart);
});

// @desc    Sepete ürün ekle
// @route   POST /api/cart
// @access  Private
const addToCart = asyncHandler(async (req, res) => {
  const { productId, quantity = 1, color, size } = req.body;

  // Ürünü kontrol et
  const product = await Product.findById(productId);
  if (!product) {
    res.status(404);
    throw new Error('Ürün bulunamadı');
  }

  // Stok kontrolü
  if (product.stock < quantity) {
    res.status(400);
    throw new Error('Yeterli stok yok');
  }

  // Kullanıcının sepetini bul veya oluştur
  let cart = await Cart.findOne({ user: req.user._id });
  if (!cart) {
    cart = await Cart.create({
      user: req.user._id,
      items: [],
      totalItems: 0,
      totalPrice: 0,
      totalDiscountedPrice: 0
    });
  }

  // Ürün zaten sepette mi kontrol et
  const existingItemIndex = cart.items.findIndex(
    (item) => 
      item.product.toString() === productId && 
      item.color === color && 
      item.size === size
  );

  if (existingItemIndex > -1) {
    // Ürün zaten sepette, miktarı güncelle
    cart.items[existingItemIndex].quantity += quantity;
  } else {
    // Yeni ürün ekle
    cart.items.push({
      product: productId,
      name: product.name,
      image: product.images[0],
      price: product.price,
      discountedPrice: product.discountedPrice,
      quantity,
      color,
      size
    });
  }

  // Sepeti kaydet
  await cart.save();

  res.status(201).json(cart);
});

// @desc    Sepetten ürün çıkar
// @route   DELETE /api/cart/:itemId
// @access  Private
const removeFromCart = asyncHandler(async (req, res) => {
  const itemId = req.params.itemId;

  // Kullanıcının sepetini bul
  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) {
    res.status(404);
    throw new Error('Sepet bulunamadı');
  }

  // Ürünü sepetten çıkar
  cart.items = cart.items.filter((item) => item._id.toString() !== itemId);

  // Sepeti kaydet
  await cart.save();

  res.json(cart);
});

// @desc    Sepetteki ürün miktarını güncelle
// @route   PUT /api/cart/:itemId
// @access  Private
const updateCartItem = asyncHandler(async (req, res) => {
  const itemId = req.params.itemId;
  const { quantity } = req.body;

  if (!quantity || quantity < 1) {
    res.status(400);
    throw new Error('Geçerli bir miktar giriniz');
  }

  // Kullanıcının sepetini bul
  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) {
    res.status(404);
    throw new Error('Sepet bulunamadı');
  }

  // Ürünü bul
  const cartItem = cart.items.find((item) => item._id.toString() === itemId);
  if (!cartItem) {
    res.status(404);
    throw new Error('Ürün sepette bulunamadı');
  }

  // Stok kontrolü
  const product = await Product.findById(cartItem.product);
  if (!product || product.stock < quantity) {
    res.status(400);
    throw new Error('Yeterli stok yok');
  }

  // Miktarı güncelle
  cartItem.quantity = quantity;

  // Sepeti kaydet
  await cart.save();

  res.json(cart);
});

// @desc    Sepeti temizle
// @route   DELETE /api/cart
// @access  Private
const clearCart = asyncHandler(async (req, res) => {
  // Kullanıcının sepetini bul
  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) {
    res.status(404);
    throw new Error('Sepet bulunamadı');
  }

  // Sepeti temizle
  cart.items = [];
  await cart.save();

  res.json({ message: 'Sepet temizlendi', cart });
});

module.exports = {
  getCart,
  addToCart,
  removeFromCart,
  updateCartItem,
  clearCart
}; 