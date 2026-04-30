const { execSync, exec } = require('child_process')
const path = require('path')
const fs = require('fs')

const SCRAPER_DIR = path.join(process.cwd(), '..', 'google-maps-scraper')
const OUTPUT_FILE = path.join(SCRAPER_DIR, 'output.json')

async function runScraper(searchQuery, maxResults = 100) {
  // Check if scraper directory exists
  if (!fs.existsSync(SCRAPER_DIR)) {
    throw new Error('Google Maps Scraper not found. Run: git clone https://github.com/omkarcloud/google-maps-scraper.git')
  }

  // Clean previous output
  if (fs.existsSync(OUTPUT_FILE)) {
    fs.unlinkSync(OUTPUT_FILE)
  }

  // Run the scraper
  try {
    execSync(
      `cd ${SCRAPER_DIR} && python main.py --query "${searchQuery}" --max ${maxResults} --output output.json`,
      { 
        timeout: 300000, // 5 minutes
        stdio: 'pipe'
      }
    )
  } catch (error) {
    // Try alternate command format
    execSync(
      `cd ${SCRAPER_DIR} && python3 main.py "${searchQuery}"`,
      { timeout: 300000, stdio: 'pipe' }
    )
  }

  // Read output
  if (!fs.existsSync(OUTPUT_FILE)) {
    throw new Error('Scraper produced no output file')
  }

  const rawData = fs.readFileSync(OUTPUT_FILE, 'utf-8')
  return JSON.parse(rawData)
}

module.exports = { runScraper }
