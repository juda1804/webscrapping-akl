const WebScraper = require('../src/scraper');
const { delay } = require('../utils/helpers');

// Parse command line arguments
const args = process.argv.slice(2);
const cliUsername = args[0] || 'ddavila';
const cliCedula = args[1] || '1144072382';
const cliMedico = args[2] || 'TBD';
const cliFechaInicio = args[3];
const cliFechaFin = args[4];

async function openRisivysLogin() {
  const scraper = new WebScraper({
    headless: false, // Always show browser for this scraper
    viewport: { width: 1280, height: 720 }
  });

  try {
    console.log('Opening Risivys login page...');
    
    const page = await scraper.createPage();
    
    // Set a realistic user agent
    await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    
    // Set additional headers to mimic a real browser
    await page.setExtraHTTPHeaders({
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'Accept-Language': 'es-ES,es;q=0.8,en-US;q=0.5,en;q=0.3',
      'Accept-Encoding': 'gzip, deflate, br',
      'Cache-Control': 'no-cache',
      'Pragma': 'no-cache'
    });
    
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
    await page.type('#username', cliUsername);
    await delay(500);
    
    // Fill password field  
    await page.type('#password', cliCedula);
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
    
    // Use provided dates or fallback to previous logic
    let startDate = cliFechaInicio;
    let endDate = cliFechaFin;
    if (!startDate || !endDate) {
      // Calculate dates: first day of current month and today
      const today = new Date();
      const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      const formatDate = (date) => {
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();
        return `${year}-${month}-${day}`;
      };
      startDate = formatDate(firstDayOfMonth);
      endDate = formatDate(today);
    }
    console.log('📅 Filling date inputs...');
    console.log(`   Start date: ${startDate}`);
    console.log(`   End date: ${endDate}`);
    
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
    
    // Wait for search button to be available
    await page.waitForSelector('#searchData', { visible: true, timeout: 5000 });
    
    // Add a longer delay before clicking to ensure page is fully ready
    await delay(2000);
    
    // Try to wait for any network activity to settle before clicking
    try {
      await page.waitForTimeout(1000); // Simple timeout instead
      console.log('ℹ️ Page ready, proceeding with click...');
    } catch (e) {
      console.log('ℹ️ Timeout, proceeding with click...');
    }
    
    // Click with human-like behavior
    await page.hover('#searchData'); // Hover first
    await delay(200);
    await page.click('#searchData');
    
    console.log('✅ Search button clicked successfully!');
    console.log('⏳ Waiting for search results to load...');
    
    // Monitor for the search request and any errors
    page.on('response', response => {
      if (response.url().includes('BuscarLeidos')) {
        console.log(`📡 Search request: ${response.status()} - ${response.url()}`);
        if (response.status() >= 400) {
          console.log(`❌ Search request failed with status ${response.status()}`);
        }
      }
    });
    
    // Wait longer for the search to process and results to load
    await delay(8000);
    
    console.log('✅ Search completed!');
    console.log('📊 Search results should now be visible on the page');
    
    // Set up download path for Excel file
    const downloadPath = require('path').join(__dirname, '..', 'downloads');
    const fs = require('fs');
    const path = require('path');
    
    // Create custom filename: username-leidos-fechadehoy
    const username = 'ddavila'; // Based on the username we're using for login
    const todayFormatted = today.toISOString().split('T')[0]; // YYYY-MM-DD format
    const customFilename = `${username}-leidos-${todayFormatted}.xlsx`;
    
    console.log(`📁 Custom filename will be: ${customFilename}`);
    
    // Set download behavior using CDP (Chrome DevTools Protocol)
    const client = await page.target().createCDPSession();
    await client.send('Page.setDownloadBehavior', {
      behavior: 'allow',
      downloadPath: downloadPath
    });
    
    // Set up download listener to rename file after download
    let downloadedFile = null;
    
    client.on('Page.downloadWillBegin', (params) => {
      console.log(`📥 Download starting: ${params.url}`);
    });
    
    client.on('Page.downloadProgress', (params) => {
      if (params.state === 'completed') {
        downloadedFile = params.guid;
        console.log(`✅ Download completed with ID: ${params.guid}`);
      }
    });
    
    // Wait for Excel button to be available and click it
    console.log('📊 Looking for Excel export button...');
    
    try {
      // Wait for the Excel button to appear (it should be available after search results load)
      await page.waitForSelector('button.dt-button.buttons-excel', { 
        visible: true, 
        timeout: 10000 
      });
      
      console.log('✅ Excel button found!');
      console.log('📥 Clicking Excel export button...');
      
      // Add a small delay to ensure the button is fully interactive
      await delay(1000);
      
      // Click the Excel button
      await page.click('button.dt-button.buttons-excel');
      
      console.log('✅ Excel button clicked successfully!');
      console.log('⏳ Excel file should start downloading...');
      
      // Wait a moment for the download to initiate and complete
      await delay(5000);
      
      // Find the downloaded file and rename it
      try {
        const files = fs.readdirSync(downloadPath);
        const excelFiles = files.filter(file => file.endsWith('.xlsx') || file.endsWith('.xls'));
        
        if (excelFiles.length > 0) {
          // Get the most recently created file
          const mostRecentFile = excelFiles
            .map(file => ({
              name: file,
              time: fs.statSync(path.join(downloadPath, file)).mtime.getTime()
            }))
            .sort((a, b) => b.time - a.time)[0];
          
          const oldPath = path.join(downloadPath, mostRecentFile.name);
          const newPath = path.join(downloadPath, customFilename);
          
          // Call excel-transformer.js to transform the downloaded file
          const { spawnSync } = require('child_process');
          const transformerPath = path.join(__dirname, '../src/excel-transformer.js');
          const result = spawnSync('node', [transformerPath, cliMedico], {
            stdio: 'inherit',
            env: process.env,
            cwd: process.cwd(),
          });
          if (result.error) {
            console.error('❌ Error running excel-transformer.js:', result.error);
          }
          
          // Rename the file
          fs.renameSync(oldPath, newPath);
          
          console.log('📁 Excel file downloaded and renamed successfully!');
          console.log(`📂 Original filename: ${mostRecentFile.name}`);
          console.log(`📄 New filename: ${customFilename}`);
          console.log(`💾 Full path: ${newPath}`);
        } else {
          console.log('⚠️ No Excel files found in downloads folder');
        }
      } catch (renameError) {
        console.log('⚠️ Error renaming file:', renameError.message);
        console.log('📁 File downloaded but could not be renamed');
        console.log(`💾 Check the downloads folder: ${downloadPath}`);
      }
      
    } catch (error) {
      console.log('⚠️ Excel button not found or not clickable:', error.message);
      console.log('🔍 This might be because:');
      console.log('   • Search results are still loading');
      console.log('   • No data to export');
      console.log('   • Button selector has changed');
    }
    
    console.log('');
    console.log('📌 The browser will stay open for manual interaction.');
    console.log('💡 Press Ctrl+C in the terminal to close when you\'re done.');
    

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