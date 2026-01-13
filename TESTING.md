# LeadGraph™ Testing Guide

## Prerequisites

✅ Node.js installed (v16 or higher)
✅ Dependencies installed (`npm install` - already done)
✅ Project structure in place

## Option 1: Quick Test (Recommended for First Run)

### Step 1: Verify Installation

```bash
# Check that dependencies are installed
npm list --depth=0
```

You should see apify, crawlee, playwright, cheerio, etc.

### Step 2: Run with Test Input

The test input file is already configured at `.actor/INPUT.json`. To run:

```bash
node src/main.js
```

**What this does:**
- Searches for "tree service" in "Pepperell, MA"
- Uses Google Maps and Yelp as sources
- Collects up to 20 results per location
- Enables website enrichment (crawls up to 5 pages per site)
- Extracts emails, phones, social links
- Detects tech signals
- Scores all leads
- Outputs to `apify_storage/datasets/default/`

### Step 3: Check the Results

After the run completes, check:

**Dataset Output:**
```bash
# View the leads
cat apify_storage/datasets/default/*.json
```

Or open the files in your IDE at:
- `apify_storage/datasets/default/000000001.json`
- `apify_storage/datasets/default/000000002.json`
- etc.

**Run Summary:**
```bash
# View the summary
cat apify_storage/key_value_stores/default/RUN_SUMMARY.json
```

## Option 2: Custom Test Input

### Create a Custom Input File

Create `test-input.json`:

```json
{
  "seedType": "keyword",
  "keywords": ["HVAC contractor"],
  "locations": ["Boston, MA"],
  "sources": ["googleMaps", "yelp"],
  "maxResultsPerLocation": 10,
  "maxTotalResults": 20,
  "filters": {
    "minRating": 4.0,
    "minReviews": 5,
    "requireWebsite": true
  },
  "enrichment": {
    "crawlWebsite": true,
    "maxWebsitePages": 3,
    "emailExtraction": "standard",
    "phoneExtraction": true,
    "collectTechSignals": true
  },
  "dedupe": {
    "enabled": true,
    "strategy": "balanced"
  },
  "scoring": {
    "enabled": true,
    "weightsPreset": "localService"
  },
  "exports": {
    "outputFormat": "dataset",
    "deltaMode": false
  },
  "runMode": {
    "stealth": true,
    "maxConcurrency": 2,
    "maxRetries": 3,
    "proxyEnabled": false
  },
  "debug": {
    "logLevel": "INFO"
  }
}
```

Then modify `src/main.js` temporarily to use this file, or use Apify's local testing.

## Option 3: Test with Apify CLI (If Installed)

If you have Apify CLI installed:

```bash
# Run locally with Apify CLI
apify run

# Or with custom input
apify run -p test-input.json
```

## What to Expect

### Console Output

You'll see logs like:

```
INFO  LeadGraph™ Actor started
INFO  Starting discovery phase
INFO  Searching Google Maps: tree service in Pepperell, MA
INFO  Found 15 businesses on Google Maps
INFO  Google Maps: 15 leads found
INFO  Searching Yelp: tree service in Pepperell, MA
INFO  Found 12 businesses on Yelp
INFO  Yelp: 12 leads found
INFO  Discovery complete: 27 raw leads collected
INFO  Starting deduplication phase
INFO  After dedupe: 20 unique leads (7 duplicates removed)
INFO  Starting enrichment phase
INFO  Enriching: ABC Tree Service
INFO  Crawled 3 pages from abctreeservice.com
INFO  Enriching: XYZ Tree Care
...
INFO  Enrichment complete: 15/20 leads enriched
INFO  Starting scoring phase
INFO  Scoring complete
INFO  Saving 20 leads to dataset
INFO  LeadGraph™ Actor finished successfully
```

### Expected Runtime

- **Without enrichment**: 30-60 seconds for 20 leads
- **With enrichment**: 2-5 minutes for 20 leads (depends on website crawl speed)

### Output Structure

Each lead will have:

```json
{
  "dedupeId": "a1b2c3d4e5f6g7h8",
  "confidence": 0.8,
  "sources": {
    "googleMaps": {
      "url": "https://www.google.com/maps/...",
      "placeId": "ChIJ..."
    },
    "yelp": {
      "url": "https://www.yelp.com/biz/...",
      "bizId": "abc-tree-service-pepperell"
    }
  },
  "business": {
    "name": "ABC Tree Service",
    "category": "Tree Service",
    "address": {
      "street": "123 Main St",
      "city": "Pepperell",
      "state": "MA",
      "postalCode": "01463",
      "formatted": "123 Main St, Pepperell, MA 01463"
    },
    "phone": "(978) 555-1234",
    "phoneE164": "+19785551234"
  },
  "online": {
    "website": "https://abctreeservice.com",
    "domain": "abctreeservice.com",
    "socials": {
      "facebook": "https://facebook.com/abctreeservice",
      "instagram": "https://instagram.com/abctreeservice"
    }
  },
  "contacts": {
    "emails": [
      {
        "email": "info@abctreeservice.com",
        "source": "mailto",
        "confidence": 0.9,
        "isRoleBased": true
      }
    ],
    "phones": [
      {
        "phone": "(978) 555-1234",
        "phoneE164": "+19785551234",
        "source": "googleMaps",
        "confidence": 0.9
      }
    ]
  },
  "signals": {
    "reviews": {
      "rating": 4.8,
      "reviewCount": 127
    },
    "websiteSignals": {
      "hasHttps": true,
      "hasContactForm": true,
      "hasBookingWidget": false,
      "hasChatWidget": false
    },
    "techSignals": {
      "googleAnalytics": true,
      "facebookPixel": false,
      "googleTagManager": true
    }
  },
  "score": {
    "leadScore": 78,
    "tier": "B",
    "reasons": [
      "Well-reviewed business",
      "Has active website",
      "Email contact available",
      "Uses marketing technology"
    ]
  }
}
```

## Troubleshooting

### Issue: "Cannot find module"

**Solution:** Run `npm install` again

### Issue: Playwright browser not found

**Solution:** Install Playwright browsers:
```bash
npx playwright install chromium
```

### Issue: No leads found

**Possible causes:**
- Google Maps/Yelp changed their HTML structure (selectors need updating)
- Network issues
- Location/keyword combination has no results

**Debug:** Set `"logLevel": "DEBUG"` in input to see detailed logs

### Issue: Enrichment fails

**Possible causes:**
- Websites blocking crawlers
- Slow website response times
- Invalid URLs

**Solution:** Reduce `maxWebsitePages` to 3 or disable enrichment temporarily

### Issue: Actor runs very slowly

**Solution:** 
- Reduce `maxResultsPerLocation` to 5-10
- Disable enrichment for faster testing
- Increase `maxConcurrency` (but be careful with rate limits)

## Testing Specific Features

### Test Deduplication

Run twice with same input - should find same dedupeIds:

```bash
node src/main.js
# Check output
node src/main.js
# Compare dedupeIds - should be identical
```

### Test Delta Mode

1. First run:
```json
{
  "exports": {
    "deltaMode": false
  }
}
```

2. Second run:
```json
{
  "exports": {
    "deltaMode": true
  }
}
```

Second run should output 0 leads (no changes).

### Test Filters

```json
{
  "filters": {
    "minRating": 4.5,
    "minReviews": 20,
    "requireWebsite": true
  }
}
```

Check that all output leads meet these criteria.

### Test Scoring

Check that:
- Leads with high reviews get higher scores
- Leads with websites get bonus points
- Leads with emails/tech signals score higher
- Tier assignments are correct (A: 80+, B: 60-79, C: 40-59, D: <40)

## Next Steps

Once basic testing works:

1. ✅ Test with different keywords/locations
2. ✅ Test with multiple sources
3. ✅ Test enrichment on/off
4. ✅ Test different scoring presets
5. ✅ Test delta mode
6. ✅ Deploy to Apify platform

## Quick Test Commands

```bash
# Clean previous run data
rm -rf apify_storage

# Run actor
node src/main.js

# View first lead
cat apify_storage/datasets/default/000000001.json | head -50

# Count total leads
ls apify_storage/datasets/default/*.json | wc -l

# View summary
cat apify_storage/key_value_stores/default/RUN_SUMMARY.json
```

## Performance Benchmarks

Expected performance on a standard laptop:

| Leads | Enrichment | Time |
|-------|------------|------|
| 10 | Off | 20-30s |
| 10 | On | 1-2 min |
| 50 | Off | 1-2 min |
| 50 | On | 5-8 min |
| 100 | Off | 2-3 min |
| 100 | On | 10-15 min |

---

**Ready to test! Start with Option 1 for the quickest results.** 🚀
