# Vercel Deployment Checklist

## ✅ Configuration Verification

### 1. `next.config.js` - CORRECT ✅
```js
// ✅ No 'output: export' 
// ✅ No 'distDir' override
// ✅ Standard Next.js config
```

### 2. `package.json` - CORRECT ✅
```json
"build": "next build"  // ✅ Correct build command
```

### 3. `vercel.json` - REMOVED ✅
- File has been deleted
- Vercel will auto-detect Next.js

---

## 🔧 Vercel Dashboard Settings

Go to: **Project Settings → Build & Development Settings**

### Required Settings:

1. **Framework Preset:** 
   - Should be: `Next.js` (auto-detected)
   - If not, select it manually

2. **Build Command:**
   - Should be: `npm run build` 
   - OR leave empty (Vercel will auto-detect)
   - ✅ Must call `next build`

3. **Output Directory:**
   - ⚠️ **MUST BE EMPTY** (do not set to `out` or `.next`)
   - Vercel auto-detects `.next` directory
   - Only set if you override `distDir` in next.config.js (you don't)

4. **Install Command:**
   - Should be: `npm install`
   - OR leave empty (Vercel will auto-detect)

5. **Root Directory:**
   - Leave empty (unless project is in a subdirectory)

---

## 🚀 Deployment Steps

### Step 1: Clear Build Cache
1. Go to **Settings → General**
2. Scroll to **"Clear Build Cache"**
3. Click **"Clear"**

### Step 2: Verify Environment Variables
**Settings → Environment Variables:**
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `STRIPE_SECRET_KEY`

### Step 3: Redeploy
**Option A: Push new commit**
```bash
git add .
git commit -m "Fix Vercel configuration"
git push
```

**Option B: Manual redeploy**
1. Go to **Deployments** tab
2. Click **"..."** on latest deployment
3. Click **"Redeploy"**

---

## 🔍 Troubleshooting

### If error persists:

1. **Delete and Recreate Project:**
   - Delete project in Vercel
   - Create new project from same GitHub repo
   - This clears all cached configs

2. **Check Build Logs:**
   - Look for: `Running "npm run build"`
   - Should see: `Creating an optimized production build`
   - Should see: `Route (app)` or `Route (pages)` listings
   - Should NOT see: `Exporting...` (that's static export)

3. **Verify Build Output:**
   Build logs should show:
   ```
   ✓ Compiled successfully
   ✓ Linting and checking validity of types
   ✓ Collecting page data
   ✓ Generating static pages
   ```

4. **Check for `.next` directory:**
   - Vercel should create `.next` directory (not `out`)
   - If you see `out` directory mentioned, static export is being used

---

## ❌ Common Mistakes

1. ❌ Setting "Output Directory" to `out` in Vercel
2. ❌ Having `output: 'export'` in next.config.js
3. ❌ Having `distDir` override in next.config.js
4. ❌ Having `vercel.json` with `outputDirectory` set
5. ❌ Build command not calling `next build`

---

## ✅ Current Configuration Status

- ✅ `next.config.js` - No static export
- ✅ `package.json` - Correct build script
- ✅ `vercel.json` - Removed (auto-detect)
- ✅ `.gitignore` - Includes `.next` and `out`

**Everything is configured correctly!** The issue is likely cached settings in Vercel.

