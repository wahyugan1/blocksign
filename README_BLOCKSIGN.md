# 🧾 BlockSign  
### A Decentralized Dual-Signed Digital Contract Verification System  
> *Built with Blockchain Smart Contract, IPFS, and Web3 Integration*

---

## 📖 Overview
**BlockSign** adalah aplikasi terdesentralisasi (DApp) yang dirancang untuk melakukan **penandatanganan digital dua pihak** dan **verifikasi kontrak digital** secara aman, transparan, dan tanpa bergantung pada pihak ketiga.  
Sistem ini memanfaatkan **Ethereum Smart Contract** untuk pencatatan transaksi, **IPFS (InterPlanetary File System)** untuk penyimpanan dokumen secara off-chain, dan **MetaMask** sebagai media tanda tangan digital berbasis wallet.

Proyek ini dikembangkan sebagai bagian dari penelitian akademik berjudul:  
> *“A Decentralized System for Dual-Signed Digital Contract Verification Using Blockchain Smart Contract and IPFS”*  
oleh **Wahyu Tri Kumolo Adi** (Universitas Islam Nahdlatul Ulama Jepara, 2025).

---

## 🚀 Main Features
### 🔹 1. Secure Document Upload
- Unggah dokumen kontrak digital (PDF atau file lain) ke jaringan **IPFS**.  
- Setiap file menghasilkan **Content Identifier (CID)** unik untuk verifikasi publik.  
### 🔹 2. Dual Digital Signature
- Dua pihak (Party A dan Party B) menandatangani kontrak secara independen.  
- Tanda tangan diverifikasi melalui **wallet kripto (MetaMask)** yang terhubung ke blockchain.  
### 🔹 3. Blockchain Record
- Metadata, hash dokumen, dan status tanda tangan dicatat secara permanen di **Ethereum Testnet Sepolia**.  
- Setiap transaksi dapat diverifikasi secara publik di **Etherscan**.  
### 🔹 4. Public Verification
- Pengguna lain dapat melakukan **verifikasi dokumen** menggunakan CID atau file asli.  
- Sistem mencocokkan hash file dengan data on-chain tanpa membuka isi dokumen.  
### 🔹 5. Selective Access History
- Riwayat kontrak hanya dapat dilihat oleh wallet yang terlibat dalam kontrak.  
- Wallet lain tetap dapat mengakses halaman verifikasi publik tanpa informasi rahasia.  

---

## 🧩 Tech Stack
| Layer | Technology |
|-------|-------------|
| **Frontend** | React.js, Craco, Tailwind CSS, Ethers.js |
| **Smart Contract** | Solidity (Remix IDE) |
| **Blockchain Network** | Ethereum Testnet Sepolia |
| **Storage** | IPFS (via Pinata) |
| **Wallet Integration** | MetaMask |
| **Indexing** | The Graph Protocol (Subgraph + GraphQL) |

---

## ⚙️ Installation & Setup
### 1️⃣ Clone Repository
```bash
git clone https://github.com/<wahyugan1>/blocksign.git
cd blocksign
```
### 2️⃣ Install Dependencies
```bash
npm install
```
### 3️⃣ Create Environment File
Buat file `.env` di root proyek dan isi variabel berikut (gunakan kunci asli dari akunmu):
```
REACT_APP_PINATA_API_KEY=your_pinata_api_key
REACT_APP_PINATA_SECRET=your_pinata_secret
REACT_APP_CONTRACT_ADDRESS=0xYourDeployedContractAddress
REACT_APP_GRAPHQL_ENDPOINT=https://api.thegraph.com/subgraphs/name/yourname/blocksign
```
Atau gunakan contoh dari `.env.example`:
```bash
cp .env.example .env
```
### 4️⃣ Run the App (Development)
```bash
npm run dev
```
Aplikasi akan berjalan di:  
👉 http://localhost:5173/

---

## 🌐 Deployment Details
| Komponen | Detail |
|-----------|---------|
| **Network** | Ethereum Testnet (Sepolia) |
| **Contract Name** | `DocumentVerification` |
| **Compiler** | Solidity v0.8.x |
| **Etherscan Link (Contoh)** | [View on Sepolia Etherscan](https://sepolia.etherscan.io/address/0x1234567890abcdef1234567890abcdef12345678) |
| **Frontend Demo (Opsional)** | [https://blocksign.vercel.app](https://blocksign.vercel.app) |

---

## 📂 Project Structure
```
APP-BLOCKSIGN/
├── node_modules/
├── plugins/
├── public/
├── src/
│   ├── components/
│   ├── hooks/
│   ├── lib/
│   ├── pages/
│   ├── services/
│   ├── App.css
│   ├── App.js
│   ├── index.css
│   └── index.js
├── .env
├── .gitignore
├── components.json
├── craco.config.js
├── jsconfig.json
├── package-lock.json
├── package.json
├── postcss.config.js
├── readme.md
└── tailwind.config.js
```

---

## 🔒 Security Notes
- **Jangan pernah** mengunggah file `.env` ke GitHub.  
- Simpan **Private Key / Wallet Seed Phrase** dengan aman.  
- Gunakan **testnet Sepolia** untuk pengujian — *jangan gunakan wallet utama*.

---

## 👨‍💻 Author
**Wahyu Tri Kumolo Adi**  
Program Studi Sistem Informasi — Universitas Islam Nahdlatul Ulama Jepara  
📧 [wahyutrikum@gmail.com](mailto:wahyutrikum@gmail.com)  
🌐 [LinkedIn](https://linkedin.com/in/yourprofile) | [GitHub](https://github.com/<wahyugan1>)

---

## 📜 License
This project is open-source and available under the [MIT License](LICENSE).

---

> *“Empowering trustless digital agreements through blockchain transparency.”*
