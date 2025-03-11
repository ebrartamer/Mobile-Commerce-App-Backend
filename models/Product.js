const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  name: {
    type: String,
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    required: true
  }
}, { timestamps: true });

const variantSchema = new mongoose.Schema({
  color: {
    type: String
  },
  size: {
    type: String
  },
  stock: {
    type: Number,
    required: true,
    default: 0
  },
  additionalPrice: {
    type: Number,
    default: 0
  }
});

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Ürün adı zorunludur'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Ürün açıklaması zorunludur']
  },
  brand: {
    type: String,
    required: [true, 'Marka zorunludur']
  },
  category: {
    type: String,
    required: [true, 'Kategori zorunludur']
  },
  subCategory: {
    type: String
  },
  price: {
    type: Number,
    required: [true, 'Fiyat zorunludur'],
    min: 0
  },
  discountedPrice: {
    type: Number,
    min: 0
  },
  discountPercentage: {
    type: Number,
    min: 0,
    max: 100
  },
  images: [
    {
      type: String,
      required: true
    }
  ],
  variants: [variantSchema],
  stock: {
    type: Number,
    required: true,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  reviews: [reviewSchema],
  rating: {
    type: Number,
    default: 0
  },
  numReviews: {
    type: Number,
    default: 0
  },
  seller: {
    type: String,
    required: [true, 'Satıcı zorunludur']
  },
  tags: [String],
  specifications: {
    type: Map,
    of: String
  }
}, { timestamps: true });

// Ürün adı ve marka için indeks oluşturma (arama için)
productSchema.index({ name: 'text', brand: 'text', description: 'text' });

// Değerlendirme ekleme ve ortalama puanı güncelleme
productSchema.methods.addReview = async function(review) {
  this.reviews.push(review);
  
  // Ortalama puanı hesapla
  const totalRating = this.reviews.reduce((sum, item) => sum + item.rating, 0);
  this.rating = totalRating / this.reviews.length;
  this.numReviews = this.reviews.length;
  
  return await this.save();
};

// İndirim hesaplama
productSchema.pre('save', function(next) {
  if (this.price && this.discountedPrice && this.discountedPrice < this.price) {
    this.discountPercentage = Math.round(((this.price - this.discountedPrice) / this.price) * 100);
  } else if (this.price && this.discountPercentage) {
    this.discountedPrice = this.price - (this.price * (this.discountPercentage / 100));
  }
  next();
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
