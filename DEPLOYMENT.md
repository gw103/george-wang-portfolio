# 🚀 Portfolio Deployment Guide

## Option 1: GitHub Pages (Recommended - Free)

### Step 1: Create GitHub Repository
1. Go to [GitHub.com](https://github.com) and sign in
2. Click the "+" icon in the top right corner
3. Select "New repository"
4. Name it: `george-wang-portfolio` (or any name you prefer)
5. Make it **Public** (required for free GitHub Pages)
6. Don't initialize with README (we already have files)
7. Click "Create repository"

### Step 2: Connect Local Repository to GitHub
```bash
# Add your GitHub repository as remote origin
git remote add origin https://github.com/gw103/george-wang-portfolio.git

# Push your code to GitHub
git branch -M main
git push -u origin main
```

### Step 3: Enable GitHub Pages
1. Go to your repository on GitHub
2. Click on "Settings" tab
3. Scroll down to "Pages" section
4. Under "Source", select "Deploy from a branch"
5. Select "main" branch and "/ (root)" folder
6. Click "Save"

### Step 4: Access Your Live Website
- Your portfolio will be available at: `https://gw103.github.io/george-wang-portfolio`
- It may take 5-10 minutes to deploy initially

---

## Option 2: Netlify (Alternative - Free)

### Method A: Drag & Drop
1. Go to [Netlify.com](https://netlify.com)
2. Sign up for free account
3. Drag your entire portfolio folder to the deploy area
4. Get instant live URL

### Method B: GitHub Integration
1. Connect your GitHub account to Netlify
2. Select your portfolio repository
3. Deploy automatically with every push

---

## Option 3: Vercel (Alternative - Free)

1. Go to [Vercel.com](https://vercel.com)
2. Sign up with GitHub
3. Import your portfolio repository
4. Deploy with one click

---

## Custom Domain (Optional)

### For GitHub Pages:
1. Buy a domain (e.g., from Namecheap, GoDaddy)
2. In GitHub Pages settings, add your custom domain
3. Update DNS records as instructed

### For Netlify/Vercel:
1. Add custom domain in project settings
2. Update DNS records

---

## Quick Commands Reference

```bash
# Check status
git status

# Add changes
git add .

# Commit changes
git commit -m "Update portfolio"

# Push to GitHub
git push origin main

# Pull latest changes
git pull origin main
```

---

## Tips for Success

1. **Keep it updated**: Regularly push new changes to keep your portfolio current
2. **Test thoroughly**: Always test your website after making changes
3. **Use HTTPS**: All hosting platforms provide free SSL certificates
4. **Monitor performance**: Use tools like Google PageSpeed Insights
5. **SEO optimization**: Add meta tags and descriptions for better search visibility

---

## Troubleshooting

### GitHub Pages not updating?
- Check if your repository is public
- Verify the branch is set to "main" in Pages settings
- Wait 5-10 minutes for changes to propagate

### Custom domain not working?
- Check DNS settings
- Ensure CNAME file is in your repository root
- Wait up to 24 hours for DNS propagation

### Need help?
- Check GitHub Pages documentation
- Contact support for your chosen platform
- Join developer communities for assistance
