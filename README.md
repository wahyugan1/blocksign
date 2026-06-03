# 🧾 BlockSign

### Sistem Verifikasi Kontrak Digital Terdesentralisasi Berbasis Blockchain dan IPFS

> Implementasi Smart Contract, IPFS, dan Wallet-Based Digital Signature untuk Verifikasi Kontrak Digital yang Aman dan Transparan.

---

# 📸 Tampilan Sistem

![Halaman Utama](assets/homepage.png)

![Upload Dokumen](assets/upload-page.png)

![Verifikasi Dokumen](assets/verification-page.png)

![Riwayat Kontrak](assets/history-page.png)

---

# 📖 Gambaran Umum

BlockSign merupakan aplikasi terdesentralisasi (*Decentralized Application / DApp*) yang dikembangkan untuk mendukung proses penandatanganan dan verifikasi kontrak digital secara aman tanpa bergantung pada pihak ketiga.

Sistem memanfaatkan kombinasi **Ethereum Smart Contract**, **IPFS (InterPlanetary File System)**, dan **MetaMask Wallet** untuk memastikan integritas dokumen, transparansi proses verifikasi, serta keamanan data kontrak yang tersimpan.

Proyek ini dikembangkan sebagai bagian dari penelitian skripsi dengan judul:

> **A Decentralized System for Dual-Signed Digital Contract Verification Using Blockchain Smart Contract and IPFS**

Universitas Islam Nahdlatul Ulama Jepara (2026).

---

# ❗ Latar Belakang Masalah

Pada sistem kontrak digital konvensional masih terdapat beberapa permasalahan, antara lain:

* Dokumen dapat diubah setelah proses penandatanganan.
* Ketergantungan pada penyimpanan terpusat (*Centralized Storage*).
* Sulit membuktikan keaslian dokumen secara independen.
* Risiko kehilangan data akibat *Single Point of Failure*.
* Kurangnya transparansi dalam proses verifikasi.

BlockSign dikembangkan untuk mengatasi permasalahan tersebut melalui pemanfaatan teknologi blockchain dan penyimpanan terdesentralisasi.

---

# 🎯 Tujuan Sistem

Sistem ini bertujuan untuk:

* Menjamin integritas kontrak digital.
* Mendukung proses *Dual Digital Signature* antara dua pihak.
* Menyimpan dokumen secara terdesentralisasi menggunakan IPFS.
* Menyediakan mekanisme verifikasi publik yang transparan.
* Mengurangi ketergantungan terhadap pihak ketiga (*Trusted Third Party*).

---

# 👨‍💻 Peran Pengembang

Proyek ini dirancang dan dikembangkan secara mandiri sebagai penelitian tugas akhir.

Ruang lingkup pekerjaan yang dilakukan meliputi:

* Requirements Analysis
* Business Process Analysis
* System Design
* Smart Contract Development
* Frontend Development
* Wallet Integration
* IPFS Integration
* System Testing
* Deployment pada Ethereum Sepolia Testnet

---

# 🏗️ Arsitektur Sistem

> **[LETAKKAN DIAGRAM ARSITEKTUR SISTEM DI SINI]**

![System Architecture](docs/architecture.png)

Sistem terdiri dari beberapa komponen utama:

* Frontend berbasis React.js.
* MetaMask sebagai Wallet Authentication.
* Smart Contract pada jaringan Ethereum Sepolia.
* IPFS (Pinata) sebagai penyimpanan dokumen.
* The Graph Protocol untuk indexing dan query data blockchain.

---

# 🔄 Alur Proses Penandatanganan Kontrak

> **[LETAKKAN ACTIVITY DIAGRAM / WORKFLOW DI SINI]**

![Workflow](docs/workflow.png)

Tahapan proses dalam sistem:

1. Party A mengunggah dokumen kontrak.
2. Dokumen disimpan ke IPFS dan menghasilkan CID.
3. CID dicatat ke dalam Smart Contract.
4. Party A melakukan Digital Signature menggunakan MetaMask.
5. Party B melakukan Digital Signature.
6. Smart Contract memverifikasi kedua tanda tangan.
7. Status kontrak berubah menjadi Fully Signed.
8. Dokumen dapat diverifikasi secara publik.

---

# ✨ Fitur Utama

### Secure Document Upload

* Upload dokumen kontrak ke IPFS.
* Menghasilkan Content Identifier (CID) unik.

### Dual Digital Signature

* Penandatanganan dilakukan oleh dua pihak secara independen.
* Verifikasi menggunakan Wallet-Based Signature.

### Blockchain Record

* Metadata kontrak disimpan secara permanen pada blockchain.
* Setiap transaksi dapat diverifikasi melalui Etherscan.

### Public Verification

* Verifikasi dokumen menggunakan CID atau file asli.
* Validasi dilakukan dengan mencocokkan hash dokumen terhadap data on-chain.

### Selective Access History

* Riwayat kontrak hanya dapat diakses oleh pihak yang terlibat.
* Verifikasi publik tetap tersedia tanpa membuka informasi sensitif.
