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
    
    // Initialize Crawl4AI client if needed
    if (crawl4aiAvailable === null) {
      crawl4aiClient = new Crawl4AIClient();
      crawl4aiAvailable = await crawl4aiClient.checkAvailability();
      if (crawl4aiAvailable) {
        log.info('Crawl4AI service available - using hybrid approach');
      } else {
        log.info('Crawl4AI not available - using simple fetch only');
      }
    }

    // HYBRID APPROACH: Try simple fetch first (fast), fallback to Crawl4AI if it fails
    log.debug(`Trying simple fetch for ${domain}`);
    const simpleResult = await simpleFetch(startUrl, 10000);
    
    // Check if simple fetch succeeded with good content
    if (simpleResult.success && simpleResult.html && simpleResult.html.length > 1000) {
      // Check if we got blocked (403, 401, captcha, etc.)
      const isBlocked = simpleResult.html.includes('403 Forbidden') ||
                       simpleResult.html.includes('Access Denied') ||
                       simpleResult.html.includes('captcha') ||
                       simpleResult.html.includes('Cloudflare') ||
                       simpleResult.html.length < 5000; // Suspiciously small
      
      if (!isBlocked) {
        log.info(`Simple fetch succeeded for ${domain}`);
        crawledPages.push({
          url: startUrl,
          title: extractTitle(simpleResult.html),
          html: simpleResult.html
        });
        allHtml = simpleResult.text;
        
        return buildCrawlResult(crawledPages, allHtml, domain);
      } else {
        log.info(`Simple fetch blocked for ${domain}, trying Crawl4AI`);
      }
    } else {
      log.debug(`Simple fetch failed for ${domain}: ${simpleResult.error || 'No content'}`);
    }
    
    // Fallback to Crawl4AI if simple fetch failed or was blocked
    if (crawl4aiAvailable) {
      log.info(`Using Crawl4AI for ${domain}`);
      return await crawlWithCrawl4AI(startUrl, domain, maxPages, options);
    }
    
    // Both methods failed
    log.warning(`All crawl methods failed for ${domain}`);
    return { pages: [], metadata: {}, htmlContent: '' };
    
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
      timeout: 20 // Reduced from 30s to 20s
    });
    
    if (result.success) {
      crawledPages.push({
        url: result.url,
        title: result.title,
        html: result.html
      });
      allHtml = result.text || result.markdown;
      
      log.info(`Crawl4AI successfully crawled ${domain}`);
      return buildCrawlResult(crawledPages, allHtml, domain);
    } else {
      log.warning(`Crawl4AI failed for ${domain}: ${result.error}`);
      return { pages: [], metadata: {}, htmlContent: '' };
    }
    
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

// Build crawl result with metadata
function buildCrawlResult(crawledPages, allHtml, domain) {
  const hasContactForm = allHtml.toLowerCase().includes('contact') && 
                        (allHtml.toLowerCase().includes('form') || 
                         allHtml.toLowerCase().includes('submit'));
  
  const hasBookingWidget = allHtml.toLowerCase().includes('book') && 
                          (allHtml.toLowerCase().includes('appointment') || 
                           allHtml.toLowerCase().includes('schedule'));
  
  const hasChatWidget = allHtml.toLowerCase().includes('chat') || 
                       allHtml.toLowerCase().includes('intercom') ||
                       allHtml.toLowerCase().includes('drift');
  
  log.info(`Crawled ${crawledPages.length} page(s) from ${domain}`);
  
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
}
