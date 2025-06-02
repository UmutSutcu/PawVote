# Stellar Voting DApp - Netlify Deploy Rehberi

## Adım 1: Build Hazırlığı
```powershell
cd "c:\Users\umuts\OneDrive\Masaüstü\Yeni klasör\Umut\blockchain\stellar\frontend"
npm run build
```

## Adım 2: Netlify Deploy
1. https://netlify.com adresine git
2. "Sites" → "Add new site" → "Deploy manually"
3. `out` klasörünü sürükle bırak
4. Veya GitHub ile connect et

## Adım 3: Domain
Deploy başarılı olduğunda netlify.app subdomain alacaksın.

## Sonuç
DApp'in Stellar TestNet'te çalışır durumda!
