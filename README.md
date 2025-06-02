# 🐾 PawVote – Decentralized Animal Voting on Stellar Soroban

🌐 **Live Demo:** [https://paw-vote.vercel.app](https://paw-vote.vercel.app)

**PawVote** is a decentralized voting dApp built using **Stellar** and **Soroban smart contracts**. It allows users to add their favorite animals and vote for them. All actions—wallet connection, animal submission, and voting—are executed on-chain for full transparency and decentralization.

## 🚀 Features

- 🌐 Frontend built with **Next.js**
- 🦀 Smart contracts written in **Rust** with **Soroban**
- 🔐 Secure wallet integration using **Freighter**
- 🐕 Add new animals and 🗳️ vote for your favorites
- 📊 Live list sorted by total votes (descending)
- 🎨 Clean, modern, mobile-friendly UI using **Tailwind CSS**

## 📂 Project Structure

```bash
/contract             # Rust/Soroban smart contract code
/app                  # Next.js frontend application
/screenshots          # UI screenshots
/tailwind.config.js   # Tailwind CSS configuration
/README.md            # This file
```

## 🛠️ Setup & Installation

1️⃣ **Clone the repository:**

```bash
git clone https://github.com/UmutSutcu/pawvote.git
cd pawvote
```

2️⃣ **Install frontend dependencies:**

```bash
cd app
npm install
```

3️⃣ **Start the development server:**

```bash
npm run dev
```

4️⃣ **Build the smart contract:**

```bash
cd ../contract
cargo build --target wasm32-unknown-unknown --release
```

> ⚠️ **Note:** Make sure the [Soroban CLI](https://soroban.stellar.org/docs/getting-started/environment#installing-soroban-cli) is installed before compiling the contract.

## ⚙️ How It Works

- Users connect their Freighter wallet to the dApp.
- They can submit a new animal by entering its name (1–30 characters, no duplicates).
- Each vote 0.1 xlm.
- All votes are recorded as **on-chain Soroban transactions**.
- The animal list is displayed in descending order based on vote count.

## 📸 Screenshots


![image](https://github.com/user-attachments/assets/8efcd139-2f8b-4f88-bc96-2c7da443b5e6)

![image](https://github.com/user-attachments/assets/6cb32572-75d1-4580-b24a-bdc8dd06b89a)





## 🧪 Tech Stack

- **Frontend:** Next.js, React, Tailwind CSS
- **Smart Contracts:** Rust, Soroban (WASM)
- **Wallet:** Freighter (Stellar wallet extension)

## 📄 License

This project is licensed under the [MIT License](LICENSE).

---

## 🤝 Contributing

Contributions are welcome!

- 🔧 Submit pull requests with improvements or new features
- 🐞 Report bugs via GitHub Issues
- 💡 Suggest enhancements and ideas

---

## 🔗 Useful Links

- 📚 [Stellar Developer Documentation](https://developers.stellar.org/docs/)
- 🔧 [Soroban Docs](https://soroban.stellar.org/docs)
- 💼 [Freighter Wallet](https://freighter.app/)

---

> ✅ **Reminder:** Before using the dApp, make sure to build the smart contract inside the `/contract` directory.
