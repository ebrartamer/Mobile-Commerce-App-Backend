const express = require('express');
const router = express.Router();
const {
  getFavorites,
  addToFavorites,
  removeFromFavorites,
  checkFavoriteStatus
} = require('../controllers/favoriteController');
const { protect } = require('../middleware/authMiddleware');

// Tüm favori rotaları korumalıdır
router.use(protect);

// Favorileri getir ve favorilere ekle
router.route('/')
  .get(getFavorites)
  .post(addToFavorites);

// Favori durumunu kontrol et
router.route('/:productId/check')
  .get(checkFavoriteStatus);

// Favorilerden çıkar
router.route('/:productId')
  .delete(removeFromFavorites);

module.exports = router; 