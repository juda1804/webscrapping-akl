const WebScraper = require('../src/scraper');
const { delay } = require('../utils/helpers');

async function automateForm() {
  const scraper = new WebScraper({
    headless: false // Keep visible for demo
  });

  try {
    console.log('Starting form automation example...');
    
    const page = await scraper.createPage();
    
    // Navigate to a form page (using httpbin for testing)
    await page.goto('https://httpbin.org/forms/post', {
      waitUntil: 'networkidle2'
    });

    console.log('Filling out form...');

    // Fill form fields
    await page.type('input[name="custname"]', 'John Doe');
    await delay(500);
    
    await page.type('input[name="custtel"]', '+1-555-123-4567');
    await delay(500);
    
    await page.type('input[name="custemail"]', 'john.doe@example.com');
    await delay(500);
    
    await page.type('textarea[name="comments"]', 'This is an automated test using Puppeteer!');
    await delay(500);

    // Select dropdown option
    await page.select('select[name="size"]', 'medium');
    await delay(500);

    // Check radio button
    await page.click('input[name="topping"][value="bacon"]');
    await delay(500);

    console.log('Form filled successfully!');
    
    // Take a screenshot before submitting
    await page.screenshot({ 
      path: 'data/form-before-submit.png',
      fullPage: true 
    });

    // Submit form
    console.log('Submitting form...');
    await Promise.all([
      page.waitForNavigation({ waitUntil: 'networkidle2' }),
      page.click('input[type="submit"]')
    ]);

    // Get response
    const response = await page.evaluate(() => {
      return document.body.innerText;
    });

    console.log('Form submission response:');
    console.log(response);

    // Take screenshot of result
    await page.screenshot({ 
      path: 'data/form-after-submit.png',
      fullPage: true 
    });

    await page.close();
    return { success: true, response };

  } catch (error) {
    console.error('Error in form automation:', error);
    throw error;
  } finally {
    await scraper.close();
  }
}

// Run if called directly
if (require.main === module) {
  automateForm()
    .then(result => {
      console.log('\n✅ Form automation completed successfully!');
    })
    .catch(error => {
      console.error('❌ Form automation failed:', error);
      process.exit(1);
    });
}

module.exports = { automateForm };