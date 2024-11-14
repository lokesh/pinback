import dotenv from 'dotenv';
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
async function fetchCheckinBatch(offset = 0) {
  console.log(`📍 Fetching checkins ${offset} - ${offset + LIMIT}`);
  const params = new URLSearchParams({
    ...AUTH_PARAMS,
    limit: LIMIT,
    offset,
  })

  const resp = await fetch(`${CHECKINS_URL}?${new URLSearchParams(params)}`);
  const json = await resp.json();
  return json.response.checkins.items;
}

/**
 * Fetches all checkins from Foursquare API
 * @returns {Promise<Array>} Array of all checkin objects
 */
async function fetchCheckins() {
  const checkinCount = await fetchCheckinCount();
  console.log(`📍 ${checkinCount} checkins - fetching in batches of ${LIMIT}`);
  const fetchCount = Math.ceil(checkinCount / LIMIT);
  let checkins = [];
  
  for (let i = 0; i < fetchCount; i++) {
    let items = await fetchCheckinBatch(i * LIMIT);
    checkins.push(...items);
  }
  
  console.log(`📍 Fetched ${checkins.length} checkins`);
  return checkins;
}

export { fetchCheckins };
