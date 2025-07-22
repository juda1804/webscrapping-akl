const puppeteer = require('puppeteer');

class WebScraper {
  constructor(options = {}) {
    this.options = {
      headless: options.headless !== false,
      viewport: options.viewport || { width: 1280, height: 720 },
      timeout: options.timeout || 30000,
      ...options
    };
  }

  async launch() {
    this.browser = await puppeteer.launch({
      headless: this.options.headless,
      defaultViewport: this.options.viewport
    });
  }

  async createPage() {
    if (!this.browser) {
      await this.launch();
    }
    const page = await this.browser.newPage();
    await page.setDefaultTimeout(this.options.timeout);
    return page;
  }

  async scrape(url, selectors, options = {}) {
    const page = await this.createPage();
    
    try {
      // Navigate to URL
      await page.goto(url, {
        waitUntil: options.waitUntil || 'networkidle2'
      });

      // Wait for specific element if provided
      if (options.waitForSelector) {
        await page.waitForSelector(options.waitForSelector);
      }

      // Extract data based on selectors
      const data = await page.evaluate((selectors) => {
        const result = {};
        
        for (const [key, selector] of Object.entries(selectors)) {
          if (selector.multiple) {
            result[key] = Array.from(document.querySelectorAll(selector.selector))
              .map(el => selector.attribute ? el.getAttribute(selector.attribute) : el.innerText);
          } else {
            const element = document.querySelector(selector.selector || selector);
            if (element) {
              result[key] = selector.attribute ? 
                element.getAttribute(selector.attribute) : 
                element.innerText;
            }
          }
        }
        
        return result;
      }, selectors);

      return data;

    } finally {
      await page.close();
    }
  }

  async close() {
    if (this.browser) {
      await this.browser.close();
    }
  }
}

module.exports = WebScraper;