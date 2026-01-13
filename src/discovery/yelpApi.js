import { log } from 'crawlee';
import { parsePhoneNumber } from 'libphonenumber-js';

export async function scrapeYelpApi(keyword, location, options) {
  // Support both input keys and environment variables (for Apify secrets)
  const apiKey = options?.apiKeys?.yelp || process.env.YELP_API_KEY;
  
  if (!apiKey) {
    throw new Error('Yelp API key is required. Set apiKeys.yelp in input or YELP_API_KEY environment variable.');
  }

  const leads = [];
  const maxResults = options?.maxResultsPerLocation || 100;
  
  log.info(`Searching Yelp Fusion API: ${keyword} in ${location}`);

  try {
    const limit = Math.min(maxResults, 50);
    let offset = 0;
    let totalFetched = 0;

    while (totalFetched < maxResults) {
      const url = `https://api.yelp.com/v3/businesses/search?term=${encodeURIComponent(keyword)}&location=${encodeURIComponent(location)}&limit=${limit}&offset=${offset}`;
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        log.error(`Yelp API error: ${response.status} ${response.statusText}`);
        break;
      }

      const data = await response.json();

      if (!data.businesses || data.businesses.length === 0) {
        break;
      }

      for (const business of data.businesses) {
        if (totalFetched >= maxResults) break;

        const businessDetails = await fetchBusinessDetails(business.id, apiKey);
        const lead = convertBusinessToLead(business, businessDetails);
        
        if (lead) {
          leads.push(lead);
          totalFetched++;
        }
      }

      if (data.businesses.length < limit) {
        break;
      }

      offset += limit;
      
      await new Promise(resolve => setTimeout(resolve, 200));
    }

    log.info(`Collected ${leads.length} leads from Yelp Fusion API`);
    return leads;

  } catch (error) {
    log.error('Yelp API request failed:', error.message);
    return [];
  }
}

async function fetchBusinessDetails(businessId, apiKey) {
  try {
    const url = `https://api.yelp.com/v3/businesses/${businessId}`;
    
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Accept': 'application/json'
      }
    });

    if (response.ok) {
      return await response.json();
    }
    
    return null;
  } catch (error) {
    log.warning(`Failed to fetch details for business ${businessId}:`, error.message);
    return null;
  }
}

function convertBusinessToLead(business, details) {
  try {
    const name = details?.name || business.name;
    if (!name) return null;

    const location = details?.location || business.location;
    const address = {
      street: location?.address1 || '',
      city: location?.city || '',
      state: location?.state || '',
      postalCode: location?.zip_code || '',
      country: location?.country || 'US',
      formatted: location?.display_address?.join(', ') || ''
    };

    const phone = details?.display_phone || business.display_phone || '';
    let phoneE164 = details?.phone || business.phone || '';
    
    if (phone && !phoneE164) {
      try {
        const parsed = parsePhoneNumber(phone, 'US');
        phoneE164 = parsed.number;
      } catch (e) {
        phoneE164 = phone;
      }
    }

    const categories = (details?.categories || business.categories || []).map(c => c.title);
    const category = categories[0] || '';

    const lead = {
      dedupeId: '',
      confidence: 0.9,
      sources: {
        yelp: {
          url: details?.url || business.url || '',
          bizId: business.id
        }
      },
      business: {
        name: name,
        category: category,
        categories: categories,
        description: '',
        address: address,
        geo: {
          lat: business.coordinates?.latitude || 0,
          lng: business.coordinates?.longitude || 0
        },
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
          source: 'yelpApi',
          confidence: 0.9
        }] : [],
        keyPeople: []
      },
      signals: {
        reviews: {
          rating: details?.rating || business.rating || 0,
          reviewCount: details?.review_count || business.review_count || 0,
          lastReviewDate: ''
        },
        hours: {
          isOpen: !business.is_closed,
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
        notes: 'Collected from Yelp Fusion API'
      }
    };

    return lead;
  } catch (error) {
    log.warning('Failed to convert business to lead:', error.message);
    return null;
  }
}
