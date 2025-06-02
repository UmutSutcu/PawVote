#!/bin/bash
# Hızlı Deploy Script

echo "🚀 Stellar Voting DApp Deploy Başlıyor..."

# Frontend build
echo "📦 Frontend build ediliyor..."
cd frontend
npm run build

echo "✅ Build tamamlandı!"
echo "📁 'out' klasörü deploy için hazır"

echo "🌐 Deploy seçenekleri:"
echo "1. Vercel: vercel.com - GitHub connect"
echo "2. Netlify: netlify.com - 'out' klasörünü drag&drop"
echo "3. GitHub Pages: GitHub repo settings"

echo "🎉 Frontend Stellar TestNet'te çalışacak!"
