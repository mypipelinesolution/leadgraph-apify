# How to Use LeadGraph™

A step-by-step guide for finding and enriching local business leads.

## Quick Start

### 1. Set Your Search Criteria

Enter your target keywords and locations:

```json
{
  "keywords": ["tree service"],
  "locations": ["Boston, MA"]
}
```

**Keywords** - Business types or services you're targeting (e.g., "plumber", "dentist", "landscaping")

**Locations** - Cities, towns, or areas to search (e.g., "Austin, TX", "Miami, FL")

### 2. Run the Actor

Click **Start** to begin lead discovery. The Actor will:

1. Search Google Maps for matching businesses
2. Collect business details (name, address, phone, website, reviews)
3. Optionally enrich with website data
4. Score and rank leads
5. Generate AI outreach content

### 3. Download Results

When complete, download your leads as:
- **JSON** - For developers and integrations
- **CSV** - For spreadsheets and CRM import
- **Excel** - For direct use in Excel

---

## Input Options

### Basic Options

| Field | Description | Example |
|-------|-------------|---------|
| `keywords` | Business types to search | `["plumber", "electrician"]` |
| `locations` | Areas to search | `["Denver, CO", "Boulder, CO"]` |
| `maxResultsPerLocation` | Max leads per location | `20` |

### Enrichment Options

Enable website crawling to extract additional contact info:

```json
{
  "enrichment": {
    "crawlWebsite": true
  }
}
```

This extracts:
- Email addresses
- Additional phone numbers
- Social media links (Facebook, Instagram, LinkedIn, etc.)
- Tech signals (Google Analytics, chat widgets, etc.)

### Scoring Options

Lead scoring is enabled by default. Each lead gets:
- **Score** (0-100) - Overall lead quality
- **Tier** (A/B/C/D) - Quick quality indicator
- **Reasons** - Why the lead scored high/low

### AI Outreach Options

Generate personalized outreach content:

```json
{
  "ai": {
    "enabled": true,
    "yourCompany": {
      "name": "Your Agency Name",
      "services": "web design, SEO, lead generation",
      "targetAudience": "local service businesses"
    }
  }
}
```

This generates:
- **Cold Email** - Personalized email with subject line
- **Voicemail Script** - 45-60 second script
- **SMS Message** - Short text message

### Filter Options

Filter leads by quality:

```json
{
  "filters": {
    "minRating": 4.0,
    "minReviews": 10,
    "requireWebsite": true
  }
}
```

| Filter | Description |
|--------|-------------|
| `minRating` | Minimum Google rating (1-5) |
| `minReviews` | Minimum number of reviews |
| `requireWebsite` | Only include leads with websites |

---

## Full Input Example

```json
{
  "keywords": ["tree service", "landscaping", "lawn care"],
  "locations": ["Boston, MA", "Cambridge, MA", "Somerville, MA"],
  "maxResultsPerLocation": 30,
  "enrichment": {
    "crawlWebsite": true
  },
  "scoring": {
    "enabled": true
  },
  "ai": {
    "enabled": true,
    "yourCompany": {
      "name": "GrowthPro Marketing",
      "services": "website design, local SEO, and Google Ads management",
      "targetAudience": "home service businesses"
    }
  },
  "filters": {
    "minRating": 3.5,
    "minReviews": 5,
    "requireWebsite": false
  }
}
```

---

## Output Format

Each lead includes:

### Business Info
- Business name
- Category
- Full address
- Phone number
- Google Maps URL

### Online Presence
- Website URL
- Social media links

### Contact Details
- Email addresses (from website)
- Phone numbers (from website)

### Signals
- Google rating and review count
- Website features (contact forms, booking widgets, chat)
- Marketing tech (Google Analytics, Facebook Pixel, etc.)

### Lead Score
- Score (0-100)
- Tier (A/B/C/D)
- Scoring reasons

### AI Outreach (if enabled)
- Cold email with subject line
- Voicemail script
- SMS message

---

## Tips for Best Results

### Keywords
- Be specific: "tree removal service" vs just "tree"
- Use multiple variations: ["plumber", "plumbing contractor", "plumbing service"]
- Target niches: "emergency plumber", "commercial HVAC"

### Locations
- Use "City, State" format: "Austin, TX"
- Search multiple nearby areas for more leads
- Try neighborhoods for large cities: "Downtown Miami, FL"

### Filters
- Start with lower thresholds, then increase if you get too many leads
- `requireWebsite: true` gives higher quality leads but fewer results

### AI Outreach
- Customize `yourCompany` details for better personalization
- The more specific your services, the better the outreach

---

## API Integration

Use the Apify API to run LeadGraph programmatically:

```javascript
import { ApifyClient } from 'apify-client';

const client = new ApifyClient({ token: 'YOUR_APIFY_TOKEN' });

const run = await client.actor('YOUR_ACTOR_ID').call({
  keywords: ['tree service'],
  locations: ['Boston, MA'],
  maxResultsPerLocation: 20,
  enrichment: { crawlWebsite: true },
  ai: { enabled: true }
});

const { items } = await client.dataset(run.defaultDatasetId).listItems();
console.log(items); // Your leads
```

---

## Support

Questions? Issues? Contact us through Apify or open an issue on GitHub.
