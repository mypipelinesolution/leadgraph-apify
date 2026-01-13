import { log } from 'crawlee';

/**
 * Crawl4AI Client - Uses Crawl4AI for advanced web scraping with bot detection bypass
 * Crawl4AI is an open-source Python library that we'll call via HTTP when available
 * Falls back to basic fetch if Crawl4AI service is not running
 */

export class Crawl4AIClient {
  constructor(baseUrl = 'http://localhost:11235') {
    this.baseUrl = baseUrl;
    this.available = false;
  }

  async checkAvailability() {
    try {
      const response = await fetch(`${this.baseUrl}/health`, {
        method: 'GET',
        signal: AbortSignal.timeout(2000)
      });
      this.available = response.ok;
      return this.available;
    } catch (error) {
      this.available = false;
      return false;
    }
  }

  async crawlUrl(url, options = {}) {
    const {
      maxPages = 5,
      includeLinks = true,
      extractMarkdown = true,
      waitForSelector = null,
      timeout = 30000
    } = options;

    try {
      const response = await fetch(`${this.baseUrl}/crawl`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          urls: [url],
          word_count_threshold: 10,
          extraction_strategy: 'NoExtractionStrategy',
          chunking_strategy: {
            type: 'RegexChunking'
          },
          bypass_cache: false,
          screenshot: false,
          pdf: false,
          verbose: false,
          extra: {
            wait_for_selector: waitForSelector,
            timeout: timeout
          }
        }),
        signal: AbortSignal.timeout(timeout + 5000)
      });

      if (!response.ok) {
        throw new Error(`Crawl4AI API error: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.success || !data.results || data.results.length === 0) {
        throw new Error('No results from Crawl4AI');
      }

      const result = data.results[0];
      
      return {
        success: true,
        url: result.url,
        title: result.metadata?.title || '',
        html: result.html || '',
        markdown: result.markdown || '',
        text: result.cleaned_html || result.markdown || '',
        links: result.links?.internal || [],
        images: result.media?.images || [],
        metadata: result.metadata || {}
      };

    } catch (error) {
      log.warning(`Crawl4AI crawl failed for ${url}:`, error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async crawlMultiple(urls, options = {}) {
    const results = [];
    
    for (const url of urls) {
      const result = await this.crawlUrl(url, options);
      results.push(result);
      
      // Small delay between requests to be respectful
      if (urls.indexOf(url) < urls.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }
    
    return results;
  }
}

/**
 * Fallback: Simple fetch-based crawler when Crawl4AI is not available
 */
export async function simpleFetch(url, timeout = 10000) {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9'
      },
      signal: AbortSignal.timeout(timeout)
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const html = await response.text();
    
    return {
      success: true,
      url: url,
      html: html,
      text: html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
    };

  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}
