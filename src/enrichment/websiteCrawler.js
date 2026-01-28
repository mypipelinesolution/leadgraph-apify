import { log } from 'crawlee';
import { PlaywrightCrawler } from 'crawlee';
import { chromium } from 'playwright';
import { simpleFetch } from './simpleFetch.js';

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
    
    // HYBRID APPROACH: Try simple fetch first (fast), fallback to Playwright if it fails
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
        log.info(`Simple fetch blocked for ${domain}, trying Playwright`);
      }
    } else {
      log.debug(`Simple fetch failed for ${domain}: ${simpleResult.error || 'No content'}`);
    }
    
    // Fallback to Playwright if simple fetch failed or was blocked
    log.info(`Using Playwright for ${domain}`);
    return await crawlWithPlaywright(startUrl, domain, maxPages, options);
    
  } catch (error) {
    log.error(`Website crawl failed for ${websiteUrl}:`, error.message);
    return { pages: [], metadata: {}, htmlContent: '' };
  }
}

// Crawl using Playwright (bot detection bypass with headless browser)
async function crawlWithPlaywright(startUrl, domain, maxPages, options) {
  const crawledPages = [];
  let allHtml = '';
  
  try {
    const browser = await chromium.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-blink-features=AutomationControlled'
      ]
    });
    
    const context = await browser.newContext({
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      viewport: { width: 1920, height: 1080 }
    });
    
    const page = await context.newPage();
    
    try {
      // Navigate with timeout
      await page.goto(startUrl, { 
        waitUntil: 'domcontentloaded',
        timeout: 15000 
      });
      
      // Wait a bit for dynamic content
      await page.waitForTimeout(2000);
      
      // Get page content
      const html = await page.content();
      const title = await page.title();
      
      crawledPages.push({
        url: startUrl,
        title: title,
        html: html
      });
      
      allHtml = html;
      
      log.info(`Playwright successfully crawled ${domain}`);
      
    } catch (pageError) {
      log.warning(`Playwright page error for ${domain}:`, pageError.message);
    } finally {
      await browser.close();
    }
    
    if (crawledPages.length > 0) {
      return buildCrawlResult(crawledPages, allHtml, domain);
    } else {
      return { pages: [], metadata: {}, htmlContent: '' };
    }
    
  } catch (error) {
    log.error(`Playwright error for ${domain}:`, error.message);
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
  
  // Extract clean text content for AI context
  const websiteChunk = extractWebsiteChunk(allHtml);
  
  log.info(`Crawled ${crawledPages.length} page(s) from ${domain}, extracted ${websiteChunk.length} chars for AI context`);
  
  return {
    pages: crawledPages,
    metadata: {
      pageCount: crawledPages.length,
      hasContactForm,
      hasBookingWidget,
      hasChatWidget
    },
    htmlContent: allHtml,
    websiteChunk: websiteChunk
  };
}

// Extract clean, meaningful text from HTML for AI context
function extractWebsiteChunk(html, maxLength = 2000) {
  if (!html) return '';
  
  try {
    let text = html;
    
    // Remove script, style, and other non-content tags
    text = text.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
    text = text.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');
    text = text.replace(/<noscript[^>]*>[\s\S]*?<\/noscript>/gi, '');
    text = text.replace(/<svg[^>]*>[\s\S]*?<\/svg>/gi, '');
    text = text.replace(/<nav[^>]*>[\s\S]*?<\/nav>/gi, ''); // Remove nav menus
    text = text.replace(/<footer[^>]*>[\s\S]*?<\/footer>/gi, ''); // Remove footer
    text = text.replace(/<!--[\s\S]*?-->/g, ''); // Remove comments
    
    // Extract key sections with labels
    const sections = [];
    
    // Get title
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    if (titleMatch) {
      sections.push(`TITLE: ${titleMatch[1].trim()}`);
    }
    
    // Get meta description
    const metaDescMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i);
    if (metaDescMatch) {
      sections.push(`DESCRIPTION: ${metaDescMatch[1].trim()}`);
    }
    
    // Get H1 headings (main topics)
    const h1Matches = html.match(/<h1[^>]*>([^<]+)<\/h1>/gi);
    if (h1Matches && h1Matches.length > 0) {
      const h1s = h1Matches.map(h => h.replace(/<[^>]+>/g, '').trim()).filter(h => h.length > 0);
      if (h1s.length > 0) {
        sections.push(`MAIN HEADINGS: ${h1s.slice(0, 3).join(' | ')}`);
      }
    }
    
    // Get H2 headings (services/sections)
    const h2Matches = html.match(/<h2[^>]*>([^<]+)<\/h2>/gi);
    if (h2Matches && h2Matches.length > 0) {
      const h2s = h2Matches.map(h => h.replace(/<[^>]+>/g, '').trim()).filter(h => h.length > 0);
      if (h2s.length > 0) {
        sections.push(`SECTIONS: ${h2s.slice(0, 5).join(' | ')}`);
      }
    }
    
    // Extract about/services content
    const aboutMatch = html.match(/<(?:section|div)[^>]*(?:id|class)=["'][^"']*(?:about|services|what-we-do)[^"']*["'][^>]*>([\s\S]*?)<\/(?:section|div)>/i);
    if (aboutMatch) {
      const aboutText = aboutMatch[1].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
      if (aboutText.length > 50) {
        sections.push(`ABOUT/SERVICES: ${aboutText.substring(0, 500)}`);
      }
    }
    
    // Get main body text (cleaned)
    text = text.replace(/<[^>]+>/g, ' '); // Remove all HTML tags
    text = text.replace(/&nbsp;/g, ' ');
    text = text.replace(/&amp;/g, '&');
    text = text.replace(/&lt;/g, '<');
    text = text.replace(/&gt;/g, '>');
    text = text.replace(/&quot;/g, '"');
    text = text.replace(/&#\d+;/g, ''); // Remove numeric entities
    text = text.replace(/\s+/g, ' ').trim();
    
    // Remove common boilerplate phrases
    const boilerplate = [
      /all rights reserved/gi,
      /privacy policy/gi,
      /terms of service/gi,
      /cookie policy/gi,
      /copyright \d{4}/gi,
      /powered by/gi,
      /built with/gi
    ];
    for (const pattern of boilerplate) {
      text = text.replace(pattern, '');
    }
    
    // Add main content excerpt
    if (text.length > 100) {
      sections.push(`CONTENT: ${text.substring(0, 1000)}`);
    }
    
    // Combine sections
    const result = sections.join('\n\n');
    
    // Truncate to max length
    if (result.length > maxLength) {
      return result.substring(0, maxLength) + '...';
    }
    
    return result;
    
  } catch (error) {
    log.warning('Failed to extract website chunk:', error.message);
    return '';
  }
}
