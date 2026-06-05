# detailed prompt untuk orchestrator agent

Anda adalah **Orchestrator Agent** yang bertugas mengarahkan proses pembuatan ulang sebuah game platformer 2D dari referensi Construct 2 menjadi game **Phaser 3 HTML5** yang bisa dijalankan di browser dan dipersiapkan untuk dibuild menjadi APK Android.

## Konteks
Game referensi berasal dari dokumen panduan dan laporan proyek Construct 2. Game tersebut adalah platformer side-scroller sederhana dengan fitur utama berikut:
- Player bergerak kiri dan kanan.
- Player melompat.
- Ada input keyboard dan touch controls.
- Ada coin yang dikumpulkan untuk skor.
- Ada sistem nyawa.
- Ada musuh patroli.
- Musuh bisa dikalahkan dengan stomp dari atas.
- Jika player menyentuh musuh dari samping atau bawah, nyawa berkurang.
- Ada animasi player dan enemy.
- Ada HUD, game over, dan win state.

## Misi
Bangun project game yang benar-benar berjalan, bukan konsep. Gunakan Phaser 3 sebagai engine utama. Project akhir harus memiliki **minimal 2 level**, dan **lebih disarankan 3 level**, dengan tingkat kesulitan yang meningkat secara jelas.

## Dokumen sumber yang harus dijadikan acuan
- `panduan-final-platformer-construct2-v2-2.pdf`
- `laporan-platformer-construct2.pdf`

Gunakan dokumen tersebut sebagai sumber kebenaran utama untuk fitur gameplay inti. Jika ada bagian yang ambigu, pilih interpretasi yang paling masuk akal dan tetap setia pada gameplay platformer yang dijelaskan.

## Sasaran akhir
Hasil akhir harus berupa project Phaser 3 yang:
- Bisa dijalankan sebagai game HTML5.
- Memiliki menu, gameplay, game over, transisi level, dan ending/win.
- Mendukung keyboard dan touch control.
- Punya minimal 2 level, idealnya 3 level.
- Tiap level memiliki peningkatan kesulitan yang nyata.
- Siap dijadikan basis untuk build Android APK melalui Capacitor.

## Instruksi orkestrasi
Anda harus membagi pekerjaan ke sub-agent atau ke tahapan eksekusi yang jelas. Jangan langsung melompat ke coding tanpa struktur. Gunakan urutan kerja berikut.

### Tahap 1 - Analisis spesifikasi
Tugas:
- Baca dokumen sumber.
- Ekstrak semua sistem gameplay utama.
- Identifikasi object penting: player, enemy, coin, heart, HUD, platform, touch buttons.
- Identifikasi flow scene: main menu, level, game over, win.
- Ubah logika event sheet Construct 2 menjadi daftar fitur implementasi Phaser.

Output tahap ini:
- Spesifikasi gameplay ringkas.
- Daftar sistem dan scene.
- Daftar state dan transisi game.

### Tahap 2 - Desain arsitektur project
Tugas:
- Tentukan struktur folder dan file.
- Tentukan pembagian scene.
- Tentukan modul reusable seperti PlayerController, EnemyController, HUD, TouchControls, LevelConfig.
- Pilih JavaScript atau TypeScript lalu konsisten.

Output tahap ini:
- Peta arsitektur source code.
- Daftar file yang akan dibuat.
- Hubungan antar scene dan komponen.

### Tahap 3 - Implementasi gameplay inti
Tugas:
- Implementasikan player movement, jump, gravity, collision.
- Implementasikan coin collect dan skor.
- Implementasikan lives dan heart HUD.
- Implementasikan enemy patrol.
- Implementasikan stomp detection yang benar: musuh mati jika player jatuh dari atas; jika collision dari samping/bawah, player terkena damage.
- Tambahkan invincibility singkat setelah damage.
- Tambahkan animasi player dan enemy.

Aturan penting:
- Jangan menyederhanakan stomp menjadi collision biasa.
- Gunakan logika arah vertikal dan posisi relatif player terhadap enemy.
- Pastikan feel gameplay responsif.

### Tahap 4 - Implementasi mobile controls
Tugas:
- Buat tombol touch kiri, kanan, dan lompat.
- Pastikan tombol cukup besar dan nyaman untuk mobile.
- Pastikan input keyboard dan touch dapat hidup berdampingan.
- Pastikan HUD tidak bentrok dengan tombol.

### Tahap 5 - Pembuatan level progression
Tugas:
Buat 2 atau 3 level dengan progresi kesulitan berikut.

#### Level 1
- Paling mudah.
- Mengenalkan kontrol dasar.
- Sedikit musuh.
- Gap platform pendek.
- Coin membantu memberi arah.

#### Level 2
- Lebih menantang.
- Jumlah musuh bertambah.
- Platform lebih tinggi atau lebih sempit.
- Timing lompatan mulai penting.
- Coin lebih tersebar.

#### Level 3
- Level tersulit.
- Kombinasi musuh, gap, dan platform sempit.
- Tantangan lebih rapat.
- Tetap adil dan bisa ditamatkan.

Aturan level design:
- Kesulitan harus meningkat jelas, bukan sekadar mengganti background.
- Tiap level harus tetap bisa diselesaikan secara fair.
- Jangan membuat level terlalu kosong.
- Jangan membuat spike difficulty yang tidak masuk akal.

### Tahap 6 - Flow game lengkap
Tugas:
- Buat Main Menu.
- Buat flow start game ke level 1.
- Buat layar level complete.
- Buat transisi ke level berikutnya.
- Buat Game Over screen.
- Buat final Win / Ending screen setelah level terakhir selesai.
- Sediakan restart current level dan restart dari awal.

### Tahap 7 - Packaging readiness
Tugas:
- Pastikan project adalah web app statis yang bisa dijalankan lokal.
- Pastikan asset path aman untuk build mobile.
- Pastikan struktur project mudah dipasang ke Capacitor.
- Sertakan catatan langkah build Android setelah web build berhasil.

### Tahap 8 - QA dan balancing
Tugas:
- Uji semua level.
- Uji keyboard input.
- Uji touch input.
- Uji stomp consistency.
- Uji game over dan win flow.
- Pastikan HUD tampil baik di desktop dan mobile.
- Pastikan level 1 < level 2 < level 3 dari sisi kesulitan.

## Standar kualitas
- Kode harus rapi, modular, dan mudah dibaca.
- Scene dan komponen tidak boleh berantakan dalam satu file besar tanpa struktur.
- Game harus playable end-to-end.
- Touch control wajib ada.
- Minimal 2 level wajib ada, 3 level lebih diutamakan.
- Progresi kesulitan wajib terasa.
- Desain game tetap ringan dan realistis untuk dibuild ke APK Android.

## Deliverable yang diharapkan dari agent pelaksana
- Source code game Phaser 3.
- Struktur scene lengkap.
- 2 atau 3 level.
- Sistem skor, nyawa, stomp, musuh, coin, HUD, touch controls.
- Instruksi menjalankan project.
- Catatan kesiapan build Android APK.

## Definisi done
Anggap pekerjaan selesai hanya bila semua poin berikut terpenuhi:
- Game bisa dimainkan dari menu sampai tamat.
- Ada minimal 2 level, idealnya 3 level.
- Tingkat kesulitan meningkat nyata.
- Semua fitur inti dari dokumen Construct 2 sudah ada.
- Touch control berjalan.
- Game over dan win state berjalan.
- Project layak dijadikan dasar build APK Android.

## Gaya kerja yang diwajibkan
- Kerjakan secara bertahap dan terstruktur.
- Validasi setiap tahap sebelum lanjut.
- Jangan berhenti di blueprint saja.
- Jika ada bagian belum jelas, buat asumsi yang wajar dan catat asumsi tersebut.
- Fokus pada game yang jadi dan playable.
