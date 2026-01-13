# Deploying LeadGraph™ to Apify Platform

## 🚀 Deployment Guide

### Prerequisites

- Apify account ([Sign up free](https://console.apify.com/sign-up))
- GitHub account
- Git installed
- API keys (Google Places, Yelp) if using API mode

---

## Method 1: Deploy via GitHub (Recommended) ⭐

This is the **best method** because:
- ✅ Automatic deployments on every push
- ✅ Version control built-in
- ✅ Easy rollbacks
- ✅ Collaboration-friendly
- ✅ Apify pulls directly from your repo

**Use this method if you want manual control over deployments.**

### Step 1: Install Apify CLI

```bash
npm install -g apify-cli
```

### Step 2: Login to Apify

```bash
apify login
```

### Step 3: Deploy to Apify

```bash
# Navigate to project
cd "d:\MPS projects\apifyactor"

# Build and deploy
apify push

# Or deploy with a specific tag
apify push --tag latest
```

### Step 4: Configure API Keys (Secrets)

**Option A: Via Apify Console (Recommended)**

1. Go to [Apify Console](https://console.apify.com/)
2. Navigate to your Actor
3. Go to **Settings** → **Environment Variables**
4. Add secrets:
   - Name: `GOOGLE_PLACES_API_KEY`, Value: `AIzaSy...`
   - Name: `YELP_API_KEY`, Value: `your_yelp_key`
5. Save

**Option B: Via CLI**

```bash
apify secrets:add GOOGLE_PLACES_API_KEY "AIzaSy..."
apify secrets:add YELP_API_KEY "your_yelp_key"
```

### Step 5: Test Run

```bash
# Run on Apify platform
apify call

# Or run with custom input
apify call --input '{"keywords":["tree service"],"locations":["Boston, MA"],"useApis":true}'
```

---

### Step 1: Initialize Git (if not already done)

```bash
# Navigate to your project
cd "d:\MPS projects\apifyactor"

# Initialize Git
git init

# Check what will be committed
git status
```

### Step 2: Create GitHub Repository

1. Go to [GitHub](https://github.com/new)
2. Create a new repository:
   - **Name**: `leadgraph-actor` (or your preferred name)
   - **Visibility**: Private (recommended) or Public
   - **DO NOT** initialize with README (we already have one)
3. Copy the repository URL

### Step 3: Push to GitHub

```bash
# Add all files
git add .

# Commit
git commit -m "Initial commit - LeadGraph Actor with API mode"

# Add remote
git remote add origin https://github.com/YOUR_USERNAME/leadgraph-actor.git

# Push to GitHub
git push -u origin main
```

**Note**: If you get an error about `master` vs `main`, use:
```bash
git branch -M main
git push -u origin main
```

### Step 4: Connect Apify to GitHub

1. Go to [Apify Console](https://console.apify.com/)
2. Click **Actors** → **Create new**
3. Choose **From GitHub repository**
4. Authorize Apify to access your GitHub (first time only)
5. Select your repository: `YOUR_USERNAME/leadgraph-actor`
6. Configure:
   - **Branch**: `main`
   - **Dockerfile**: `./Dockerfile`
   - **Build tag**: `latest`
7. Click **Create**

### Step 5: Configure Environment Variables (Secrets)

1. In Apify Console, go to your Actor
2. Click **Settings** → **Environment Variables**
3. Add secrets:
   - `GOOGLE_PLACES_API_KEY` = `your_key_here`
   - `YELP_API_KEY` = `your_key_here`
   - `OPENAI_API_KEY` = `your_key_here` (optional, for AI features)
4. Click **Save**

### Step 6: Build & Deploy

Apify will automatically:
1. Pull your code from GitHub
2. Build the Docker image
3. Deploy the Actor

**That's it!** 🎉

### Step 7: Auto-Deploy on Every Push

Now, whenever you push to GitHub:

```bash
# Make changes to your code
git add .
git commit -m "Updated feature X"
git push

# Apify automatically rebuilds and deploys! ✨
```

---

## Method 2: Deploy via Apify CLI

---

## Method 3: Manual Upload

### Step 1: Create ZIP

```bash
# Exclude node_modules and storage
zip -r leadgraph-actor.zip . -x "node_modules/*" "apify_storage/*" ".git/*"
```

### Step 2: Upload to Apify

1. Go to [Apify Console](https://console.apify.com/)
2. Click **Create Actor**
3. Choose **Upload ZIP**
4. Upload your ZIP file
5. Configure and deploy

---

## 🔐 API Key Management on Apify

### Option 1: Environment Variables (Recommended for Production)

**Pros:**
- ✅ Keys stored securely (encrypted)
- ✅ Not visible in run logs
- ✅ Shared across all runs
- ✅ Can be updated without redeploying

**Setup:**
```javascript
// In your code - already implemented!
const apiKey = options?.apiKeys?.googlePlaces || process.env.GOOGLE_PLACES_API_KEY;
```

**Users don't need to provide keys** - you set them once in Actor settings.

### Option 2: Input Parameters (User-Provided Keys)

**Pros:**
- ✅ Each user uses their own keys
- ✅ No shared rate limits
- ✅ Users control their own costs

**Setup:**
```json
{
  "apiKeys": {
    "googlePlaces": "USER_ENTERS_KEY_HERE",
    "yelp": "USER_ENTERS_KEY_HERE"
  }
}
```

**Users provide keys** when running the Actor.

### Option 3: Hybrid Approach (Best for Apify Challenge)

**Use environment variables as fallback:**

```javascript
const googleKey = input.apiKeys?.googlePlaces || process.env.GOOGLE_PLACES_API_KEY;
const yelpKey = input.apiKeys?.yelp || process.env.YELP_API_KEY;
```

**Benefits:**
- You can demo with your keys
- Users can optionally use their own keys
- Flexible for different use cases

---

## 💰 Pricing on Apify

### Apify Platform Costs

**Compute Units (CU):**
- 1 CU = 1 GB RAM for 1 hour
- Free tier: 5 CU/month (~$5 value)
- Paid: $0.25 per CU

**LeadGraph™ Usage:**
- ~0.5 GB RAM
- API mode: ~1 min per 100 leads = **0.008 CU** (~$0.002)
- Web scraping: ~5 min per 100 leads = **0.042 CU** (~$0.01)

### Total Cost per 100 Leads

**API Mode:**
- Apify: $0.002
- Google Places: $3.40
- Yelp: FREE
- **Total: ~$3.40**

**Web Scraping Mode:**
- Apify: $0.01
- APIs: $0
- **Total: ~$0.01** (but slower, less reliable)

---

## 🎯 Apify Actor Store Listing

### For the $1M Challenge

**Title:** LeadGraph™ - Local Business Lead Discovery & Enrichment

**Description:**
```
Multi-source local business lead discovery with AI-powered enrichment. 
Extract business data from Google Maps, Yelp, BBB, and more. 
Includes email extraction, phone validation, social media links, 
tech signals, and lead scoring.

Perfect for:
- Sales teams building prospect lists
- Marketing agencies finding local clients
- Lead generation businesses
- Market research

Features:
✓ Multiple data sources (Google Maps, Yelp, BBB, SERP)
✓ API mode for reliability or free web scraping
✓ Website enrichment (emails, phones, socials)
✓ Smart deduplication
✓ Lead scoring (A/B/C/D tiers)
✓ CRM-ready output
✓ Delta mode for incremental updates
```

**Categories:**
- Lead Generation
- Data Extraction
- Business Intelligence

**Pricing Strategy:**
- **Free tier**: 100 leads/month (web scraping)
- **Starter**: $29/month - 1,000 leads (API mode)
- **Pro**: $99/month - 5,000 leads (API mode)
- **Enterprise**: Custom pricing

---

## 🧪 Testing on Apify

### Test Locally First

```bash
# Test with Apify SDK
apify run
```

### Test on Platform

```bash
# Push to Apify
apify push

# Run on platform
apify call
```

### Monitor Runs

1. Go to [Apify Console](https://console.apify.com/)
2. Click on your Actor
3. View **Runs** tab
4. Check logs, dataset output, and key-value store

---

## 📊 Performance Optimization for Apify

### 1. Use API Mode for Speed

```json
{
  "useApis": true
}
```

**Result:** 10-30 seconds vs 2-5 minutes

### 2. Optimize Memory Usage

In `.actor/actor.json`:
```json
{
  "defaultRunOptions": {
    "memoryMbytes": 512
  }
}
```

**Result:** Lower costs

### 3. Enable Caching

Use Apify's key-value store for caching:
```javascript
const cache = await Actor.getValue('CACHE');
```

### 4. Use Delta Mode

Only process new/changed leads:
```json
{
  "exports": {
    "deltaMode": true
  }
}
```

---

## 🔍 Monitoring & Debugging

### View Logs

```bash
# Via CLI
apify log

# Or in Apify Console
# Actor → Runs → Select run → Logs tab
```

### Check Output

```bash
# Download dataset
apify dataset:download

# View in console
# Actor → Runs → Select run → Dataset tab
```

### Debug Issues

**Common issues:**

1. **API key errors**: Check environment variables
2. **Rate limits**: Monitor API usage
3. **Memory issues**: Increase memory in actor.json
4. **Timeouts**: Reduce maxResultsPerLocation

---

## 🚀 Going Live

### Pre-Launch Checklist

- [ ] Test with API mode
- [ ] Test with web scraping mode
- [ ] Verify all enrichment features work
- [ ] Check output schema matches docs
- [ ] Test delta mode
- [ ] Set up error handling
- [ ] Configure memory limits
- [ ] Add comprehensive README
- [ ] Create example runs
- [ ] Set up monitoring

### Launch

1. **Deploy to Apify**: `apify push`
2. **Publish to Store**: Apify Console → Actor → Publish
3. **Set Pricing**: Configure tiers
4. **Add Examples**: Create sample runs
5. **Monitor**: Watch for errors and usage

---

## 📞 Support

**Apify Documentation:**
- [Actor Development](https://docs.apify.com/actors)
- [Deployment](https://docs.apify.com/actors/development/deployment)
- [Environment Variables](https://docs.apify.com/actors/development/environment-variables)

**LeadGraph™ Support:**
- GitHub Issues
- Email: your@email.com

---

**Ready to deploy!** 🚀

Run `apify push` to deploy your Actor to Apify platform.
