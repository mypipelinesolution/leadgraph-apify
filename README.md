# LeadGraph™ - Local Business Lead Discovery & Enrichment

Multi-source local business lead discovery with website enrichment, deduplication, scoring, and CRM-ready output.

## 🚀 Features

- **Multi-source Discovery**: Google Maps, Yelp, BBB, Chambers of Commerce, SERP
- **API Mode**: Use official APIs (Google Places, Yelp Fusion) for faster, reliable data
- **Web Scraping Mode**: Free alternative using Playwright and Cheerio
- **Website Enrichment**: Email, phone, contact forms, social links, tech signals
- **Smart Deduplication**: Stable dedupeId using SHA1 hash
- **Lead Scoring**: 0-100 score with A/B/C/D tiers
- **AI Outreach**: Cold email, voicemail, SMS drafts (optional)
- **Delta Mode**: Only output new/changed leads
- **CRM Integration**: Webhook/batch push to TradeHive/AdSuite

## 📋 Quick Start

### Option 1: Using APIs (Recommended)

1. Get API keys:
   - [Google Places API](https://console.cloud.google.com/apis/credentials)
   - [Yelp Fusion API](https://www.yelp.com/developers/v3/manage_app) (FREE 500 calls/day)

2. Set environment variables:
```bash
# Windows (PowerShell)
$env:GOOGLE_PLACES_API_KEY="YOUR_KEY_HERE"
$env:YELP_API_KEY="YOUR_KEY_HERE"

# Mac/Linux
export GOOGLE_PLACES_API_KEY="YOUR_KEY_HERE"
export YELP_API_KEY="YOUR_KEY_HERE"
```

3. Run:
```bash
node test-local.js
```

**For Apify deployment:** See [SECRETS-SETUP.md](./SECRETS-SETUP.md)

### Option 2: Web Scraping (Free)

```bash
# Install Playwright browsers
npx playwright install chromium

# Run
node test-local.js
```

See [API-SETUP.md](./API-SETUP.md) for detailed instructions.

## 🔧 Input Parameters

See `INPUT_SCHEMA.json` for complete configuration options.

### Basic Example

```json
{
  "seedType": "keyword",
  "keywords": ["tree service"],
  "locations": ["Pepperell, MA"],
  "sources": ["googleMaps", "yelp"],
  "enrichment": {
    "crawlWebsite": true
  },
  "scoring": {
    "enabled": true
  }
}
```

## 📊 Output Schema

Each lead includes:
- Business information (name, address, phone, category)
- Online presence (website, social media)
- Contact details (emails, phones, contact forms)
- Signals (reviews, tech stack, website features)
- Lead score (0-100 with tier A/B/C/D)
- AI-generated outreach drafts (optional)

## 🔑 Delta Mode

Enable `deltaMode` to only output new or changed leads compared to previous runs. Perfect for weekly/monthly re-runs.

## 🎯 Development Status

**Phase 0**: ✅ Setup & Foundation - COMPLETED
- Project structure created
- Dependencies installed
- Configuration files ready

**Phase 1**: ✅ Core Discovery (MVP) - COMPLETED
- Google Maps scraper (Playwright)
- Yelp scraper (Cheerio)
- Deduplication & merge logic
- Lead scoring (0-100 with A/B/C/D tiers)
- Full pipeline integration

**Phase 2**: ✅ Enrichment & Processing - COMPLETED
- Website crawler (up to 10 pages per site)
- Email extraction with validation
- Phone extraction with E.164 formatting
- Social media link extraction (Facebook, Instagram, LinkedIn, YouTube, TikTok, X)
- Tech signals detection (Google Analytics, GTM, Facebook Pixel, HubSpot, Mailchimp)
- Website signals (HTTPS, contact forms, booking widgets, chat widgets)

**Phase 3**: ✅ Advanced Features - COMPLETED
- BBB (Better Business Bureau) scraper
- SERP (Google Search) scraper
- AI outreach generation (cold email, voicemail, SMS)
- OpenAI integration for personalized outreach

**Phase 4**: ⏭️ CRM Integration - SKIPPED
- CSV export available via Apify dataset
- User can format for CRM import with custom scripts

## 📝 License

ISC
