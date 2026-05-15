# 🌌 Azeerh AI V2

**Azeerh AI V2** adalah asisten kecerdasan buatan (AI) generasi masa depan yang dirancang dengan antarmuka (UI) bernuansa *Command Center* yang modern, elegan, dan super responsif. Ditenagai oleh **Groq API (Llama-3)**, AI ini mampu memberikan jawaban sangat cepat, menulis kode pemograman, dan mendukung interaksi suara (Speech-to-Text).

Dibuat oleh **Razeerh**.

---

## ✨ Fitur Utama

- ⚡ **Super Fast Response:** Ditenagai oleh *Neural Network* dari Groq API.
- 💾 **Multi-Session Local Storage:** Riwayat chat tersimpan secara lokal dan aman di perangkat masing-masing pengguna.
- 📝 **Manajemen Percakapan:** Buat obrolan baru, ganti nama (Rename), atau hapus (Delete) riwayat chat kapan saja.
- 🎤 **Speech-to-Text:** Dilengkapi fitur mikrofon cerdas untuk mendikte pesan langsung menggunakan suara.
- 🌗 **Dark / Light Mode:** Tema yang bisa diubah secara dinamis dan memanjakan mata.
- 🎨 **Modern Animations:** Transisi *smooth* dan animasi *bouncing* menggunakan Framer Motion.
- 📋 **Interaksi AI Lengkap:** Tombol *Copy* jawaban ke clipboard, serta tombol *Like* & *Dislike* beserta notifikasi interaktif.
- 💻 **Markdown & Code Highlighting:** Menampilkan format teks yang rapi, terutama saat AI memberikan jawaban berupa blok kode.

---

## 🛠️ Teknologi yang Digunakan

- **Framework:** [Next.js 14](https://nextjs.org/) (App Router)
- **Bahasa:** [TypeScript](https://www.typescriptlang.org/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **Animasi:** [Framer Motion](https://www.framer.com/motion/)
- **Ikon:** [Lucide React](https://lucide.dev/)
- **Notifikasi:** [Sonner](https://sonner.emilkowal.ski/)
- **AI Model:** [Groq Cloud](https://console.groq.com/) (Llama-3 70B & 8B)

---

## 🚀 Cara Menjalankan Project (Local Development)

Ikuti langkah-langkah di bawah ini untuk menjalankan **Azeerh AI** di komputermu sendiri:

### 1. Clone Repository
```bash
git clone https://github.com/USERNAME_GITHUB_KAMU/azeerh-ai.git
cd azeerh-ai

---

# 2. Install Dependencies

Pastikan kamu sudah menginstal Node.js, lalu jalankan:

```bash
npm install

---

# 3. Setup Environment Variables
Buat sebuah file baru bernama .env di dalam folder utama project.

Dapatkan API Key secara gratis di Groq Console.
Tambahkan API Key kamu ke dalam file .env dengan format berikut:

```Bash
GROQ_API_KEY=gsk_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx

Catatan: Jangan pernah mempublikasikan file .env kamu ke GitHub!

---

# 4. Jalankan Server
npm run dev