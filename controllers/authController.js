const asyncHandler = require('express-async-handler');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { generateAccessToken, generateRefreshToken } = require('../utils/generateToken');

// @desc    Kullanıcı kaydı
// @route   POST /api/users/register
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, phoneNumber } = req.body;

  // Tüm alanların dolu olup olmadığını kontrol et
  if (!name || !email || !password) {
    res.status(400);
    throw new Error('Lütfen tüm zorunlu alanları doldurun');
  }

  // Kullanıcının zaten var olup olmadığını kontrol et
  const userExists = await User.findOne({ email });

  if (userExists) {
    res.status(400);
    throw new Error('Bu email adresi zaten kullanılıyor');
  }

  // Yeni kullanıcı oluştur
  const user = await User.create({
    name,
    email,
    password,
    phoneNumber
  });

  if (user) {
    // Kullanıcı başarıyla oluşturuldu
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      phoneNumber: user.phoneNumber,
      message: 'Kullanıcı başarıyla oluşturuldu. Lütfen giriş yapın.'
    });
  } else {
    res.status(400);
    throw new Error('Geçersiz kullanıcı verileri');
  }
});

// @desc    Kullanıcı girişi
// @route   POST /api/users/login
// @access  Public
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Email ve şifre kontrolü
  if (!email || !password) {
    res.status(400);
    throw new Error('Lütfen email ve şifre girin');
  }

  // Kullanıcıyı bul
  const user = await User.findOne({ email });

  // Kullanıcı var mı ve şifre doğru mu kontrol et
  if (user && (await user.matchPassword(password))) {
    // Kullanıcı aktif mi kontrol et
    if (!user.isActive) {
      res.status(401);
      throw new Error('Hesabınız devre dışı bırakılmış');
    }

    // Token oluştur
    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    // Refresh token'ı kullanıcı belgesine kaydet
    user.refreshToken = refreshToken;
    user.lastLogin = Date.now();
    await user.save();

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      phoneNumber: user.phoneNumber,
      accessToken,
      refreshToken
    });
  } else {
    res.status(401);
    throw new Error('Geçersiz email veya şifre');
  }
});

// @desc    Token yenileme
// @route   POST /api/users/refresh
// @access  Public
const refreshToken = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    res.status(400);
    throw new Error('Refresh token gerekli');
  }

  try {
    // Refresh token'ı doğrula
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    
    // Kullanıcıyı bul
    const user = await User.findById(decoded.id);

    if (!user || user.refreshToken !== refreshToken) {
      res.status(401);
      throw new Error('Geçersiz refresh token');
    }

    // Yeni access token oluştur
    const accessToken = generateAccessToken(user._id);

    res.json({ accessToken });
  } catch (error) {
    res.status(401);
    throw new Error('Geçersiz veya süresi dolmuş token');
  }
});

// @desc    Kullanıcı çıkışı
// @route   POST /api/users/logout
// @access  Private
const logoutUser = asyncHandler(async (req, res) => {
  // Kullanıcının refresh token'ını sil
  const user = await User.findById(req.user._id);
  
  if (user) {
    user.refreshToken = null;
    await user.save();
  }

  res.json({ message: 'Başarıyla çıkış yapıldı' });
});

// @desc    Kullanıcı profilini getir
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select('-password -refreshToken');
  
  if (user) {
    res.json(user);
  } else {
    res.status(404);
    throw new Error('Kullanıcı bulunamadı');
  }
});

// @desc    Kullanıcı profilini güncelle
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    user.phoneNumber = req.body.phoneNumber || user.phoneNumber;
    
    // Şifre değişikliği varsa
    if (req.body.password) {
      user.password = req.body.password;
    }

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      phoneNumber: updatedUser.phoneNumber
    });
  } else {
    res.status(404);
    throw new Error('Kullanıcı bulunamadı');
  }
});

// @desc    Adres ekle
// @route   POST /api/users/address
// @access  Private
const addAddress = asyncHandler(async (req, res) => {
  const { title, fullName, phoneNumber, province, district, neighborhood, fullAddress, isDefault } = req.body;

  // Tüm gerekli alanların dolu olup olmadığını kontrol et
  if (!title || !fullName || !phoneNumber || !province || !district || !neighborhood || !fullAddress) {
    res.status(400);
    throw new Error('Lütfen tüm adres alanlarını doldurun');
  }

  const user = await User.findById(req.user._id);

  if (!user) {
    res.status(404);
    throw new Error('Kullanıcı bulunamadı');
  }

  // Yeni adres oluştur
  const newAddress = {
    title,
    fullName,
    phoneNumber,
    province,
    district,
    neighborhood,
    fullAddress,
    isDefault: isDefault || false
  };

  // Eğer yeni adres varsayılan olarak işaretlendiyse, diğer adreslerin varsayılan özelliğini kaldır
  if (newAddress.isDefault) {
    user.addresses.forEach(address => {
      address.isDefault = false;
    });
  }

  // Kullanıcının adreslerine yeni adresi ekle
  user.addresses.push(newAddress);
  await user.save();

  res.status(201).json(user.addresses);
});

// @desc    Adresi güncelle
// @route   PUT /api/users/address/:id
// @access  Private
const updateAddress = asyncHandler(async (req, res) => {
  const addressId = req.params.id;
  const user = await User.findById(req.user._id);

  if (!user) {
    res.status(404);
    throw new Error('Kullanıcı bulunamadı');
  }

  // Adresi bul
  const address = user.addresses.id(addressId);

  if (!address) {
    res.status(404);
    throw new Error('Adres bulunamadı');
  }

  // Adresi güncelle
  Object.keys(req.body).forEach(key => {
    if (key !== '_id' && key !== 'createdAt' && key !== 'updatedAt') {
      address[key] = req.body[key];
    }
  });

  // Eğer adres varsayılan olarak işaretlendiyse, diğer adreslerin varsayılan özelliğini kaldır
  if (req.body.isDefault) {
    user.addresses.forEach(addr => {
      if (addr._id.toString() !== addressId) {
        addr.isDefault = false;
      }
    });
  }

  await user.save();
  res.json(user.addresses);
});

// @desc    Adresi sil
// @route   DELETE /api/users/address/:id
// @access  Private
const deleteAddress = asyncHandler(async (req, res) => {
  const addressId = req.params.id;
  const user = await User.findById(req.user._id);

  if (!user) {
    res.status(404);
    throw new Error('Kullanıcı bulunamadı');
  }

  // Adresi bul ve sil
  const addressIndex = user.addresses.findIndex(addr => addr._id.toString() === addressId);

  if (addressIndex === -1) {
    res.status(404);
    throw new Error('Adres bulunamadı');
  }

  user.addresses.splice(addressIndex, 1);
  await user.save();

  res.json({ message: 'Adres başarıyla silindi', addresses: user.addresses });
});

module.exports = {
  registerUser,
  loginUser,
  refreshToken,
  logoutUser,
  getUserProfile,
  updateUserProfile,
  addAddress,
  updateAddress,
  deleteAddress
};
