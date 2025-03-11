const express = require('express');
const router = express.Router();
const {
  createOrder,
  getMyOrders,
  getOrderById,
  cancelOrder
} = require('../controllers/orderController');
const { protect } = require('../middleware/authMiddleware');

// Tüm sipariş rotaları korumalıdır
router.use(protect);

// Sipariş oluştur ve kullanıcının siparişlerini getir
router.route('/')
  .post(createOrder)
  .get(getMyOrders);

// Sipariş detayını getir
router.route('/:id')
  .get(getOrderById);

// Siparişi iptal et
router.route('/:id/cancel')
  .put(cancelOrder);

module.exports = router; 