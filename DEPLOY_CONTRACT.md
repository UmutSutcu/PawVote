# Stellar Soroban Contract Deploy Rehberi

## Ön Gereksinimler
1. Rust kurulu olmalı
2. Soroban CLI kurulu olmalı
3. Stellar hesap (TestNet)

## Kurulum
```powershell
# Soroban CLI kur
cargo install --locked soroban-cli

# Soroban initialize
soroban config network add testnet --rpc-url https://soroban-testnet.stellar.org:443 --network-passphrase "Test SDF Network ; September 2015"

# Kimlik oluştur (eğer yoksa)
soroban config identity generate alice
soroban config identity fund alice --network testnet
```

## Deploy Adımları
```powershell
cd "c:\Users\umuts\OneDrive\Masaüstü\Yeni klasör\Umut\blockchain\stellar\contract"

# Contract build et
soroban contract build

# Deploy et
soroban contract deploy --wasm target/wasm32-unknown-unknown/release/contract.wasm --source alice --network testnet
```

## Contract ID
Deploy sonrası contract ID alacaksın. Bu ID'yi frontend'de kullan.
