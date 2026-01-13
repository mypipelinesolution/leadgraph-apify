import { log } from 'crawlee';

export async function scrapeGoogleMapsApi(keyword, location, options) {
  // Support both input keys and environment variables (for Apify secrets)
  const apiKey = options?.apiKeys?.googlePlaces || process.env.GOOGLE_PLACES_API_KEY;
  
  if (!apiKey) {
    throw new Error('Google Places API key is required. Set apiKeys.googlePlaces in input or GOOGLE_PLACES_API_KEY environment variable.');
  }

  const leads = [];
  const maxResults = options?.maxResultsPerLocation || 100;
  
  log.info(`Searching Google Places API: ${keyword} in ${location}`);

  try {
    const query = `${keyword} in ${location}`;
    const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query)}&key=${apiKey}`;
    
    let nextPageToken = null;
    let totalFetched = 0;

    do {
      const fetchUrl = nextPageToken 
        ? `${url}&pagetoken=${nextPageToken}`
        : url;

      const response = await fetch(fetchUrl);
      const data = await response.json();

      if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
        log.error(`Google Places API error: ${data.status} - ${data.error_message || 'Unknown error'}`);
        break;
      }

      if (data.results && data.results.length > 0) {
        for (const place of data.results) {
          if (totalFetched >= maxResults) break;

          const placeDetails = await fetchPlaceDetails(place.place_id, apiKey);
          const lead = convertPlaceToLead(place, placeDetails);
          
          if (lead) {
            leads.push(lead);
            totalFetched++;
          }
        }
      }

      nextPageToken = data.next_page_token;
      
      if (nextPageToken && totalFetched < maxResults) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }

    } while (nextPageToken && totalFetched < maxResults);

    log.info(`Collected ${leads.length} leads from Google Places API`);
    return leads;

  } catch (error) {
    log.error('Google Places API request failed:', error.message);
    return [];
  }
}

async function fetchPlaceDetails(placeId, apiKey) {
  try {
    const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=name,formatted_address,formatted_phone_number,international_phone_number,website,rating,user_ratings_total,address_components,geometry,types&key=${apiKey}`;
    
    const response = await fetch(url);
    const data = await response.json();

    if (data.status === 'OK') {
      return data.result;
    }
    
    return null;
  } catch (error) {
    log.warning(`Failed to fetch details for place ${placeId}:`, error.message);
    return null;
  }
}

function convertPlaceToLead(place, details) {
  try {
    const name = details?.name || place.name;
    if (!name) return null;

    const addressComponents = details?.address_components || [];
    const address = parseAddressComponents(addressComponents, details?.formatted_address || place.formatted_address);

    const phone = details?.formatted_phone_number || '';
    const phoneE164 = details?.international_phone_number || phone;
    
    const website = details?.website || '';
    const domain = website ? new URL(website).hostname : '';

    const category = details?.types?.[0]?.replace(/_/g, ' ') || place.types?.[0]?.replace(/_/g, ' ') || '';
    const categories = (details?.types || place.types || []).map(t => t.replace(/_/g, ' '));

    const lead = {
      dedupeId: '',
      confidence: 0.95,
      sources: {
        googleMaps: {
          url: `https://www.google.com/maps/place/?q=place_id:${place.place_id}`,
          placeId: place.place_id
        }
      },
      business: {
        name: name,
        category: category,
        categories: categories,
        description: '',
        address: address,
        geo: {
          lat: details?.geometry?.location?.lat || place.geometry?.location?.lat || 0,
          lng: details?.geometry?.location?.lng || place.geometry?.location?.lng || 0
        },
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
          source: 'googlePlacesApi',
          confidence: 0.95
        }] : [],
        keyPeople: []
      },
      signals: {
        reviews: {
          rating: details?.rating || place.rating || 0,
          reviewCount: details?.user_ratings_total || place.user_ratings_total || 0,
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
        notes: 'Collected from Google Places API'
      }
    };

    return lead;
  } catch (error) {
    log.warning('Failed to convert place to lead:', error.message);
    return null;
  }
}

function parseAddressComponents(components, formattedAddress) {
  const address = {
    street: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'US',
    formatted: formattedAddress || ''
  };

  for (const component of components) {
    const types = component.types;
    
    if (types.includes('street_number')) {
      address.street = component.long_name + ' ';
    }
    if (types.includes('route')) {
      address.street += component.long_name;
    }
    if (types.includes('locality')) {
      address.city = component.long_name;
    }
    if (types.includes('administrative_area_level_1')) {
      address.state = component.short_name;
    }
    if (types.includes('postal_code')) {
      address.postalCode = component.long_name;
    }
    if (types.includes('country')) {
      address.country = component.short_name;
    }
  }

  address.street = address.street.trim();

  return address;
}
