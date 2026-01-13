# API Setup Guide for LeadGraph™

## Overview

LeadGraph™ now supports **two modes** for data collection:

1. **Web Scraping Mode** (Free, slower, may be blocked)
2. **API Mode** (Paid, faster, reliable) ⭐ **Recommended**

## 🔑 Getting API Keys

### Google Places API

**Cost**: ~$17 per 1,000 searches (Text Search) + $17 per 1,000 details requests

#### Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable billing (required for API access)

#### Step 2: Enable APIs

1. Go to **APIs & Services** → **Library**
2. Search for and enable:
   - **Places API**
   - **Places API (New)** (optional, for better results)

#### Step 3: Create API Key

1. Go to **APIs & Services** → **Credentials**
2. Click **Create Credentials** → **API Key**
3. Copy your API key
4. **Restrict the key** (recommended):
   - Click on the key name
   - Under **API restrictions**, select **Restrict key**
   - Choose **Places API**
   - Save

#### Step 4: Set Usage Limits (Optional but Recommended)

1. Go to **APIs & Services** → **Places API** → **Quotas**
2. Set daily limits to prevent unexpected charges

**Your Google Places API Key**: `AIzaSy...` (starts with `AIzaSy`)

---

### Yelp Fusion API

**Cost**: **FREE** for up to 500 calls/day!

#### Step 1: Create Yelp Account

1. Go to [Yelp Developers](https://www.yelp.com/developers)
2. Sign up or log in

#### Step 2: Create an App

1. Go to [Manage App](https://www.yelp.com/developers/v3/manage_app)
2. Click **Create New App**
3. Fill in:
   - **App Name**: LeadGraph Actor
   - **Industry**: Marketing/Lead Generation
   - **Contact Email**: Your email
   - **Description**: Local business lead discovery tool
4. Agree to terms and create app

#### Step 3: Get API Key

1. Your **API Key** will be displayed immediately
2. Copy the key (it looks like: `Bearer abc123...`)

**Your Yelp API Key**: Long alphanumeric string

---

## 📝 Configuration

### Option 1: Update INPUT.json

Edit `.actor/INPUT.json`:

```json
{
  "seedType": "keyword",
  "keywords": ["tree service"],
  "locations": ["Pepperell, MA"],
  "useApis": true,
  "apiKeys": {
    "googlePlaces": "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
    "yelp": "YOUR_YELP_API_KEY_HERE"
  },
  "sources": ["googleMaps", "yelp"],
  "maxResultsPerLocation": 20,
  "enrichment": {
    "crawlWebsite": true
  }
}
```

### Option 2: Environment Variables (More Secure)

Create `.env` file:

```bash
GOOGLE_PLACES_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
YELP_API_KEY=YOUR_YELP_API_KEY_HERE
```

Then in your code, load from environment:

```javascript
const input = {
  useApis: true,
  apiKeys: {
    googlePlaces: process.env.GOOGLE_PLACES_API_KEY,
    yelp: process.env.YELP_API_KEY
  }
};
```

---

## 🚀 Testing with APIs

### Quick Test

```bash
# Make sure API keys are in .actor/INPUT.json
node test-local.js
```

You should see:

```
INFO  Starting discovery phase {"mode":"API"}
INFO  Using API mode (faster, more reliable)
INFO  Searching Google Places API: tree service in Pepperell, MA
INFO  Collected 10 leads from Google Places API
INFO  Searching Yelp Fusion API: tree service in Pepperell, MA
INFO  Collected 8 leads from Yelp Fusion API
```

### Expected Performance

| Mode | Speed | Reliability | Cost |
|------|-------|-------------|------|
| **Web Scraping** | 2-5 min/20 leads | 60% (may be blocked) | Free |
| **API Mode** | 10-30 sec/20 leads | 99% | ~$0.68/20 leads |

---

## 💰 Cost Estimation

### Google Places API

**Pricing**:
- Text Search: $17 per 1,000 requests
- Place Details: $17 per 1,000 requests
- **Total**: ~$34 per 1,000 leads

**Example costs**:
- 100 leads: ~$3.40
- 500 leads: ~$17.00
- 1,000 leads: ~$34.00

### Yelp Fusion API

**Pricing**:
- **FREE**: Up to 500 calls/day
- Each lead = 2 calls (search + details)
- **FREE**: Up to 250 leads/day

### Combined Cost

For 100 leads using both sources:
- Google Places: ~$3.40
- Yelp: **FREE**
- **Total**: ~$3.40

---

## 🔒 Security Best Practices

### 1. Never Commit API Keys to Git

Add to `.gitignore`:

```
.env
.actor/INPUT.json
```

### 2. Use Environment Variables

For production, use Apify's secret storage:

1. Go to Apify Console → Your Actor → Settings
2. Add secrets:
   - `GOOGLE_PLACES_API_KEY`
   - `YELP_API_KEY`
3. Reference in input schema

### 3. Restrict API Keys

**Google Places**:
- Restrict to specific APIs only
- Set daily quotas
- Use IP restrictions if possible

**Yelp**:
- Monitor usage in Yelp dashboard
- Regenerate key if compromised

### 4. Monitor Usage

- Check Google Cloud Console billing daily
- Check Yelp dashboard for rate limits
- Set up billing alerts

---

## 🐛 Troubleshooting

### Error: "Google Places API key is required"

**Solution**: Make sure `useApis: true` and `apiKeys.googlePlaces` is set in input.

### Error: "REQUEST_DENIED" from Google

**Possible causes**:
1. API not enabled in Google Cloud Console
2. Billing not enabled
3. API key restrictions too strict
4. Invalid API key

**Solution**: 
- Enable Places API in Google Cloud Console
- Enable billing
- Check API key restrictions

### Error: 403 from Yelp

**Possible causes**:
1. Invalid API key
2. Rate limit exceeded (500/day)

**Solution**:
- Verify API key is correct
- Check usage in Yelp dashboard
- Wait 24 hours if rate limited

### Error: "ZERO_RESULTS"

**Possible causes**:
1. No businesses match the search
2. Location not recognized

**Solution**:
- Try broader keywords
- Use more specific location (e.g., "Boston, MA" instead of just "Boston")

---

## 📊 API vs Web Scraping Comparison

| Feature | Web Scraping | API Mode |
|---------|--------------|----------|
| **Cost** | Free | ~$3-4 per 100 leads |
| **Speed** | 2-5 min | 10-30 sec |
| **Reliability** | 60-70% | 99% |
| **Data Quality** | Good | Excellent |
| **Rate Limits** | Soft (may be blocked) | Hard (500/day Yelp) |
| **Maintenance** | High (breaks when sites change) | Low |
| **Legal** | Gray area | Fully compliant |

---

## 🎯 Recommendations

### For Development/Testing
- Use **Web Scraping** mode (free)
- Or use **API mode** with low limits

### For Production
- Use **API mode** for reliability
- Set up billing alerts
- Monitor usage daily
- Consider Yelp for free tier (250 leads/day)

### For High Volume (1000+ leads/day)
- Use **API mode** exclusively
- Set up Google Cloud billing alerts
- Consider batch processing to optimize costs
- Use caching/delta mode to avoid re-fetching

---

## 📞 Support

**Google Places API**:
- [Documentation](https://developers.google.com/maps/documentation/places/web-service)
- [Support](https://developers.google.com/maps/support)

**Yelp Fusion API**:
- [Documentation](https://www.yelp.com/developers/documentation/v3)
- [Support](https://www.yelp.com/developers/support)

---

**Ready to use APIs!** 🚀

Just add your API keys to `.actor/INPUT.json` and set `"useApis": true`.
