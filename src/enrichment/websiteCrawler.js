import { log } from 'crawlee';
import { Crawl4AIClient, simpleFetch } from './crawl4aiClient.js';

// Initialize Crawl4AI client (will check availability on first use)
let crawl4aiClient = null;
let crawl4aiAvailable = null;

export async function crawlWebsite(websiteUrl, options) {
  if (!websiteUrl) {
    return { pages: [], metadata: {}, htmlContent: '' };
  }

  const maxPages = options?.enrichment?.maxWebsitePages || 10;
  const crawledPages = [];
  let allHtml = '';
  
  try {
    const startUrl = websiteUrl.startsWith('http') ? websiteUrl : `https://${websiteUrl}`;
    const domain = new URL(startUrl).hostname;
    
    log.info(`Crawling website: ${domain}`);
    
    // Try Crawl4AI first (better bot detection bypass)
    if (crawl4aiAvailable === null) {
      crawl4aiClient = new Crawl4AIClient();
      crawl4aiAvailable = await crawl4aiClient.checkAvailability();
      if (crawl4aiAvailable) {
        log.info('Crawl4AI service available - using advanced scraping');
      } else {
        log.info('Crawl4AI not available - using simple fetch fallback');
      }
    }

    // If Crawl4AI is available, use it
    if (crawl4aiAvailable) {
      return await crawlWithCrawl4AI(startUrl, domain, maxPages, options);
    }
    
    // Fallback: Use simple fetch (lightweight, no external dependencies)
    log.info(`Using simple fetch for ${domain}`);
    const simpleResult = await simpleFetch(startUrl);
    
    if (simpleResult.success && simpleResult.html && simpleResult.html.length > 1000) {
      log.info(`Successfully fetched ${domain}`);
      crawledPages.push({
        url: startUrl,
        title: extractTitle(simpleResult.html),
        html: simpleResult.html
      });
      allHtml = simpleResult.text;
      
      const hasContactForm = allHtml.toLowerCase().includes('contact') && 
                            (allHtml.toLowerCase().includes('form') || 
                             allHtml.toLowerCase().includes('submit'));
      
      const hasBookingWidget = allHtml.toLowerCase().includes('book') && 
                              (allHtml.toLowerCase().includes('appointment') || 
                               allHtml.toLowerCase().includes('schedule'));
      
      const hasChatWidget = allHtml.toLowerCase().includes('chat') || 
                           allHtml.toLowerCase().includes('intercom') ||
                           allHtml.toLowerCase().includes('drift');
      
      log.info(`Crawled 1 page from ${domain}`);
      
      return {
        pages: crawledPages,
        metadata: {
          pageCount: 1,
          hasContactForm,
          hasBookingWidget,
          hasChatWidget
        },
        htmlContent: allHtml
      };
    } else {
      log.warning(`Failed to fetch ${domain}: ${simpleResult.error || 'No content'}`);
      return { pages: [], metadata: {}, htmlContent: '' };
    }
    
  } catch (error) {
    log.error(`Website crawl failed for ${websiteUrl}:`, error.message);
    return { pages: [], metadata: {}, htmlContent: '' };
  }
}

// Crawl using Crawl4AI (advanced bot detection bypass)
async function crawlWithCrawl4AI(startUrl, domain, maxPages, options) {
  const crawledPages = [];
  let allHtml = '';
  
  try {
    const result = await crawl4aiClient.crawlUrl(startUrl, {
      maxPages: 1, // Start with homepage
      timeout: 30000
    });
    
    if (result.success) {
      crawledPages.push({
        url: result.url,
        title: result.title,
        html: result.html
      });
      allHtml = result.text || result.markdown;
      
      log.info(`Crawl4AI successfully crawled ${domain}`);
    } else {
      log.warning(`Crawl4AI failed for ${domain}: ${result.error}`);
      return { pages: [], metadata: {}, htmlContent: '' };
    }
    
    const hasContactForm = allHtml.toLowerCase().includes('contact') && 
                          (allHtml.toLowerCase().includes('form') || 
                           allHtml.toLowerCase().includes('submit'));
    
    const hasBookingWidget = allHtml.toLowerCase().includes('book') && 
                            (allHtml.toLowerCase().includes('appointment') || 
                             allHtml.toLowerCase().includes('schedule'));
    
    const hasChatWidget = allHtml.toLowerCase().includes('chat') || 
                         allHtml.toLowerCase().includes('intercom') ||
                         allHtml.toLowerCase().includes('drift');
    
    return {
      pages: crawledPages,
      metadata: {
        pageCount: crawledPages.length,
        hasContactForm,
        hasBookingWidget,
        hasChatWidget
      },
      htmlContent: allHtml
    };
    
  } catch (error) {
    log.error(`Crawl4AI error for ${domain}:`, error.message);
    return { pages: [], metadata: {}, htmlContent: '' };
  }
}

// Extract title from HTML
function extractTitle(html) {
  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  return titleMatch ? titleMatch[1].trim() : '';
}
