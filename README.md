# Neon1 ERP

Neon1 ERP, Neonbir üretim ekibi için geliştirilen modern ve üretime hazır bir kurumsal kaynak planlama panelidir. Uygulama Next.js (App Router), React, Tailwind CSS ve Firebase servisleri (Authentication, Firestore, Storage) ile inşa edilmiştir.

## Özellikler
- 🔐 Firebase Authentication ile güvenli giriş (admin & ekip rolleri)
- 📊 Gerçek zamanlı sipariş ve finans verileri (Firestore canlı dinleme)
- 🧭 Neonbir markasına özel cam efekti (glassmorphism) arayüz
- 🗂️ Ürün, sipariş, finans ve admin yönetimi sayfaları
- 📈 Recharts ile durum dağılımı, aylık gelir ve sipariş grafikleri
- ☁️ Firebase Storage entegrasyonu ile görsel yükleme
- 🎯 Rollere göre erişim, log kayıtları ve durum bazlı filtreleme

## Başlangıç

### Gereksinimler
- Node.js 18+
- Firebase projesi (Authentication, Firestore, Storage etkin)
- (Opsiyonel) Vercel hesabı

### Kurulum
```bash
npm install
```

### Geliştirme Sunucusu
```bash
npm run dev
```
`http://localhost:3000` adresinde projeyi görüntüleyebilirsiniz.

## Firebase Yapılandırması
1. `.env.example` dosyasını `.env.local` olarak kopyalayın.
2. Bu depodaki `.env.example` Neonbir için paylaşılan Firebase yapılandırmasını içermektedir:
   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyCRddqt6PrFLeRPA_iHuAY1-PgJ51b5EPw
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=neonbirerpofc.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=neonbirerpofc
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=neonbirerpofc.firebasestorage.app
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=847246032373
   NEXT_PUBLIC_FIREBASE_APP_ID=1:847246032373:web:27aabe9cdddf5ff0eb74bc
   NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-KEV4YNJHQZ
   ```
   Farklı bir Firebase projesi kullanacaksanız bu değerleri kendi projenizle değiştirin.
3. Firestore koleksiyonlarını oluşturun:
   - `orders`
   - `users`
   - `products`
   - `logs`
4. Firebase Storage içinde klasörleri oluşturun:
   - `product_images`
   - `design_files`

### Güvenlik Kuralları (örnek)
```js
// Firestore
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}

// Storage
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```
Rollere göre daha detaylı kurallar tanımlayarak üretim ve kargo ekiplerinin yetkilerini sınırlandırabilirsiniz.

## Dağıtım (Vercel)
1. Vercel üzerinde yeni bir proje oluşturun ve bu depoya bağlayın.
2. `NEXT_PUBLIC_FIREBASE_*` değişkenlerini Vercel Project Settings > Environment Variables kısmında tanımlayın.
3. Vercel build komutu otomatik olarak `npm run build` çalıştıracaktır.

## Ek Notlar
- Siparişlerin gecikme bildirimleri için Firebase Cloud Functions ile zamanlanmış görev (scheduled function) tanımlayabilirsiniz.
- Finans verilerini CSV/XLSX olarak dışa aktarmak için `papaparse` veya `xlsx` paketleri kolayca entegre edilebilir.
- `users` koleksiyonundaki `role` alanına göre sayfa bazlı yetkilendirme (`production` rolü finans sayfasını görmesin gibi) `useAuth()` üzerinden genişletilebilir.
- Tailwind teması `#ff7a00` Neonbir turuncusu üzerine kuruludur, isterseniz koyu mod için `class` bazlı toggle ekleyin.

## Komutlar
| Komut | Açıklama |
| --- | --- |
| `npm run dev` | Geliştirme sunucusunu başlatır |
| `npm run build` | Production derlemesi oluşturur |
| `npm run start` | Production derlemesini çalıştırır |
| `npm run lint` | ESLint çalıştırır |

---
Neon1 ERP, Neonbir ekibinin üretim, kargo ve finans operasyonlarını tek panelden yönetmesine yardımcı olur.
