const express = require('express');
const router = express.Router();
const {
  createProduct,
  updateProduct,
  deleteProduct,
  createBulkProducts,
  getAllCategories,
  getAllBrands,
  createCategory,
  updateCategory,
  deleteCategory,
  getCategoryById
} = require('../controllers/productManagementController');

// Ürün yönetimi rotaları
router.route('/products')
  .post(createProduct);

router.route('/products/bulk')
  .post(createBulkProducts);

router.route('/products/:id')
  .put(updateProduct)
  .delete(deleteProduct);

// Kategori yönetimi rotaları
router.route('/categories')
  .get(getAllCategories)
  .post(createCategory);

router.route('/categories/:id')
  .get(getCategoryById)
  .put(updateCategory)
  .delete(deleteCategory);

// Marka yönetimi rotaları
router.get('/brands', getAllBrands);

module.exports = router; 