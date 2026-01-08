# 🔴 CRITICAL: Fix Vercel Routes Manifest Error

## The Problem

Vercel is looking for `/vercel/path0/out/routes-manifest.json` which means:
- **Your Vercel project has "Output Directory" set to `out` in the dashboard**
- This must be cleared manually in Vercel's UI

## ⚠️ REQUIRED ACTION: Fix in Vercel Dashboard

### Step 1: Go to Vercel Dashboard
1. Open https://vercel.com
2. Select your project
3. Click **Settings** (gear icon)

### Step 2: Clear Output Directory (CRITICAL)
1. Click **General** in left sidebar
2. Scroll to **"Build & Development Settings"**
3. Find **"Output Directory"** field
4. **DELETE everything in that field** - make it completely empty
5. **DO NOT** type `.next` or anything else
6. **LEAVE IT BLANK**
7. Click **"Save"** button

### Step 3: Verify Settings
Make sure these are correct:
- **Framework Preset:** `Next.js` (should auto-detect)
- **Build Command:** `npm run build` (or leave empty)
- **Output Directory:** ⚠️ **MUST BE EMPTY** (this is the key!)
- **Install Command:** `npm install` (or leave empty)

### Step 4: Clear Build Cache
1. Still in **Settings** → **General**
2. Scroll to **"Clear Build Cache"** section
3. Click **"Clear"** button
4. Wait for confirmation

### Step 5: Delete and Recreate Project (If Above Doesn't Work)

If clearing the Output Directory doesn't work:

1. **Delete Project:**
   - Settings → General → Scroll to very bottom
   - Click **"Delete Project"**
   - Type project name to confirm
   - Click **"Delete"**

2. **Create Fresh Project:**
   - Click **"Add New Project"** (top right)
   - Select your GitHub repository
   - **IMPORTANT:** When configuring:
     - Framework: Should auto-detect as "Next.js"
     - **Output Directory: DO NOT SET ANYTHING - LEAVE EMPTY** ⚠️
     - Build Command: Leave as `npm run build`
     - Install Command: Leave as `npm install`
   - Add environment variables:
     - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
     - `STRIPE_SECRET_KEY`
   - Click **"Deploy"**

---

## Why This Error Happens

The error `/vercel/path0/out/routes-manifest.json` means:
- Vercel thinks you're doing a **static export** (looking in `out/` directory)
- But Next.js API routes need the **`.next`** directory
- The `routes-manifest.json` file is created in `.next/`, not `out/`

## The Solution

By leaving "Output Directory" **completely empty**:
- ✅ Vercel auto-detects `.next` directory
- ✅ Finds `routes-manifest.json` correctly  
- ✅ API routes work as serverless functions
- ✅ No more errors!

---

## Verification

After fixing, your build logs should show:

```
Route (pages)                             Size     First Load JS
┌ ○ /                                     25.9 kB         112 kB
├   /_app                                 0 B            86.2 kB
├ ○ /404                                  181 B          86.4 kB
├ ƒ /api/create-checkout-session          0 B            86.2 kB  ← This ƒ means serverless function!
└ ○ /success                              3.16 kB        89.3 kB
```

The `ƒ` symbol means the API route is a serverless function (correct!).

You should **NOT** see:
- ❌ `Exporting...`
- ❌ `Output directory: out`
- ❌ Any mention of static export

---

## Files Status

✅ `next.config.js` - No `output: 'export'` (correct)
✅ `package.json` - Build script is `next build` (correct)
✅ `vercel.json` - Framework set to `nextjs` (correct)
✅ `.gitignore` - Includes `/out/` (correct)

**Your code is 100% correct!** The issue is **ONLY** in Vercel's dashboard settings.

---

## Still Not Working?

If you've cleared the Output Directory and it still fails:

1. **Check Build Logs:**
   - Go to Deployments → Click on failed deployment
   - Look at the build logs
   - Check if it says "Exporting..." anywhere (this means static export is still being used)

2. **Try Deleting Project:**
   - Sometimes Vercel caches the configuration
   - Deleting and recreating clears all caches

3. **Contact Vercel Support:**
   - If nothing works, this might be a Vercel platform issue
   - They can check your project settings directly

---

**The fix is simple: Clear the "Output Directory" field in Vercel dashboard. That's it!**

