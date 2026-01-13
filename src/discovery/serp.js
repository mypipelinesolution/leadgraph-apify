// Google SERP scraping implementation
// Note: Google has strong anti-bot measures
// Results may be limited or blocked without proper headers/proxies

import { scrapeSERP as scrapeSERPScraper } from './serpApi.js';

export async function scrapeSERP(keyword, location, options) {
  return scrapeSERPScraper(keyword, location, options);
}
