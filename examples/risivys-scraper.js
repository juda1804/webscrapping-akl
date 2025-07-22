const WebScraper = require('../src/scraper');
const { delay } = require('../utils/helpers');

async function openRisivysLogin() {
  const scraper = new WebScraper({
    headless: false, // Always show browser for this scraper
    viewport: { width: 1280, height: 720 }
  });

  try {
    console.log('Opening Risivys login page...');
    
    const page = await scraper.createPage();
    
    // Navigate to the login URL
    await page.goto('https://risivys.hiruko.com.co:32117/login', {
      waitUntil: 'networkidle2'
    });

    console.log('✅ Risivys login page opened successfully!');
    console.log('🌐 URL: https://risivys.hiruko.com.co:32117/login');
    console.log('');
    
    // Wait for login form to be available
    console.log('🔍 Waiting for login form...');
    await page.waitForSelector('#username', { visible: true });
    await page.waitForSelector('#password', { visible: true });
    await page.waitForSelector('#_submit', { visible: true });
    
    console.log('📝 Filling login form...');
    
    // Fill username field
    await page.type('#username', 'ddavila');
    await delay(500);
    
    // Fill password field  
    await page.type('#password', '1144072382');
    await delay(500);
    
    console.log('✅ Form filled successfully!');
    console.log('🚀 Submitting login...');
    
    // Click submit button
    await page.click('#_submit');
    
    console.log('⏳ Login submitted, waiting for response...');
    
    // Wait for navigation or response after login
    try {
      await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 10000 });
      console.log('✅ Login completed! Page navigated successfully.');
    } catch (navError) {
      console.log('ℹ️ No navigation detected, checking current page...');
    }
    
    // Check current URL to see if login was successful
    const currentUrl = page.url();
    console.log(`📍 Current URL after login: ${currentUrl}`);
    
    // Navigate to ListadoLeidos page
    console.log('🧭 Navigating to ListadoLeidos page...');
    await delay(2000); // Wait a moment to ensure login is complete
    
    await page.goto('https://risivys.hiruko.com.co:32117/common/ListadoLeidos/Lista', {
      waitUntil: 'networkidle2'
    });
    
    console.log('✅ Successfully navigated to ListadoLeidos page!');
    console.log('📍 Final URL: https://risivys.hiruko.com.co:32117/common/ListadoLeidos/Lista');
    
    // Calculate dates: first day of current month and today
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    
    // Format dates as DD/MM/YYYY (common format for date pickers)
    const formatDate = (date) => {
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    };
    
    const startDate = formatDate(firstDayOfMonth);
    const endDate = formatDate(today);
    
    console.log('📅 Filling date inputs...');
    console.log(`   Start date (first day of month): ${startDate}`);
    console.log(`   End date (today): ${endDate}`);
    
    // Wait for date inputs to be available
    await page.waitForSelector('#dateInit', { visible: true, timeout: 5000 });
    await page.waitForSelector('#dateEnd', { visible: true, timeout: 5000 });
    
    // Fill the date inputs
    // Since they are readonly, we need to use evaluate to set their values directly
    await page.evaluate((startDate, endDate) => {
      const dateInitInput = document.getElementById('dateInit');
      const dateEndInput = document.getElementById('dateEnd');
      
      if (dateInitInput) {
        dateInitInput.value = startDate;
        // Trigger change event
        dateInitInput.dispatchEvent(new Event('change', { bubbles: true }));
      }
      
      if (dateEndInput) {
        dateEndInput.value = endDate;
        // Trigger change event
        dateEndInput.dispatchEvent(new Event('change', { bubbles: true }));
      }
    }, startDate, endDate);
    
    await delay(1000);
    
    console.log('✅ Date inputs filled successfully!');
    console.log('📅 Date range set from first day of month to today');
    
    // Click the search button
    console.log('🔍 Clicking search button...');
    
    // Wait for search button to be available and click it
    await page.waitForSelector('#searchData', { visible: true, timeout: 5000 });
    await page.click('#searchData');
    
    console.log('✅ Search button clicked successfully!');
    console.log('⏳ Waiting for search results to load...');
    
    // Wait a moment for the search to process and results to load
    await delay(3000);
    
    console.log('✅ Search completed!');
    console.log('📊 Search results should now be visible on the page');
    
    console.log('');
    console.log('📌 The browser will stay open for manual interaction.');
    console.log('💡 Press Ctrl+C in the terminal to close when you\'re done.');
    
    // Keep the page open by waiting indefinitely
    // This prevents the browser from closing automatically
    await new Promise(() => {
      // This promise never resolves, keeping the browser open
      // The user can manually close it or use Ctrl+C
    });

  } catch (error) {
    console.error('❌ Error during login process:', error);
    
    // Still keep browser open even if there's an error
    console.log('🔧 Browser will remain open for debugging...');
    await new Promise(() => {});
    
  }
  // Note: We don't call scraper.close() here because we want to keep it open
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n👋 Shutting down gracefully...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n👋 Shutting down gracefully...');
  process.exit(0);
});

// Run if called directly
if (require.main === module) {
  openRisivysLogin().catch(error => {
    console.error('❌ Failed to open Risivys login:', error);
    process.exit(1);
  });
}

module.exports = { openRisivysLogin };