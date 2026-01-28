# LeadGraph™ — Local Business Leads with AI-Powered Outreach

**Stop wasting hours on manual prospecting.** Get verified local business leads with emails, phone numbers, and ready-to-send outreach messages — in minutes.

---

## Why LeadGraph?

Most lead generation tools give you a list of names. **LeadGraph gives you a sales pipeline.**

| The Old Way | The LeadGraph Way |
|-------------|-------------------|
| Manually search Google Maps | Automated discovery across locations |
| Copy-paste business info into spreadsheets | Structured, CRM-ready data |
| Hunt for emails on websites | Emails extracted automatically |
| Guess which leads are worth pursuing | AI-scored leads (A/B/C/D tiers) |
| Write cold emails from scratch | Personalized outreach generated for you |

---

## What You Get

### Every Lead Includes:

- **Business Details** — Name, category, full address, phone number
- **Online Presence** — Website, Facebook, Instagram, LinkedIn
- **Contact Info** — Email addresses and phone numbers extracted from their website
- **Reputation Signals** — Google rating, review count
- **Website Summary** — Key info extracted from their homepage
- **Lead Score** — 0-100 quality score with A/B/C/D tier ranking
- **AI Outreach** — Personalized cold email, voicemail script, and SMS message

---

## Perfect For

- **Marketing Agencies** — Find clients who need your services
- **Sales Teams** — Build targeted prospect lists by industry and location
- **Local Service Businesses** — Find partners, vendors, or competitors
- **Consultants** — Identify businesses that match your ideal client profile

---

## How It Works

**1. Enter Your Search**
- Keywords (e.g., "tree service", "landscaping", "HVAC contractor")
- Locations (e.g., "Boston, MA", "Austin, TX")
- Your company info for personalized AI outreach

**2. We Do The Work**
- 🔍 Search Google Maps for matching businesses
- 🌐 Crawl each website to extract contact info
- 📊 Score and rank leads by quality
- 🤖 Generate personalized outreach with AI

**3. Get Sales-Ready Leads**
Download your leads with AI-generated emails, voicemail scripts, and SMS — ready to import into your CRM or start calling.

---

## Real-Time Progress

Watch your leads being discovered in real-time:

```
🚀 Starting LeadGraph™...
🔍 Discovering leads for 3 keywords in 3 locations...
✅ Found 45 businesses
🔄 Deduplicating 45 leads...
🌐 Enriching 32 leads (crawling websites)...
📊 Scoring 32 leads...
🤖 AI outreach: 32/32 leads (100%)
💾 Saving 32 leads to dataset...
🎉 Done! 32 leads with AI outreach ready (245s)
```

---

## Sample Output

| Tier | Score | Business | Phone | Email | City |
|------|-------|----------|-------|-------|------|
| A | 92 | ABC Tree Service | (617) 555-1234 | info@abctree.com | Boston |
| B | 74 | Green Lawn Care | (617) 555-5678 | contact@greenlawn.com | Cambridge |
| B | 68 | Pro Landscaping | (617) 555-9012 | hello@prolandscape.com | Somerville |

**AI-Generated Cold Email:**
```
Subject: Quick question about ABC Tree Service's online presence

Hi ABC Tree Service team,

I came across your business while researching top-rated tree companies 
in Boston — your 4.8-star rating with 127 reviews is impressive!

I noticed your website could benefit from some SEO optimization to 
help you rank higher in local searches...

Best regards,
[Your Name]
[Your Company]
```

---

## Input Options

| Option | Description |
|--------|-------------|
| **Keywords** | Business types to find (e.g., "plumber", "dentist") |
| **Locations** | Cities to search (e.g., "Miami, FL", "Denver, CO") |
| **Max Leads per Location** | How many leads to collect per location (1-100) |
| **Min Rating** | Only include businesses with this rating or higher |
| **Min Reviews** | Only include businesses with this many reviews |
| **Your Name** | Your name for AI outreach signatures |
| **Your Company Name** | Your company name for AI outreach |
| **Your Services** | What you offer (for AI personalization) |
| **Company Description** | Brief description for better AI context |

---

## Output Columns

Your download includes these columns (in order):

| Column | Description |
|--------|-------------|
| tier | Lead quality: A (best), B, C, D |
| leadScore | 0-100 quality score |
| businessName | Company name |
| phone | Primary phone number |
| email | Primary email address |
| website | Website URL |
| city, state, zip | Location |
| rating | Google star rating |
| reviewCount | Number of Google reviews |
| websiteSummary | Key info from their website |
| coldEmailSubject | AI-generated email subject |
| coldEmailBody | AI-generated email body |
| voicemailScript | AI-generated voicemail script |
| smsMessage | AI-generated SMS message |
| facebook, instagram, linkedin | Social media links |

---

## Frequently Asked Questions

### Why are some emails missing?

Not all businesses have their email publicly available on their website. We extract emails from:
- Contact pages
- Footer sections
- About pages
- Meta tags

If a business doesn't display their email anywhere on their site, we can't extract it.

### Why is the website summary empty for some leads?

Website enrichment depends on the business's website:
- Some websites block automated crawling
- Some use JavaScript-heavy frameworks that are harder to parse
- Some simply don't have much content on their homepage

### Why did some AI outreach fail to generate?

AI outreach requires:
- A valid OpenAI API key (set as `OPENAI_API_KEY` environment variable)
- Enough context about the business

If the AI response format varies, we use fallback extraction to still provide content.

### How long does it take?

Typical run times:
- **10 leads**: ~2-3 minutes
- **50 leads**: ~8-12 minutes
- **100 leads**: ~15-25 minutes

AI outreach generation is the most time-consuming step (~5-7 seconds per lead).

### Why are some businesses filtered out?

By default, we only include businesses with websites (since we need a website to extract contact info and generate personalized AI outreach). You can also filter by:
- Minimum star rating
- Minimum review count

### How accurate is the lead scoring?

Lead scoring is based on:
- **Review quality** — Higher ratings and more reviews = higher score
- **Online presence** — Website, social media, contact forms
- **Contact availability** — Email and phone numbers found
- **Tech signals** — Marketing tools detected on their website

A-tier leads (80+) are your best opportunities. Focus on these first.

### Can I use this for any industry?

Yes! LeadGraph works for any business type that appears on Google Maps:
- Home services (plumbers, electricians, HVAC, landscaping)
- Professional services (lawyers, accountants, dentists)
- Retail and restaurants
- B2B services
- And more...

### How do I get better AI personalization?

Fill out all the "Your Company" fields:
- **Your Name** — So emails aren't signed "[Your Name]"
- **Your Services** — So AI knows what you're offering
- **Company Description** — Gives AI more context for personalization

The more context you provide, the better the AI outreach will be.

---

## Cost Breakdown

| Component | Cost per Lead |
|-----------|---------------|
| Apify Compute | ~$0.001 |
| OpenAI (gpt-4o-mini) | ~$0.0005 |
| Google Places API (if enabled) | ~$0.017 |
| **Total (web scraping)** | **~$0.002/lead** |
| **Total (with API)** | **~$0.02/lead** |

*Google offers $200/month free credit, covering ~10,000 leads.*

---

## Start Finding Leads Now

1. Enter your target keywords and locations
2. Add your company info for personalized AI outreach
3. Click **Start**
4. Watch real-time progress as leads are discovered
5. Download your leads and start closing deals

---

## Need Help?

- **Timeout errors?** Increase timeout in Run Options (default: 30 minutes)
- **No leads found?** Try broader keywords or different locations
- **Missing AI content?** Make sure `OPENAI_API_KEY` is set in environment variables

---

*LeadGraph™ — Turn Google Maps into your sales pipeline.*
