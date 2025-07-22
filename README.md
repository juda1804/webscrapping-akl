# Puppeteer Web Scraper

A ready-to-use Puppeteer project for web scraping and browser automation.

## Features

- 🚀 Pre-configured Puppeteer setup
- 🏗️ Modular scraper class for reusability
- 📊 Data export to JSON and CSV formats
- 🔧 Utility functions for common tasks
- 📝 Complete examples for different use cases
- 🎯 Form automation capabilities

## Installation

```bash
npm install
```

## Quick Start

### Basic Usage

Run the basic scraper example:

```bash
npm start
```

### Available Scripts

- `npm start` - Run basic quotes scraper
- `npm run scrape-quotes` - Advanced quotes scraping with data export
- `npm run automate-form` - Form automation example

## Project Structure

```
├── src/
│   └── scraper.js          # Main WebScraper class
├── utils/
│   └── helpers.js          # Utility functions
├── examples/
│   ├── quotes-scraper.js   # Advanced scraping example
│   └── form-automation.js  # Form automation example
├── data/                   # Generated data files
├── index.js               # Basic example
└── package.json
```

## Usage Examples

### 1. Basic Scraping

```javascript
const { scrapeExample } = require('./index');

scrapeExample()
  .then(quotes => console.log(`Scraped ${quotes.length} quotes`))
  .catch(console.error);
```

### 2. Using the WebScraper Class

```javascript
const WebScraper = require('./src/scraper');

async function customScrape() {
  const scraper = new WebScraper({
    headless: true,
    viewport: { width: 1280, height: 720 }
  });

  try {
    const data = await scraper.scrape('https://example.com', {
      title: 'h1',
      links: {
        selector: 'a',
        multiple: true,
        attribute: 'href'
      }
    });
    
    console.log(data);
    return data;
  } finally {
    await scraper.close();
  }
}
```

### 3. Advanced Scraping with Data Export

```javascript
const WebScraper = require('./src/scraper');
const { saveToJSON, saveToCSV } = require('./utils/helpers');

async function scrapeAndSave() {
  const scraper = new WebScraper();
  
  // Your scraping logic here
  const data = await scraper.scrape(url, selectors);
  
  // Save data
  await saveToJSON(data, 'results.json');
  await saveToCSV(data, 'results.csv');
  
  await scraper.close();
}
```

## Configuration Options

The `WebScraper` class accepts these options:

```javascript
const scraper = new WebScraper({
  headless: false,           // Show browser (false) or hide (true)
  viewport: {                // Browser window size
    width: 1280,
    height: 720
  },
  timeout: 30000            // Default timeout in milliseconds
});
```

## Available Utility Functions

### Data Export
- `saveToJSON(data, filename)` - Save data as JSON
- `saveToCSV(data, filename)` - Save data as CSV

### Timing
- `delay(ms)` - Add delay between operations
- `randomDelay(min, max)` - Random delay between min/max ms

### Error Handling
- `retry(fn, maxAttempts, baseDelay)` - Retry function with exponential backoff

### Helpers
- `getTimestamp()` - Get current timestamp string

## Examples Included

### 1. Quotes Scraper (`examples/quotes-scraper.js`)
- Scrapes quotes from quotes.toscrape.com
- Exports data to JSON and CSV
- Includes error handling and progress logging

### 2. Form Automation (`examples/form-automation.js`)
- Demonstrates form filling and submission
- Takes screenshots before/after actions
- Shows interaction with various form elements

## Best Practices

1. **Always close the browser**: Use try/finally or the scraper's close method
2. **Add delays**: Use `delay()` or `randomDelay()` to avoid being blocked
3. **Handle errors**: Implement proper error handling and retries
4. **Respectful scraping**: Add delays and don't overload servers
5. **Screenshot debugging**: Take screenshots when debugging issues

## Error Handling

The project includes robust error handling:

```javascript
const { retry } = require('./utils/helpers');

// Retry failed operations
await retry(async () => {
  return await scraper.scrape(url, selectors);
}, 3, 1000);
```

## Troubleshooting

### Common Issues

1. **Browser won't launch**: Make sure Puppeteer installed correctly
2. **Timeout errors**: Increase timeout in scraper options
3. **Element not found**: Use `waitForSelector` option
4. **Memory issues**: Always close browser/pages when done

### Debug Mode

Set `headless: false` to see what the browser is doing:

```javascript
const scraper = new WebScraper({ headless: false });
```

## Contributing

Feel free to add more examples and utilities to this project!

## License

ISC