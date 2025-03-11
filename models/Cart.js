const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Product'
  },
  name: {
    type: String,
    required: true
  },
  image: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  discountedPrice: {
    type: Number
  },
  quantity: {
    type: Number,
    required: true,
    default: 1
  },
  color: {
    type: String
  },
  size: {
    type: String
  }
});

const cartSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  items: [cartItemSchema],
  totalItems: {
    type: Number,
    default: 0
  },
  totalPrice: {
    type: Number,
    default: 0
  },
  totalDiscountedPrice: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

// Sepet toplamlarını hesapla
cartSchema.pre('save', function(next) {
  // Toplam ürün sayısı
  this.totalItems = this.items.reduce((total, item) => total + item.quantity, 0);
  
  // Toplam fiyat
  this.totalPrice = this.items.reduce((total, item) => total + (item.price * item.quantity), 0);
  
  // Toplam indirimli fiyat
  this.totalDiscountedPrice = this.items.reduce((total, item) => {
    const itemPrice = item.discountedPrice || item.price;
    return total + (itemPrice * item.quantity);
  }, 0);
  
  next();
});

const Cart = mongoose.model('Cart', cartSchema);

module.exports = Cart; 