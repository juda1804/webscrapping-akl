const puppeteer = require('puppeteer');

async function scrapeExample() {
  // Launch browser
  const browser = await puppeteer.launch({
    headless: false, // Set to true for production
    defaultViewport: { width: 1280, height: 720 }
  });

  try {
    // Create new page
    const page = await browser.newPage();
    
    // Navigate to website
    await page.goto('https://quotes.toscrape.com/', {
      waitUntil: 'networkidle2'
    });

    // Extract quotes data
    const quotes = await page.evaluate(() => {
      const quoteElements = document.querySelectorAll('.quote');
      return Array.from(quoteElements).map(quote => {
        const text = quote.querySelector('.text')?.innerText || '';
        const author = quote.querySelector('.author')?.innerText || '';
        const tags = Array.from(quote.querySelectorAll('.tag')).map(tag => tag.innerText);
        
        return { text, author, tags };
      });
    });

    console.log('Scraped quotes:', quotes);
    return quotes;

  } catch (error) {
    console.error('Error during scraping:', error);
    throw error;
  } finally {
    // Always close browser
    await browser.close();
  }
}

// Run the scraper if this file is executed directly
if (require.main === module) {
  scrapeExample()
    .then(data => {
      console.log(`Successfully scraped ${data.length} quotes!`);
    })
    .catch(error => {
      console.error('Scraping failed:', error);
      process.exit(1);
    });
}

module.exports = { scrapeExample };