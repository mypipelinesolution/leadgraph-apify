# Git Deployment Guide for LeadGraph™ Actor

## 🚀 Quick Start: Deploy to Apify via GitHub

This is the **recommended deployment method** for Apify Actors.

---

## Why GitHub Deployment?

✅ **Automatic deployments** - Push to GitHub, Apify rebuilds automatically  
✅ **Version control** - Full Git history  
✅ **Easy rollbacks** - Revert to any previous version  
✅ **Collaboration** - Multiple developers can contribute  
✅ **CI/CD ready** - Integrate with GitHub Actions  

---

## Step-by-Step Guide

### 1️⃣ Initialize Git Repository

```bash
# Navigate to your project
cd "d:\MPS projects\apifyactor"

# Initialize Git (if not already done)
git init

# Check status
git status
```

### 2️⃣ Review .gitignore

Make sure `.gitignore` excludes sensitive files:

```
node_modules/
apify_storage/
.env
*.log
```

**IMPORTANT**: Never commit API keys or `.env` files!

### 3️⃣ Create GitHub Repository

1. Go to [GitHub](https://github.com/new)
2. Create new repository:
   - **Name**: `leadgraph-actor`
   - **Visibility**: **Private** (recommended for production)
   - **DO NOT** check "Initialize with README" (we have one)
3. Copy the repository URL (e.g., `https://github.com/YOUR_USERNAME/leadgraph-actor.git`)

### 4️⃣ Commit and Push to GitHub

```bash
# Add all files
git add .

# Commit
git commit -m "Initial commit - LeadGraph Actor v0.2"

# Add remote (replace YOUR_USERNAME)
git remote add origin https://github.com/YOUR_USERNAME/leadgraph-actor.git

# Push to GitHub
git push -u origin main
```

**If you get a branch error:**
```bash
git branch -M main
git push -u origin main
```

### 5️⃣ Connect Apify to GitHub

1. Go to [Apify Console](https://console.apify.com/)
2. Click **Actors** → **Create new**
3. Select **From GitHub repository**
4. **First time only**: Authorize Apify to access your GitHub
5. Select your repository: `YOUR_USERNAME/leadgraph-actor`
6. Configure build settings:
   - **Branch**: `main`
   - **Dockerfile**: `./Dockerfile`
   - **Build tag**: `latest`
7. Click **Create**

Apify will now:
- Clone your repository
- Build the Docker image
- Deploy the Actor

### 6️⃣ Add API Keys (Environment Variables)

**CRITICAL**: Add your API keys as secrets in Apify (NOT in your code!)

1. In Apify Console, go to your Actor
2. Click **Settings** → **Environment Variables**
3. Add the following secrets:

| Variable Name | Value | Required |
|---------------|-------|----------|
| `GOOGLE_PLACES_API_KEY` | Your Google Places API key | Yes (for API mode) |
| `YELP_API_KEY` | Your Yelp Fusion API key | Yes (for API mode) |
| `OPENAI_API_KEY` | Your OpenAI API key | No (only for AI features) |

4. Click **Save**

### 7️⃣ Test Your Actor

1. In Apify Console, go to your Actor
2. Click **Input**
3. Configure test input:
```json
{
  "keywords": ["tree service"],
  "locations": ["Boston, MA"],
  "useApis": true,
  "maxResultsPerLocation": 10
}
```
4. Click **Start**
5. Monitor the run and check results

---

## 🔄 Continuous Deployment

Now that your Actor is connected to GitHub, every push triggers a rebuild:

```bash
# Make changes to your code
# Edit files...

# Commit changes
git add .
git commit -m "Added new feature"

# Push to GitHub
git push

# ✨ Apify automatically rebuilds and deploys!
```

### Deployment Workflow

```
Local Changes → Git Commit → Git Push → GitHub
                                           ↓
                                    Apify detects push
                                           ↓
                                    Builds Docker image
                                           ↓
                                    Deploys new version
                                           ↓
                                    Actor updated! ✅
```

---

## 🏷️ Version Management

### Using Git Tags for Releases

```bash
# Tag a release
git tag -a v1.0.0 -m "Release v1.0.0 - Production ready"
git push origin v1.0.0

# In Apify, you can specify which tag to deploy
```

### Using Branches

```bash
# Create development branch
git checkout -b development

# Make changes and push
git push -u origin development

# In Apify, configure to deploy from 'development' branch for testing
```

---

## 🔐 Security Best Practices

### ✅ DO:
- ✅ Use `.gitignore` to exclude sensitive files
- ✅ Store API keys in Apify environment variables
- ✅ Use private GitHub repositories for production
- ✅ Review commits before pushing
- ✅ Use Git tags for version tracking

### ❌ DON'T:
- ❌ Commit `.env` files
- ❌ Hardcode API keys in code
- ❌ Commit `node_modules/`
- ❌ Commit `apify_storage/` or logs
- ❌ Push directly to main without testing

---

## 🐛 Troubleshooting

### Build Failed on Apify

**Check:**
1. Dockerfile syntax is correct
2. All dependencies in `package.json`
3. No syntax errors in code
4. Build logs in Apify Console

**Solution:**
```bash
# Test build locally first
docker build -t leadgraph-test .
```

### Actor Not Updating After Push

**Possible causes:**
1. Apify webhook not triggered
2. Build still in progress
3. Wrong branch configured

**Solution:**
1. Check Apify Console → Actor → Builds
2. Manually trigger rebuild: Click **Build** → **Build latest version**

### API Keys Not Working

**Check:**
1. Environment variables are set in Apify Console
2. Variable names match exactly (case-sensitive)
3. No extra spaces in keys

**Solution:**
1. Re-enter keys in Apify Console
2. Rebuild Actor after updating environment variables

### Git Push Rejected

**Error**: `! [rejected] main -> main (fetch first)`

**Solution:**
```bash
git pull origin main --rebase
git push origin main
```

---

## 📊 Monitoring Deployments

### View Build Status

1. Apify Console → Your Actor → **Builds**
2. See all builds with status (success/failed)
3. View build logs for debugging

### Rollback to Previous Version

1. Apify Console → Your Actor → **Builds**
2. Find previous successful build
3. Click **Deploy this build**

Or via Git:
```bash
# Revert to previous commit
git revert HEAD
git push

# Or reset to specific commit
git reset --hard <commit-hash>
git push --force
```

---

## 🎯 Production Checklist

Before deploying to production:

- [ ] All tests pass locally
- [ ] `.gitignore` excludes sensitive files
- [ ] API keys stored as Apify secrets (not in code)
- [ ] README.md is up to date
- [ ] Version tagged in Git
- [ ] Test run completed successfully on Apify
- [ ] Error handling tested
- [ ] Rate limits configured
- [ ] Monitoring set up

---

## 📞 Quick Reference

### Common Git Commands

```bash
# Check status
git status

# Add files
git add .

# Commit
git commit -m "Your message"

# Push
git push

# Pull latest
git pull

# View history
git log --oneline

# Create branch
git checkout -b feature-name

# Switch branch
git checkout main
```

### Apify CLI Commands

```bash
# Login
apify login

# Pull Actor from Apify
apify pull

# Push Actor to Apify (alternative to Git)
apify push

# Run locally
apify run
```

---

## 🚀 Next Steps

1. **Push your code to GitHub** (follow steps above)
2. **Connect Apify to your repo**
3. **Add API keys as secrets**
4. **Run a test**
5. **Monitor and iterate**

---

**You're all set!** 🎉

Every time you push to GitHub, Apify will automatically rebuild and deploy your Actor.

For more info: [Apify Git Integration Docs](https://docs.apify.com/actors/development/deployment/git-integration)
