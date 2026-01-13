import { PlaywrightCrawler, log } from 'crawlee';

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
    
    const priorityPages = [
      '/contact',
      '/contact-us',
      '/about',
      '/about-us',
      '/team',
      '/services',
      '/'
    ];
    
    const urlsToVisit = new Set([startUrl]);
    
    for (const path of priorityPages) {
      try {
        const url = new URL(path, startUrl);
        if (url.hostname === domain) {
          urlsToVisit.add(url.href);
        }
      } catch (e) {
        // Invalid URL, skip
      }
    }
    
    const crawler = new PlaywrightCrawler({
      maxRequestsPerCrawl: maxPages,
      maxConcurrency: 2,
      requestHandlerTimeoutSecs: 30,
      launchContext: {
        launchOptions: {
          headless: true,
          args: ['--no-sandbox', '--disable-setuid-sandbox']
        }
      },
      async requestHandler({ page, request, enqueueLinks }) {
        try {
          // Wait for page to load
          await page.waitForLoadState('domcontentloaded');
          
          const title = await page.title();
          const html = await page.content();
          const bodyText = await page.evaluate(() => document.body.innerText);
          
          crawledPages.push({
            url: request.url,
            title: title,
            html: html
          });
          
          allHtml += ' ' + bodyText;
          
          if (crawledPages.length < maxPages) {
            await enqueueLinks({
              globs: [
                `${startUrl}*`,
                `https://${domain}/*`,
                `http://${domain}/*`
              ],
              exclude: [
                '**/*.pdf',
                '**/*.jpg',
                '**/*.jpeg',
                '**/*.png',
                '**/*.gif',
                '**/*.zip',
                '**/*.doc',
                '**/*.docx'
              ],
              transformRequestFunction: (req) => {
                const url = new URL(req.url);
                if (url.hostname !== domain) {
                  return false;
                }
                return req;
              }
            });
          }
        } catch (error) {
          log.warning(`Failed to process page ${request.url}:`, error.message);
        }
      },
      failedRequestHandler({ request }) {
        log.warning(`Request failed: ${request.url}`);
      },
    });
    
    await crawler.run(Array.from(urlsToVisit));
    
    const hasContactForm = allHtml.toLowerCase().includes('contact') && 
                          (allHtml.toLowerCase().includes('form') || 
                           allHtml.toLowerCase().includes('submit'));
    
    const hasBookingWidget = allHtml.toLowerCase().includes('book') && 
                            (allHtml.toLowerCase().includes('appointment') || 
                             allHtml.toLowerCase().includes('schedule'));
    
    const hasChatWidget = allHtml.toLowerCase().includes('chat') || 
                         allHtml.toLowerCase().includes('intercom') ||
                         allHtml.toLowerCase().includes('drift');
    
    log.info(`Crawled ${crawledPages.length} pages from ${domain}`);
    
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
    log.error(`Website crawl failed for ${websiteUrl}:`, error.message);
    return { pages: [], metadata: {}, htmlContent: '' };
  }
}
