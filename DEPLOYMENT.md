# Free Deployment Guide

This guide covers deploying your Beauty Nails site for free using various platforms.

## 🚀 Option 1: Vercel (Recommended - Easiest)

**Why Vercel?**
- Made by the Next.js team - perfect integration
- Automatically handles API routes as serverless functions
- Free tier includes:
  - Unlimited deployments
  - 100GB bandwidth/month
  - Automatic HTTPS
  - Custom domains

### Steps:

1. **Push your code to GitHub:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/yourusername/beauty-nails.git
   git push -u origin main
   ```

2. **Deploy to Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Sign up with GitHub
   - Click "New Project"
   - Import your GitHub repository
   - Vercel will auto-detect Next.js settings

3. **Add Environment Variables:**
   In Vercel dashboard → Project Settings → Environment Variables:
   ```
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
   STRIPE_SECRET_KEY=sk_test_...
   ```

4. **Deploy:**
   - Click "Deploy"
   - Your site will be live in ~2 minutes!
   - URL format: `your-project.vercel.app`

**Note:** Vercel will automatically handle the API route as a serverless function, so your checkout will work out of the box!

---

## 🌐 Option 2: Netlify

**Why Netlify?**
- Great for static sites
- Free tier includes:
  - 100GB bandwidth/month
  - 300 build minutes/month
  - Serverless functions support

### Steps:

1. **Push to GitHub** (same as Vercel step 1)

2. **Deploy to Netlify:**
   - Go to [netlify.com](https://netlify.com)
   - Sign up with GitHub
   - Click "Add new site" → "Import an existing project"
   - Select your repository

3. **Configure Build Settings:**
   ```
   Build command: npm run build
   Publish directory: out
   ```

4. **Add Environment Variables:**
   Site Settings → Environment Variables:
   ```
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
   STRIPE_SECRET_KEY=sk_test_...
   ```

5. **Configure Netlify Functions:**
   Create `netlify.toml` in project root:
   ```toml
   [build]
     command = "npm run build"
     publish = "out"
   
   [[redirects]]
     from = "/api/*"
     to = "/.netlify/functions/:splat"
     status = 200
   ```

6. **Create Netlify Function:**
   Create `netlify/functions/create-checkout-session.js` (copy from `pages/api/create-checkout-session.ts` and convert to JS)

---

## 📦 Option 3: GitHub Pages (Static Only)

**Limitations:**
- ❌ API routes won't work (no serverless functions)
- ✅ Free and simple
- ✅ Good for testing frontend

### Steps:

1. **Update `next.config.js`:**
   ```js
   module.exports = {
     output: 'export',
     basePath: '/beauty-nails', // Your repo name
     images: { unoptimized: true },
   }
   ```

2. **Install gh-pages:**
   ```bash
   npm install --save-dev gh-pages
   ```

3. **Add to `package.json`:**
   ```json
   "scripts": {
     "deploy": "npm run build && gh-pages -d out"
   }
   ```

4. **Deploy:**
   ```bash
   npm run deploy
   ```

5. **Enable GitHub Pages:**
   - Go to repo Settings → Pages
   - Select `gh-pages` branch
   - Your site: `https://username.github.io/beauty-nails`

**Note:** You'll need to use Stripe Payment Links instead of the API route for checkout.

---

## ☁️ Option 4: Cloudflare Pages

**Why Cloudflare?**
- Unlimited bandwidth on free tier
- Fast global CDN
- Free SSL

### Steps:

1. **Push to GitHub**

2. **Deploy to Cloudflare:**
   - Go to [pages.cloudflare.com](https://pages.cloudflare.com)
   - Sign up and connect GitHub
   - Select your repository
   - Build settings:
     - Framework preset: Next.js (Static HTML Export)
     - Build command: `npm run build`
     - Build output directory: `out`

3. **Add Environment Variables:**
   - Project Settings → Environment Variables
   - Add your Stripe keys

**Note:** Cloudflare Pages doesn't support serverless functions on free tier. Use Stripe Payment Links.

---

## 🔧 Pre-Deployment Checklist

Before deploying, make sure:

- [ ] All environment variables are set
- [ ] Stripe keys are configured (test keys for testing)
- [ ] `package.json` has correct build scripts
- [ ] Code is pushed to GitHub/GitLab
- [ ] `.env.local` is in `.gitignore` (never commit secrets!)

## 🎯 Recommended: Vercel

**For this project, Vercel is the best choice because:**
1. ✅ Zero configuration needed
2. ✅ API routes work automatically
3. ✅ Free tier is generous
4. ✅ Perfect Next.js integration
5. ✅ Automatic deployments on git push

## 📝 Quick Vercel Deploy Command

If you have Vercel CLI installed:
```bash
npm i -g vercel
vercel
```

Follow the prompts and you're done!

---

## 🔐 Environment Variables Reference

Make sure to set these in your hosting platform:

**Required:**
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` - Your Stripe publishable key (starts with `pk_`)
- `STRIPE_SECRET_KEY` - Your Stripe secret key (starts with `sk_`)

**Optional:**
- `NEXT_PUBLIC_API_URL` - Only if deploying API separately

---

## 🚨 Important Notes

1. **Never commit `.env.local`** - It contains secrets!
2. **Use test keys first** - Test with Stripe test mode before going live
3. **API Routes** - Only Vercel and Netlify support them on free tier
4. **Custom Domain** - All platforms support free custom domains

---

## 🆘 Troubleshooting

**API route not working?**
- Make sure you're using Vercel or Netlify
- Check environment variables are set correctly
- Verify the API route file exists in `pages/api/`

**Build fails?**
- Check Node.js version (should be 18+)
- Run `npm install` locally first
- Check build logs in hosting dashboard

**Stripe checkout not working?**
- Verify Stripe keys are correct
- Check Stripe dashboard for webhook/API errors
- Make sure you're using the correct key type (test vs live)

