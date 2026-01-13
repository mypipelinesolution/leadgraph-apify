# LeadGraph™ Actor - AI Assistant Context

## Project Overview

**LeadGraph™** is an Apify Actor for multi-source local business lead discovery with enrichment, deduplication, scoring, and CRM integration. Built for the Apify $1M Challenge.

## Architecture

### Core Components

1. **Discovery Layer** (`src/discovery/`)
   - `googleMaps.js` - Google Maps scraper using Playwright
   - `yelp.js` - Yelp scraper using Cheerio
   - `bbb.js` - Better Business Bureau scraper (placeholder)
   - `serp.js` - Search engine results scraper (placeholder)
   - `chambers.js` - Chambers of Commerce scraper (placeholder)

2. **Enrichment Layer** (`src/enrichment/`)
   - `websiteCrawler.js` - Website crawling for contact extraction
   - `emailExtractor.js` - Email address extraction
   - `phoneExtractor.js` - Phone number extraction with E.164 formatting
   - `socialExtractor.js` - Social media link extraction
   - `techSignals.js` - Marketing technology detection

3. **Processing Layer** (`src/processing/`)
   - `dedupe.js` - Deduplication logic
   - `merge.js` - Multi-source lead merging
   - `scoring.js` - Lead scoring (0-100 with A/B/C/D tiers)

4. **Utilities** (`src/utils/`)
   - `dedupeId.js` - **CRITICAL**: Stable SHA1 hash generation for deduplication
   - `deltaMode.js` - Change detection for incremental runs
   - `validation.js` - Input validation

5. **Integrations** (`src/integrations/`)
   - `webhook.js` - Webhook push functionality
   - `crmPush.js` - CRM integration (TradeHive/AdSuite)

6. **AI** (`src/ai/`)
   - `outreachDrafts.js` - AI-generated outreach content (optional)

## Key Implementation Details

### Stable dedupeId (CRITICAL)

The `dedupeId` MUST be deterministic and stable across runs:

```javascript
// From src/utils/dedupeId.js
const input = `${normName}|${normAddress}|${domain}|${phoneE164}`;
return crypto.createHash('sha1').update(input).digest('hex').substring(0, 16);
```

### Lead Schema

Each lead follows this structure:
- `dedupeId` - Stable identifier (SHA1 hash)
- `confidence` - 0.0-1.0 confidence score
- `sources` - Object with source-specific data (googleMaps, yelp, etc.)
- `business` - Core business info (name, address, phone, category)
- `online` - Website, domain, social media
- `contacts` - Emails, phones, contact forms, key people
- `signals` - Reviews, hours, website signals, tech signals
- `score` - Lead score (0-100), tier (A/B/C/D), reasons
- `ai` - AI-generated outreach drafts (optional)
- `raw` - Metadata (collectedAt, runId, notes)

## Development Status

### ✅ Phase 0: Setup & Foundation - COMPLETED
- Project structure created
- Dependencies installed
- Configuration files ready

### ✅ Phase 1: Core Discovery (MVP) - COMPLETED
- Google Maps scraper implemented
- Yelp scraper implemented
- Deduplication & merge logic working
- Lead scoring implemented
- Full pipeline integrated in main.js

### ✅ Phase 2: Enrichment & Processing - COMPLETED
- Website crawler implemented (crawls up to 10 pages)
- Email extraction with confidence scoring
- Phone extraction with E.164 formatting
- Social media extraction (6 platforms)
- Tech signals detection (5 technologies)
- Website signals (HTTPS, forms, widgets)
- Full integration in main.js

### ✅ Phase 3: Advanced Features - COMPLETED
- BBB scraper implemented
- SERP (Google Search) scraper implemented
- Delta mode implemented
- AI outreach generation (OpenAI integration)
- Generates cold emails, voicemail scripts, SMS messages
- Full integration in main.js

### ⏭️ Phase 4: CRM Integration - SKIPPED
- CSV export available via Apify dataset
- User will handle CRM formatting with custom scripts

### 🚧 Phase 5: Polish & Deploy - READY
- Error handling implemented
- Comprehensive logging in place
- README documentation complete
- Ready for Apify platform deployment

## Common Tasks

### Running Locally

```bash
# Install dependencies
npm install

# Run with test input
node src/main.js
```

### Testing Individual Scrapers

```javascript
import { scrapeGoogleMaps } from './src/discovery/googleMaps.js';

const leads = await scrapeGoogleMaps('tree service', 'Pepperell, MA', {
  maxResultsPerLocation: 10
});
```

### Adding a New Source

1. Create scraper in `src/discovery/[source].js`
2. Export async function that returns array of lead objects
3. Import and integrate in `src/main.js`
4. Add source to INPUT_SCHEMA.json enum

## Critical Rules

**NEVER**:
- ❌ Hardcode API keys or secrets
- ❌ Change output schema without approval
- ❌ Skip deduplication step
- ❌ Make dedupeId non-deterministic
- ❌ Store PII in logs

**ALWAYS**:
- ✅ Use stable dedupeId (SHA1 hash)
- ✅ Match output schema exactly
- ✅ Handle errors gracefully
- ✅ Respect rate limits
- ✅ Test delta mode thoroughly

## File Locations

- Main entry: `src/main.js`
- Input schema: `INPUT_SCHEMA.json`
- Actor config: `.actor/actor.json`
- Test input: `.actor/INPUT.json`
- Dependencies: `package.json`
- Docker: `Dockerfile`

## Next Steps

1. Implement website enrichment (Phase 2)
2. Add remaining scrapers (BBB, SERP)
3. Implement AI outreach generation
4. Add CRM integration
5. Deploy to Apify platform
