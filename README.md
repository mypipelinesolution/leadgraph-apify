# LeadGraph™

Local business lead discovery with enrichment, scoring, and AI-powered outreach generation.

## Features

- **Lead Discovery** - Find local businesses via Google Places API
- **Website Enrichment** - Extract emails, phones, social links, and tech signals
- **Lead Scoring** - Score leads 0-100 with A/B/C/D tiers
- **AI Outreach** - Generate personalized cold emails, voicemail scripts, and SMS messages
- **Deduplication** - Stable SHA1-based deduplication across runs
- **Delta Mode** - Only output new/changed leads on subsequent runs

## Requirements

You need two API keys:

| API | Purpose | Get Key |
|-----|---------|---------|
| **Google Places API** | Lead discovery | [Google Cloud Console](https://console.cloud.google.com/apis/credentials) |
| **OpenAI API** | AI outreach generation | [OpenAI Platform](https://platform.openai.com/api-keys) |

## Setup

### 1. Environment Variables

Create a `.env` file in the project root:

```env
GOOGLE_PLACES_API_KEY=your_google_places_api_key
OPENAI_API_KEY=your_openai_api_key
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Run

```bash
npm start
```

## Input Configuration

```json
{
  "keywords": ["tree service", "landscaping"],
  "locations": ["Boston, MA", "Cambridge, MA"],
  "useApis": true,
  "maxResultsPerLocation": 20,
  "apiKeys": {
    "googlePlaces": "your_key_here"
  },
  "enrichment": {
    "crawlWebsite": true
  },
  "scoring": {
    "enabled": true,
    "weightsPreset": "localService"
  },
  "ai": {
    "enabled": true,
    "openaiApiKey": "your_key_here",
    "model": "gpt-4o-mini",
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
  },
  "exports": {
    "deltaMode": false
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

## Apify Deployment

1. Push code to your Apify Actor
2. Add environment variables in Actor Settings:
   - `GOOGLE_PLACES_API_KEY`
   - `OPENAI_API_KEY`
3. Run the Actor with your input configuration

## License

ISC
