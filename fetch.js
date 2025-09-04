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
  console.log('🔍 Fetching checkin count...');
  const url = buildApiUrl(CHECKINS_URL);
  console.log('📡 API URL:', url);
  
  const resp = await fetch(url);
  console.log('📊 Response status:', resp.status);
  console.log('📊 Response headers:', Object.fromEntries(resp.headers.entries()));
  
  const json = await resp.json();
  console.log('📋 Full API response:', JSON.stringify(json, null, 2));
  
  // Check if response has the expected structure
  if (!json.response) {
    console.error('❌ No "response" property in API response');
    throw new Error('API response missing "response" property');
  }
  
  if (!json.response.checkins) {
    console.error('❌ No "checkins" property in response.checkins');
    console.log('🔍 Available properties in response:', Object.keys(json.response));
    throw new Error('API response missing "checkins" property in response');
  }
  
  if (typeof json.response.checkins.count === 'undefined') {
    console.error('❌ No "count" property in response.checkins');
    console.log('🔍 Available properties in response.checkins:', Object.keys(json.response.checkins));
    throw new Error('API response missing "count" property in response.checkins');
  }
  
  console.log('✅ Checkin count:', json.response.checkins.count);
  return json.response.checkins.count;
}

/**
 * Fetches a batch of checkins from the Foursquare API
 * @param {number} offset - Starting position for fetching checkins
 * @returns {Promise<Array>} Array of checkin objects from Foursquare
 */
async function fetchCheckinBatch(offset = 0) {
  console.log(`🔍 Fetching checkin batch with offset: ${offset}`);
  const url = buildApiUrl(CHECKINS_URL, { limit: LIMIT, offset });
  console.log('📡 Batch API URL:', url);
  
  const resp = await fetch(url);
  console.log(`📊 Batch response status: ${resp.status}`);
  
  if (!resp.ok) {
    console.error(`❌ API request failed with status: ${resp.status}`);
    const errorText = await resp.text();
    console.error('❌ Error response body:', errorText);
    throw new Error(`API request failed with status ${resp.status}: ${errorText}`);
  }
  
  const json = await resp.json();
  console.log(`📋 Batch API response structure:`, {
    hasResponse: !!json.response,
    hasCheckins: !!(json.response && json.response.checkins),
    hasItems: !!(json.response && json.response.checkins && json.response.checkins.items),
    itemsLength: json.response && json.response.checkins && json.response.checkins.items ? json.response.checkins.items.length : 'N/A'
  });
  
  // Check if response has the expected structure
  if (!json.response) {
    console.error('❌ No "response" property in batch API response');
    console.log('📋 Full batch response:', JSON.stringify(json, null, 2));
    throw new Error('Batch API response missing "response" property');
  }
  
  if (!json.response.checkins) {
    console.error('❌ No "checkins" property in batch response.checkins');
    console.log('🔍 Available properties in batch response:', Object.keys(json.response));
    throw new Error('Batch API response missing "checkins" property in response');
  }
  
  if (!Array.isArray(json.response.checkins.items)) {
    console.error('❌ "items" is not an array in batch response.checkins');
    console.log('🔍 Available properties in batch response.checkins:', Object.keys(json.response.checkins));
    console.log('🔍 Type of items:', typeof json.response.checkins.items);
    throw new Error('Batch API response "items" is not an array in response.checkins');
  }
  
  console.log(`✅ Successfully fetched ${json.response.checkins.items.length} checkins for this batch`);
  return json.response.checkins.items;
}

/**
 * Fetches all checkins from Foursquare API
 * @returns {Promise<Array>} Array of all checkin objects
 */
async function fetchCheckins() {
  console.log('🚀 Starting fetchCheckins process...');
  
  try {
    const checkinCount = await fetchCheckinCount();
    console.log(`📍 Fetching ${checkinCount} checkins in batches of ${LIMIT}`);
    const fetchCount = Math.ceil(checkinCount / LIMIT);
    console.log(`📦 Will make ${fetchCount} batch requests`);
    let checkins = [];
    
    const spinner = ora(`Fetching`).start();
    for (let i = 0; i < fetchCount; i++) {
      spinner.text = ` ${i * LIMIT} - ${i * LIMIT + LIMIT}`;
      console.log(`\n🔄 Processing batch ${i + 1}/${fetchCount}`);
      let items = await fetchCheckinBatch(i * LIMIT);
      checkins.push(...items);
      console.log(`📊 Total checkins collected so far: ${checkins.length}`);
    }
    spinner.succeed(` Fetched ${checkins.length} checkins`);
    console.log('✅ fetchCheckins process completed successfully');
    return checkins;
  } catch (error) {
    console.error('💥 Error in fetchCheckins process:', error.message);
    console.error('📋 Full error details:', error);
    throw error;
  }
}

export { fetchCheckins };
