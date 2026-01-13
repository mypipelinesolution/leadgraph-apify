import { PlaywrightCrawler, log } from 'crawlee';
import { parsePhoneNumber } from 'libphonenumber-js';

export async function scrapeGoogleMaps(keyword, location, options) {
  const leads = [];
  const searchQuery = `${keyword} in ${location}`;
  const searchUrl = `https://www.google.com/maps/search/${encodeURIComponent(searchQuery)}`;
  
  log.info(`Searching Google Maps: ${searchQuery}`);
  
  const crawler = new PlaywrightCrawler({
    launchContext: {
      launchOptions: {
        headless: true,
      },
    },
    maxConcurrency: options?.runMode?.maxConcurrency || 1,
    requestHandlerTimeoutSecs: 120,
    async requestHandler({ page, request }) {
      try {
        await page.goto(searchUrl, { waitUntil: 'domcontentloaded', timeout: 60000 });
        await page.waitForTimeout(3000);
        
        await page.waitForSelector('div[role="feed"]', { timeout: 10000 }).catch(() => {
          log.warning('Feed element not found, Google Maps may have changed structure');
        });
        
        const maxResults = options?.maxResultsPerLocation || 100;
        let scrollAttempts = 0;
        const maxScrollAttempts = Math.ceil(maxResults / 20);
        
        while (scrollAttempts < maxScrollAttempts) {
          const scrollableDiv = await page.$('div[role="feed"]');
          if (scrollableDiv) {
            await scrollableDiv.evaluate(el => {
              el.scrollTop = el.scrollHeight;
            });
            await page.waitForTimeout(1500);
            scrollAttempts++;
          } else {
            break;
          }
        }
        
        const businesses = await page.$$('div[role="feed"] > div > div[jsaction]');
        log.info(`Found ${businesses.length} businesses on Google Maps`);
        
        for (let i = 0; i < Math.min(businesses.length, maxResults); i++) {
          try {
            await businesses[i].click();
            await page.waitForTimeout(1000);
            
            const lead = await extractBusinessData(page, location);
            if (lead) {
              leads.push(lead);
            }
          } catch (error) {
            log.warning(`Failed to extract business ${i}:`, error.message);
          }
        }
      } catch (error) {
        log.error('Google Maps scraping failed:', error.message);
      }
    },
  });
  
  await crawler.run([searchUrl]);
  
  log.info(`Collected ${leads.length} leads from Google Maps`);
  return leads;
}

async function extractBusinessData(page, location) {
  try {
    const name = await page.$eval('h1.DUwDvf', el => el.textContent).catch(() => null);
    if (!name) return null;
    
    const rating = await page.$eval('div.F7nice span[aria-hidden="true"]', el => parseFloat(el.textContent)).catch(() => 0);
    const reviewCount = await page.$eval('div.F7nice span[aria-label*="reviews"]', el => {
      const match = el.getAttribute('aria-label').match(/(\d+)/);
      return match ? parseInt(match[1]) : 0;
    }).catch(() => 0);
    
    const category = await page.$eval('button[jsaction*="category"]', el => el.textContent).catch(() => '');
    
    const addressText = await page.$eval('button[data-item-id*="address"]', el => el.getAttribute('aria-label')).catch(() => '');
    const address = parseAddress(addressText);
    
    const phoneText = await page.$eval('button[data-item-id*="phone"]', el => el.getAttribute('aria-label')).catch(() => '');
    const phone = phoneText.replace('Phone: ', '').trim();
    let phoneE164 = '';
    if (phone) {
      try {
        const parsed = parsePhoneNumber(phone, 'US');
        phoneE164 = parsed.number;
      } catch (e) {
        phoneE164 = phone;
      }
    }
    
    const website = await page.$eval('a[data-item-id*="authority"]', el => el.href).catch(() => '');
    const domain = website ? new URL(website).hostname : '';
    
    const placeUrl = page.url();
    const placeIdMatch = placeUrl.match(/!1s([^!]+)/);
    const placeId = placeIdMatch ? placeIdMatch[1] : '';
    
    const lead = {
      dedupeId: '',
      confidence: 0.8,
      sources: {
        googleMaps: {
          url: placeUrl,
          placeId: placeId
        }
      },
      business: {
        name: name,
        category: category,
        categories: category ? [category] : [],
        description: '',
        address: address,
        geo: { lat: 0, lng: 0 },
        phone: phone,
        phoneE164: phoneE164
      },
      online: {
        website: website,
        domain: domain,
        socials: {}
      },
      contacts: {
        emails: [],
        phones: phone ? [{
          phone: phone,
          phoneE164: phoneE164,
          source: 'googleMaps',
          confidence: 0.9
        }] : [],
        keyPeople: []
      },
      signals: {
        reviews: {
          rating: rating,
          reviewCount: reviewCount,
          lastReviewDate: ''
        },
        hours: {
          isOpen: true,
          hoursText: ''
        },
        websiteSignals: {},
        techSignals: {}
      },
      score: {},
      ai: {},
      raw: {
        collectedAt: new Date().toISOString(),
        runId: '',
        notes: 'Collected from Google Maps'
      }
    };
    
    return lead;
  } catch (error) {
    log.warning('Failed to extract business data:', error.message);
    return null;
  }
}

function parseAddress(addressText) {
  const cleaned = addressText.replace('Address: ', '').trim();
  const parts = cleaned.split(',').map(p => p.trim());
  
  let street = '';
  let city = '';
  let state = '';
  let postalCode = '';
  
  if (parts.length >= 3) {
    street = parts[0];
    city = parts[1];
    const lastPart = parts[2];
    const stateZipMatch = lastPart.match(/([A-Z]{2})\s+(\d{5})/);
    if (stateZipMatch) {
      state = stateZipMatch[1];
      postalCode = stateZipMatch[2];
    }
  }
  
  return {
    street: street,
    city: city,
    state: state,
    postalCode: postalCode,
    country: 'US',
    formatted: cleaned
  };
}
