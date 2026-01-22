# LeadGraph™

Local business lead discovery with enrichment, scoring, and AI-powered outreach generation.

## Features

- **Lead Discovery** - Find local businesses via Google Places API
- **Website Enrichment** - Extract emails, phones, social links, and tech signals
- **Lead Scoring** - Score leads 0-100 with A/B/C/D tiers
- **AI Outreach** - Generate personalized cold emails, voicemail scripts, and SMS messages
- **Deduplication** - Stable SHA1-based deduplication across runs
- **Delta Mode** - Only output new/changed leads on subsequent runs

## How It Works

1. Enter your target **keywords** (e.g., "tree service", "plumber") and **locations**
2. LeadGraph discovers businesses from Google Maps
3. Optionally enrich leads with website data (emails, phones, social links)
4. Score and rank leads by quality (A/B/C/D tiers)
5. Generate personalized AI outreach (cold email, voicemail, SMS)
6. Export CRM-ready lead data

## Input Configuration

```json
{
  "keywords": ["tree service", "landscaping"],
  "locations": ["Boston, MA", "Cambridge, MA"],
  "maxResultsPerLocation": 20,
  "enrichment": {
    "crawlWebsite": true
  },
  "scoring": {
    "enabled": true
  },
  "ai": {
    "enabled": true,
    "yourCompany": {
      "name": "Your Agency Name",
      "services": "web design, SEO, lead generation",
      "targetAudience": "local service businesses"
    }
  },
  "filters": {
    "minRating": 3.5,
    "minReviews": 5,
    "requireWebsite": false
  }
}
```

## Output

Each lead includes:

```json
{
  "dedupeId": "abc123...",
  "business": {
    "name": "Business Name",
    "category": "tree service",
    "address": { "street": "...", "city": "...", "state": "...", "postalCode": "..." },
    "phone": "(555) 123-4567",
    "phoneE164": "+15551234567"
  },
  "online": {
    "website": "https://example.com",
    "domain": "example.com",
    "socials": { "facebook": "...", "instagram": "..." }
  },
  "contacts": {
    "emails": [{ "email": "...", "confidence": 0.9 }],
    "phones": [{ "phone": "...", "source": "website" }]
  },
  "signals": {
    "reviews": { "rating": 4.8, "reviewCount": 127 },
    "techSignals": { "googleAnalytics": true, "facebookPixel": false }
  },
  "score": {
    "leadScore": 85,
    "tier": "A",
    "reasons": ["High rating", "Active website", "Contact info available"]
  },
  "ai": {
    "coldEmail": "Subject: ...\n\nHi...",
    "voicemail": "Hi, this is...",
    "sms": "Hi [Name], quick question..."
  }
}
```

## Actor Owner Setup

To deploy this Actor on Apify:

1. Push code to your Apify Actor
2. Add environment variables in **Actor Settings → Environment variables**:
   - `GOOGLE_PLACES_API_KEY` - [Get from Google Cloud Console](https://console.cloud.google.com/apis/credentials)
   - `OPENAI_API_KEY` - [Get from OpenAI Platform](https://platform.openai.com/api-keys)
3. Set your pricing in Apify Store

Users pay per run through Apify - they don't need to provide API keys.

## License

ISC
