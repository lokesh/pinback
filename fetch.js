import dotenv from 'dotenv';
import ora from 'ora';
dotenv.config();

// -------
// Config
// -------

// ------------------------
// API Auth and Config
// ------------------------

const AUTH_PARAMS = {
  'v': process.env.FOURSQUARE_API_VERSION,
  'oauth_token': process.env.FOURSQUARE_OAUTH_TOKEN,
};

const CHECKINS_URL = 'https://api.foursquare.com/v2/users/self/checkins';
const LIMIT = 250;

// Helper function to build API URL with params
function buildApiUrl(endpoint, additionalParams = {}) {
  const params = new URLSearchParams({
    ...AUTH_PARAMS,
    ...additionalParams
  });
  return `${endpoint}?${params}`;
}

/**
 * Fetches the total number of checkins for the authenticated user
 * Makes a single API call to get the checkins count
 * @returns {Promise<number>} Total number of checkins
 */
async function fetchCheckinCount() {
  const resp = await fetch(buildApiUrl(CHECKINS_URL));
  const json = await resp.json();
  return json.response.checkins.count;
}

/**
 * Fetches a batch of checkins from the Foursquare API
 * @param {number} offset - Starting position for fetching checkins
 * @returns {Promise<Array>} Array of checkin objects from Foursquare
 */
async function fetchCheckinBatch(offset = 0) {
  const resp = await fetch(buildApiUrl(CHECKINS_URL, { limit: LIMIT, offset }));
  const json = await resp.json();
  return json.response.checkins.items;
}

/**
 * Fetches all checkins from Foursquare API
 * @returns {Promise<Array>} Array of all checkin objects
 */
async function fetchCheckins() {
  const checkinCount = await fetchCheckinCount();
  console.log(`📍 Fetching ${checkinCount} checkins in batches of ${LIMIT}`);
  const fetchCount = Math.ceil(checkinCount / LIMIT);
  let checkins = [];
  
  const spinner = ora(`Fetching`).start();
  for (let i = 0; i < fetchCount; i++) {
    spinner.text = ` ${i * LIMIT} - ${i * LIMIT + LIMIT}`;
    let items = await fetchCheckinBatch(i * LIMIT);
    checkins.push(...items);
  }
  spinner.succeed(` Fetched ${checkins.length} checkins`);
  return checkins;
}

export { fetchCheckins };
