# みんなの日本語 — Belajar & Latihan N5

Web app belajar bahasa Jepang JLPT N5 berbasis Minna no Nihongo: kosakata (Bab 1–25),
kanji N5, latihan menulis, tata bahasa (30 pola), latihan kuis, dan mode SRS.
Dibuat dengan **Vite + React**. Progres belajar tersimpan otomatis di browser
(`localStorage`), tanpa perlu backend.

## Menjalankan secara lokal

Butuh Node.js 18+.

## Deploy ke Vercel

### Cara 1 — lewat GitHub (paling mudah)
1. Buat repo baru di GitHub, push seluruh folder ini.
2. Buka https://vercel.com → **Add New… → Project** → pilih repo tersebut.
3. Vercel otomatis mendeteksi framework **Vite**. Biarkan pengaturan default:
   - Build Command: `npm run build`
   - Output Directory: `dist`
4. Klik **Deploy**. Selesai — situs langsung online dengan domain `*.vercel.app`.

### Cara 2 — lewat Vercel CLI
```bash
npm i -g vercel
vercel          # ikuti prompt, deploy preview
vercel --prod   # deploy ke produksi
```

## Struktur
```
index.html          # entry HTML
vite.config.js      # konfigurasi Vite + plugin React
src/
  main.jsx          # bootstrap React
  App.jsx           # seluruh aplikasi (data + UI)
  index.css         # reset global
```

## Catatan
- Audio pelafalan memakai Web Speech API bawaan browser (kualitas suara Jepang
  tergantung perangkat; Chrome & Safari umumnya sudah menyediakannya).
- Tab **Menulis** adalah latihan menjiplak. Untuk animasi urutan goresan asli,
  bisa diintegrasikan dataset KanjiVG / library `hanzi-writer` pada iterasi berikutnya.
