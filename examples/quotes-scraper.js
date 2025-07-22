const WebScraper = require('../src/scraper');
const { saveToJSON, saveToCSV, getTimestamp } = require('../utils/helpers');

async function scrapeQuotes() {
  const scraper = new WebScraper({
    headless: false // Set to true for production
  });

  try {
    console.log('Starting quotes scraping...');
    
    const selectors = {
      quotes: {
        selector: '.quote',
        multiple: true
      }
    };

    // First, get the basic structure
    const data = await scraper.scrape('https://quotes.toscrape.com/', selectors);
    
    // Now get detailed quote information
    const page = await scraper.createPage();
    await page.goto('https://quotes.toscrape.com/', {
      waitUntil: 'networkidle2'
    });

    const quotes = await page.evaluate(() => {
      const quoteElements = document.querySelectorAll('.quote');
      return Array.from(quoteElements).map(quote => {
        const text = quote.querySelector('.text')?.innerText || '';
        const author = quote.querySelector('.author')?.innerText || '';
        const tags = Array.from(quote.querySelectorAll('.tag')).map(tag => tag.innerText);
        
        return { 
          text: text.replace(/[""]/g, ''),
          author, 
          tags: tags.join(', '),
          scraped_at: new Date().toISOString()
        };
      });
    });

    await page.close();

    console.log(`Scraped ${quotes.length} quotes successfully!`);
    
    // Save data
    const timestamp = getTimestamp();
    await saveToJSON(quotes, `quotes-${timestamp}.json`);
    await saveToCSV(quotes, `quotes-${timestamp}.csv`);

    return quotes;

  } catch (error) {
    console.error('Error scraping quotes:', error);
    throw error;
  } finally {
    await scraper.close();
  }
}

// Run if called directly
if (require.main === module) {
  scrapeQuotes()
    .then(quotes => {
      console.log(`\n✅ Successfully scraped ${quotes.length} quotes!`);
      console.log('\nFirst quote:');
      console.log(`"${quotes[0]?.text}" - ${quotes[0]?.author}`);
    })
    .catch(error => {
      console.error('❌ Scraping failed:', error);
      process.exit(1);
    });
}

module.exports = { scrapeQuotes };