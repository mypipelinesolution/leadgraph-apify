# 🚀 Deploy LeadGraph to Apify NOW

Your GitHub repo is ready: **https://github.com/vyreee/leadgraph**

Follow these steps to deploy to Apify in **5 minutes**.

---

## Step 1: Connect Apify to GitHub (2 minutes)

### 1.1 Go to Apify Console

Open: [https://console.apify.com/actors](https://console.apify.com/actors)

### 1.2 Create New Actor from GitHub

1. Click **"Create new"** button (top right)
2. Select **"From GitHub repository"**
3. **First time only**: Click "Authorize Apify" to connect your GitHub account
4. Select repository: **`vyreee/leadgraph`**

### 1.3 Configure Build Settings

Fill in these settings:

| Setting | Value |
|---------|-------|
| **Repository** | `vyreee/leadgraph` |
| **Branch** | `main` |
| **Dockerfile** | `./Dockerfile` |
| **Build tag** | `latest` |
| **Actor name** | `leadgraph` (or your preferred name) |

### 1.4 Create Actor

Click **"Create"** button

Apify will now:
- ✅ Clone your repository
- ✅ Build the Docker image
- ✅ Deploy the Actor

**Wait 2-3 minutes for the build to complete.**

---

## Step 2: Add API Keys (1 minute)

### 2.1 Navigate to Settings

In your Actor page, click **Settings** → **Environment Variables**

### 2.2 Add Secrets

Click **"Add environment variable"** and add these:

| Name | Value | Required |
|------|-------|----------|
| `GOOGLE_PLACES_API_KEY` | Your Google Places API key | ✅ Yes (for API mode) |
| `YELP_API_KEY` | Your Yelp Fusion API key | ✅ Yes (for API mode) |
| `OPENAI_API_KEY` | Your OpenAI API key | ⚠️ Optional (only for AI features) |

**Don't have API keys yet?**
- Google Places: [Get key here](https://console.cloud.google.com/apis/credentials)
- Yelp Fusion: [Get key here](https://www.yelp.com/developers/v3/manage_app) (FREE!)
- OpenAI: [Get key here](https://platform.openai.com/api-keys)

### 2.3 Save

Click **"Save"** button

---

## Step 3: Test Run (2 minutes)

### 3.1 Configure Input

1. In your Actor page, click **"Input"** tab
2. Use this test configuration:

```json
{
  "seedType": "keyword",
  "keywords": ["tree service"],
  "locations": ["Boston, MA"],
  "useApis": true,
  "sources": ["googleMaps", "yelp"],
  "maxResultsPerLocation": 10,
  "enrichment": {
    "crawlWebsite": false
  },
  "ai": {
    "enabled": false
  }
}
```

### 3.2 Start Run

Click **"Start"** button

### 3.3 Monitor Progress

Watch the **Log** tab to see:
```
INFO  LeadGraph™ Actor started
INFO  Using API mode (faster, more reliable)
INFO  Searching Google Places API: tree service in Boston, MA
INFO  Collected 10 leads from Google Places API
INFO  Searching Yelp Fusion API: tree service in Boston, MA
INFO  Collected 8 leads from Yelp Fusion API
...
INFO  LeadGraph™ Actor finished successfully
```

### 3.4 View Results

Click **"Dataset"** tab to see your leads!

---

## ✅ Success Checklist

After deployment, verify:

- [ ] Build completed successfully (green checkmark)
- [ ] Environment variables added (3 secrets)
- [ ] Test run completed without errors
- [ ] Dataset contains leads
- [ ] Lead data includes business name, address, phone, website
- [ ] Enrichment data present (if enabled)

---

## 🔄 Auto-Deploy on Every Push

Now that your Actor is connected to GitHub, **every push triggers a rebuild**:

```bash
# Make changes locally
git add .
git commit -m "Updated feature"
git push

# ✨ Apify automatically rebuilds and deploys!
```

---

## 🎯 Next Steps

### Enable More Features

Edit your input to enable:

**1. Website Enrichment**
```json
{
  "enrichment": {
    "crawlWebsite": true,
    "maxWebsitePages": 5
  }
}
```

**2. AI Outreach Generation**
```json
{
  "ai": {
    "enabled": true,
    "yourCompanyName": "Your Company",
    "yourServiceOffering": "digital marketing services"
  }
}
```

**3. More Data Sources**
```json
{
  "sources": ["googleMaps", "yelp", "bbb", "serp"]
}
```

**4. Lead Scoring**
```json
{
  "scoring": {
    "enabled": true,
    "weightsPreset": "localService"
  }
}
```

### Export Data

Click **"Export"** → Choose format:
- CSV (for Excel/CRM)
- JSON (for APIs)
- Excel (for analysis)

### Schedule Runs

1. Click **"Schedules"** tab
2. Create schedule (e.g., daily at 9 AM)
3. Automatically collect fresh leads!

---

## 💰 Pricing Estimate

**For 100 leads per run:**

| Cost Item | Amount |
|-----------|--------|
| Apify compute | ~$0.002 |
| Google Places API | ~$3.40 |
| Yelp API | FREE |
| **Total** | **~$3.40** |

**Your pricing to customers:**
- Basic: $10/run (100 leads) → $6.60 profit
- Standard: $50/run (500 leads) → $33 profit
- Premium: $100/run (1,000 leads) → $66 profit

---

## 🐛 Troubleshooting

### Build Failed

**Check:**
1. Dockerfile exists in repo
2. package.json has all dependencies
3. No syntax errors in code

**Fix:**
- View build logs in Apify Console
- Check GitHub repo has latest code

### API Key Errors

**Error**: "Google Places API key is required"

**Fix:**
1. Verify environment variables are set
2. Check variable names match exactly
3. Rebuild Actor after adding keys

### No Results Found

**Check:**
1. API keys are valid
2. Keywords and locations are correct
3. `useApis` is set to `true`

**Fix:**
- Test with broader keywords
- Check API quotas/limits

---

## 📞 Support

**Apify Help:**
- [Apify Documentation](https://docs.apify.com)
- [Apify Discord](https://discord.gg/apify)

**LeadGraph Issues:**
- GitHub: [https://github.com/vyreee/leadgraph/issues](https://github.com/vyreee/leadgraph/issues)

---

## 🎉 You're Live!

Your LeadGraph Actor is now deployed on Apify and ready to generate leads!

**Share your Actor:**
- Publish to Apify Store
- Share with team members
- Integrate with your CRM

**Good luck with the Apify $1M Challenge!** 🚀
