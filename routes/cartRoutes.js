const express = require('express');
const router = express.Router();
const {
  getCart,
  addToCart,
  removeFromCart,
  updateCartItem,
  clearCart
} = require('../controllers/cartController');
const { protect } = require('../middleware/authMiddleware');

// Tüm sepet rotaları korumalıdır
router.use(protect);

// Sepeti getir ve sepete ürün ekle
router.route('/')
  .get(getCart)
  .post(addToCart)
  .delete(clearCart);

// Sepetteki ürünü güncelle veya sil
router.route('/:itemId')
  .put(updateCartItem)
  .delete(removeFromCart);

module.exports = router; 