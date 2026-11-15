# Desain onboarding dan setup provider MVP

## Tujuan
Bantu pengguna mulai memakai NIXHub Assistant tanpa mengesankan bahwa OAuth consumer sudah siap. Pengguna boleh melewati setup, lalu menambah endpoint kompatibel OpenAI atau Anthropic dari layar Models.

## Cakupan
- Onboarding singkat: pengantar, disclosure privasi/legal, setup provider opsional, tombol “Lewati”.
- Models: tambah/edit/hapus akun provider, pilih format OpenAI atau Anthropic, simpan key hanya lewat `SecretStore`, uji koneksi, ambil model, dan izinkan ID model manual bila fetch gagal.
- Mask API key; jangan tampilkan key sesudah disimpan atau masukkan ke ekspor konfigurasi.
- Settings MVP: bahasa, tema, prompt sistem default, disclosure, privasi, terms, versi aplikasi.
- Dokumen `DISCLAIMER.md`, `PRIVACY.md`, `TERMS.md` jelaskan penyimpanan lokal, pengiriman data ke provider terpilih, non-afiliasi, tanggung jawab pengguna, risiko integrasi eksperimental, dan pencabutan kredensial.

## Di luar cakupan
Capability switches, OAuth provider, marketplace, plugin, ekspor debug lokal, dan fitur pengelolaan model lanjutan. Tidak ada klaim zero-setup OAuth.

## Pendekatan
1. Setup ringkas (dipilih pengguna): onboarding disclosure + skip, pengelolaan provider/model penting, uji koneksi, dan model manual. Minimalkan langkah sebelum chat.
2. Setup lengkap: tambah capability switches, advanced settings, dan ekspor debug. Lebih banyak kontrol, tetapi memperlebar MVP dan memerlukan pengaturan tambahan.

## Keputusan implementasi
Gunakan Expo Router, JavaScript, NativeWind, SQLite/Drizzle, dan `SecretStore` yang sudah ada. Provider account menyimpan metadata dan opaque `secretRef`; nilai key tidak masuk SQLite. Onboarding dan Models gunakan layanan/provider registry yang sudah ada. Indonesian dan English harus memiliki string sepadan dan aksi berlabel aksesibilitas.

## Risiko dan batas
Disclosure/legal copy bukan pengganti tinjauan hukum. Uji koneksi memerlukan endpoint dan kredensial milik pengguna. Redirect/URL validation tetap mengikuti kontrak keamanan provider yang sudah dibuat.
