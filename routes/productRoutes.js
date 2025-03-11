const express = require('express');
const router = express.Router();
const {
  getProducts,
  getProductById,
  getFeaturedProducts,
  getProductsByCategory,
  createProductReview,
  getCategories,
  getBrands
} = require('../controllers/productController');
const { protect } = require('../middleware/authMiddleware');

// Ürün listeleme ve filtreleme
router.get('/', getProducts);

// Öne çıkan ürünleri getir
router.get('/featured', getFeaturedProducts);

// Kategorileri getir
router.get('/categories', getCategories);

// Markaları getir
router.get('/brands', getBrands);

// Kategoriye göre ürünleri getir
router.get('/category/:category', getProductsByCategory);

// Ürün değerlendirmesi ekle
router.post('/:id/reviews', protect, createProductReview);

// Ürün detayını getir (en sona koy, diğer rotalarla çakışmaması için)
router.get('/:id', getProductById);

module.exports = router;
