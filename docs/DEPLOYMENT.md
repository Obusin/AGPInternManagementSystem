# 🚀 AG&P Attendance System - Deployment Guide

## 📋 Prerequisites

- GitHub account
- Vercel account
- Supabase account (for database and QR code storage)
- Basic knowledge of environment variables

## 🔧 Vercel Deployment

### 1. **Prepare Repository**
```bash
# Ensure all files are committed
git add .
git commit -m "Prepare for deployment"
git push origin main
```

### 2. **Deploy to Vercel**

#### Option A: Vercel CLI
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Follow prompts:
# - Link to existing project? No
# - Project name: agp-attendance-system
# - Directory: ./
# - Override settings? No
```

#### Option B: Vercel Dashboard
1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import your GitHub repository
4. Configure project settings:
   - **Framework Preset**: Other
   - **Root Directory**: ./
   - **Build Command**: (leave empty)
   - **Output Directory**: (leave empty)

### 3. **Environment Variables**
Add these in Vercel Dashboard → Project → Settings → Environment Variables:

```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_APP_NAME=AG&P Attendance System
NEXT_PUBLIC_ENVIRONMENT=production
```

## 🗄️ Supabase Database Setup (Required for QR Codes)

### 1. **Create Supabase Project**
1. Go to [supabase.com](https://supabase.com)
2. Click "New Project"
3. Choose organization and project name
4. Set database password
5. Select region (closest to your users)
6. Note your project URL and anon key

### 2. **Database Schema with QR Code Support**
Run the complete schema from `docs/SUPABASE_SCHEMA.sql` in your Supabase SQL Editor.

**Key tables for QR functionality:**
- `users` - User accounts and profiles
- `user_qr_codes` - QR codes for each user
- `attendance_records` - Attendance tracking with scan methods
- `qr_scan_logs` - Audit log of QR scans

### 3. **Quick Setup SQL**
```sql
-- Essential tables for QR code functionality
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (enhanced)
CREATE TABLE users (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'user',
    department VARCHAR(255),
    position VARCHAR(255),
    avatar TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- QR Codes table
CREATE TABLE user_qr_codes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    qr_data JSONB NOT NULL,
    qr_image TEXT NOT NULL,
    generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true,
    UNIQUE(user_id)
);
```

### 3. **Row Level Security (RLS)**
```sql
-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;

-- Users can only see their own data
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth.uid() = id);

-- Attendance records policies
CREATE POLICY "Users can view own attendance" ON attendance_records
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own attendance" ON attendance_records
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Activities policies
CREATE POLICY "Users can view own activities" ON activities
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own activities" ON activities
    FOR INSERT WITH CHECK (auth.uid() = user_id);
```

## 🔄 Local Development with Production Setup

### 1. **Environment Setup**
```bash
# Copy environment template
cp .env.example .env.local

# Edit .env.local with your values
nano .env.local
```

### 2. **Test Locally**
```bash
# Start local server
npx http-server -p 3000

# Or use Python
python -m http.server 3000

# Visit http://localhost:3000
```

## 📱 PWA Configuration

The app is already configured as a PWA with:
- Service Worker (`config/sw.js`)
- Web App Manifest (`config/manifest.json`)
- Offline support
- Install prompts

## 🔒 Security Considerations

### 1. **Environment Variables**
- Never commit `.env` files
- Use Vercel environment variables for secrets
- Rotate keys regularly

### 2. **HTTPS**
- Vercel provides HTTPS by default
- Ensure all external resources use HTTPS

### 3. **Content Security Policy**
Add to your HTML head:
```html
<meta http-equiv="Content-Security-Policy" 
      content="default-src 'self'; 
               script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net; 
               style-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com;">
```

## 🚀 Deployment Checklist

- [ ] Repository pushed to GitHub
- [ ] Vercel project created and deployed
- [ ] Environment variables configured
- [ ] Supabase project created (if using)
- [ ] Database tables created
- [ ] RLS policies configured
- [ ] Custom domain configured (optional)
- [ ] SSL certificate active
- [ ] PWA functionality tested
- [ ] Mobile responsiveness verified
- [ ] Cross-browser compatibility checked

## 🔧 Troubleshooting

### Common Issues:

1. **Module Import Errors**
   - Ensure all file paths use relative imports
   - Check case sensitivity in file names

2. **Environment Variables Not Loading**
   - Verify variable names start with `NEXT_PUBLIC_`
   - Redeploy after adding variables

3. **Supabase Connection Issues**
   - Check URL and keys are correct
   - Verify RLS policies allow access

4. **PWA Not Installing**
   - Check manifest.json is accessible
   - Ensure HTTPS is enabled
   - Verify service worker registration

## 📞 Support

For deployment issues:
1. Check Vercel deployment logs
2. Review browser console for errors
3. Test in incognito mode
4. Verify all environment variables

## 🎉 Success!

Your AG&P Attendance System should now be live at:
`https://your-project-name.vercel.app`

The system will work offline and sync data when online if Supabase is configured.
