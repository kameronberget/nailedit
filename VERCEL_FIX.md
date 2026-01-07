# Fixing Vercel Deployment Error

## Steps to Fix the routes-manifest.json Error

### 1. Remove the `out` directory from Git (if tracked)

The `out` directory from previous static exports might be confusing Vercel. Make sure it's not tracked:

```bash
# Remove out directory from git tracking (if it was committed)
git rm -r --cached out/
git commit -m "Remove out directory from git"
```

### 2. Clean Local Build

```bash
# Remove local build artifacts
rm -rf .next
rm -rf out
```

### 3. Update Vercel Project Settings

In your Vercel dashboard:

1. Go to your project → **Settings** → **General**
2. Under **Build & Development Settings**:
   - **Framework Preset:** Should be "Next.js" (auto-detected)
   - **Build Command:** Should be `npm run build` (or leave empty for auto)
   - **Output Directory:** Leave EMPTY (don't set to `out`)
   - **Install Command:** `npm install` (or leave empty for auto)

3. **Clear Build Cache:**
   - Go to **Settings** → **General**
   - Scroll to **Clear Build Cache**
   - Click "Clear" to remove cached builds

### 4. Redeploy

After clearing cache, trigger a new deployment:
- Push a new commit, OR
- Go to **Deployments** tab → Click "..." on latest deployment → **Redeploy**

### 5. Verify Configuration

Make sure your `next.config.js` does NOT have `output: 'export'`:

```js
// ✅ CORRECT (what you have now)
const nextConfig = {
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
}

// ❌ WRONG (static export - causes the error)
const nextConfig = {
  output: 'export',  // Don't use this for Vercel with API routes
  ...
}
```

### 6. Check Environment Variables

Make sure these are set in Vercel:
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `STRIPE_SECRET_KEY`

---

## Why This Happens

The error occurs when:
- Vercel thinks it's a static export project (looks for `out/` directory)
- But Next.js API routes need serverless functions (not static)
- The `routes-manifest.json` is only created in full Next.js builds, not static exports

## Solution

By removing `vercel.json` and `output: 'export'`, Vercel will:
- Auto-detect Next.js
- Build as a full Next.js app (not static export)
- Generate `routes-manifest.json` automatically
- Handle API routes as serverless functions

---

## Still Having Issues?

If the error persists:

1. **Delete and recreate the Vercel project:**
   - Delete the project in Vercel dashboard
   - Create a new project from the same GitHub repo
   - This clears all cached configurations

2. **Check Vercel Build Logs:**
   - Look for any warnings about static export
   - Verify the build command is `npm run build`

3. **Verify no `out` directory in repo:**
   ```bash
   git ls-files | grep "^out/"
   ```
   If any files show up, remove them from git tracking.

