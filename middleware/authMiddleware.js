const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const User = require('../models/User');

// Kullanıcı kimlik doğrulama
const protect = asyncHandler(async (req, res, next) => {
  let token;

  // Token'ı header'dan al
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Token'ı ayır
      token = req.headers.authorization.split(' ')[1];

      // Token'ı doğrula
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Kullanıcıyı bul ve şifre hariç bilgileri req.user'a ekle
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        res.status(401);
        throw new Error('Kullanıcı bulunamadı');
      }

      if (!req.user.isActive) {
        res.status(401);
        throw new Error('Hesabınız devre dışı bırakılmış');
      }

      next();
    } catch (error) {
      console.error(error);
      res.status(401);
      
      if (error.name === 'TokenExpiredError') {
        throw new Error('Oturum süresi doldu, lütfen tekrar giriş yapın');
      } else {
        throw new Error('Yetkilendirme başarısız');
      }
    }
  }

  if (!token) {
    res.status(401);
    throw new Error('Yetkilendirme token\'ı bulunamadı');
  }
});

module.exports = { protect };
