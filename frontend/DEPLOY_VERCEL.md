# Stellar Voting DApp - Vercel Deploy Rehberi

## Adım 1: Vercel Hesabı Oluştur
1. https://vercel.com adresine git
2. GitHub hesabınla giriş yap

## Adım 2: Proje Deploy Et
1. Vercel dashboard'ta "New Project" tıkla
2. GitHub repository'ni seç veya import et
3. Framework: Next.js otomatik algılanır
4. Build ayarları:
   - Build Command: `npm run build`
   - Output Directory: `.next`
   - Install Command: `npm install`

## Adım 3: Environment Variables
Deploy sırasında bu değişkenler otomatik ayarlanır:
- NEXT_PUBLIC_STELLAR_NETWORK=testnet
- NEXT_PUBLIC_HORIZON_URL=https://horizon-testnet.stellar.org

## Adım 4: Deploy
"Deploy" butonuna tıkla ve bekle!

## Sonuç
Deploy başarılı olduğunda vercel.app URL'i alacaksın.
Freighter wallet ile bağlanıp Stellar TestNet'te oy verebilirsin!
