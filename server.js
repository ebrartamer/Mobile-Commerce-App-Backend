require("dotenv").config();
const express = require("express");
const connectDB = require("./config/db");
const cors = require("cors");
const morgan = require("morgan");
const helmet = require("helmet");
const { notFound, errorHandler, mongooseErrorHandler } = require("./middleware/errorMiddleware");
const userRoutes = require("./routes/userRoutes");
const productRoutes = require("./routes/productRoutes");
const cartRoutes = require("./routes/cartRoutes");
const orderRoutes = require("./routes/orderRoutes");
const favoriteRoutes = require("./routes/favoriteRoutes");
const managementRoutes = require("./routes/managementRoutes");

const app = express();
connectDB();

// Middleware
app.use(express.json());
app.use(cors());
app.use(morgan("dev"));
app.use(helmet());

// Routes
app.use("/api/users", userRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/favorites", favoriteRoutes);
app.use("/api/management", managementRoutes);

// Test Route
app.get("/", (req, res) => {
  res.send("Trendyol Clone Backend Çalışıyor!");
});

// Hata işleme middleware'leri
app.use(mongooseErrorHandler);
app.use(notFound);
app.use(errorHandler);

// Port Ayarı
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server ${PORT} portunda çalışıyor`));
