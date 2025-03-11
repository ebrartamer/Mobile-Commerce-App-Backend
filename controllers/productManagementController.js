const asyncHandler = require('express-async-handler');
const Product = require('../models/Product');
const Category = require('../models/Category');

// @desc    Yeni ürün ekle
// @route   POST /api/management/products
// @access  Private
const createProduct = asyncHandler(async (req, res) => {
  const {
    name,
    description,
    brand,
    category,
    subCategory,
    price,
    discountedPrice,
    images,
    variants,
    stock,
    seller,
    tags,
    specifications,
    isFeatured
  } = req.body;

  // Zorunlu alanları kontrol et
  if (!name || !description || !brand || !category || !price || !images || !seller) {
    res.status(400);
    throw new Error('Lütfen tüm zorunlu alanları doldurun');
  }

  // Ürün oluştur
  const product = await Product.create({
    name,
    description,
    brand,
    category,
    subCategory: subCategory || '',
    price,
    discountedPrice: discountedPrice || price,
    images: Array.isArray(images) ? images : [images],
    variants: variants || [],
    stock: stock || 0,
    seller,
    tags: tags || [],
    specifications: specifications || {},
    isFeatured: isFeatured || false
  });

  if (product) {
    res.status(201).json(product);
  } else {
    res.status(400);
    throw new Error('Ürün oluşturulamadı');
  }
});

// @desc    Ürünü güncelle
// @route   PUT /api/management/products/:id
// @access  Private
const updateProduct = asyncHandler(async (req, res) => {
  const productId = req.params.id;
  
  const product = await Product.findById(productId);
  
  if (!product) {
    res.status(404);
    throw new Error('Ürün bulunamadı');
  }
  
  // Ürünü güncelle
  Object.keys(req.body).forEach(key => {
    // images dizisini düzgün şekilde güncelle
    if (key === 'images' && req.body.images) {
      product.images = Array.isArray(req.body.images) ? req.body.images : [req.body.images];
    } 
    // variants dizisini düzgün şekilde güncelle
    else if (key === 'variants' && req.body.variants) {
      product.variants = req.body.variants;
    }
    // tags dizisini düzgün şekilde güncelle
    else if (key === 'tags' && req.body.tags) {
      product.tags = req.body.tags;
    }
    // specifications objesini düzgün şekilde güncelle
    else if (key === 'specifications' && req.body.specifications) {
      product.specifications = req.body.specifications;
    }
    // Diğer alanları güncelle
    else if (key !== '_id' && key !== 'reviews' && key !== 'rating' && key !== 'numReviews') {
      product[key] = req.body[key];
    }
  });
  
  const updatedProduct = await product.save();
  res.json(updatedProduct);
});

// @desc    Ürünü sil
// @route   DELETE /api/management/products/:id
// @access  Private
const deleteProduct = asyncHandler(async (req, res) => {
  const productId = req.params.id;
  
  const product = await Product.findById(productId);
  
  if (!product) {
    res.status(404);
    throw new Error('Ürün bulunamadı');
  }
  
  await Product.deleteOne({ _id: productId });
  
  res.json({ message: 'Ürün başarıyla silindi' });
});

// @desc    Toplu ürün ekle (test için)
// @route   POST /api/management/products/bulk
// @access  Private
const createBulkProducts = asyncHandler(async (req, res) => {
  const { products } = req.body;
  
  if (!products || !Array.isArray(products) || products.length === 0) {
    res.status(400);
    throw new Error('Geçerli bir ürün dizisi gönderilmedi');
  }
  
  // Her ürün için zorunlu alanları kontrol et
  for (const product of products) {
    if (!product.name || !product.description || !product.brand || !product.category || !product.price || !product.images || !product.seller) {
      res.status(400);
      throw new Error('Tüm ürünler için zorunlu alanları doldurun');
    }
    
    // images alanını düzenle
    product.images = Array.isArray(product.images) ? product.images : [product.images];
    
    // Varsayılan değerleri ayarla
    product.discountedPrice = product.discountedPrice || product.price;
    product.stock = product.stock || 0;
    product.variants = product.variants || [];
    product.tags = product.tags || [];
    product.specifications = product.specifications || {};
    product.isFeatured = product.isFeatured || false;
  }
  
  // Toplu ürün ekle
  const createdProducts = await Product.insertMany(products);
  
  res.status(201).json({
    message: `${createdProducts.length} ürün başarıyla eklendi`,
    products: createdProducts
  });
});

// @desc    Tüm kategorileri getir
// @route   GET /api/management/categories
// @access  Private
const getAllCategories = asyncHandler(async (req, res) => {
  const categories = await Product.distinct('category');
  res.json(categories);
});

// @desc    Tüm markaları getir
// @route   GET /api/management/brands
// @access  Private
const getAllBrands = asyncHandler(async (req, res) => {
  const brands = await Product.distinct('brand');
  res.json(brands);
});

// @desc    Yeni kategori oluştur
// @route   POST /api/management/categories
// @access  Private
const createCategory = asyncHandler(async (req, res) => {
  const { name, description, parentCategory, image, isActive } = req.body;

  // Zorunlu alanları kontrol et
  if (!name) {
    res.status(400);
    throw new Error('Kategori adı zorunludur');
  }

  // Kategori oluştur
  const category = await Category.create({
    name,
    description: description || '',
    parentCategory: parentCategory || null,
    image: image || '',
    isActive: isActive !== undefined ? isActive : true
  });

  if (category) {
    res.status(201).json(category);
  } else {
    res.status(400);
    throw new Error('Kategori oluşturulamadı');
  }
});

// @desc    Kategori güncelle
// @route   PUT /api/management/categories/:id
// @access  Private
const updateCategory = asyncHandler(async (req, res) => {
  const categoryId = req.params.id;
  
  const category = await Category.findById(categoryId);
  
  if (!category) {
    res.status(404);
    throw new Error('Kategori bulunamadı');
  }
  
  // Kategoriyi güncelle
  category.name = req.body.name || category.name;
  category.description = req.body.description || category.description;
  category.parentCategory = req.body.parentCategory || category.parentCategory;
  category.image = req.body.image || category.image;
  category.isActive = req.body.isActive !== undefined ? req.body.isActive : category.isActive;
  
  const updatedCategory = await category.save();
  res.json(updatedCategory);
});

// @desc    Kategori sil
// @route   DELETE /api/management/categories/:id
// @access  Private
const deleteCategory = asyncHandler(async (req, res) => {
  const categoryId = req.params.id;
  
  const category = await Category.findById(categoryId);
  
  if (!category) {
    res.status(404);
    throw new Error('Kategori bulunamadı');
  }
  
  // Kategoriyi kullanan ürünleri kontrol et
  const productsUsingCategory = await Product.countDocuments({ category: category.name });
  
  if (productsUsingCategory > 0) {
    res.status(400);
    throw new Error(`Bu kategori ${productsUsingCategory} üründe kullanılıyor. Önce ürünleri güncelleyin veya silin.`);
  }
  
  await Category.deleteOne({ _id: categoryId });
  
  res.json({ message: 'Kategori başarıyla silindi' });
});

// @desc    Kategori detayını getir
// @route   GET /api/management/categories/:id
// @access  Private
const getCategoryById = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);
  
  if (category) {
    res.json(category);
  } else {
    res.status(404);
    throw new Error('Kategori bulunamadı');
  }
});

module.exports = {
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
}; 