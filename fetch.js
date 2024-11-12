const fs = require('fs');
const { resolve } = require('path');
const dotenv = require('dotenv');

dotenv.config();

// -------
// Config
// -------

console.log('🕐 [Foursquare] Refreshing data');

// ------------------------
// API Auth and Config
// ------------------------

const AUTH_PARAMS = {
  'v': process.env.FOURSQUARE_API_VERSION,
  'oauth_token': process.env.FOURSQUARE_OAUTH_TOKEN,
};

const CHECKINS_URL  = 'https://api.foursquare.com/v2/users/self/checkins';
const LIMIT = 250;

const CHECKINS_FILE_PATH = resolve(process.cwd(), 'checkins.json');

let existingCheckins = [];
try {
  existingCheckins = JSON.parse(fs.readFileSync(CHECKINS_FILE_PATH, 'utf-8'));
} catch (e) {
  // File doesn't exist yet, start fresh
  existingCheckins = [];
}

// Add near the top of the file, after the Config section:
const FETCH_ALL = process.argv.includes('--all');

/**
 * Fetches the total number of checkins for the authenticated user
 * Makes a single API call to get the checkins count
 * @returns {Promise<number>} Total number of checkins
 */
async function fetchCheckinCount() {
   const params = new URLSearchParams({
    ...AUTH_PARAMS,
  })

  const resp = await fetch(`${CHECKINS_URL}?${new URLSearchParams(params)}`);
  const json = await resp.json();
  return json.response.checkins.count;
}

/**
 * Fetches a batch of checkins from the Foursquare API
 * @param {number} offset - Starting position for fetching checkins
 * @returns {Promise<Array>} Array of checkin objects from Foursquare
 */
async function fetchCheckins(offset = 0) {
  console.log(`   [Foursquare] Fetching checkins ${offset} - ${offset + LIMIT}`);
  const params = new URLSearchParams({
    ...AUTH_PARAMS,
    limit: LIMIT,
    offset,
  })

  const resp = await fetch(`${CHECKINS_URL}?${new URLSearchParams(params)}`);
  const json = await resp.json();

  let checkins = json.response.checkins.items;

  return checkins;
}

/**
 * Main function that handles fetching and storing checkins
 * Has two modes:
 * 1. --all flag: Fetches all checkins and overwrites existing data
 * 2. Default: Only fetches new checkins since last run and prepends to existing data
 * @returns {Promise<void>}
 */
async function main() {
  // Get current checkin count from API
  const checkinCount = await fetchCheckinCount();
  
  if (FETCH_ALL) {
    console.log('🕐 [Foursquare] Fetching all checkins');
    let checkins = [];
    const fetchCount = Math.ceil(checkinCount / LIMIT);
    
    for (let i = 0; i < fetchCount; i++) {
      let items = await fetchCheckins(i * LIMIT);
      checkins.push(...items);
    }
    
    fs.writeFileSync(CHECKINS_FILE_PATH, JSON.stringify(checkins, null, 2));
    console.log(`✅ [Foursquare] Fetched all ${checkins.length} checkins`);
    return;
  }
  
  // Calculate how many new checkins we need to fetch
  const existingCount = existingCheckins.length;
  const newCheckinsCount = checkinCount - existingCount;
  
  if (newCheckinsCount <= 0) {
    console.log('✅ [Foursquare] No new checkins to fetch');
    return;
  }
  
  console.log(`🕐 [Foursquare] Fetching ${newCheckinsCount} new checkins`);
  
  // Calculate how many fetch calls we need to make
  const fetchCount = Math.ceil(newCheckinsCount / LIMIT);
  let newCheckins = [];
  
  // Get new checkins - start from 0 instead of existingCount
  for (let i = 0; i < fetchCount; i++) {
    let items = await fetchCheckins(i * LIMIT);
    newCheckins.push(...items);
  }
  
  // Only take the number of new checkins we need from the beginning
  newCheckins = newCheckins.slice(0, newCheckinsCount);
  
  // Combine existing and new checkins - put new ones at the beginning
  const allCheckins = [...newCheckins, ...existingCheckins];
  
  // Write to file
  fs.writeFileSync(CHECKINS_FILE_PATH, JSON.stringify(allCheckins, null, 2));
  console.log(`✅ [Foursquare] Fetched ${newCheckins.length} new checkins`);
}

main();
