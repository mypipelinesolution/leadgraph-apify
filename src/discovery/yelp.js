import { CheerioCrawler, log } from 'crawlee';
import { parsePhoneNumber } from 'libphonenumber-js';

export async function scrapeYelp(keyword, location, options) {
  const leads = [];
  const searchQuery = keyword.replace(/\s+/g, '+');
  const locationQuery = location.replace(/\s+/g, '+');
  const searchUrl = `https://www.yelp.com/search?find_desc=${searchQuery}&find_loc=${locationQuery}`;
  
  log.info(`Searching Yelp: ${keyword} in ${location}`);
  
  const crawler = new CheerioCrawler({
    maxConcurrency: options?.runMode?.maxConcurrency || 2,
    async requestHandler({ $, request }) {
      try {
        const businesses = $('div[data-testid="serp-ia-card"]');
        log.info(`Found ${businesses.length} businesses on Yelp`);
        
        const maxResults = options?.maxResultsPerLocation || 100;
        
        businesses.each((index, element) => {
          if (index >= maxResults) return false;
          
          try {
            const $business = $(element);
            
            const nameEl = $business.find('a[data-analytics-label="biz-name"]');
            const name = nameEl.text().trim();
            if (!name) return;
            
            const bizUrl = 'https://www.yelp.com' + nameEl.attr('href');
            const bizIdMatch = bizUrl.match(/\/biz\/([^?]+)/);
            const bizId = bizIdMatch ? bizIdMatch[1] : '';
            
            const ratingEl = $business.find('div[aria-label*="star rating"]');
            const ratingText = ratingEl.attr('aria-label') || '';
            const ratingMatch = ratingText.match(/([\d.]+)\s+star/);
            const rating = ratingMatch ? parseFloat(ratingMatch[1]) : 0;
            
            const reviewCountEl = $business.find('span[data-font-weight="semibold"]');
            const reviewText = reviewCountEl.text().trim();
            const reviewCount = reviewText ? parseInt(reviewText) : 0;
            
            const categories = [];
            $business.find('a[href*="cflt="]').each((i, cat) => {
              categories.push($(cat).text().trim());
            });
            const category = categories[0] || '';
            
            const addressParts = [];
            $business.find('p').each((i, p) => {
              const text = $(p).text().trim();
              if (text && !text.includes('$') && text.length > 5) {
                addressParts.push(text);
              }
            });
            const addressText = addressParts[0] || '';
            const address = parseYelpAddress(addressText, location);
            
            const phoneText = $business.find('p[data-font-weight="semibold"]').text().trim();
            const phone = phoneText.match(/\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}/) ? phoneText : '';
            let phoneE164 = '';
            if (phone) {
              try {
                const parsed = parsePhoneNumber(phone, 'US');
                phoneE164 = parsed.number;
              } catch (e) {
                phoneE164 = phone;
              }
            }
            
            const lead = {
              dedupeId: '',
              confidence: 0.75,
              sources: {
                yelp: {
                  url: bizUrl,
                  bizId: bizId
                }
              },
              business: {
                name: name,
                category: category,
                categories: categories,
                description: '',
                address: address,
                geo: { lat: 0, lng: 0 },
                phone: phone,
                phoneE164: phoneE164
              },
              online: {
                website: '',
                domain: '',
                socials: {}
              },
              contacts: {
                emails: [],
                phones: phone ? [{
                  phone: phone,
                  phoneE164: phoneE164,
                  source: 'yelp',
                  confidence: 0.85
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
                notes: 'Collected from Yelp'
              }
            };
            
            leads.push(lead);
          } catch (error) {
            log.warning(`Failed to extract Yelp business ${index}:`, error.message);
          }
        });
      } catch (error) {
        log.error('Yelp scraping failed:', error.message);
      }
    },
  });
  
  await crawler.run([searchUrl]);
  
  log.info(`Collected ${leads.length} leads from Yelp`);
  return leads;
}

function parseYelpAddress(addressText, location) {
  if (!addressText) {
    return {
      street: '',
      city: '',
      state: '',
      postalCode: '',
      country: 'US',
      formatted: ''
    };
  }
  
  const parts = addressText.split(',').map(p => p.trim());
  let street = '';
  let city = '';
  let state = '';
  let postalCode = '';
  
  if (parts.length >= 1) {
    street = parts[0];
  }
  
  if (parts.length >= 2) {
    const lastPart = parts[parts.length - 1];
    const stateZipMatch = lastPart.match(/([A-Z]{2})\s+(\d{5})/);
    if (stateZipMatch) {
      state = stateZipMatch[1];
      postalCode = stateZipMatch[2];
    }
    
    if (parts.length >= 3) {
      city = parts[1];
    } else {
      const locationParts = location.split(',');
      city = locationParts[0]?.trim() || '';
    }
  }
  
  return {
    street: street,
    city: city,
    state: state,
    postalCode: postalCode,
    country: 'US',
    formatted: addressText
  };
}
