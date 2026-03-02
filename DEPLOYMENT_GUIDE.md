# Thuto Dashboard - Deployment Guide

## 🚀 Deployment Overview

This guide covers deploying the Thuto Dashboard frontend to various platforms.

## 📋 Pre-Deployment Checklist

- [ ] All environment variables configured
- [ ] Firebase project set up and configured
- [ ] Backend API is running and accessible
- [ ] Production build tests successfully
- [ ] All tests passing
- [ ] Dependencies up to date
- [ ] Security vulnerabilities addressed

## 🏗️ Building for Production

### Create Production Build

```bash
cd frontend
npm run build
```

**Output:** `build/` directory containing optimized files

**Build includes:**
- Minified JavaScript
- Optimized CSS
- Compressed images
- Source maps (for debugging)
- Service worker (if configured)

### Test Production Build Locally

```bash
npm run serve
```

Visit `http://localhost:3000` to test the production build.

## 🌐 Deployment Platforms

### 1. Railway (Current Deployment)

Railway is currently used for deployment with automatic builds from GitHub.

#### Configuration Files

**`nixpacks.toml`:**
```toml
[phases.setup]
cmds = [
  "apt-get update && apt-get install -y curl",
  "curl -fsSL https://deb.nodesource.com/setup_18.x | bash -",
  "apt-get install -y nodejs"
]

[phases.install]
cmds = [
  "cd frontend && npm install"
]

[phases.build]
cmds = [
  "cd frontend && npm run build"
]

[start]
cmd = "cd frontend && npm start"

[build.args]
NODE_VERSION = "18.17.0"

[build.environment]
NODE_ENV = "production"
```

**`railway.json`:**
```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "cd frontend && npm install && npm run build"
  },
  "deploy": {
    "startCommand": "cd frontend && npm start"
  }
}
```

#### Deployment Steps

1. **Connect Repository:**
   - Go to [Railway Dashboard](https://railway.app)
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose `Thuto-Dashboard` repository

2. **Configure Environment Variables:**
   ```env
   REACT_APP_FIREBASE_API_KEY=your_key
   REACT_APP_FIREBASE_AUTH_DOMAIN=your_domain
   REACT_APP_FIREBASE_PROJECT_ID=your_project_id
   REACT_APP_FIREBASE_STORAGE_BUCKET=your_bucket
   REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   REACT_APP_FIREBASE_APP_ID=your_app_id
   REACT_APP_FIREBASE_MEASUREMENT_ID=your_measurement_id
   REACT_APP_API_URL=https://your-backend-url.com
   ```

3. **Deploy:**
   - Railway automatically builds and deploys
   - Monitor deployment logs
   - Check for any build errors

4. **Custom Domain (Optional):**
   - Go to Settings → Domains
   - Add custom domain
   - Configure DNS records

#### Automatic Deployments

Railway automatically deploys when you push to the main branch:

```bash
git add .
git commit -m "Update feature"
git push origin main
```

Railway will:
1. Detect the push
2. Run build commands
3. Deploy new version
4. Provide deployment URL

---

#### Environment Variables

- Go to Site Settings → Build & Deploy → Environment
- Add all `REACT_APP_*` variables

**Note:** Environment variables are automatically set on Railway. No additional configuration is required.

---

## 🔐 Environment Variables

### Required Variables

All deployments must include these environment variables:

```env
# Firebase Configuration
REACT_APP_FIREBASE_API_KEY=
REACT_APP_FIREBASE_AUTH_DOMAIN=
REACT_APP_FIREBASE_PROJECT_ID=
REACT_APP_FIREBASE_STORAGE_BUCKET=
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=
REACT_APP_FIREBASE_APP_ID=
REACT_APP_FIREBASE_MEASUREMENT_ID=

# Backend API
REACT_APP_API_URL=
```

### Security Best Practices

1. **Never commit `.env` files**
   ```gitignore
   .env
   .env.local
   .env.production
   ```

2. **Use different Firebase projects for dev/prod**

3. **Restrict API keys:**
   - Firebase Console → Project Settings → API restrictions
   - Limit to specific domains

4. **Configure CORS on backend:**
   - Allow only your frontend domain

---

## 🔧 Post-Deployment Configuration

### 1. Firebase Authentication Domain

Add your deployment domain to Firebase:

1. Go to Firebase Console
2. Authentication → Settings → Authorized domains
3. Add your domain (e.g., `your-app.vercel.app`)

### 2. Backend CORS Configuration

Ensure backend allows requests from your frontend domain:

```javascript
// Backend CORS config
app.use(cors({
  origin: [
    'https://your-frontend-domain.com',
    'http://localhost:3000' // for development
  ],
  credentials: true
}));
```

### 3. Custom Domain Setup

#### DNS Configuration

For custom domain (e.g., `dashboard.thuto.com`):

**A Record:**
```
Type: A
Name: @
Value: [Your hosting IP]
```

**CNAME Record:**
```
Type: CNAME
Name: www
Value: your-app.vercel.app
```

#### SSL Certificate

Most platforms provide free SSL:
- **Vercel:** Automatic
- **Netlify:** Automatic
- **Railway:** Automatic

---

## 📊 Monitoring & Analytics

### 1. Google Analytics

Add to `public/index.html`:

```html
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_MEASUREMENT_ID');
</script>
```

### 2. Error Tracking (Sentry)

Install Sentry:

```bash
npm install @sentry/react
```

Configure in `src/index.js`:

```javascript
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: "YOUR_SENTRY_DSN",
  environment: process.env.NODE_ENV,
  integrations: [new Sentry.BrowserTracing()],
  tracesSampleRate: 1.0,
});
```

### 3. Performance Monitoring

Use Web Vitals:

```javascript
// src/reportWebVitals.js
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

function sendToAnalytics({ name, delta, id }) {
  // Send to analytics service
  gtag('event', name, {
    event_category: 'Web Vitals',
    value: Math.round(delta),
    event_label: id,
  });
}

getCLS(sendToAnalytics);
getFID(sendToAnalytics);
getFCP(sendToAnalytics);
getLCP(sendToAnalytics);
getTTFB(sendToAnalytics);
```

---

## 🚨 Troubleshooting Deployment Issues

### Build Failures

**Issue:** `npm install` fails
```bash
# Solution: Clear cache and retry
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
```

**Issue:** Build runs out of memory
```bash
# Solution: Increase Node memory
NODE_OPTIONS=--max_old_space_size=4096 npm run build
```

### Runtime Errors

**Issue:** Blank white page after deployment

**Solutions:**
1. Check browser console for errors
2. Verify environment variables are set
3. Check API URL is correct and accessible
4. Verify routing configuration

**Issue:** API requests failing

**Solutions:**
1. Check CORS configuration on backend
2. Verify `REACT_APP_API_URL` is correct
3. Check network tab in browser DevTools
4. Ensure backend is running and accessible

### Firebase Issues

**Issue:** Firebase authentication not working

**Solutions:**
1. Add deployment domain to Firebase authorized domains
2. Verify Firebase config variables
3. Check Firebase quotas/limits
4. Enable phone authentication in Firebase Console

---

## 🔄 CI/CD Pipeline

### GitHub Actions Example

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches:
      - main

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v2
      
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: |
          cd frontend
          npm ci
      
      - name: Run tests
        run: |
          cd frontend
          npm test -- --watchAll=false
      
      - name: Build
        run: |
          cd frontend
          npm run build
        env:
          REACT_APP_FIREBASE_API_KEY: ${{ secrets.FIREBASE_API_KEY }}
          REACT_APP_API_URL: ${{ secrets.API_URL }}
      
      - name: Deploy to Railway
        # Railway deployment steps
```

---

## 📝 Deployment Checklist

Before deploying to production:

- [ ] All features tested locally
- [ ] Production build created and tested
- [ ] Environment variables configured
- [ ] Firebase domains authorized
- [ ] Backend CORS configured
- [ ] SSL certificate configured
- [ ] Custom domain DNS configured
- [ ] Analytics configured
- [ ] Error tracking configured
- [ ] Performance monitoring set up
- [ ] Backup plan in place

---

## 🆘 Support & Resources

- **Railway Docs:** https://docs.railway.app/
- **Vercel Docs:** https://vercel.com/docs
- **Netlify Docs:** https://docs.netlify.com/
- **Firebase Docs:** https://firebase.google.com/docs
- **React Deployment:** https://create-react-app.dev/docs/deployment/

---

**Happy Deploying! 🚀**
