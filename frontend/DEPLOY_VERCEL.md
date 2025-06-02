# Stellar Voting DApp - Vercel Deploy Rehberi

## 🚨 ANA SORUN: Root Directory!
404 NOT_FOUND hatasının sebebi: Vercel root directory'den deploy ediyor ama app `frontend/` klasöründe!

## ✅ Düzeltme Yapıldı!
404 NOT_FOUND hatasını düzeltmek için:
- ❌ `output: 'export'` kaldırıldı
- ✅ Vercel.json güncellendi
- ✅ Scripts temizlendi
- ✅ CSS import düzeltildi (`test-globals.css` → `globals.css`)

## 🎯 Kritik Adım: Root Directory Ayarı
1. Vercel dashboard'ta proje sayfasına git
2. **Settings** sekmesine tıkla
3. **General** bölümünde **Root Directory** ayarını bul
4. **Root Directory**'yi `frontend` olarak değiştir
5. **Save** tıkla

## Adım 1: Vercel'de Yeniden Deploy
1. Settings'ten Root Directory'yi `frontend` yap
2. "Deployments" sekmesine tıkla
3. "Redeploy" butonuna tıkla
4. "Use existing Build Cache" işaretini KALDIR
5. "Redeploy" tıkla

## Adım 2: Build Settings Kontrol
Vercel'de şu ayarları kontrol et:
- **Framework**: Next.js (otomatik algılanır)
- **Root Directory**: `frontend` ⭐ EN ÖNEMLİSİ!
- **Build Command**: `next build`
- **Output Directory**: `.next`
- **Node.js Version**: 18.x

## Adım 3: Environment Variables (Opsiyonel)
Vercel settings'de ekle:
- `NEXT_PUBLIC_STELLAR_NETWORK` = `testnet`
- `NEXT_PUBLIC_HORIZON_URL` = `https://horizon-testnet.stellar.org`

## Sonuç
Root Directory düzeltmesi ile deploy başarılı olacak!
DApp https://paw-vote.vercel.app adresinde çalışır durumda olacak.
