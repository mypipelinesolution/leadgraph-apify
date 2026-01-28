import { CheerioCrawler, log } from 'crawlee';
import { parsePhoneNumber } from 'libphonenumber-js';

export async function scrapeSERP(keyword, location, options) {
  const leads = [];
  const maxResults = options?.maxResultsPerLocation || 100;
  
  log.info(`Searching Google SERP: ${keyword} in ${location}`);

  try {
    const query = `${keyword} ${location}`;
    const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}&num=${Math.min(maxResults, 100)}`;
    
    const crawler = new CheerioCrawler({
      maxRequestsPerCrawl: 2,
      maxConcurrency: 1,
      requestHandlerTimeoutSecs: 60,
      additionalMimeTypes: ['text/html'],
      navigationTimeoutSecs: 30,
      ignoreSslErrors: true,
      async requestHandler({ $, request }) {
        try {
          // Look for organic search results
          const results = $('.g, .tF2Cxc, [data-hveid]');
          
          if (results.length === 0) {
            log.warning('No SERP results found - Google may be blocking or structure changed');
            return;
          }

          results.each((index, element) => {
            if (leads.length >= maxResults) return false;

            try {
              const $el = $(element);
              
              // Extract business name from title
              const titleEl = $el.find('h3, .LC20lb, .DKV0Md');
              const name = titleEl.text().trim();
              if (!name) return;

              // Extract URL
              const linkEl = $el.find('a[href]').first();
              const url = linkEl.attr('href') || '';
              if (!url || url.startsWith('/search')) return;

              // Extract snippet/description
              const snippetEl = $el.find('.VwiC3b, .lEBKkf, [data-sncf="1"]');
              const description = snippetEl.text().trim();

              // Try to extract phone from snippet
              const phoneMatch = description.match(/\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/);
              let phone = '';
              let phoneE164 = '';
              let phoneFormatted = '';

              if (phoneMatch) {
                phone = phoneMatch[0];
                try {
                  const parsed = parsePhoneNumber(phone, 'US');
                  phoneE164 = parsed.number;
                  phoneFormatted = parsed.formatNational();
                } catch (e) {
                  phoneFormatted = phone;
                  phoneE164 = phone.replace(/[^\d]/g, '');
                }
              }

              const domain = extractDomain(url);

              // Try to extract location from snippet
              const locationMatch = description.match(/([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*),\s*([A-Z]{2})/);
              const city = locationMatch ? locationMatch[1] : '';
              const state = locationMatch ? locationMatch[2] : '';

              const lead = {
                dedupeId: '',
                confidence: 0.6,
                sources: {
                  serp: {
                    url: url,
                    snippet: description.substring(0, 200),
                    position: leads.length + 1
                  }
                },
                business: {
                  name: name,
                  category: keyword,
                  categories: [keyword],
                  description: description.substring(0, 500),
                  address: {
                    street: '',
                    city: city,
                    state: state,
                    postalCode: '',
                    country: 'US',
                    formatted: locationMatch ? `${city}, ${state}` : location
                  },
                  geo: { lat: 0, lng: 0 },
                  phone: phoneFormatted,
                  phoneE164: phoneE164
                },
                online: {
                  website: url,
                  domain: domain,
                  socials: {}
                },
                contacts: {
                  emails: [],
                  phones: phoneE164 ? [{
                    phone: phoneFormatted,
                    phoneE164: phoneE164,
                    source: 'serp',
                    confidence: 0.7
                  }] : [],
                  keyPeople: []
                },
                signals: {
                  reviews: {
                    rating: 0,
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
                  notes: 'Collected from Google SERP'
                }
              };

              leads.push(lead);
            } catch (error) {
              log.warning('Failed to parse SERP result:', error.message);
            }
          });

          log.info(`Found ${leads.length} businesses on SERP`);

        } catch (error) {
          log.error('Failed to process SERP page:', error.message);
        }
      },
      failedRequestHandler({ request }) {
        log.warning(`SERP request failed: ${request.url}`);
      },
    });

    await crawler.addRequests([{ url: searchUrl, uniqueKey: `serp-${keyword}-${location}` }]);
    await crawler.run();

    log.info(`Collected ${leads.length} leads from SERP`);
    return leads;

  } catch (error) {
    log.error('SERP scraping failed:', error.message);
    return [];
  }
}

function extractDomain(url) {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname.replace('www.', '');
  } catch (e) {
    return '';
  }
}
