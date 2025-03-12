const asyncHandler = require('express-async-handler');
const Product = require('../models/Product');

// @desc    Tüm ürünleri getir (filtreleme ve sıralama ile)
// @route   GET /api/products
// @access  Public
const getProducts = asyncHandler(async (req, res) => {
  // Sayfalama için
  const pageSize = 10;
  const page = Number(req.query.page) || 1;

  // Filtreleme için
  const keyword = req.query.keyword
    ? {
        $or: [
          { name: { $regex: req.query.keyword, $options: 'i' } },
          { brand: { $regex: req.query.keyword, $options: 'i' } },
          { description: { $regex: req.query.keyword, $options: 'i' } }
        ]
      }
    : {};

  // Kategori filtresi
  const categoryFilter = req.query.category ? { category: req.query.category } : {};
  
  // Marka filtresi
  const brandFilter = req.query.brand ? { brand: req.query.brand } : {};
  
  // Fiyat aralığı filtresi
  const priceFilter = {};
  if (req.query.minPrice) {
    priceFilter.price = { ...priceFilter.price, $gte: Number(req.query.minPrice) };
  }
  if (req.query.maxPrice) {
    priceFilter.price = { ...priceFilter.price, $lte: Number(req.query.maxPrice) };
  }
  
  // Sıralama için
  let sortOption = {};
  if (req.query.sort) {
    switch (req.query.sort) {
      case 'price-asc':
        sortOption = { price: 1 };
        break;
      case 'price-desc':
        sortOption = { price: -1 };
        break;
      case 'rating-desc':
        sortOption = { rating: -1 };
        break;
      case 'newest':
        sortOption = { createdAt: -1 };
        break;
      default:
        sortOption = { createdAt: -1 };
    }
  } else {
    sortOption = { createdAt: -1 }; // Varsayılan sıralama: en yeni
  }

  // Sadece aktif ürünleri getir
  const activeFilter = { isActive: true };

  // Tüm filtreleri birleştir
  const filter = {
    ...keyword,
    ...categoryFilter,
    ...brandFilter,
    ...priceFilter,
    ...activeFilter
  };

  // Toplam ürün sayısını hesapla
  const count = await Product.countDocuments(filter);

  // Ürünleri getir
  const products = await Product.find(filter)
    .sort(sortOption)
    .limit(pageSize)
    .skip(pageSize * (page - 1));

  res.json({
    products,
    page,
    pages: Math.ceil(count / pageSize),
    totalProducts: count
  });
});

// @desc    Tek bir ürünü ID'ye göre getir
// @route   GET /api/products/:id
// @access  Public
const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (product && product.isActive) {
    res.json(product);
  } else {
    res.status(404);
    throw new Error('Ürün bulunamadı');
  }
});

// @desc    Öne çıkan ürünleri getir
// @route   GET /api/products/featured
// @access  Public
const getFeaturedProducts = asyncHandler(async (req, res) => {
  const limit = Number(req.query.limit) || 8;
  
  const products = await Product.find({ isActive: true, isFeatured: true })
    .sort({ createdAt: -1 })
    .limit(limit);

  res.json(products);
});

// @desc    Kategoriye göre ürünleri getir
// @route   GET /api/products/category/:category
// @access  Public
const getProductsByCategory = asyncHandler(async (req, res) => {
  const pageSize = 10;
  const page = Number(req.query.page) || 1;
  
  const count = await Product.countDocuments({ 
    category: req.params.category,
    isActive: true
  });
  
  const products = await Product.find({ 
    category: req.params.category,
    isActive: true
  })
    .sort({ createdAt: -1 })
    .limit(pageSize)
    .skip(pageSize * (page - 1));

  res.json({
    products,
    page,
    pages: Math.ceil(count / pageSize),
    totalProducts: count
  });
});

// @desc    Ürüne değerlendirme ekle
// @route   POST /api/products/:id/reviews
// @access  Private
const createProductReview = asyncHandler(async (req, res) => {
  const { rating, comment } = req.body;

  if (!rating || !comment) {
    res.status(400);
    throw new Error('Lütfen puan ve yorum giriniz');
  }

  const product = await Product.findById(req.params.id);

  if (!product) {
    res.status(404);
    throw new Error('Ürün bulunamadı');
  }

  // Kullanıcının daha önce değerlendirme yapıp yapmadığını kontrol et
  const alreadyReviewed = product.reviews.find(
    (r) => r.user.toString() === req.user._id.toString()
  );

  if (alreadyReviewed) {
    res.status(400);
    throw new Error('Bu ürünü zaten değerlendirdiniz');
  }

  const review = {
    name: req.user.name,
    rating: Number(rating),
    comment,
    user: req.user._id
  };

  // Değerlendirmeyi ekle ve ortalama puanı güncelle
  await product.addReview(review);

  res.status(201).json({ message: 'Değerlendirme eklendi' });
});

// @desc    Tüm kategorileri getir
// @route   GET /api/products/categories
// @access  Public
const getCategories = asyncHandler(async (req, res) => {
  const categories = await Product.distinct('category', { isActive: true });
  res.json(categories);
});

// @desc    Tüm markaları getir
// @route   GET /api/products/brands
// @access  Public
const getBrands = asyncHandler(async (req, res) => {
  // Aktif ürünlerin marka ve logo bilgilerini getir
  const products = await Product.find({ isActive: true }).select('brand brandLogo');
  
  // Marka ve logo bilgilerini birleştir
  const brandsMap = {};
  products.forEach(product => {
    if (product.brand && !brandsMap[product.brand]) {
      brandsMap[product.brand] = product.brandLogo || '';
    }
  });
  
  // Marka ve logo bilgilerini dizi olarak formatla
  const brands = Object.keys(brandsMap).map(brand => ({
    name: brand,
    logo: brandsMap[brand]
  }));
  
  res.json(brands);
});

module.exports = {
  getProducts,
  getProductById,
  getFeaturedProducts,
  getProductsByCategory,
  createProductReview,
  getCategories,
  getBrands
};
