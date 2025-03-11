const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  quantity: {
    type: Number,
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
  product: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Product'
  },
  color: {
    type: String
  },
  size: {
    type: String
  }
});

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  orderItems: [orderItemSchema],
  shippingAddress: {
    fullName: {
      type: String,
      required: true
    },
    phoneNumber: {
      type: String,
      required: true
    },
    province: {
      type: String,
      required: true
    },
    district: {
      type: String,
      required: true
    },
    neighborhood: {
      type: String,
      required: true
    },
    fullAddress: {
      type: String,
      required: true
    }
  },
  paymentMethod: {
    type: String,
    required: true,
    default: 'Kapıda Ödeme'
  },
  paymentResult: {
    id: { type: String },
    status: { type: String },
    update_time: { type: String },
    email_address: { type: String }
  },
  itemsPrice: {
    type: Number,
    required: true,
    default: 0.0
  },
  discountedItemsPrice: {
    type: Number,
    required: true,
    default: 0.0
  },
  shippingPrice: {
    type: Number,
    required: true,
    default: 0.0
  },
  totalPrice: {
    type: Number,
    required: true,
    default: 0.0
  },
  isPaid: {
    type: Boolean,
    required: true,
    default: false
  },
  paidAt: {
    type: Date
  },
  isDelivered: {
    type: Boolean,
    required: true,
    default: false
  },
  deliveredAt: {
    type: Date
  },
  status: {
    type: String,
    required: true,
    enum: ['Sipariş Alındı', 'Hazırlanıyor', 'Kargoya Verildi', 'Teslim Edildi', 'İptal Edildi'],
    default: 'Sipariş Alındı'
  },
  trackingNumber: {
    type: String
  },
  estimatedDeliveryDate: {
    type: Date
  }
}, { timestamps: true });

const Order = mongoose.model('Order', orderSchema);

module.exports = Order; 