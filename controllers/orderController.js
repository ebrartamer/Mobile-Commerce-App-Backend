const asyncHandler = require('express-async-handler');
const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');

// @desc    Yeni sipariş oluştur
// @route   POST /api/orders
// @access  Private
const createOrder = asyncHandler(async (req, res) => {
  const { 
    shippingAddress, 
    paymentMethod 
  } = req.body;

  // Kullanıcının sepetini bul
  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart || cart.items.length === 0) {
    res.status(400);
    throw new Error('Sepetinizde ürün bulunmuyor');
  }

  // Sipariş öğelerini oluştur
  const orderItems = cart.items.map(item => {
    return {
      name: item.name,
      quantity: item.quantity,
      image: item.image,
      price: item.price,
      discountedPrice: item.discountedPrice,
      product: item.product,
      color: item.color,
      size: item.size
    };
  });

  // Fiyatları hesapla
  const itemsPrice = cart.totalPrice;
  const discountedItemsPrice = cart.totalDiscountedPrice;
  const shippingPrice = discountedItemsPrice > 150 ? 0 : 14.99; // 150 TL üzeri kargo bedava
  const totalPrice = discountedItemsPrice + shippingPrice;

  // Siparişi oluştur
  const order = await Order.create({
    user: req.user._id,
    orderItems,
    shippingAddress,
    paymentMethod,
    itemsPrice,
    discountedItemsPrice,
    shippingPrice,
    totalPrice,
    estimatedDeliveryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 gün sonra
  });

  if (order) {
    // Stok güncelleme
    for (const item of cart.items) {
      const product = await Product.findById(item.product);
      if (product) {
        product.stock -= item.quantity;
        await product.save();
      }
    }

    // Sepeti temizle
    cart.items = [];
    await cart.save();

    res.status(201).json(order);
  } else {
    res.status(400);
    throw new Error('Sipariş oluşturulamadı');
  }
});

// @desc    Kullanıcının siparişlerini getir
// @route   GET /api/orders
// @access  Private
const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
  res.json(orders);
});

// @desc    Sipariş detayını ID'ye göre getir
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (order && order.user.toString() === req.user._id.toString()) {
    res.json(order);
  } else {
    res.status(404);
    throw new Error('Sipariş bulunamadı');
  }
});

// @desc    Siparişi iptal et
// @route   PUT /api/orders/:id/cancel
// @access  Private
const cancelOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    res.status(404);
    throw new Error('Sipariş bulunamadı');
  }

  // Kullanıcının kendi siparişi mi kontrol et
  if (order.user.toString() !== req.user._id.toString()) {
    res.status(401);
    throw new Error('Bu işlem için yetkiniz yok');
  }

  // Sipariş durumunu kontrol et
  if (order.status === 'Kargoya Verildi' || order.status === 'Teslim Edildi') {
    res.status(400);
    throw new Error('Kargoya verilmiş veya teslim edilmiş siparişler iptal edilemez');
  }

  // Siparişi iptal et
  order.status = 'İptal Edildi';
  
  // Stokları geri ekle
  for (const item of order.orderItems) {
    const product = await Product.findById(item.product);
    if (product) {
      product.stock += item.quantity;
      await product.save();
    }
  }

  const updatedOrder = await order.save();
  res.json(updatedOrder);
});

module.exports = {
  createOrder,
  getMyOrders,
  getOrderById,
  cancelOrder
}; 