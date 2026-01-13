# LeadGraph™ Apify Actor - Build Plan

**Target**: Apify $1M Challenge (Deadline: January 31, 2026)

This document breaks down the LeadGraph™ Actor build into clear, actionable steps organized by phase.

---

## 📋 Build Phases Overview

| Phase | Focus | Duration | Priority |
|-------|-------|----------|----------|
| **Phase 0** | Setup & Foundation | 1-2 days | Critical |
| **Phase 1** | Core Discovery (MVP) | 3-5 days | Critical |
| **Phase 2** | Enrichment & Processing | 3-4 days | Critical |
| **Phase 3** | Advanced Features | 2-3 days | High |
| **Phase 4** | CRM Integration | 2-3 days | High |
| **Phase 5** | Polish & Deploy | 2-3 days | Medium |

**Total Estimated Time**: 13-20 days

---

## Phase 0: Setup & Foundation (Days 1-2)

### Goal
Set up the project structure, install dependencies, and create configuration files.

### Steps

#### 0.1 Initialize Apify Project
```bash
# Install Apify CLI globally
npm install -g apify-cli

# Create new Actor from template
apify create leadgraph --template js-crawlee-cheerio

# Navigate to project
cd leadgraph

# Login to Apify
apify login
```

**Acceptance**: Project created with basic Apify structure

---

#### 0.2 Create Project Structure
Create the modular folder structure:

```bash
mkdir -p src/discovery
mkdir -p src/enrichment
mkdir -p src/processing
mkdir -p src/ai
mkdir -p src/integrations
mkdir -p src/utils
mkdir -p .actor
```

**Files to create**:
- `src/main.js` - Entry point
- `src/discovery/googleMaps.js` - Google Maps scraper
- `src/discovery/yelp.js` - Yelp scraper
- `src/discovery/bbb.js` - BBB scraper
- `src/discovery/chambers.js` - Chambers scraper
- `src/discovery/serp.js` - SERP scraper
- `src/enrichment/websiteCrawler.js` - Website crawler
- `src/enrichment/emailExtractor.js` - Email extraction
- `src/enrichment/phoneExtractor.js` - Phone extraction
- `src/enrichment/socialExtractor.js` - Social links extraction
- `src/enrichment/techSignals.js` - Tech signal detection
- `src/processing/dedupe.js` - Deduplication logic
- `src/processing/scoring.js` - Lead scoring
- `src/processing/merge.js` - Multi-source merge
- `src/utils/dedupeId.js` - Stable ID generation
- `src/utils/deltaMode.js` - Delta mode logic
- `src/utils/validation.js` - Input validation

**Acceptance**: All folders and placeholder files created

---

#### 0.3 Configure Actor Metadata
Create `.actor/actor.json`:

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

**Acceptance**: Actor metadata configured correctly

---

#### 0.4 Create INPUT_SCHEMA.json
Copy the complete INPUT_SCHEMA.json from the project outline (lines 118-462).

**Key sections**:
- seedType, keywords, locations
- sources (googleMaps, yelp, bbb, chambers, serp)
- filters (minRating, minReviews, requireWebsite, etc.)
- enrichment (crawlWebsite, emailExtraction, etc.)
- dedupe (enabled, strategy)
- scoring (enabled, weightsPreset)
- aiOutreach (enabled, tone, offer)
- exports (outputFormat, deltaMode, webhookUrl)
- runMode (stealth, maxConcurrency, maxRetries)
- debug (saveHtmlSnapshots, logLevel)

**Acceptance**: INPUT_SCHEMA.json validates and renders in Apify UI

---

#### 0.5 Install Dependencies
Update `package.json`:

```json
{
  "name": "leadgraph",
  "version": "1.0.0",
  "type": "module",
  "dependencies": {
    "apify": "^3.1.0",
    "crawlee": "^3.5.0",
    "playwright": "^1.40.0",
    "cheerio": "^1.0.0-rc.12",
    "libphonenumber-js": "^1.10.0",
    "email-validator": "^2.0.4",
    "string-similarity": "^4.0.4"
  }
}
```

Install:
```bash
npm install
```

**Acceptance**: All dependencies installed without errors

---

#### 0.6 Create Basic Main Entry Point
Create `src/main.js`:

```javascript
import { Actor } from 'apify';
import { log } from 'crawlee';

await Actor.init();

try {
  const input = await Actor.getInput();
  log.info('Actor started', { input });

  // Validate input
  if (!input.locations || input.locations.length === 0) {
    throw new Error('At least one location is required');
  }

  // TODO: Implement discovery, enrichment, processing

  log.info('Actor finished successfully');
} catch (error) {
  log.error('Actor failed', { error: error.message });
  throw error;
} finally {
  await Actor.exit();
}
```

**Acceptance**: Actor runs locally with `apify run` (even if it does nothing yet)

---

## Phase 1: Core Discovery - MVP (Days 3-7)

### Goal
Implement basic lead discovery from at least 2 sources (Google Maps + one other).

### Steps

#### 1.1 Implement Google Maps Scraper
**File**: `src/discovery/googleMaps.js`

**Requirements**:
- Accept keyword + location
- Use Playwright for dynamic content
- Extract: name, address, phone, website, rating, reviewCount, category
- Return standardized lead objects
- Handle pagination (up to maxResultsPerLocation)
- Respect rate limits with stealth mode

**Key functions**:
```javascript
export async function scrapeGoogleMaps(keyword, location, options) {
  // Returns array of raw leads
}
```

**Test**: Run with `keywords: ["tree service"], locations: ["Pepperell, MA"]`

**Acceptance**: Successfully extracts 10+ businesses from Google Maps

---

#### 1.2 Implement Yelp Scraper
**File**: `src/discovery/yelp.js`

**Requirements**:
- Accept keyword + location
- Extract same fields as Google Maps
- Handle Yelp's specific structure
- Return standardized lead objects

**Key functions**:
```javascript
export async function scrapeYelp(keyword, location, options) {
  // Returns array of raw leads
}
```

**Test**: Same test query as Google Maps

**Acceptance**: Successfully extracts 10+ businesses from Yelp

---

#### 1.3 Implement Basic Deduplication
**File**: `src/utils/dedupeId.js`

**Requirements**:
- Generate stable SHA1 hash from: normName|normAddress|domain|phoneE164
- Normalize business name (lowercase, strip punctuation)
- Normalize address (formatted string)
- Handle missing fields gracefully

**Key functions**:
```javascript
import crypto from 'crypto';

export function generateDedupeId(business) {
  const normName = normalizeName(business.name);
  const normAddress = normalizeAddress(business.address?.formatted);
  const domain = business.domain || '';
  const phoneE164 = business.phoneE164 || '';
  
  const input = `${normName}|${normAddress}|${domain}|${phoneE164}`;
  return crypto.createHash('sha1').update(input).digest('hex').substring(0, 16);
}

function normalizeName(name) {
  return (name || '')
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function normalizeAddress(address) {
  return (address || '')
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}
```

**Test**: Same business from 2 sources should generate same dedupeId

**Acceptance**: Stable, deterministic dedupeId generation

---

#### 1.4 Implement Basic Merge Logic
**File**: `src/processing/merge.js`

**Requirements**:
- Group leads by dedupeId
- Merge duplicate records
- Preserve all source URLs
- Calculate confidence score based on source agreement

**Key functions**:
```javascript
export function mergeLeads(rawLeads) {
  const grouped = groupByDedupeId(rawLeads);
  return Object.values(grouped).map(mergeDuplicates);
}

function mergeDuplicates(leads) {
  // Merge logic: higher confidence source wins for conflicts
  // Preserve all source URLs
  // Calculate overall confidence
}
```

**Test**: 2 duplicate leads from different sources merge into 1

**Acceptance**: Deduplication reduces lead count correctly

---

#### 1.5 Integrate Discovery into Main
**File**: `src/main.js`

**Requirements**:
- Loop through keywords × locations
- Call each enabled source scraper
- Collect all raw leads
- Apply deduplication
- Output to dataset

**Updated main.js**:
```javascript
import { Actor } from 'apify';
import { log } from 'crawlee';
import { scrapeGoogleMaps } from './discovery/googleMaps.js';
import { scrapeYelp } from './discovery/yelp.js';
import { generateDedupeId } from './utils/dedupeId.js';
import { mergeLeads } from './processing/merge.js';

await Actor.init();

try {
  const input = await Actor.getInput();
  const rawLeads = [];

  // Discovery phase
  for (const location of input.locations) {
    for (const keyword of input.keywords) {
      if (input.sources.includes('googleMaps')) {
        const gmLeads = await scrapeGoogleMaps(keyword, location, input);
        rawLeads.push(...gmLeads);
      }
      
      if (input.sources.includes('yelp')) {
        const yelpLeads = await scrapeYelp(keyword, location, input);
        rawLeads.push(...yelpLeads);
      }
    }
  }

  log.info(`Collected ${rawLeads.length} raw leads`);

  // Add dedupeId to each lead
  rawLeads.forEach(lead => {
    lead.dedupeId = generateDedupeId(lead);
  });

  // Merge duplicates
  const mergedLeads = mergeLeads(rawLeads);
  log.info(`After dedupe: ${mergedLeads.length} unique leads`);

  // Save to dataset
  await Actor.pushData(mergedLeads);

  log.info('Actor finished successfully');
} catch (error) {
  log.error('Actor failed', { error: error.message });
  throw error;
} finally {
  await Actor.exit();
}
```

**Test**: Run with 1 keyword, 1 location, 2 sources

**Acceptance**: 
- ✅ Discovers leads from 2 sources
- ✅ Deduplicates correctly
- ✅ Outputs to dataset with proper schema

---

## Phase 2: Enrichment & Processing (Days 8-11)

### Goal
Add website crawling, contact extraction, and lead scoring.

### Steps

#### 2.1 Implement Website Crawler
**File**: `src/enrichment/websiteCrawler.js`

**Requirements**:
- Accept domain URL
- Crawl up to maxWebsitePages (default 10)
- Prioritize: /contact, /about, /team, footer
- Extract raw HTML for further processing
- Handle timeouts and errors gracefully

**Key functions**:
```javascript
export async function crawlWebsite(domain, options) {
  // Returns { pages: [...], metadata: {...} }
}
```

**Test**: Crawl a known business website

**Acceptance**: Successfully crawls and returns page content

---

#### 2.2 Implement Email Extractor
**File**: `src/enrichment/emailExtractor.js`

**Requirements**:
- Extract emails from mailto: links
- Extract emails from text patterns
- Validate email format
- Detect role-based emails (info@, contact@, etc.)
- Calculate confidence score per email

**Key functions**:
```javascript
export function extractEmails(html, domain) {
  // Returns array of { email, source, confidence, isRoleBased }
}
```

**Test**: Extract emails from sample HTML

**Acceptance**: Finds emails with correct confidence scores

---

#### 2.3 Implement Phone Extractor
**File**: `src/enrichment/phoneExtractor.js`

**Requirements**:
- Extract phone numbers from text
- Convert to E.164 format using libphonenumber-js
- Calculate confidence score
- Handle multiple formats

**Key functions**:
```javascript
import { parsePhoneNumber } from 'libphonenumber-js';

export function extractPhones(html, countryCode = 'US') {
  // Returns array of { phone, phoneE164, source, confidence }
}
```

**Test**: Extract phones from sample HTML

**Acceptance**: Finds phones and converts to E.164 format

---

#### 2.4 Implement Social Extractor
**File**: `src/enrichment/socialExtractor.js`

**Requirements**:
- Extract social media links (Facebook, Instagram, LinkedIn, YouTube, TikTok, X/Twitter)
- Validate URLs
- Return standardized format

**Key functions**:
```javascript
export function extractSocials(html) {
  // Returns { facebook, instagram, linkedin, youtube, tiktok, x }
}
```

**Test**: Extract socials from sample HTML

**Acceptance**: Finds social links correctly

---

#### 2.5 Implement Tech Signals Detector
**File**: `src/enrichment/techSignals.js`

**Requirements**:
- Detect: Google Analytics, GTM, Meta Pixel, HubSpot, Mailchimp
- Check HTML for tracking scripts
- Return boolean flags

**Key functions**:
```javascript
export function detectTechSignals(html) {
  // Returns { googleAnalytics, googleTagManager, facebookPixel, hubspot, mailchimp }
}
```

**Test**: Detect tech signals from sample HTML

**Acceptance**: Correctly identifies tracking technologies

---

#### 2.6 Implement Lead Scoring
**File**: `src/processing/scoring.js`

**Requirements**:
- Score 0-100 based on signals
- Assign tier A/B/C/D
- Provide reasons array
- Support multiple weight presets (localService, b2bAgency, retail)

**Scoring factors**:
- Review count + rating (0-30 points)
- Website quality (0-20 points)
- Contactability (email/phone/form) (0-20 points)
- Tech signals (0-15 points)
- Recency of reviews (0-15 points)

**Key functions**:
```javascript
export function scoreLead(lead, weightsPreset = 'localService') {
  const score = calculateScore(lead, weightsPreset);
  const tier = assignTier(score);
  const reasons = generateReasons(lead, score);
  
  return { leadScore: score, tier, reasons };
}

function assignTier(score) {
  if (score >= 80) return 'A';
  if (score >= 60) return 'B';
  if (score >= 40) return 'C';
  return 'D';
}
```

**Test**: Score sample leads

**Acceptance**: Scores are reasonable and tiers are correct

---

#### 2.7 Integrate Enrichment into Main
**File**: `src/main.js`

**Add enrichment phase**:
```javascript
// After merging leads
if (input.enrichment.crawlWebsite) {
  log.info('Starting enrichment phase');
  
  for (const lead of mergedLeads) {
    if (!lead.online?.website) continue;
    
    try {
      // Crawl website
      const crawlResult = await crawlWebsite(lead.online.website, input.enrichment);
      
      // Extract contacts
      const emails = extractEmails(crawlResult.pages, lead.online.domain);
      const phones = extractPhones(crawlResult.pages);
      const socials = extractSocials(crawlResult.pages);
      const techSignals = detectTechSignals(crawlResult.pages);
      
      // Update lead
      lead.contacts = { emails, phones, ...lead.contacts };
      lead.online.socials = socials;
      lead.signals.techSignals = techSignals;
      lead.signals.websiteSignals = {
        hasHttps: lead.online.website.startsWith('https'),
        hasContactForm: crawlResult.hasContactForm,
        hasBookingWidget: crawlResult.hasBookingWidget
      };
    } catch (error) {
      log.warning(`Enrichment failed for ${lead.business.name}`, { error: error.message });
    }
  }
}

// Scoring phase
if (input.scoring.enabled) {
  log.info('Starting scoring phase');
  
  for (const lead of mergedLeads) {
    lead.score = scoreLead(lead, input.scoring.weightsPreset);
  }
}
```

**Test**: Run full pipeline with enrichment and scoring

**Acceptance**:
- ✅ Websites crawled successfully
- ✅ Contacts extracted
- ✅ Scores calculated
- ✅ Output matches schema

---

## Phase 3: Advanced Features (Days 12-14)

### Goal
Add remaining sources, delta mode, and AI outreach generation.

### Steps

#### 3.1 Implement BBB Scraper
**File**: `src/discovery/bbb.js`

**Requirements**:
- Search BBB directory by keyword + location
- Extract business info
- Return standardized format

**Acceptance**: BBB source works and dedupes with other sources

---

#### 3.2 Implement SERP Scraper
**File**: `src/discovery/serp.js`

**Requirements**:
- Search Google for "[keyword] near [location]"
- Extract business listings from SERP
- Return standardized format

**Acceptance**: SERP source works and dedupes with other sources

---

#### 3.3 Implement Delta Mode
**File**: `src/utils/deltaMode.js`

**Requirements**:
- Load previous LEAD_STATE.json from Key-Value Store
- Compute contentHash for each lead (SHA1 of core fields)
- Compare with previous state
- Only output new/changed leads
- Save new state

**Key functions**:
```javascript
export async function applyDeltaMode(leads) {
  const prevState = await loadPreviousState();
  const changedLeads = [];
  const newState = {};
  
  for (const lead of leads) {
    const contentHash = computeContentHash(lead);
    newState[lead.dedupeId] = contentHash;
    
    if (!prevState[lead.dedupeId] || prevState[lead.dedupeId] !== contentHash) {
      changedLeads.push(lead);
    }
  }
  
  await saveState(newState);
  return changedLeads;
}

function computeContentHash(lead) {
  const coreFields = {
    name: lead.business.name,
    address: lead.business.address.formatted,
    phoneE164: lead.business.phoneE164,
    domain: lead.online.domain,
    emails: lead.contacts.emails.map(e => e.email),
    score: lead.score.leadScore
  };
  
  return crypto.createHash('sha1')
    .update(JSON.stringify(coreFields))
    .digest('hex');
}
```

**Test**: Run twice with same input - 2nd run should output minimal changes

**Acceptance**: Delta mode correctly identifies new/changed leads

---

#### 3.4 Implement AI Outreach Generation (Optional)
**File**: `src/ai/outreachDrafts.js`

**Requirements**:
- Generate cold email (subject + body)
- Generate voicemail script
- Generate SMS opener (if enabled)
- Use lead context for personalization
- Support different tones (direct, friendly, professional, highEnergy)

**Key functions**:
```javascript
export async function generateOutreach(lead, options) {
  // Use OpenAI API or similar
  // Returns { coldEmail: { subject, body }, voicemail, smsOpener }
}
```

**Note**: This requires an LLM API key (OpenAI, Anthropic, etc.)

**Test**: Generate drafts for sample leads

**Acceptance**: AI drafts are relevant and personalized

---

## Phase 4: CRM Integration (Days 15-17)

### Goal
Implement webhook push to TradeHive and AdSuite CRMs.

### Steps

#### 4.1 Implement Webhook Module
**File**: `src/integrations/webhook.js`

**Requirements**:
- POST to webhookUrl with proper payload
- Support batch mode (25-200 leads per request)
- Support per-lead mode
- Handle retries with exponential backoff
- Store failed batches in Key-Value Store

**Key functions**:
```javascript
export async function pushToWebhook(leads, webhookUrl, mode, options) {
  if (mode === 'summary') {
    await sendSummary(leads, webhookUrl);
  } else if (mode === 'perLead') {
    for (const lead of leads) {
      await sendLead(lead, webhookUrl);
    }
  } else if (mode === 'both') {
    await sendSummary(leads, webhookUrl);
    await sendBatch(leads, webhookUrl);
  }
}
```

**Test**: Push to test webhook endpoint

**Acceptance**: Webhook receives correct payload format

---

#### 4.2 Implement CRM Push Module
**File**: `src/integrations/crmPush.js`

**Requirements**:
- Format leads for TradeHive/AdSuite
- POST to /api/v1/integrations/apify/leadgraph/upsert
- Include: source, crmTarget, runId, collectedAt, mode, leads[]
- Handle response: created, updated, skipped, errors[]
- Retry failed batches

**Key functions**:
```javascript
export async function pushToCRM(leads, crmTarget, apiKey, options) {
  const batches = chunkLeads(leads, 100); // 100 leads per batch
  
  for (const batch of batches) {
    const payload = {
      source: 'apify-leadgraph',
      crmTarget,
      runId: Actor.getEnv().actorRunId,
      collectedAt: new Date().toISOString(),
      mode: options.deltaMode ? 'delta' : 'full',
      leads: batch
    };
    
    await postToCRM(payload, apiKey);
  }
}
```

**Test**: Push to test CRM endpoint (mock if needed)

**Acceptance**: CRM receives properly formatted payloads

---

#### 4.3 Integrate Webhooks into Main
**File**: `src/main.js`

**Add webhook phase**:
```javascript
// After scoring phase
if (input.exports.webhookUrl) {
  log.info('Pushing to webhook');
  
  await pushToWebhook(
    mergedLeads,
    input.exports.webhookUrl,
    input.exports.webhookMode,
    input
  );
}

// Generate RUN_SUMMARY.json
const summary = {
  totalFound: rawLeads.length,
  totalAfterDedupe: mergedLeads.length,
  enrichedCount: mergedLeads.filter(l => l.contacts.emails.length > 0).length,
  aiCount: mergedLeads.filter(l => l.ai).length,
  errors: [],
  sourceCoverage: calculateSourceCoverage(rawLeads),
  runTimeMs: Date.now() - startTime
};

await Actor.setValue('RUN_SUMMARY', summary);
```

**Test**: Run with webhook enabled

**Acceptance**: Webhook receives data, summary saved

---

## Phase 5: Polish & Deploy (Days 18-20)

### Goal
Add error handling, logging, README, and deploy to Apify.

### Steps

#### 5.1 Add Comprehensive Error Handling
**All files**

**Requirements**:
- Try-catch blocks around all external calls
- Graceful degradation (one source failure doesn't crash run)
- Detailed error logging
- Store failed batches for manual review

**Acceptance**: Actor handles errors gracefully

---

#### 5.2 Add Detailed Logging
**All files**

**Requirements**:
- Log progress at each phase
- Log counts (discovered, deduped, enriched, scored)
- Log timing for performance monitoring
- Respect logLevel from input

**Acceptance**: Logs are informative and not overwhelming

---

#### 5.3 Write Comprehensive README
**File**: `README.md`

**Sections**:
1. What it does (1-2 paragraphs)
2. Use cases
3. Quick start example
4. Input parameters explained
5. Output schema explained
6. Delta mode explanation
7. Webhook integration guide
8. Tips for best results
9. Limits & notes
10. Changelog

**Acceptance**: README is clear and conversion-optimized

---

#### 5.4 Create AGENTS.md for AI Assistance
**File**: `AGENTS.md`

**Content**:
- Project context
- Architecture overview
- Key files and their purpose
- Common tasks and how to do them
- Testing instructions

**Acceptance**: AI assistants can understand the project from AGENTS.md

---

#### 5.5 Test Full Pipeline
**Test cases**:
1. Single keyword, single location, 2 sources
2. Multiple keywords, multiple locations, all sources
3. With enrichment enabled
4. With scoring enabled
5. With AI outreach enabled
6. With delta mode (run twice)
7. With webhook push
8. Error scenarios (invalid input, network failures)

**Acceptance**: All test cases pass

---

#### 5.6 Deploy to Apify
```bash
# Test locally one final time
apify run

# Push to Apify platform
apify push

# Test on platform
# Run from Apify Console with test input

# Publish to Store (if ready)
```

**Acceptance**: Actor runs successfully on Apify platform

---

## 🎯 Stretch Goals (Optional)

These can be added after the core Actor is working:

### S1. Chambers of Commerce Scraper
**File**: `src/discovery/chambers.js`

Add chamber directory scraping for additional coverage.

---

### S2. Niche Directories Support
**File**: `src/discovery/nicheDirectories.js`

Add support for industry-specific directories.

---

### S3. Email Validation API Integration
**File**: `src/enrichment/emailValidator.js`

Integrate with email validation service (ZeroBounce, Hunter.io, etc.)

---

### S4. Advanced Fuzzy Matching
**File**: `src/processing/dedupe.js`

Improve dedupe with Levenshtein distance for name/address matching.

---

### S5. Export Format Handlers
**Files**: `src/integrations/exportCSV.js`, `src/integrations/exportXLSX.js`

Add CSV and XLSX export options.

---

### S6. Rate Limiting & Throttling
**File**: `src/utils/rateLimiter.js`

Add sophisticated rate limiting per source.

---

### S7. Proxy Rotation
**File**: `src/utils/proxyManager.js`

Add smart proxy rotation for better reliability.

---

### S8. Performance Monitoring
**File**: `src/utils/metrics.js`

Add detailed performance metrics and timing.

---

## 📊 Success Metrics

Track these to measure Actor quality:

| Metric | Target | How to Measure |
|--------|--------|----------------|
| **Discovery Rate** | 80%+ of businesses found | Compare with manual search |
| **Dedupe Accuracy** | 95%+ correct merges | Manual review of sample |
| **Enrichment Success** | 60%+ find email/phone | Check contacts.emails length |
| **Scoring Accuracy** | Scores correlate with manual assessment | Manual review of A/B/C/D tiers |
| **Delta Mode Accuracy** | 99%+ correct change detection | Run twice, verify changes |
| **Error Rate** | <5% of runs fail | Monitor Actor runs |
| **Performance** | <2 min per 100 leads | Time full pipeline |

---

## 🚨 Critical Rules (From rules.txt)

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

---

## 📚 Reference Documentation

- **Apify Actors**: https://docs.apify.com/platform/actors/development
- **Crawlee**: https://crawlee.dev/docs
- **Apify SDK**: https://docs.apify.com/sdk/js
- **Input Schema**: https://docs.apify.com/platform/actors/development/actor-definition/input-schema
- **Publishing**: https://docs.apify.com/platform/actors/publishing

---

## ✅ Final Checklist

Before submitting to Apify $1M Challenge:

- [ ] All core features implemented
- [ ] All acceptance criteria met
- [ ] Comprehensive README written
- [ ] Input schema complete and tested
- [ ] Output schema matches specification
- [ ] Error handling robust
- [ ] Logging detailed but not excessive
- [ ] Delta mode tested and working
- [ ] Webhook integration tested
- [ ] Actor runs successfully on Apify platform
- [ ] Quality score ≥65/100
- [ ] Example datasets created (HVAC Boston, Laundromats Worcester, Tree Service Nashua)
- [ ] Store listing optimized
- [ ] Pricing tiers configured

---

**Ready to build! Start with Phase 0 and work through each step systematically. 🚀**
