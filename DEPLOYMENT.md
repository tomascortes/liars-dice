# 🎮 GitHub Pages Deployment Guide - Platanus Hack 25 Arcade

## ✅ What I've Already Set Up For You

1. **Updated `vite.config.ts`** - Added the base path configuration for GitHub Pages
2. **Created `.github/workflows/deploy.yml`** - Your automated deployment workflow

## 🚀 Next Steps to Deploy

### Step 1: Enable GitHub Pages

1. Go to your repository on GitHub: https://github.com/tomascortes/platanus-hack-25-arcade
2. Click on **Settings** tab
3. In the left sidebar, click **Pages** (under "Code and automation")
4. Under **Build and deployment**:
   - **Source**: Select **GitHub Actions** (not "Deploy from a branch")
5. That's it! No need to save, it auto-saves.

### Step 2: Push Your Changes

Run these commands in your terminal:

```bash
cd /Users/tomas/Documents/personal/miniprojects/platanus-hack-25-arcade
git add .
git commit -m "Add GitHub Actions deployment workflow"
git push origin main
```

### Step 3: Watch the Magic Happen! ✨

1. Go to the **Actions** tab in your GitHub repository
2. You'll see your workflow running (takes ~1-2 minutes)
3. Once it's done (green checkmark ✅), your game will be live!

### Step 4: Access Your Game

Your game will be available at:
**https://tomascortes.github.io/platanus-hack-25-arcade/**

---

## 🎯 How It Works

### The Workflow Explained

1. **Trigger**: Runs automatically when you push to `main` branch
2. **Build Job**:
   - Checks out your code
   - Sets up Node.js
   - Installs dependencies with `npm ci`
   - Runs `npm run build` (Vite builds to `front/dist`)
   - Uploads the built files as an artifact
3. **Deploy Job**:
   - Takes the artifact and deploys it to GitHub Pages

### What Changed in Your Code

**`vite.config.ts`:**
```typescript
base: process.env.NODE_ENV === 'production' ? '/platanus-hack-25-arcade/' : '/'
```
- In **development**: Uses `/` (works locally at localhost:3000)
- In **production**: Uses `/platanus-hack-25-arcade/` (correct path for GitHub Pages)

---

## 🔄 Future Updates

After the initial setup, deploying updates is super simple:

```bash
git add .
git commit -m "Your changes"
git push origin main
```

That's it! GitHub Actions will automatically rebuild and redeploy your game.

---

## 🎛️ Manual Deployment

You can also trigger a deployment manually:
1. Go to **Actions** tab on GitHub
2. Click **Deploy to GitHub Pages** on the left
3. Click **Run workflow** button
4. Click the green **Run workflow** button

---

## 🐛 Troubleshooting

### Build Fails
- Check the **Actions** tab for error details
- Make sure your game builds locally first: `npm run build`

### Game Doesn't Load
- Check browser console for errors
- Verify the base path is correct in `vite.config.ts`
- Make sure all asset paths are relative (not absolute)

### Assets Not Loading
- Phaser assets should use relative paths
- Check that all files are in the `front/dist` folder after build

---

## 📊 Monitoring

- **Build Status**: Check the Actions tab
- **Build Time**: Usually 1-2 minutes
- **Free Tier Limits**: 
  - 2000 CI/CD minutes per month (more than enough!)
  - 500MB storage
  - 1GB bandwidth per month

---

## 🎨 Custom Domain (Optional)

If you want to use a custom domain:
1. Buy a domain (e.g., from Namecheap, Google Domains)
2. In GitHub Pages settings, add your custom domain
3. Update your DNS records as instructed by GitHub
4. Update `vite.config.ts` base path to `'/'`

---

## 🎉 That's It!

Your Phaser game will now deploy automatically every time you push to `main`. 

**Live URL**: https://tomascortes.github.io/platanus-hack-25-arcade/

Happy gaming! 🎲
