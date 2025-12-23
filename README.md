# Beauty Nails - Custom Nail Design Store

A modern, elegant Next.js static site for selling custom nail products with AI-powered sizing guide.

## Features

- 🎨 Elegant, mobile-responsive design
- 💳 Stripe checkout integration
- 📸 AI-powered sizing guide with camera
- 🤖 Hand detection and nail size measurement
- ⚡ Fast static site generation

## Setup

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
Create a `.env.local` file with your Stripe keys:
```
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_publishable_key
STRIPE_SECRET_KEY=your_secret_key
```

3. Run development server:
```bash
npm run dev
```

4. Build for production:
```bash
npm run build
```

The static site will be generated in the `out` directory.

## Stripe Setup

1. Create a Stripe account at https://stripe.com
2. Get your API keys from the Stripe Dashboard
3. Add your keys to `.env.local`:
   ```
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
   STRIPE_SECRET_KEY=sk_test_...
   ```

## 🚀 Deployment (Free Options)

### Quick Deploy to Vercel (Recommended)

**Vercel is the easiest option - it automatically handles API routes!**

1. **Push to GitHub:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/yourusername/beauty-nails.git
   git push -u origin main
   ```

2. **Deploy:**
   - Go to [vercel.com](https://vercel.com) and sign up with GitHub
   - Click "New Project" → Import your repository
   - Add environment variables:
     - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
     - `STRIPE_SECRET_KEY`
   - Click "Deploy" - Done! 🎉

**Your site will be live at `your-project.vercel.app`**

### Other Free Options

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed guides on:
- ✅ **Vercel** - Recommended (handles API routes automatically)
- ✅ **Netlify** - Good alternative with serverless functions
- ⚠️ **GitHub Pages** - Static only (no API routes)
- ⚠️ **Cloudflare Pages** - Static only (no API routes)

### Environment Variables

Set these in your hosting platform:
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` - Your Stripe publishable key
- `STRIPE_SECRET_KEY` - Your Stripe secret key

**Never commit `.env.local` to git!** It's already in `.gitignore`.

