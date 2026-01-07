# URGENT: Fix Vercel Routes Manifest Error

## The Problem

Vercel is looking for `/vercel/path0/out/routes-manifest.json` which means:
- ❌ Vercel project settings have "Output Directory" set to `out`
- ❌ This is causing it to look for static export files instead of Next.js build files

## ⚠️ CRITICAL: Fix in Vercel Dashboard

### Step 1: Go to Vercel Dashboard
1. Open your project in Vercel
2. Click **Settings** → **General** → **Build & Development Settings**

### Step 2: Clear Output Directory
**THIS IS THE MOST IMPORTANT STEP:**

1. Find **"Output Directory"** field
2. **DELETE/ERASE** any value in that field (make it completely empty)
3. **DO NOT** set it to `.next` or anything else
4. **LEAVE IT BLANK**
5. Click **"Save"**

### Step 3: Verify Other Settings
- **Framework Preset:** `Next.js`
- **Build Command:** `npm run build` (or empty)
- **Install Command:** `npm install` (or empty)

### Step 4: Clear Build Cache
1. Still in **Settings** → **General**
2. Scroll to **"Clear Build Cache"**
3. Click **"Clear"**

### Step 5: Delete and Recreate Project (If Still Failing)

If the above doesn't work:

1. **Delete Project:**
   - Settings → General → Scroll to bottom
   - Click **"Delete Project"**
   - Confirm deletion

2. **Create New Project:**
   - Click **"Add New Project"**
   - Import same GitHub repo
   - **IMPORTANT:** When it asks for settings:
     - Framework: Next.js (auto-detected)
     - **Output Directory: LEAVE EMPTY** ⚠️
     - Build Command: Leave as `npm run build`
   - Add environment variables
   - Deploy

---

## Why This Happens

The error `/vercel/path0/out/routes-manifest.json` means:
- Vercel thinks you're doing a static export
- It's looking in the `out` directory
- But Next.js API routes need the `.next` directory
- The `routes-manifest.json` is in `.next`, not `out`

## Solution

By leaving "Output Directory" **EMPTY**:
- Vercel auto-detects `.next` directory
- Finds `routes-manifest.json` correctly
- API routes work as serverless functions

---

## Verification

After fixing, your build logs should show:
```
Route (pages)
├ ƒ /api/create-checkout-session
```

The `ƒ` means it's a serverless function (correct!).

You should **NOT** see:
- `Exporting...`
- `Output directory: out`
- Any mention of static export

---

## Files Changed

I've created a `vercel.json` file that explicitly sets the framework, but the **most important fix is in the Vercel dashboard** - clearing the Output Directory setting.

