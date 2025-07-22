const fs = require('fs').promises;
const path = require('path');

/**
 * Save data to JSON file
 */
async function saveToJSON(data, filename, directory = './data') {
  try {
    // Create directory if it doesn't exist
    await fs.mkdir(directory, { recursive: true });
    
    const filepath = path.join(directory, filename);
    await fs.writeFile(filepath, JSON.stringify(data, null, 2));
    
    console.log(`Data saved to ${filepath}`);
    return filepath;
  } catch (error) {
    console.error('Error saving to JSON:', error);
    throw error;
  }
}

/**
 * Save data to CSV file
 */
async function saveToCSV(data, filename, directory = './data') {
  try {
    if (!Array.isArray(data) || data.length === 0) {
      throw new Error('Data must be a non-empty array for CSV export');
    }

    // Create directory if it doesn't exist
    await fs.mkdir(directory, { recursive: true });
    
    // Get headers from first object
    const headers = Object.keys(data[0]);
    
    // Create CSV content
    const csvContent = [
      headers.join(','),
      ...data.map(row => 
        headers.map(header => {
          const value = row[header];
          // Escape quotes and wrap in quotes if contains comma or quote
          if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
            return `"${value.replace(/"/g, '""')}"`;
          }
          return value;
        }).join(',')
      )
    ].join('\n');
    
    const filepath = path.join(directory, filename);
    await fs.writeFile(filepath, csvContent);
    
    console.log(`Data saved to ${filepath}`);
    return filepath;
  } catch (error) {
    console.error('Error saving to CSV:', error);
    throw error;
  }
}

/**
 * Add delay between operations
 */
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Generate random delay between min and max milliseconds
 */
function randomDelay(min = 1000, max = 3000) {
  const ms = Math.floor(Math.random() * (max - min + 1)) + min;
  return delay(ms);
}

/**
 * Retry function with exponential backoff
 */
async function retry(fn, maxAttempts = 3, baseDelay = 1000) {
  let lastError;
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      if (attempt === maxAttempts) {
        break;
      }
      
      const delayMs = baseDelay * Math.pow(2, attempt - 1);
      console.log(`Attempt ${attempt} failed, retrying in ${delayMs}ms...`);
      await delay(delayMs);
    }
  }
  
  throw lastError;
}

/**
 * Get current timestamp string
 */
function getTimestamp() {
  return new Date().toISOString().replace(/[:.]/g, '-');
}

module.exports = {
  saveToJSON,
  saveToCSV,
  delay,
  randomDelay,
  retry,
  getTimestamp
};