const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Kategori adı zorunludur'],
    unique: true,
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  parentCategory: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    default: null
  },
  image: {
    type: String,
    default: ''
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

// Kategori adı için indeks oluşturma (arama için)
categorySchema.index({ name: 'text' });

const Category = mongoose.model('Category', categorySchema);

module.exports = Category; 