# plan.md

## Ringkasan tujuan
Membangun game platformer 2D berbasis Phaser 3 dari spesifikasi Construct 2, dengan dukungan desktop dan mobile, serta menyediakan 2 atau 3 level dengan tingkat kesulitan meningkat.

## Tahap kerja

### 1. Analisis dokumen referensi
- Baca panduan dan laporan Construct 2.
- Ekstrak fitur gameplay, daftar object, variabel, flow scene, HUD, animasi, dan logika stomp.
- Ubah spesifikasi event-based menjadi daftar sistem yang akan diimplementasikan di Phaser.

### 2. Definisi arsitektur project
- Tentukan stack: Phaser 3 + JavaScript/TypeScript.
- Susun struktur folder, misalnya `src/scenes`, `src/entities`, `src/ui`, `src/data`, `assets`.
- Tentukan scene utama: preload, menu, level, game over, victory.
- Tentukan cara menyimpan konfigurasi level dalam data JSON atau object config.

### 3. Porting gameplay inti
Implementasikan sistem berikut lebih dulu:
- Movement kiri-kanan.
- Jump.
- Gravity dan collision platform.
- Camera follow.
- Coin collect.
- Score update.
- Lives / health.
- Enemy patrol.
- Stomp detection.
- Hurt / invincibility timer.
- Animasi player dan enemy.
- HUD.

### 4. Implementasi touch controls
- Buat tombol virtual kiri, kanan, lompat.
- Pastikan ukuran tombol cukup nyaman di layar mobile.
- Pastikan tombol tidak mengganggu HUD utama.
- Validasi bahwa input touch dan keyboard bisa bekerja stabil.

### 5. Penyusunan level
Buat 2 atau 3 level sebagai berikut:

#### Level 1
- Fokus onboarding.
- Platform relatif aman.
- 1-2 jenis tantangan sederhana.
- Coin ditempatkan sebagai penunjuk jalur.

#### Level 2
- Tambah musuh dan variasi platform.
- Timing lompatan mulai penting.
- Ada risiko jatuh yang lebih sering.
- Penempatan coin mulai opsional dan menantang.

#### Level 3
- Level tersulit.
- Kombinasi musuh dan platform sempit.
- Pola tantangan lebih rapat.
- Tetap fair dan bisa diselesaikan tanpa grinding.

### 6. Flow game lengkap
- Main Menu.
- Start game.
- Level complete transition.
- Next level.
- Game over.
- Final win / ending screen.
- Restart level dan restart game.

### 7. Kesiapan mobile build
- Pastikan asset path relatif.
- Pastikan project dapat dibuild sebagai web app statis.
- Siapkan catatan integrasi Capacitor.
- Pastikan audio, input, dan scaling aman untuk Android WebView.

### 8. QA dan balancing
- Uji desktop keyboard.
- Uji mobile touch.
- Pastikan stomp terasa konsisten.
- Pastikan tingkat kesulitan naik bertahap.
- Pastikan tidak ada level yang terlalu pendek atau terlalu sulit.

## Deliverable
- Source code Phaser 3.
- Struktur scene lengkap.
- 2 atau 3 level dengan progresi kesulitan.
- Asset integration.
- Instruksi run lokal.
- Instruksi build web dan langkah lanjut ke APK.

## Definisi selesai
Project selesai bila:
- Semua level bisa dimainkan sampai selesai.
- HUD, score, nyawa, enemy, stomp, dan coin bekerja.
- Touch control berfungsi di mobile.
- Scene menu, game over, dan win berfungsi.
- Game siap dipackage ke Android.
