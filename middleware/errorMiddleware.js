// 404 - Bulunamadı hatası
const notFound = (req, res, next) => {
  const error = new Error(`${req.originalUrl} - Bu URL bulunamadı`);
  res.status(404);
  next(error);
};

// Genel hata işleyici
const errorHandler = (err, req, res, next) => {
  // Durum kodu zaten ayarlanmışsa kullan, yoksa 500 kullan
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  
  res.status(statusCode);
  res.json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
    error: true
  });
};

// Mongoose hata işleyici
const mongooseErrorHandler = (err, req, res, next) => {
  // Duplicate key hatası (örn. benzersiz email)
  if (err.code === 11000) {
    res.status(400);
    const field = Object.keys(err.keyValue)[0];
    return res.json({
      message: `Bu ${field} zaten kullanılıyor.`,
      error: true
    });
  }
  
  // Validation hatası
  if (err.name === 'ValidationError') {
    res.status(400);
    const errors = Object.values(err.errors).map(val => val.message);
    return res.json({
      message: errors[0],
      error: true
    });
  }
  
  next(err);
};

module.exports = { notFound, errorHandler, mongooseErrorHandler };
