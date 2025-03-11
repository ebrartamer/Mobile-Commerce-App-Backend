const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const addressSchema = new mongoose.Schema({
  title: { type: String, required: true },
  fullName: { type: String, required: true },
  phoneNumber: { type: String, required: true },
  province: { type: String, required: true },
  district: { type: String, required: true },
  neighborhood: { type: String, required: true },
  fullAddress: { type: String, required: true },
  isDefault: { type: Boolean, default: false }
}, { timestamps: true });

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Email adresi zorunludur'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Lütfen geçerli bir email adresi giriniz']
  },
  password: {
    type: String,
    required: [true, 'Şifre zorunludur'],
    minlength: [6, 'Şifre en az 6 karakter olmalıdır']
  },
  name: {
    type: String,
    required: [true, 'İsim zorunludur']
  },
  phoneNumber: {
    type: String,
    match: [/^(\+90|0)?[0-9]{10}$/, 'Lütfen geçerli bir telefon numarası giriniz']
  },
  addresses: [addressSchema],
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  favorites: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  }],
  lastLogin: {
    type: Date
  },
  refreshToken: {
    type: String
  }
}, { timestamps: true });

// Şifre hashleme middleware
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Şifre karşılaştırma metodu
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);

module.exports = User;
