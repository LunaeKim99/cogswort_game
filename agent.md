# agent.md

## Peran
Agent ini bertugas sebagai **Game Builder Agent** yang mengubah spesifikasi game platformer 2D dari dokumen referensi menjadi project game berbasis **Phaser 3 (HTML5)** yang siap diuji di browser dan siap dibungkus menjadi APK Android menggunakan **Capacitor**.

Agent harus bekerja sebagai pelaksana teknis utama, bukan sekadar pemberi saran. Output akhirnya adalah game yang benar-benar berjalan.

## Tujuan utama
- Membangun ulang game platformer side-scroller dari spesifikasi dokumen.
- Menggunakan Phaser 3 dengan struktur kode yang rapi dan mudah dikembangkan.
- Menyediakan **2 atau 3 level** dengan tingkat kesulitan yang meningkat.
- Mendukung kontrol **desktop** dan **mobile touch controls**.
- Menyiapkan project agar mudah dibuild menjadi APK Android.

## Input yang harus dipahami agent
Agent wajib membaca dan mengekstrak kebutuhan dari dokumen berikut:
- `panduan-final-platformer-construct2-v2-2.pdf`
- `laporan-platformer-construct2.pdf`
- Jika relevan, storyboard dapat dipakai untuk inspirasi visual dan flow presentasi, tetapi fokus utama tetap pada gameplay.

## Fitur inti yang wajib ada
Berdasarkan dokumen referensi, agent harus mengimplementasikan fitur berikut:
- Player bergerak kiri dan kanan.
- Player melompat.
- Touch button untuk kiri, kanan, dan lompat.
- Coin yang bisa dikumpulkan.
- Sistem skor.
- Sistem nyawa.
- Musuh patroli.
- Mekanik stomp: musuh mati jika diinjak dari atas.
- Player kehilangan nyawa jika terkena musuh dari samping atau bawah.
- Animasi player: idle, run, jump, fall, hurt.
- Animasi enemy: walk dan death.
- HUD untuk heart/nyawa dan skor.
- Game over screen.
- Win / level clear flow.

## Ketentuan level
Agent wajib membuat **minimal 2 level**, dan lebih baik **3 level**, dengan progresi kesulitan yang jelas:

### Level 1
- Tutorial ringan.
- Jumlah musuh sedikit.
- Jarak lompatan mudah.
- Penempatan coin membantu pemain memahami rute.
- Tujuan: memperkenalkan kontrol dan ritme game.

### Level 2
- Tantangan menengah.
- Lebih banyak musuh patroli.
- Platform lebih bervariasi.
- Penempatan coin mulai mendorong eksplorasi dan timing lompatan.
- Tujuan: menguji konsistensi kontrol pemain.

### Level 3
- Tantangan lebih tinggi.
- Kombinasi musuh, gap, dan platform sempit.
- Penempatan coin lebih berisiko.
- Desain level harus tetap adil, tidak terasa mustahil.
- Tujuan: menjadi puncak tantangan sebelum layar kemenangan.

## Standar implementasi
- Gunakan **Phaser 3**.
- Gunakan JavaScript atau TypeScript, pilih salah satu dan konsisten.
- Pisahkan scene minimal menjadi:
  - Boot / PreloadScene
  - MainMenuScene
  - LevelScene atau Level1Scene, Level2Scene, Level3Scene
  - GameOverScene
  - WinScene / LevelCompleteScene
- Buat sistem reusable untuk HUD, player controller, enemy behavior, dan touch controls bila memungkinkan.
- Pastikan game dapat berjalan di resolusi desktop dan mobile.
- Terapkan scaling UI yang aman untuk layar HP.
- Sediakan struktur project yang mudah dibungkus ke Capacitor.

## Build target
Agent harus menyiapkan project agar:
- Dapat dijalankan di browser sebagai game HTML5.
- Dapat dibuild ke Android APK melalui wrapper seperti Capacitor.
- Tidak bergantung pada backend.
- Asset path dan konfigurasi harus aman untuk build mobile.

## Larangan
- Jangan membuat prototype setengah jadi.
- Jangan hanya menuliskan pseudocode tanpa implementasi nyata.
- Jangan membuat hanya satu level.
- Jangan menghapus fitur touch control.
- Jangan menyederhanakan stomp menjadi collision biasa tanpa logika arah jatuh.

## Kriteria selesai
Tugas dianggap selesai hanya jika:
- Game dapat dimainkan.
- Terdapat minimal 2 level, idealnya 3 level.
- Tingkat kesulitan antar level meningkat secara jelas.
- Semua fitur inti dari dokumen utama sudah terimplementasi.
- Ada flow start menu, gameplay, game over, level clear, dan ending/win.
- Project siap dilanjutkan ke proses packaging APK.
