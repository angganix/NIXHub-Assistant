# PRD — NIXHub Assistant

**Versi:** 0.2 (Draft) · **Tanggal:** 15 November 2026 · **Penulis:** Angga (Product Owner & Developer) **Platform:** React Native (Android & iOS) · **Lisensi:** MIT (public GitHub)

---

## 1. Ringkasan Eksekutif

NIXHub Assistant adalah aplikasi AI chat agent untuk smartphone yang menjadi *satu pintu* ke banyak provider AI. Pengguna menautkan beberapa akun provider (GPT, Google Gemini, dan lainnya) lewat OAuth, lalu bebas berpindah provider/model di tengah percakapan, atau membuat **Combo** (gabungan beberapa model) yang otomatis berpindah ketika satu akun kena limit.

Selain chat, aplikasi bertindak sebagai *agent host*: pengguna dapat mencari dan memasang **Skills dan Plugins** (integrasi seperti Google Sheets, Notion, Telegram, dan WhatsApp lewat WAHA) langsung dari dalam aplikasi, lalu semuanya otomatis tersedia di sesi chat. Untuk plugin yang butuh akses akun, pengguna cukup memilih akun yang sudah tertaut atau mengisi kredensial sekali.

Cara kerja penghubungan provider, model, custom provider, dan combo mengadopsi konsep 9router; fitur 9router lainnya tidak diadopsi. Aplikasi dibuat sebagai aplikasi mobile native yang ringan, standalone, dan sepenuhnya berjalan di perangkat pengguna (tanpa server perantara milik NIXHub).

## 2. Latar Belakang & Masalah

| Masalah | Dampak |
| --- | --- |
| Akun gratis tiap provider punya limit harian/mingguan | Percakapan terhenti di tengah pekerjaan |
| Pengguna punya banyak akun/provider, tapi harus buka aplikasi berbeda-beda | Konteks terpecah, alur kerja lambat |
| Ekosistem skill dan plugin tersebar dan umumnya hanya nyaman di desktop/CLI | Pengguna mobile tidak bisa memakai agent secara praktis |
| Setup ekstensi (kredensial, OAuth) rumit | Hambatan adopsi |

**Peluang:** satu aplikasi mobile yang menyatukan multi-akun provider, routing otomatis (combo), dan marketplace ekstensi agent dengan UX native.

## 3. Tujuan, Non-Tujuan, dan Metrik

### 3.1 Tujuan

1. Chat dengan AI lintas provider dalam satu aplikasi, dengan switch provider/model kapan saja.
2. Menautkan banyak akun provider lewat OAuth (tanpa API key) bila provider mendukung.
3. Membuat Combo model dengan aturan routing dan failover otomatis.
4. Menemukan dan memasang Skills dan Plugins secara mandiri dari dalam aplikasi.
5. Mendukung custom provider OpenAI-compatible dan Anthropic-compatible (URL + API key).
6. Pengalaman native mobile yang modern, minimalis, dan compact.
7. Proyek open source yang transparan dan mudah dikontribusi.

### 3.2 Non-Tujuan (v1)

- Tidak menyediakan backend/proxy terpusat milik NIXHub; token dan data tetap di perangkat.
- Tidak menjual, membagikan, atau me-resell akses/akun/kredit AI.
- Tidak melakukan scraping sesi web (cookie/token browser) provider pada v1, kecuali diputuskan lain di §14 (DeepSeek Web).
- Tidak mendukung MCP (Model Context Protocol); ekstensi hanya Skills dan Plugins.
- Tidak mengadopsi fitur 9router di luar penghubungan provider, model, custom provider, dan combo.
- Tidak ada fitur tim/kolaborasi multi-user dan tidak ada sinkronisasi antar perangkat; aplikasi standalone untuk satu pengguna.

### 3.3 Metrik Keberhasilan

| Metrik | Target (6 bulan setelah rilis publik) |
| --- | --- |
| Waktu dari install ke pesan pertama (dengan 1 provider) | < 2 menit |
| Pesan yang berhasil di-failover otomatis saat limit | > 95% |
| Crash-free sessions | > 99% |
| Latency token pertama (selain waktu provider) | < 300 ms overhead aplikasi |
| Pengguna yang memasang ≥ 1 skill atau plugin | > 40% |
| GitHub stars / kontributor aktif | 1.000 / 15 |

## 4. Target Pengguna

| Persona | Kebutuhan |
| --- | --- |
| **Power user AI gratisan** — punya beberapa akun, sering kena limit | Switch cepat, combo otomatis, pantau sisa kuota |
| **Developer / tinkerer** — punya 9router atau gateway sendiri | Custom provider OpenAI/Anthropic-compatible, combo model |
| **Profesional non-teknis** — ingin AI yang bisa mengakses Google Sheets, Notion, Telegram, WhatsApp | Install ekstensi dengan satu ketukan, OAuth mudah |

## 5. Ruang Lingkup & Prioritas

| Modul | MVP (v0.x) | v1.0 | v1.x+ |
| --- | --- | --- | --- |
| Provider OAuth multi-akun | ChatGPT, Google Gemini (atau Antigravity), DeepSeek Web (status DeepSeek Web: lihat §14) | Stabilisasi adapter | Provider tambahan via adapter komunitas |
| Custom provider (OpenAI/Anthropic compatible) | ✔ | ✔ | — |
| Chat + switch provider/model | ✔ | ✔ | Voice, gambar |
| Combo | ✔ (failover sederhana) | ✔ semua strategi | Combo adaptif berdasarkan kuota/latensi |
| Marketplace Skills | — | ✔ | — |
| Marketplace Plugins (Google Sheets, Notion, Telegram, WhatsApp/WAHA) | — | ✔ | Plugin tambahan dari komunitas |
| Akun dan kredensial untuk plugin | — | ✔ | — |
| Backup/ekspor lokal terenkripsi | — | ✔ | — |

## 6. Kebutuhan Fungsional

### 6.1 Provider & Akun (OAuth)

| ID | Kebutuhan | Prioritas |
| --- | --- | --- |
| FR-P1 | Pengguna dapat menambah akun provider via OAuth 2.0 Authorization Code + PKCE memakai browser sistem (Custom Tabs / ASWebAuthenticationSession), bukan WebView tertanam. | P0 |
| FR-P2 | Satu provider dapat memiliki banyak akun; tiap akun punya label, avatar/email, status (aktif, limit, token kedaluwarsa, error). | P0 |
| FR-P3 | Token disimpan terenkripsi di Keychain/Keystore; refresh token otomatis di latar belakang. | P0 |
| FR-P4 | Daftar model per akun diambil dinamis dari provider (bila ada endpoint model) atau dari katalog internal yang dapat diperbarui. | P0 |
| FR-P5 | Indikator kuota/limit per akun (sisa, reset time) bila provider mengekspos informasinya; jika tidak, deteksi dari respons 429 dan tampilkan perkiraan. | P1 |
| FR-P6 | Pengguna dapat mengaktifkan/menonaktifkan, mengganti nama, mengurutkan, dan mencabut (logout + hapus token) akun kapan saja. | P0 |
| FR-P7 | Arsitektur *provider adapter* sehingga provider baru dapat ditambah tanpa mengubah inti aplikasi (lihat §8.3). | P0 |
| FR-P8 | Setiap provider ditandai tingkat dukungannya (Tier A/B/C, lihat §10) beserta peringatan yang sesuai. | P0 |

**Provider MVP:** ChatGPT, Google Gemini (atau Antigravity), dan DeepSeek Web. Provider lain ditambahkan kemudian lewat adapter (FR-P7). Status DeepSeek Web: lihat §10.1 dan §14.

### 6.2 Custom Provider

| ID | Kebutuhan | Prioritas |
| --- | --- | --- |
| FR-C1 | Tambah provider kustom dengan **Base URL + API key**, pilih format: OpenAI-compatible (`/v1/chat/completions`) atau Anthropic-compatible (`/v1/messages`). | P0 |
| FR-C2 | Tombol *Test connection* dan *Fetch models* (`/v1/models` bila tersedia), serta input model manual. | P0 |
| FR-C3 | Header kustom opsional; API key disimpan di secure storage. | P1 |
| FR-C4 | Custom provider diperlakukan setara dengan provider OAuth di model picker dan Combo. | P0 |
| FR-C5 | Mendukung streaming (SSE), tool calling, dan vision sejauh didukung endpoint; kapabilitas dapat diatur manual. | P1 |

### 6.3 Chat

| ID | Kebutuhan | Prioritas |
| --- | --- | --- |
| FR-H1 | Antarmuka chat dengan streaming token, render Markdown, blok kode (salin, syntax highlight), dan tabel. | P0 |
| FR-H2 | **Model picker** di header chat: pilih akun + model, atau Combo. Dapat diganti di tengah percakapan; riwayat pesan dibawa ke model baru. | P0 |
| FR-H3 | Tiap pesan AI menampilkan label provider/model yang menjawab (penting saat Combo/failover). | P0 |
| FR-H4 | Saat limit tercapai: tampilkan notifikasi non-intrusif dan tawarkan *Switch* manual, atau otomatis berpindah bila Combo aktif. | P0 |
| FR-H5 | Riwayat percakapan lokal (cari, pin, arsipkan, hapus, ekspor Markdown/JSON). | P0 |
| FR-H6 | Lampiran gambar dan file (sesuai kapabilitas model); fallback ke model lain bila model aktif tidak mendukung. | P1 |
| FR-H7 | Regenerate, edit pesan, dan *branch* percakapan. | P1 |
| FR-H8 | System prompt/persona per percakapan dan default global. | P1 |
| FR-H9 | Manajemen konteks: pemotongan/ringkasan otomatis ketika riwayat melebihi jendela konteks model tujuan saat berpindah. | P0 |
| FR-H10 | Tool calls ditampilkan sebagai kartu ringkas yang dapat dibuka (nama tool, argumen, hasil), dengan konfirmasi untuk aksi sensitif. | P0 |

### 6.4 Combo (Chat Agent Gabungan)

| ID | Kebutuhan | Prioritas |
| --- | --- | --- |
| FR-B1 | Pengguna membuat Combo: nama, ikon, dan daftar berurutan anggota (akun + model) dari provider OAuth maupun custom. | P0 |
| FR-B2 | Strategi routing: **Priority/Fallback** (urut, pindah saat gagal/limit), **Round-robin**, **Random**, **Least-used** (berdasarkan pemakaian lokal). | P0 (Fallback), P1 (lainnya) |
| FR-B3 | Pemicu failover: HTTP 429/402/403 kuota, 5xx, timeout, atau token refresh gagal. Pengaturan retry, jeda, dan batas percobaan. | P0 |
| FR-B4 | *Cooldown* otomatis untuk akun yang kena limit sampai perkiraan reset; akun kembali ke rotasi sendiri. | P0 |
| FR-B5 | Pembatasan per anggota: hanya untuk kapabilitas tertentu (mis. vision, coding), atau konteks minimum. | P2 |
| FR-B6 | Combo muncul sebagai satu "model" di model picker dan dapat dijadikan default. | P0 |
| FR-B7 | Log routing per pesan (anggota mana yang dicoba dan hasilnya) untuk transparansi dan debugging. | P1 |
| FR-B8 | Pratinjau/uji Combo (kirim pesan uji dan lihat jalur routing). | P2 |

### 6.5 Marketplace Skills dan Plugins

Semua kategori memakai pola UX yang sama: **Cari → Detail → Install → Konfigurasi/Otorisasi → Aktif di chat**.

| ID | Kebutuhan | Prioritas |
| --- | --- | --- |
| FR-M1 | Tab *Explore* dengan pencarian, kategori, filter (populer, terbaru, terpasang), dan halaman detail (deskripsi, sumber/repo, versi, izin yang diminta, README). | P0 |
| FR-M2 | Sumber katalog dapat dikonfigurasi: registry publik yang sudah ada, indeks katalog terbuka, dan repositori GitHub (URL langsung). Katalog di-cache lokal untuk akses offline. | P0 |
| FR-M3 | **Skills:** pemasangan paket skill (folder berisi instruksi `SKILL.md` + sumber daya) dari GitHub/registry; skill dimuat ke konteks agent secara *on-demand* berdasarkan deskripsinya (progressive disclosure) agar hemat token. | P0 (v1) |
| FR-M4 | **Plugins:** paket integrasi deklaratif (manifest) yang mendaftarkan sekumpulan tool (fungsi) ke agent. Plugin awal: Google Sheets, Notion, Telegram, dan WhatsApp (lewat WAHA). | P0 (v1) |
| FR-M5 | Setiap plugin mendeklarasikan jenis autentikasi (OAuth, token bot, atau URL server + API key) dan skema konfigurasinya, yang dirender sebagai form di aplikasi. | P0 |
| FR-M6 | Setiap ekstensi mendeklarasikan **izin** (jaringan, akun tertaut, file, dll.); pengguna menyetujui saat install dan dapat mengubahnya kemudian. | P0 |
| FR-M7 | Ekstensi terpasang **otomatis tersedia di chat**; pengguna dapat mengaktifkan/menonaktifkan global atau per percakapan. | P0 |
| FR-M8 | Pembaruan ekstensi: deteksi versi baru, tampilkan *changelog* dan perubahan izin sebelum memperbarui. | P1 |
| FR-M9 | Label kepercayaan: *Verified* (ditinjau komunitas), *Community*, *Manual/Unverified*, dengan peringatan jelas untuk sumber tidak terverifikasi. | P0 |
| FR-M10 | Hapus/uninstall bersih (termasuk cabut token ekstensi). | P0 |

### 6.6 Otorisasi Akun untuk Ekstensi

| ID | Kebutuhan | Prioritas |
| --- | --- | --- |
| FR-A1 | Plugin yang butuh akun atau kredensial (Google Sheets, Notion, Telegram, WhatsApp lewat WAHA) menampilkan langkah *Connect* saat install atau saat pertama dipakai. Jenisnya: OAuth (Google, Notion), token bot (Telegram), atau URL server + API key (WAHA self-hosted). | P0 |
| FR-A2 | Untuk plugin berbasis OAuth, pengguna dapat **memilih akun yang sudah tertaut** (mis. akun Google yang dipakai untuk provider Gemini) agar tidak login ulang; bila scope yang dibutuhkan belum ada, minta *incremental consent* hanya untuk scope tambahan. | P0 |
| FR-A3 | Ada layar *Connected Accounts* yang menampilkan semua akun dan kredensial, scope yang diberikan, plugin yang memakainya, dan tombol cabut. | P0 |
| FR-A4 | Pemisahan jelas antara **akun untuk provider AI** dan **akun untuk plugin**: satu identitas (mis. Google) dapat dipakai untuk keduanya, tetapi scope dikelola terpisah dan dapat dicabut terpisah. | P0 |
| FR-A5 | Scope minimum (*least privilege*); aksi tulis/hapus/kirim (mengubah sheet, mengirim pesan Telegram atau WhatsApp) membutuhkan konfirmasi di chat secara default. | P0 |
| FR-A6 | Opsi memasukkan OAuth *client ID* sendiri (mis. proyek Google Cloud milik pengguna) bagi pengguna yang tidak ingin memakai client ID bawaan aplikasi. | P1 |

### 6.7 Pengaturan, Data, dan Privasi

- **FR-S1** Semua data (chat, konfigurasi, token) tersimpan lokal; tidak ada telemetri tanpa persetujuan eksplisit (opt-in, anonim).
- **FR-S2** Kunci aplikasi (biometrik/PIN) opsional.
- **FR-S3** Ekspor/impor konfigurasi (provider tanpa token, combo, daftar ekstensi) dan backup terenkripsi dengan passphrase.
- **FR-S4** Tema terang/gelap/sistem, ukuran font, bahasa (Indonesia & Inggris).
- **FR-S5** Halaman *Usage* lokal: jumlah pesan dan token per akun/model, riwayat failover.

## 7. Kebutuhan Non-Fungsional

| Area | Kebutuhan |
| --- | --- |
| Performa | Start dingin < 2 detik di perangkat menengah; scroll chat 60 fps; streaming tanpa *jank* untuk percakapan panjang (virtualized list). |
| Keandalan | Retry dengan *exponential backoff*; pesan tidak hilang saat aplikasi masuk latar belakang; draf tersimpan otomatis. |
| Keamanan | Token di Keychain/Keystore; tidak ada token di log; TLS wajib; *certificate* kustom hanya untuk custom provider dengan peringatan; sandbox untuk eksekusi tool. |
| Privasi | On-device first; tidak ada akun NIXHub; tidak ada pengiriman data ke pihak ketiga selain provider/ekstensi yang dipilih pengguna. |
| Aksesibilitas | Dukungan *screen reader*, kontras WCAG AA, ukuran sentuh ≥ 44 pt. |
| Kompatibilitas | Android 8+ (API 26), iOS 15+. |
| Observabilitas | Mode *debug log* lokal yang dapat dibagikan pengguna saat melaporkan bug (token otomatis disamarkan). |
| Lokalisasi | Indonesia dan Inggris sejak awal (i18n). |

## 8. Arsitektur Teknis (Usulan)

### 8.1 Tech Stack

| Lapisan | Pilihan |
| --- | --- |
| Framework | React Native + **Expo** (dev build / prebuild), TypeScript strict |
| Navigasi | Expo Router |
| UI | **NativeWind** (Tailwind untuk RN) + **React Native Reusables** (port gaya shadcn/ui untuk RN, berbasis `@rn-primitives`) |
| Ikon | Lucide (`lucide-react-native`) |
| State | Zustand + TanStack Query |
| Penyimpanan | `expo-sqlite` + Drizzle ORM (chat, katalog cache); `expo-secure-store` (token, API key) |
| OAuth | `expo-auth-session` / `expo-web-browser` (PKCE), *deep link* `nixhub://oauth/callback` |
| Streaming | `expo/fetch` (streaming response) atau `react-native-sse` |
| Markdown | `react-native-markdown-display` (atau renderer kustom) + syntax highlight ringan |
| Test | Jest, React Native Testing Library, Maestro (E2E) |
| CI/CD | GitHub Actions + EAS Build, rilis APK di GitHub Releases |

> Catatan: shadcn/ui asli berbasis DOM/Radix sehingga tidak bisa dipakai langsung di React Native. Pendekatan terdekat adalah React Native Reusables (komponen dengan API dan estetika shadcn) di atas NativeWind.

### 8.2 Lapisan Aplikasi

1. **UI Layer** — layar, komponen, tema.
2. **Conversation Engine** — mengelola riwayat, konteks, pemanggilan tool (agent loop), streaming.
3. **Model Router** — menerjemahkan pilihan pengguna (akun/model/combo) menjadi permintaan ke adapter; menjalankan strategi Combo, failover, cooldown.
4. **Provider Adapters** — satu antarmuka seragam per provider (lihat §8.3).
5. **Extension Runtime** — pemuat Skills, pengelola Plugins (manifest dan eksekutor tool), *permission broker*.
6. **Auth Manager** — OAuth flow, penyimpanan dan refresh token, *account linking*.
7. **Storage Layer** — SQLite, secure store, cache.

### 8.3 Antarmuka Provider Adapter

Setiap adapter mengimplementasikan kontrak yang sama:

- `authenticate()` / `refresh()` / `revoke()`
- `listModels(account)`
- `chat(request, account)` → *stream* event seragam (teks, tool call, usage, error)
- `capabilities(model)` → streaming, tools, vision, panjang konteks
- `normalizeError(e)` → `RATE_LIMIT | QUOTA | AUTH | NETWORK | SERVER | UNKNOWN` (dipakai Router untuk failover)

Format internal pesan dan tool call dinormalisasi; adapter bertugas menerjemahkan ke format OpenAI, Anthropic, Gemini, dan lainnya.

### 8.4 Model Data Inti

`ProviderAccount` (id, providerId, label, status, tokenRef) · `Model` (id, providerId, capabilities) · `Combo` (id, nama, strategi, members\[\]) · `Conversation` · `Message` (role, content, modelUsed, routingLog) · `Extension` (id, tipe, sumber, versi, izin, status) · `ConnectedAccount` (id, identitas, scopes) · `ExtensionBinding` (extensionId → connectedAccountId).

### 8.5 Batasan Mobile untuk Skills dan Plugins

- MCP tidak didukung (keputusan produk). Integrasi dilakukan lewat plugin deklaratif yang memanggil REST API layanan terkait (Google Sheets API, Notion API, Telegram Bot API, WAHA).
- iOS dan toko aplikasi membatasi eksekusi kode yang diunduh secara dinamis. Maka **plugin berbentuk deklaratif** (manifest + definisi tool + panggilan HTTP), bukan kode native arbitrer. Eksekusi JavaScript kustom, jika ada, harus di sandbox (interpreter JS terisolasi tanpa akses sistem) dan ditinjau terhadap aturan toko aplikasi.
- Skills bersifat **instruksi dan sumber daya** (Markdown/teks), sehingga aman dan portabel; skill yang menyertakan skrip eksekusi ditandai *tidak didukung di mobile* kecuali ada runtime yang sesuai.

### 8.6 Keamanan Ekstensi

- *Permission broker*: ekstensi tidak pernah memegang token mentah; semua panggilan lewat broker yang menyuntikkan kredensial dan menegakkan scope.
- Pembatasan domain jaringan per ekstensi (allowlist).
- Konfirmasi pengguna untuk aksi bertipe tulis/destruktif.
- Peringatan *prompt injection*: konten dari tool/plugin diperlakukan sebagai data tidak tepercaya; instruksi di dalamnya tidak boleh memicu tool sensitif tanpa konfirmasi.

## 9. UI/UX

### 9.1 Prinsip Desain

- **Native-first:** gestur platform (swipe back, long-press, pull to refresh), *haptics* halus, *bottom sheet* untuk pemilihan.
- **Minimalis & compact:** kepadatan informasi tinggi, tipografi kecil-tapi-terbaca (14–15 pt isi), spasi 4/8 pt, sudut membulat 10–12.
- **Gaya PaaS modern:** permukaan netral (zinc/slate), satu warna aksen (mis. indigo/violet), border tipis, bayangan minimal; terang dan gelap setara.
- **Transparansi:** selalu jelas model/akun mana yang sedang menjawab dan sisa kuotanya.

### 9.2 Navigasi (Bottom Tabs)

| Tab | Isi |
| --- | --- |
| **Chat** | Daftar percakapan → layar chat; model picker di header; tombol *New chat* |
| **Models** | Akun provider, custom provider, Combo |
| **Explore** | Pencarian dan katalog: Skills · Plugins (segmented control) |
| **Library** | Ekstensi terpasang, Connected Accounts, izin |
| **Settings** | Tema, bahasa, keamanan, backup, tentang, lisensi, legal |

### 9.3 Layar Kunci

1. **Onboarding** — pengantar singkat, penjelasan legal/risiko, tautkan provider pertama (≤ 3 langkah).
2. **Chat** — gelembung pesan ringkas, kartu tool call yang dapat dilipat, input bar dengan tombol lampiran, *model chip* yang dapat diketuk untuk membuka bottom sheet pemilih model/Combo.
3. **Model Picker (bottom sheet)** — dikelompokkan per provider/akun, badge status (aktif/limit/error), bar kuota mini, bagian *Combos* di atas.
4. **Combo Builder** — daftar anggota dapat diurutkan dengan *drag*, pemilih strategi, pengaturan failover, tombol *Test*.
5. **Explore → Detail Ekstensi** — ikon, deskripsi, sumber, izin yang diminta, tombol **Install** → langkah *Connect account* bila perlu.
6. **Connected Accounts** — kartu per identitas dengan scope dan ekstensi yang memakainya.

### 9.4 Komponen & Ikon

Button, Input, Sheet, Dialog, Tabs, Badge, Switch, Command/Search, Toast, Skeleton, Avatar — memakai set React Native Reusables; ikon Lucide dengan ukuran konsisten (16/20/24).

## 10. Legalitas, Kepatuhan, dan Risiko Penggunaan Akun Gratis

> Bagian ini sengaja ditulis lugas karena menjadi risiko terbesar proyek. Ini bukan nasihat hukum; **lakukan peninjauan hukum/ToS tiap provider sebelum rilis publik** dan verifikasi ulang kondisi terbaru, karena kebijakan provider sering berubah.

### 10.1 Realitas yang Perlu Disadari

- Sebagian besar provider **tidak menyediakan OAuth publik bagi aplikasi pihak ketiga untuk mengakses chat konsumen** (mis. akun chat gratis). Pendekatan seperti 9router umumnya memakai alur OAuth milik *CLI/klien resmi* provider. Itu secara teknis berjalan, tetapi **berada di area abu-abu** dan dapat melanggar ketentuan layanan sebagian provider (risiko pembatasan atau penangguhan akun pengguna).
- Beberapa provider (mis. DeepSeek) pada umumnya **tidak memiliki OAuth untuk chat**; akses resminya via API key. DeepSeek Web tidak memakai OAuth; mengaksesnya berarti memakai sesi web (cookie/token browser), yang bertentangan dengan prinsip 10.3 no. 1. Hal ini perlu keputusan (§14, pertanyaan terbuka no. 1); jalur resminya adalah DeepSeek API dengan API key lewat Custom Provider.
- Berpindah antar **provider berbeda** untuk menghindari limit adalah penggunaan wajar. Merotasi **banyak akun pada provider yang sama** untuk menembus limit lebih berisiko melanggar ketentuan anti-penyalahgunaan.

### 10.2 Klasifikasi Dukungan Provider

| Tier | Definisi | Contoh | Perlakuan di aplikasi |
| --- | --- | --- | --- |
| **A — Resmi** | OAuth/akses yang memang disediakan untuk aplikasi pihak ketiga dengan *client ID* aplikasi NIXHub sendiri | OAuth PKCE penyedia gateway yang mengizinkan aplikasi pihak ketiga (mis. OpenRouter), Google OAuth dengan *client ID* proyek sendiri bila kebijakannya mengizinkan | Aktif default, tanpa peringatan khusus |
| **B — Eksperimental** | OAuth memakai alur/*client ID* klien resmi provider (gaya 9router) | ChatGPT dan Google Gemini/Antigravity (provider MVP) | Boleh masuk build publik. Aktif setelah pengguna menyetujui dialog risiko, berlabel "Eksperimental", dan dapat dinonaktifkan lewat katalog bila provider melarang |
| **C — API key** | Pengguna membawa kunci sendiri | OpenAI/Anthropic-compatible, DeepSeek API, gateway pribadi | Aktif default; tanggung jawab kunci di pengguna |
| **D — Sesi web** | Login memakai cookie/token sesi browser | DeepSeek Web | Belum didukung; menunggu keputusan (§14, pertanyaan terbuka no. 1) |

### 10.3 Prinsip Kepatuhan Proyek

1. **Tanpa scraping sesi web** (cookie/token browser) dan tanpa menembus mekanisme anti-bot.
2. **Kredensial hanya milik pengguna dan tetap di perangkatnya**; tidak ada pengumpulan, penjualan, atau berbagi akun/token.
3. **Tidak ada layanan terpusat** yang memproksi akses atas nama banyak pengguna.
4. **Persetujuan eksplisit** sebelum mengaktifkan provider Tier B, termasuk teks risiko (kemungkinan akun dibatasi/ditangguhkan).
5. **Kepatuhan toko aplikasi** (Google Play / App Store): konsultasikan kebijakan untuk aplikasi yang menautkan akun layanan pihak ketiga; distribusi awal lewat komunitas (APK di GitHub Releases, F-Droid), dan Google Play dipertimbangkan setelah kepatuhan dipastikan.
6. **Merek dagang:** gunakan nama dan logo provider hanya secara deskriptif (*nominative use*), dengan pernyataan *"tidak berafiliasi dengan atau didukung oleh provider mana pun"*.
7. **Tanggapi permintaan resmi:** bila provider meminta penghapusan adapter, adapter tersebut dicabut dari katalog dan repositori.
8. **Lisensi dan kepatuhan open source:** gunakan lisensi MIT, cantumkan atribusi dependensi, dan sertakan dokumen `SECURITY.md`, `CODE_OF_CONDUCT.md`, serta `DISCLAIMER.md`.
9. **Privasi:** sediakan Kebijakan Privasi dan Syarat Penggunaan; jelaskan bahwa data hanya diproses di perangkat dan dikirim ke provider yang dipilih pengguna (relevan untuk UU PDP Indonesia dan GDPR bila ada pengguna terkait).

### 10.4 Teks Disclaimer Minimum (di Onboarding dan Pengaturan)

- NIXHub Assistant adalah proyek independen dan tidak berafiliasi dengan provider AI mana pun.
- Anda bertanggung jawab mematuhi ketentuan layanan tiap provider dan akun yang Anda tautkan.
- Fitur eksperimental berisiko memicu pembatasan akun oleh provider.
- Token tersimpan hanya di perangkat Anda dan dapat dicabut kapan saja.

## 11. Roadmap

| Fase | Perkiraan | Deliverable |
| --- | --- | --- |
| **0 — Fondasi** | Minggu 1–3 | Repo publik (MIT), CI, desain sistem UI, kerangka navigasi, secure storage, kontrak adapter |
| **1 — MVP Chat** | Minggu 4–8 | Adapter ChatGPT dan Google Gemini/Antigravity (Tier B, dengan dialog risiko), DeepSeek (sesuai keputusan §14), custom provider OpenAI/Anthropic-compatible, chat streaming, model picker, riwayat lokal |
| **2 — Combo & Failover** | Minggu 9–11 | Combo builder, strategi Fallback, cooldown, log routing, indikator kuota |
| **3 — Skills** | Minggu 12–15 | Pemuat skill, Explore Skills, install dari GitHub/registry, label kepercayaan |
| **4 — Plugins & Akun** | Minggu 16–22 | Spesifikasi plugin deklaratif, permission broker, Connected Accounts, plugin Google Sheets, Notion, Telegram, dan WhatsApp (WAHA), pembaruan ekstensi |
| **5 — Beta Komunitas** | Minggu 23–26 | Backup terenkripsi, aksesibilitas, tinjauan keamanan dan legal, rilis APK di GitHub Releases |
| **6 — v1.0** | Setelah beta | Distribusi komunitas (GitHub Releases, opsional F-Droid), Google Play dipertimbangkan setelah tinjauan kebijakan, dokumentasi kontributor |

*Estimasi untuk satu pengembang; sesuaikan dengan kapasitas.*

## 12. Risiko dan Mitigasi

| Risiko | Dampak | Mitigasi |
| --- | --- | --- |
| Provider melarang/memblokir alur OAuth klien resmi | Adapter Tier B mati atau akun pengguna kena sanksi | Dialog risiko sebelum aktif, *remote kill switch* via katalog, jalur Tier A/C tetap tersedia |
| Penolakan toko aplikasi | Distribusi terbatas | Komunitas dulu (APK/F-Droid); tinjau kebijakan sebelum Google Play |
| API provider tidak resmi berubah tanpa pemberitahuan | Fitur rusak | Adapter modular, tes kontrak otomatis, pembaruan katalog tanpa rilis aplikasi |
| DeepSeek Web tidak punya OAuth | Adapter sesi web rapuh dan bertentangan dengan prinsip kepatuhan | Putuskan di §14; alternatif DeepSeek API key lewat Custom Provider |
| Plugin berbahaya / *prompt injection* | Kebocoran data, aksi tak diinginkan | Permission broker, allowlist domain, konfirmasi aksi tulis, label kepercayaan |
| Verifikasi OAuth Google untuk scope Sheets | Aplikasi tanpa verifikasi dibatasi jumlah pengguna dan menampilkan layar peringatan | Opsi *client ID* milik pengguna (FR-A6) atau proses verifikasi Google |
| WhatsApp lewat WAHA bukan jalur resmi WhatsApp | Nomor WhatsApp pengguna dapat dibatasi/diblokir | Peringatan di plugin, WAHA dijalankan pengguna sendiri, aksi kirim wajib konfirmasi |
| Kebocoran token | Akun pengguna disalahgunakan | Keychain/Keystore, tidak ada log token, kunci biometrik, mudah dicabut |
| Batasan mobile (eksekusi kode) | Plugin terbatas pada integrasi HTTP | Plugin deklaratif, tanpa kode native arbitrer |
| Beban pemeliharaan banyak adapter | Proyek mandek (satu pengembang) | Antarmuka adapter bersih, dokumentasi kontribusi adapter, komunitas |
| Konteks hilang saat berpindah model | Kualitas jawaban turun | Ringkasan konteks otomatis, penanda perpindahan model di UI |

## 13. Rencana Open Source

- Repo publik GitHub (monorepo: `app/`, `packages/adapters/`, `packages/registry-schema/`, `docs/`).
- Lisensi **MIT**.
- Dokumen: `README`, `LICENSE`, `CONTRIBUTING`, `ARCHITECTURE`, `ADAPTER_GUIDE`, `EXTENSION_SPEC`, `SECURITY`, `DISCLAIMER`.
- Template *issue/PR*, label *good first issue*, rilis bersemver, *changelog* otomatis.
- Skema registry ekstensi terbuka agar komunitas dapat menerbitkan katalog sendiri.
- Distribusi awal berbasis komunitas: APK di GitHub Releases (opsional F-Droid); Google Play dipertimbangkan kemudian.

## 14. Keputusan dan Pertanyaan Terbuka

**Keputusan pemilik produk (15 November 2026):**

| # | Pertanyaan | Keputusan |
| --- | --- | --- |
| 1 | Provider MVP | ChatGPT, Google Gemini (atau Antigravity), DeepSeek Web. Provider lain belum diketahui; MVP cukup tiga ini. |
| 2 | Tier B (gaya 9router) di build publik | Boleh. Konsep 9router hanya dipakai untuk penghubungan provider, model, custom provider OpenAI/Anthropic-compatible, dan combo model. |
| 3 | Sumber katalog dan MCP | MCP tidak dipakai. Ekstensi = Skills + Plugins (Google Sheets, Notion, Telegram, WhatsApp lewat WAHA). |
| 4 | Lisensi | MIT |
| 5 | Sinkronisasi antar perangkat | Tidak perlu; standalone untuk satu pengguna |
| 6 | Target distribusi | Basis komunitas dulu (GitHub); Google Play mungkin belakangan |
