# Trendyol Clone API

Bu proje, Trendyol benzeri bir e-ticaret mobil uygulaması için backend API'sini içerir.

## Kurulum

1. Projeyi klonlayın
2. Bağımlılıkları yükleyin:
   ```
   npm install
   ```
3. MongoDB'nin yerel olarak çalıştığından emin olun
4. `.env` dosyasını düzenleyin (gerekirse)
5. Sunucuyu başlatın:
   ```
   npm run dev
   ```

## Token Sistemi

Bu API, JWT (JSON Web Token) tabanlı bir kimlik doğrulama sistemi kullanır:

### Access Token ve Refresh Token

- **Access Token**: Kısa ömürlüdür (30 dakika) ve korumalı API endpoint'lerine erişim sağlar.
- **Refresh Token**: Uzun ömürlüdür (7 gün) ve sadece yeni bir access token almak için kullanılır.

### Token Akışı

1. Kullanıcı **kayıt olur** (token verilmez)
2. Kullanıcı **giriş yapar** (access token ve refresh token verilir)
3. Access token süresi dolduğunda, refresh token kullanılarak yeni bir access token alınır
4. Kullanıcı çıkış yaptığında refresh token geçersiz kılınır

### Neden Refresh Token?

Refresh token, güvenlik ve kullanıcı deneyimi arasında denge sağlar:
- Access token'ın kısa ömürlü olması güvenliği artırır
- Refresh token sayesinde kullanıcı sürekli yeniden giriş yapmak zorunda kalmaz

## Postman ile Test Etme

Bu projede API'leri test etmek için Postman koleksiyonu ve ortam değişkenleri dosyaları bulunmaktadır.

### Postman Koleksiyonunu İçe Aktarma

1. Postman'i açın
2. "Import" düğmesine tıklayın
3. `trendyol-clone-postman-collection.json` dosyasını seçin
4. Aynı şekilde `trendyol-clone-postman-environment.json` dosyasını da içe aktarın
5. Sağ üst köşeden "Trendyol Clone API Environment" ortamını seçin

### Test Adımları

1. Önce "API Durumu" isteğini göndererek API'nin çalışıp çalışmadığını kontrol edin
2. "Kullanıcı Kaydı" isteğini göndererek yeni bir kullanıcı oluşturun
3. "Kullanıcı Girişi" isteğini göndererek token alın (otomatik olarak ortam değişkenlerine kaydedilecektir)
4. Diğer istekleri sırayla test edin

### Ortam Değişkenleri

Postman koleksiyonu, aşağıdaki ortam değişkenlerini kullanır:

- `baseUrl`: API'nin temel URL'i (varsayılan: http://localhost:5000)
- `accessToken`: Kimlik doğrulama için JWT token
- `refreshToken`: Token yenilemek için kullanılan token
- `addressId`: Adres işlemleri için adres ID'si
- `productId`: Ürün işlemleri için ürün ID'si
- `category`: Kategori bazlı ürün listeleme için kategori adı
- `cartItemId`: Sepet öğesi işlemleri için sepet öğesi ID'si
- `orderId`: Sipariş işlemleri için sipariş ID'si

### Test Senaryoları

#### Kullanıcı İşlemleri
1. Kullanıcı kaydı oluşturun
2. Kullanıcı girişi yapın
3. Kullanıcı profilini görüntüleyin
4. Kullanıcı profilini güncelleyin
5. Adres ekleyin ve ID'sini `addressId` değişkenine kaydedin

#### Ürün İşlemleri
1. Ürünleri listeleyin
2. Öne çıkan ürünleri görüntüleyin
3. Kategorileri listeleyin
4. Bir ürün detayını görüntüleyin ve ID'sini `productId` değişkenine kaydedin

#### Sepet İşlemleri
1. Sepeti görüntüleyin
2. Sepete ürün ekleyin
3. Sepetteki bir ürünün ID'sini `cartItemId` değişkenine kaydedin
4. Sepetteki ürünü güncelleyin
5. Sepetten ürünü çıkarın

#### Sipariş İşlemleri
1. Sipariş oluşturun (otomatik olarak `orderId` değişkenine kaydedilecektir)
2. Siparişleri listeleyin
3. Sipariş detayını görüntüleyin
4. Siparişi iptal edin

#### Favori İşlemleri
1. Bir ürünü favorilere ekleyin
2. Favorileri listeleyin
3. Favori durumunu kontrol edin
4. Ürünü favorilerden çıkarın

## API Endpoint'leri

### Kullanıcı İşlemleri

- `POST /api/users/register` - Yeni kullanıcı kaydı
- `POST /api/users/login` - Kullanıcı girişi
- `POST /api/users/refresh` - Token yenileme
- `POST /api/users/logout` - Çıkış yapma
- `GET /api/users/profile` - Kullanıcı profilini görüntüleme
- `PUT /api/users/profile` - Kullanıcı profilini güncelleme

### Adres İşlemleri

- `POST /api/users/address` - Adres ekleme
- `PUT /api/users/address/:id` - Adres güncelleme
- `DELETE /api/users/address/:id` - Adres silme

### Ürün İşlemleri

- `GET /api/products` - Ürünleri listeleme (filtreleme ve sıralama ile)
- `GET /api/products/:id` - Ürün detayını görüntüleme
- `GET /api/products/featured` - Öne çıkan ürünleri listeleme
- `GET /api/products/categories` - Kategorileri listeleme
- `GET /api/products/brands` - Markaları listeleme
- `GET /api/products/category/:category` - Kategoriye göre ürünleri listeleme
- `POST /api/products/:id/reviews` - Ürüne değerlendirme ekleme

### Sepet İşlemleri

- `GET /api/cart` - Sepeti görüntüleme
- `POST /api/cart` - Sepete ürün ekleme
- `PUT /api/cart/:itemId` - Sepetteki ürün miktarını güncelleme
- `DELETE /api/cart/:itemId` - Sepetten ürün çıkarma
- `DELETE /api/cart` - Sepeti temizleme

### Sipariş İşlemleri

- `POST /api/orders` - Sipariş oluşturma
- `GET /api/orders` - Siparişleri listeleme
- `GET /api/orders/:id` - Sipariş detayını görüntüleme
- `PUT /api/orders/:id/cancel` - Siparişi iptal etme

### Favori İşlemleri

- `GET /api/favorites` - Favori ürünleri listeleme
- `POST /api/favorites` - Ürünü favorilere ekleme
- `DELETE /api/favorites/:productId` - Ürünü favorilerden çıkarma
- `GET /api/favorites/:productId/check` - Ürünün favori durumunu kontrol etme 