# LeadGraph™ Apify Actor - Project Starter Template

This is a complete AI-assisted development starter template for building the **LeadGraph™** Apify Actor - a multi-source local business lead discovery, enrichment, and scoring engine.

**Target**: Apify $1M Challenge (ends January 31, 2026)

---

## 📁 Project Structure

```
leadgraph-actor/
├── .actor/
│   └── actor.json              # Actor configuration
├── src/
│   ├── main.js                 # Entry point
│   ├── discovery/              # Source scrapers
│   │   ├── googleMaps.js
│   │   ├── yelp.js
│   │   ├── bbb.js
│   │   ├── chambers.js
│   │   └── serp.js
│   ├── enrichment/             # Website crawling & extraction
│   │   ├── websiteCrawler.js
│   │   ├── emailExtractor.js
│   │   ├── phoneExtractor.js
│   │   ├── socialExtractor.js
│   │   └── techSignals.js
│   ├── processing/             # Data processing
│   │   ├── dedupe.js
│   │   ├── scoring.js
│   │   └── merge.js
│   ├── ai/                     # AI outreach generation
│   │   └── outreachDrafts.js
│   ├── integrations/           # CRM & webhook integrations
│   │   ├── webhook.js
│   │   └── crmPush.js
│   └── utils/                  # Utilities
│       ├── dedupeId.js
│       ├── deltaMode.js
│       └── validation.js
├── INPUT_SCHEMA.json           # Actor input schema
├── Dockerfile                  # Container configuration
├── package.json                # Dependencies
├── README.md                   # Actor documentation
└── AGENTS.md                   # AI assistant context
```

---

## 🚀 AI Coding Assistant Prompt

Copy this prompt when starting a new AI coding session:

```markdown
# LeadGraph™ Actor Development Session

I'm building **LeadGraph™**, an Apify Actor for multi-source local business lead discovery with enrichment, deduplication, scoring, and CRM integration.

## Project Context
- **Platform**: Apify (https://docs.apify.com)
- **Language**: JavaScript/Node.js
- **Framework**: Crawlee + Apify SDK
- **Goal**: Apify $1M Challenge submission

## Key Documentation
- Apify Actor Development: https://docs.apify.com/platform/actors/development
- Input Schema: https://docs.apify.com/platform/actors/development/actor-definition/input-schema
- Crawlee Docs: https://crawlee.dev/docs

## Core Features to Implement
1. **Multi-source Discovery**: Google Maps, Yelp, BBB, Chambers, SERP
2. **Website Enrichment**: Email, phone, contact forms, socials, tech signals
3. **Deduplication**: Stable dedupeId using SHA1 hash
4. **Lead Scoring**: 0-100 score with A/B/C/D tiers
5. **AI Outreach**: Cold email, voicemail, SMS drafts (optional)
6. **Delta Mode**: Only output new/changed leads
7. **Webhook/CRM Push**: Batch upsert to TradeHive/AdSuite

## Current Session Goal
[Describe what you want to work on this session]

## Files to Reference
- @INPUT_SCHEMA.json - Input configuration
- @src/main.js - Entry point
- @.actor/actor.json - Actor metadata
```

---

## 📄 .actor/actor.json

```json
{
  "actorSpecification": 1,
  "name": "leadgraph",
  "title": "LeadGraph™ - Local Business Lead Discovery & Enrichment",
  "description": "Multi-source local business lead discovery with website enrichment, deduplication, scoring, and CRM-ready output.",
  "version": "1.0.0",
  "buildTag": "latest",
  "meta": {
    "templateId": "js-crawlee-cheerio"
  },
  "input": "./INPUT_SCHEMA.json",
  "dockerfile": "./Dockerfile",
  "storages": {
    "dataset": {
      "actorSpecification": 1,
      "title": "Leads",
      "description": "Discovered and enriched business leads"
    }
  }
}
```

---

## 📄 INPUT_SCHEMA.json

```json
{
  "title": "LeadGraph™ Input",
  "type": "object",
  "schemaVersion": 1,
  "properties": {
    "seedType": {
      "title": "Seed Type",
      "type": "string",
      "description": "How to start the search.",
      "default": "keyword",
      "editor": "select",
      "enum": ["keyword", "category", "customUrls"],
      "enumTitles": ["Keyword search", "Category browse", "Custom URLs list"]
    },
    "keywords": {
      "title": "Keywords",
      "type": "array",
      "description": "Search terms (e.g., 'HVAC contractor', 'landscaping'). Used when Seed Type = Keyword search.",
      "editor": "stringList",
      "default": ["tree service"]
    },
    "customUrls": {
      "title": "Custom URLs",
      "type": "array",
      "description": "Business listing URLs. Used when Seed Type = Custom URLs list.",
      "editor": "stringList",
      "default": []
    },
    "locations": {
      "title": "Locations",
      "type": "array",
      "description": "Locations to search. Use 'City, State' or 'ZIP'.",
      "editor": "stringList",
      "default": ["Pepperell, MA"]
    },
    "geoMode": {
      "title": "Geo Mode",
      "type": "string",
      "description": "Use city/town text search or precise lat/lng radius.",
      "default": "text",
      "editor": "select",
      "enum": ["text", "radius"],
      "enumTitles": ["Text locations", "Lat/Lng + radius"]
    },
    "radiusMiles": {
      "title": "Radius (miles)",
      "type": "number",
      "description": "Only used when Geo Mode = Lat/Lng + radius.",
      "default": 10,
      "minimum": 1,
      "maximum": 200
    },
    "centerLat": {
      "title": "Center Latitude",
      "type": "number",
      "default": 42.665
    },
    "centerLng": {
      "title": "Center Longitude",
      "type": "number",
      "default": -71.588
    },
    "sources": {
      "title": "Sources",
      "type": "array",
      "description": "Select which sources to use for discovery.",
      "editor": "checkboxGroup",
      "default": ["googleMaps", "yelp", "bbb", "serp"],
      "items": {
        "type": "string",
        "enum": ["googleMaps", "yelp", "bbb", "chambers", "serp", "nicheDirectories"],
        "enumTitles": ["Google Maps", "Yelp", "BBB", "Chambers of Commerce", "Search (SERP)", "Niche directories"]
      }
    },
    "maxResultsPerLocation": {
      "title": "Max Results per Location",
      "type": "integer",
      "description": "Maximum businesses to collect per location (before dedupe).",
      "default": 100,
      "minimum": 1,
      "maximum": 5000
    },
    "maxTotalResults": {
      "title": "Max Total Results",
      "type": "integer",
      "description": "Hard cap across all locations (before dedupe).",
      "default": 500,
      "minimum": 1,
      "maximum": 50000
    },
    "filters": {
      "title": "Filters",
      "type": "object",
      "description": "Filtering and qualification rules.",
      "properties": {
        "minRating": {
          "title": "Min Rating",
          "type": "number",
          "default": 0,
          "minimum": 0,
          "maximum": 5
        },
        "minReviews": {
          "title": "Min Reviews",
          "type": "integer",
          "default": 0,
          "minimum": 0
        },
        "requireWebsite": {
          "title": "Require Website",
          "type": "boolean",
          "default": false
        },
        "excludeFranchises": {
          "title": "Exclude Franchises / Chains",
          "type": "boolean",
          "default": false
        },
        "excludeKeywords": {
          "title": "Exclude Keywords",
          "type": "array",
          "editor": "stringList",
          "default": []
        },
        "includeKeywords": {
          "title": "Include Keywords",
          "type": "array",
          "editor": "stringList",
          "default": []
        }
      }
    },
    "enrichment": {
      "title": "Enrichment",
      "type": "object",
      "description": "Website crawl + contact extraction options.",
      "properties": {
        "crawlWebsite": {
          "title": "Crawl Website for Contacts",
          "type": "boolean",
          "default": true
        },
        "maxWebsitePages": {
          "title": "Max Website Pages",
          "type": "integer",
          "default": 10,
          "minimum": 1,
          "maximum": 100
        },
        "emailExtraction": {
          "title": "Email Extraction",
          "type": "string",
          "default": "standard",
          "editor": "select",
          "enum": ["off", "standard", "aggressive"],
          "enumTitles": ["Off", "Standard", "Aggressive"]
        },
        "phoneExtraction": {
          "title": "Phone Extraction",
          "type": "boolean",
          "default": true
        },
        "collectTechSignals": {
          "title": "Collect Tech Signals",
          "type": "boolean",
          "default": true
        }
      }
    },
    "dedupe": {
      "title": "Dedupe & Matching",
      "type": "object",
      "properties": {
        "enabled": {
          "title": "Enable Dedupe",
          "type": "boolean",
          "default": true
        },
        "strategy": {
          "title": "Dedupe Strategy",
          "type": "string",
          "default": "balanced",
          "editor": "select",
          "enum": ["strict", "balanced", "aggressive"],
          "enumTitles": ["Strict (few merges)", "Balanced (recommended)", "Aggressive (more merges)"]
        }
      }
    },
    "scoring": {
      "title": "Lead Scoring",
      "type": "object",
      "properties": {
        "enabled": {
          "title": "Enable Scoring",
          "type": "boolean",
          "default": true
        },
        "weightsPreset": {
          "title": "Weights Preset",
          "type": "string",
          "default": "localService",
          "editor": "select",
          "enum": ["localService", "b2bAgency", "retail", "custom"],
          "enumTitles": ["Local service", "B2B agency", "Retail", "Custom (advanced)"]
        },
        "customWeights": {
          "title": "Custom Weights (advanced)",
          "type": "object",
          "default": {},
          "properties": {
            "reviews": { "type": "number", "default": 1 },
            "recency": { "type": "number", "default": 1 },
            "hasWebsite": { "type": "number", "default": 1 },
            "techSignals": { "type": "number", "default": 1 },
            "contactability": { "type": "number", "default": 1 }
          }
        }
      }
    },
    "aiOutreach": {
      "title": "AI Outreach Drafts",
      "type": "object",
      "properties": {
        "enabled": {
          "title": "Enable AI Drafts",
          "type": "boolean",
          "default": false
        },
        "tone": {
          "title": "Tone",
          "type": "string",
          "default": "direct",
          "editor": "select",
          "enum": ["direct", "friendly", "professional", "highEnergy"],
          "enumTitles": ["Direct", "Friendly", "Professional", "High-energy"]
        },
        "offer": {
          "title": "Your Offer (1–2 sentences)",
          "type": "string",
          "default": "We help local businesses get more customers with simple marketing + follow-up automation."
        },
        "personalizationDepth": {
          "title": "Personalization Depth",
          "type": "string",
          "default": "medium",
          "editor": "select",
          "enum": ["low", "medium", "high"],
          "enumTitles": ["Low (fast)", "Medium", "High (slower)"]
        },
        "includeSmsOpener": {
          "title": "Include SMS opener",
          "type": "boolean",
          "default": false
        }
      }
    },
    "exports": {
      "title": "Exports & Integrations",
      "type": "object",
      "properties": {
        "outputFormat": {
          "title": "Output Format",
          "type": "string",
          "default": "dataset",
          "editor": "select",
          "enum": ["dataset", "csv", "json", "xlsx"],
          "enumTitles": ["Apify Dataset", "CSV", "JSON", "Excel (XLSX)"]
        },
        "deltaMode": {
          "title": "Delta Mode",
          "type": "boolean",
          "description": "Only output new/changed leads compared to previous run.",
          "default": false
        },
        "webhookUrl": {
          "title": "Webhook URL (optional)",
          "type": "string",
          "default": ""
        },
        "webhookMode": {
          "title": "Webhook Mode",
          "type": "string",
          "default": "summary",
          "editor": "select",
          "enum": ["off", "summary", "perLead", "both"],
          "enumTitles": ["Off", "Summary only", "Per-lead", "Both"]
        }
      }
    },
    "runMode": {
      "title": "Run Mode",
      "type": "object",
      "properties": {
        "stealth": {
          "title": "Stealth Mode",
          "type": "boolean",
          "default": true
        },
        "maxConcurrency": {
          "title": "Max Concurrency",
          "type": "integer",
          "default": 10,
          "minimum": 1,
          "maximum": 200
        },
        "maxRetries": {
          "title": "Max Retries",
          "type": "integer",
          "default": 3,
          "minimum": 0,
          "maximum": 20
        },
        "proxyEnabled": {
          "title": "Use Apify Proxy",
          "type": "boolean",
          "default": true
        }
      }
    },
    "debug": {
      "title": "Debug",
      "type": "object",
      "properties": {
        "saveHtmlSnapshots": {
          "title": "Save HTML Snapshots",
          "type": "boolean",
          "default": false
        },
        "logLevel": {
          "title": "Log Level",
          "type": "string",
          "default": "INFO",
          "editor": "select",
          "enum": ["ERROR", "WARN", "INFO", "DEBUG"],
          "enumTitles": ["ERROR", "WARN", "INFO", "DEBUG"]
        }
      }
    }
  },
  "required": ["seedType", "locations"]
}
```

---

## 📄 Output Schema (Lead Record)

Each lead in the dataset follows this structure:

```json
{
  "dedupeId": "string (SHA1 hash - stable identifier)",
  "confidence": 0.0,
  "sources": {
    "googleMaps": { "url": "string", "placeId": "string" },
    "yelp": { "url": "string", "bizId": "string" },
    "bbb": { "url": "string", "businessId": "string" },
    "serp": { "url": "string" }
  },
  "business": {
    "name": "string",
    "category": "string",
    "categories": ["string"],
    "description": "string",
    "address": {
      "street": "string",
      "city": "string",
      "state": "string",
      "postalCode": "string",
      "country": "string",
      "formatted": "string"
    },
    "geo": { "lat": 0.0, "lng": 0.0 },
    "phone": "string",
    "phoneE164": "string"
  },
  "online": {
    "website": "string",
    "domain": "string",
    "socials": {
      "facebook": "string",
      "instagram": "string",
      "linkedin": "string",
      "youtube": "string",
      "tiktok": "string",
      "x": "string"
    }
  },
  "contacts": {
    "emails": [
      {
        "email": "string",
        "source": "string",
        "confidence": 0.0,
        "isRoleBased": true,
        "isValidated": false
      }
    ],
    "phones": [
      {
        "phone": "string",
        "phoneE164": "string",
        "source": "string",
        "confidence": 0.0
      }
    ],
    "contactFormUrl": "string",
    "bookingUrl": "string",
    "keyPeople": [
      {
        "name": "string",
        "title": "string",
        "source": "string",
        "confidence": 0.0
      }
    ]
  },
  "signals": {
    "reviews": {
      "rating": 0.0,
      "reviewCount": 0,
      "lastReviewDate": "ISO date string"
    },
    "hours": {
      "isOpen": true,
      "hoursText": "string"
    },
    "websiteSignals": {
      "hasHttps": true,
      "hasContactForm": true,
      "hasBookingWidget": false,
      "hasChatWidget": false
    },
    "techSignals": {
      "googleAnalytics": false,
      "facebookPixel": false,
      "googleTagManager": false,
      "hubspot": false,
      "mailchimp": false
    }
  },
  "score": {
    "leadScore": 0,
    "tier": "A|B|C|D",
    "reasons": ["string"]
  },
  "ai": {
    "coldEmail": {
      "subject": "string",
      "body": "string"
    },
    "voicemail": "string",
    "smsOpener": "string"
  },
  "raw": {
    "collectedAt": "ISO date string",
    "runId": "string",
    "notes": "string"
  }
}
```

---

## 📄 Key-Value Store Outputs

### RUN_SUMMARY.json
```json
{
  "totalFound": 420,
  "totalAfterDedupe": 280,
  "enrichedCount": 260,
  "aiCount": 120,
  "created": 0,
  "updated": 0,
  "skipped": 0,
  "errors": [],
  "sourceCoverage": {
    "googleMaps": 200,
    "yelp": 150,
    "bbb": 70
  },
  "runTimeMs": 360000
}
```

### LEAD_STATE.json (for Delta Mode)
```json
{
  "dedupeId1": "contentHash1",
  "dedupeId2": "contentHash2"
}
```

---

## 🔑 Critical Implementation: Stable dedupeId

The `dedupeId` must be **stable across runs** for delta mode to work:

```javascript
import crypto from 'crypto';

function generateDedupeId(business) {
  // Normalize business name
  const normName = (business.name || '')
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  
  // Normalize address
  const normAddress = (business.address?.formatted || '')
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  
  // Get domain and phone
  const domain = business.domain || '';
  const phoneE164 = business.phoneE164 || '';
  
  // Generate stable hash
  const input = `${normName}|${normAddress}|${domain}|${phoneE164}`;
  return crypto.createHash('sha1').update(input).digest('hex').substring(0, 16);
}
```

---

## 🔗 CRM Integration Endpoints

### Upsert Endpoint
```
POST /api/v1/integrations/apify/leadgraph/upsert
Authorization: Bearer ${CRM_API_KEY}
```

**Request Payload:**
```json
{
  "source": "apify-leadgraph",
  "crmTarget": "tradehive",
  "runId": "apify_run_123",
  "collectedAt": "2025-12-18T14:22:11.000Z",
  "mode": "full",
  "leads": [{ /* lead schema */ }]
}
```

**Response:**
```json
{
  "runId": "apify_run_123",
  "created": 10,
  "updated": 5,
  "skipped": 2,
  "errors": []
}
```

### Summary Endpoint (Optional)
```
POST /api/v1/integrations/apify/leadgraph/summary
```

---

## 💰 Pricing Strategy

| Tier | Price | Leads/Month | Features |
|------|-------|-------------|----------|
| **Free** | $0 | 25/run | 1 location, Maps+SERP only |
| **Starter** | $19/mo | 500 | 5 locations, basic enrichment |
| **Pro** | $79/mo | 10,000 | Unlimited, AI drafts, delta mode |
| **Agency** | $199/mo | 50,000+ | Priority, white-label |

**Cost per 1,000 leads**: ~$0.90-$1.90  
**Gross margin at Pro tier**: ~80%

---

## ✅ Acceptance Criteria

### Actor Must:
- [ ] Run keyword + location → produce LEADS dataset
- [ ] Dedupe merges duplicates correctly across sources
- [ ] Website crawl extracts at least one of: email/phone/contact form/socials
- [ ] LeadScore populated (0-100 with A/B/C/D tier)
- [ ] Delta mode works (2nd run produces minimal CHANGES)
- [ ] Webhook pushes in batches successfully

### CRM Must:
- [ ] Upsert endpoint creates/updates by dedupeId
- [ ] Required fields mapped to correct objects
- [ ] Tasks created automatically on new leads
- [ ] Pipeline stage set to "New Lead (LeadGraph)"

---

## 🛠️ Development Workflow

```bash
# 1. Install Apify CLI
npm install -g apify-cli

# 2. Create Actor from template
apify create leadgraph --template js-crawlee-cheerio

# 3. Install dependencies
cd leadgraph
npm install

# 4. Test locally
apify run -p '{"keywords":["tree service"],"locations":["Pepperell, MA"]}'

# 5. Login to Apify
apify login

# 6. Push to Apify platform
apify push
```

---

## 📚 Key Documentation Links

- **Apify Actor Development**: https://docs.apify.com/platform/actors/development
- **Input Schema**: https://docs.apify.com/platform/actors/development/actor-definition/input-schema
- **Crawlee**: https://crawlee.dev/docs
- **Apify SDK**: https://docs.apify.com/sdk/js
- **Publishing**: https://docs.apify.com/platform/actors/publishing
- **$1M Challenge**: https://apify.com/challenge

---

## 🏆 Why This Actor Wins

| Feature | Typical Actor | LeadGraph™ |
|---------|---------------|------------|
| Single-site scraping | ✅ | ✅ |
| Multi-source merge | ❌ | ✅ |
| Website enrichment | ❌ | ✅ |
| Lead scoring | ❌ | ✅ |
| AI outreach | ❌ | ✅ |
| Delta mode | ❌ | ✅ |
| CRM-ready output | ❌ | ✅ |
| Weekly re-run value | ❌ | ✅ |

**This isn't a scraper. It's a revenue engine.**

---

## 📝 Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | TBD | Initial release: multi-source discovery + enrichment + dedupe + scoring |

---

**Ready to build! 🚀**
