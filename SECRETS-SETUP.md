# Setting Up Actor Secrets for Fixed Pricing

## 🎯 Overview

This Actor uses **environment variables (secrets)** to store API keys. This means:

✅ **Fixed pricing per run** - You control the API keys and costs
✅ **No user configuration needed** - Users just click "Run"
✅ **Secure** - Keys are encrypted and never exposed
✅ **Simple UX** - No complex setup for users

---

## 🔑 Step-by-Step Setup

### Step 1: Get Your API Keys

**Google Places API** (Required for API mode):
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a project and enable billing
3. Enable **Places API**
4. Create an API key
5. Copy the key (starts with `AIzaSy...`)

**Yelp Fusion API** (Optional but recommended - FREE):
1. Go to [Yelp Developers](https://www.yelp.com/developers/v3/manage_app)
2. Create an app
3. Copy the API key

### Step 2: Add Secrets to Apify Actor

**Option A: Via Apify Console (Easiest)**

1. Go to [Apify Console](https://console.apify.com/)
2. Navigate to your Actor
3. Click **Settings** → **Environment Variables**
4. Add the following secrets:

| Name | Value | Description |
|------|-------|-------------|
| `GOOGLE_PLACES_API_KEY` | `AIzaSy...` | Your Google Places API key |
| `YELP_API_KEY` | `your_yelp_key` | Your Yelp Fusion API key |

5. Click **Save**

**Option B: Via Apify CLI**

```bash
# Login to Apify
apify login

# Add secrets
apify secrets:add GOOGLE_PLACES_API_KEY "AIzaSy..."
apify secrets:add YELP_API_KEY "your_yelp_key"

# Verify
apify secrets:list
```

### Step 3: Deploy Your Actor

```bash
apify push
```

### Step 4: Test

Run your Actor from the Apify Console. It will automatically use the secrets!

---

## 💰 Fixed Pricing Model

### How It Works

**You pay for the API calls** → **You charge users a fixed price per run**

**Example Pricing:**

| Plan | Leads | Your Cost | Your Price | Profit |
|------|-------|-----------|------------|--------|
| **Basic** | 100 | $3.40 | $10 | $6.60 |
| **Standard** | 500 | $17.00 | $50 | $33.00 |
| **Premium** | 1,000 | $34.00 | $100 | $66.00 |

### Cost Breakdown (per 100 leads)

- **Apify compute**: ~$0.002 (negligible)
- **Google Places API**: ~$3.40
- **Yelp API**: FREE (up to 500 calls/day)
- **Total**: ~$3.40

### Pricing Strategy

**Option 1: Simple Flat Rate**
```
$10 per run (up to 100 leads)
$50 per run (up to 500 leads)
$100 per run (up to 1,000 leads)
```

**Option 2: Subscription**
```
$29/month - 10 runs (1,000 leads)
$99/month - 50 runs (5,000 leads)
$299/month - 200 runs (20,000 leads)
```

**Option 3: Pay-per-Lead**
```
$0.10 per lead (minimum 50 leads)
Volume discounts:
- 500+ leads: $0.08/lead
- 1,000+ leads: $0.06/lead
```

---

## 🔒 Security Best Practices

### 1. Set API Key Restrictions

**Google Places API:**
- Go to Google Cloud Console → Credentials
- Click on your API key
- Under **API restrictions**, select **Restrict key**
- Choose only **Places API**
- Under **Application restrictions** (optional):
  - Choose **IP addresses**
  - Add Apify's IP ranges (if available)

### 2. Set Usage Quotas

**Google Places API:**
- Go to APIs & Services → Places API → Quotas
- Set daily limits:
  - Text Search: 1,000 requests/day
  - Place Details: 1,000 requests/day
- This prevents unexpected charges

**Yelp API:**
- Already limited to 500 calls/day (free tier)
- Monitor usage in Yelp dashboard

### 3. Monitor Usage

**Set up billing alerts:**
1. Google Cloud Console → Billing → Budgets & Alerts
2. Create budget: $100/month
3. Set alerts at 50%, 90%, 100%

### 4. Rotate Keys Regularly

- Rotate API keys every 3-6 months
- Update secrets in Apify Console
- No code changes needed!

---

## 📊 Usage Monitoring

### Track API Costs

**Google Cloud Console:**
- Go to Billing → Reports
- Filter by **Places API**
- View daily/monthly costs

**Yelp Dashboard:**
- Go to [Manage App](https://www.yelp.com/developers/v3/manage_app)
- View API call statistics

### Track Apify Costs

**Apify Console:**
- Go to Billing → Usage
- View compute units used
- Set up budget alerts

---

## 🎯 User Experience

### What Users See

**Simple Input Form:**
```json
{
  "keywords": ["tree service"],
  "locations": ["Boston, MA"],
  "maxResultsPerLocation": 100
}
```

**No API keys needed!** ✅

### What Happens Behind the Scenes

1. User clicks "Run"
2. Actor uses your secrets (environment variables)
3. Makes API calls with your keys
4. Returns results to user
5. You get charged for API usage
6. User pays you the fixed price

---

## 🚀 Deployment Checklist

Before going live:

- [ ] Get Google Places API key
- [ ] Get Yelp Fusion API key (optional)
- [ ] Add secrets to Apify Actor
- [ ] Set API key restrictions
- [ ] Set usage quotas/limits
- [ ] Set up billing alerts
- [ ] Test with real API keys
- [ ] Deploy to Apify: `apify push`
- [ ] Test a full run on Apify platform
- [ ] Monitor first few runs
- [ ] Set your pricing
- [ ] Publish to Apify Store

---

## 🔧 Troubleshooting

### Error: "Google Places API key is required"

**Cause:** Environment variable not set

**Solution:**
1. Check Apify Console → Settings → Environment Variables
2. Verify `GOOGLE_PLACES_API_KEY` exists
3. Redeploy: `apify push`

### Error: "REQUEST_DENIED" from Google

**Cause:** API not enabled or billing not set up

**Solution:**
1. Enable Places API in Google Cloud Console
2. Enable billing on your Google Cloud project
3. Wait 5-10 minutes for changes to propagate

### High API Costs

**Cause:** Too many requests

**Solution:**
1. Set lower `maxResultsPerLocation` limits
2. Set daily quotas in Google Cloud Console
3. Monitor usage daily

---

## 📞 Support

**Questions?**
- Check [API-SETUP.md](./API-SETUP.md) for detailed API setup
- Check [APIFY-DEPLOYMENT.md](./APIFY-DEPLOYMENT.md) for deployment guide

**Need Help?**
- Apify Discord: [discord.gg/apify](https://discord.gg/apify)
- Apify Docs: [docs.apify.com](https://docs.apify.com)

---

## ✅ Quick Reference

**Add secrets:**
```bash
apify secrets:add GOOGLE_PLACES_API_KEY "AIzaSy..."
apify secrets:add YELP_API_KEY "your_key"
```

**Deploy:**
```bash
apify push
```

**Test:**
```bash
apify call
```

**Monitor costs:**
- Google: [console.cloud.google.com/billing](https://console.cloud.google.com/billing)
- Yelp: [yelp.com/developers/v3/manage_app](https://www.yelp.com/developers/v3/manage_app)
- Apify: [console.apify.com/billing](https://console.apify.com/billing)

---

**You're all set for fixed pricing!** 🎉

Users just click "Run" and you control all the costs through your secrets.
