// BBB web scraping implementation
// Note: BBB.org has anti-bot measures, so this may not work reliably
// Consider using bbbApi.js for better results if BBB provides an API

import { scrapeBBB as scrapeBBBScraper } from './bbbApi.js';

export async function scrapeBBB(keyword, location, options) {
  // For now, use the same implementation
  // In the future, this could be a Playwright-based scraper
  return scrapeBBBScraper(keyword, location, options);
}
