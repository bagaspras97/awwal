# Setup Google SSO untuk Awwal

## Langkah 1: Google Cloud Console Setup

1. **Buka Google Cloud Console**
   - Kunjungi https://console.cloud.google.com/
   - Login dengan akun Google Anda

2. **Buat Project Baru (atau gunakan existing)**
   - Klik "Select a project" → "New Project"
   - Nama project: `awwal-prayer-tracker`
   - Klik "Create"

3. **Enable Google+ API**
   - Di dashboard, klik "APIs & Services" → "Library"
   - Cari "Google+ API" dan enable

4. **Buat OAuth 2.0 Credentials**
   - Klik "APIs & Services" → "Credentials"
   - Klik "Create Credentials" → "OAuth client ID"
   - Application type: "Web application"
   - Name: "Awwal Web Client"

5. **Configure Authorized URLs**
   - Authorized JavaScript origins:
     - `http://localhost:3000` (development)
     - `https://awwal.yourdomain.com` (production)
   - Authorized redirect URIs:
     - `http://localhost:3000/api/auth/callback/google` (development)
     - `https://awwal.yourdomain.com/api/auth/callback/google` (production)

6. **Simpan Client ID dan Client Secret**
   - Copy Client ID dan Client Secret yang muncul
   - Paste ke file `.env.local`

## Langkah 2: Environment Variables

Edit file `.env.local`:

```env
# NextAuth.js Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-super-secret-key-here

# Google OAuth Credentials (dari Google Cloud Console)
GOOGLE_CLIENT_ID=your-google-client-id-from-console
GOOGLE_CLIENT_SECRET=your-google-client-secret-from-console
```

**Generate NEXTAUTH_SECRET:**
```bash
openssl rand -base64 32
```

## Langkah 3: Test Authentication

1. **Start development server:**
   ```bash
   npm run dev
   ```

2. **Test login flow:**
   - Buka http://localhost:3000
   - Klik tombol "Masuk"
   - Login dengan akun Google
   - Verify redirect ke homepage dengan username tampil

## Langkah 4: Production Deployment

1. **Update environment variables di hosting platform**
2. **Update Google OAuth redirect URLs dengan production domain**
3. **Test login flow di production**

## Features yang Sudah Terintegrasi

✅ **Google SSO Login/Logout**  
✅ **User-specific data storage** - Data shalat tersimpan per user ID  
✅ **Session management** - Auto login jika masih valid  
✅ **User stats display** - Statistik ibadah per user  
✅ **Graceful fallback** - App tetap berfungsi tanpa login  

## Troubleshooting

**Error: "redirect_uri_mismatch"**
- Pastikan URL di Google Console sama persis dengan yang digunakan

**Error: "invalid_client"**
- Cek GOOGLE_CLIENT_ID dan GOOGLE_CLIENT_SECRET di .env.local

**Session tidak persist**
- Generate ulang NEXTAUTH_SECRET dengan openssl
- Restart development server

**Data tidak muncul setelah login**
- Data lama (tanpa user ID) tidak akan muncul untuk user yang login
- Ini normal behavior untuk data isolation