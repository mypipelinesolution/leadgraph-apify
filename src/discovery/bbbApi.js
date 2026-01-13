import { CheerioCrawler, log } from 'crawlee';
import { parsePhoneNumber } from 'libphonenumber-js';

export async function scrapeBBB(keyword, location, options) {
  const leads = [];
  const maxResults = options?.maxResultsPerLocation || 100;
  
  log.info(`Searching BBB: ${keyword} in ${location}`);

  try {
    const searchUrl = `https://www.bbb.org/search?find_text=${encodeURIComponent(keyword)}&find_loc=${encodeURIComponent(location)}&page=1`;
    
    const crawler = new CheerioCrawler({
      maxRequestsPerCrawl: Math.ceil(maxResults / 10),
      maxConcurrency: 1,
      requestHandlerTimeoutSecs: 60,
      async requestHandler({ $, request }) {
        try {
          const businesses = $('.result-item, .search-result-item, [data-bbb-id]');
          
          if (businesses.length === 0) {
            log.warning('No BBB results found - page structure may have changed');
            return;
          }

          businesses.each((index, element) => {
            if (leads.length >= maxResults) return false;

            try {
              const $el = $(element);
              
              const name = $el.find('.business-name, h3 a, .result-business-name').first().text().trim();
              if (!name) return;

              const addressText = $el.find('.address, .result-address, [itemprop="address"]').text().trim();
              const phoneText = $el.find('.phone, .result-phone, [itemprop="telephone"]').text().trim();
              const websiteUrl = $el.find('a[href*="website"], .website-link').attr('href') || '';
              const bbbUrl = $el.find('a.business-name, h3 a').attr('href') || '';
              
              const ratingText = $el.find('.rating, .bbb-rating, [itemprop="ratingValue"]').text().trim();
              const rating = parseFloat(ratingText.match(/[\d.]+/)?.[0] || '0');
              
              const accreditedText = $el.find('.accredited, .bbb-accredited').text().toLowerCase();
              const isAccredited = accreditedText.includes('accredited');

              const address = parseAddress(addressText, location);
              
              let phone = phoneText.replace(/[^\d]/g, '');
              let phoneE164 = '';
              let phoneFormatted = phoneText;

              if (phone.length >= 10) {
                try {
                  const parsed = parsePhoneNumber(phone, 'US');
                  phoneE164 = parsed.number;
                  phoneFormatted = parsed.formatNational();
                } catch (e) {
                  phoneE164 = phone;
                }
              }

              const domain = websiteUrl ? extractDomain(websiteUrl) : '';

              const lead = {
                dedupeId: '',
                confidence: isAccredited ? 0.9 : 0.75,
                sources: {
                  bbb: {
                    url: bbbUrl.startsWith('http') ? bbbUrl : `https://www.bbb.org${bbbUrl}`,
                    isAccredited: isAccredited,
                    rating: rating
                  }
                },
                business: {
                  name: name,
                  category: keyword,
                  categories: [keyword],
                  description: '',
                  address: address,
                  geo: { lat: 0, lng: 0 },
                  phone: phoneFormatted,
                  phoneE164: phoneE164
                },
                online: {
                  website: websiteUrl,
                  domain: domain,
                  socials: {}
                },
                contacts: {
                  emails: [],
                  phones: phoneE164 ? [{
                    phone: phoneFormatted,
                    phoneE164: phoneE164,
                    source: 'bbb',
                    confidence: 0.85
                  }] : [],
                  keyPeople: []
                },
                signals: {
                  reviews: {
                    rating: rating,
                    reviewCount: 0,
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
                  notes: `BBB ${isAccredited ? 'Accredited' : 'Listed'} Business`
                }
              };

              leads.push(lead);
            } catch (error) {
              log.warning('Failed to parse BBB business:', error.message);
            }
          });

          log.info(`Found ${leads.length} businesses on BBB`);

        } catch (error) {
          log.error('Failed to process BBB page:', error.message);
        }
      },
      failedRequestHandler({ request }) {
        log.warning(`BBB request failed: ${request.url}`);
      },
    });

    await crawler.run([searchUrl]);

    log.info(`Collected ${leads.length} leads from BBB`);
    return leads;

  } catch (error) {
    log.error('BBB scraping failed:', error.message);
    return [];
  }
}

function parseAddress(addressText, location) {
  const parts = addressText.split(',').map(s => s.trim());
  
  const address = {
    street: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'US',
    formatted: addressText
  };

  if (parts.length >= 3) {
    address.street = parts[0];
    address.city = parts[1];
    
    const lastPart = parts[parts.length - 1];
    const stateZipMatch = lastPart.match(/([A-Z]{2})\s*(\d{5})/);
    if (stateZipMatch) {
      address.state = stateZipMatch[1];
      address.postalCode = stateZipMatch[2];
    }
  } else if (parts.length === 2) {
    address.city = parts[0];
    const stateZipMatch = parts[1].match(/([A-Z]{2})\s*(\d{5})/);
    if (stateZipMatch) {
      address.state = stateZipMatch[1];
      address.postalCode = stateZipMatch[2];
    }
  }

  return address;
}

function extractDomain(url) {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname.replace('www.', '');
  } catch (e) {
    return '';
  }
}
