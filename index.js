import { fetchCheckins } from './fetch.js';
import { generateCalendarData } from './ical.js';
import { uploadFiles } from './upload.js';
import dotenv from 'dotenv';
dotenv.config();

async function main() {
  // Check if Foursquare environment variables are set
  const foursquareOauthToken = process.env.FOURSQUARE_OAUTH_TOKEN;
  const foursquareApiVersion = process.env.FOURSQUARE_API_VERSION;

  if (!foursquareOauthToken || !foursquareApiVersion) {
    console.warn('Warning: Foursquare environment variables are not set.');
    return;
  }

  try {
    // Fetch the checkins
    const checkins = await fetchCheckins();

    // Generate the calendar files
    const calendarFiles = generateCalendarData(checkins);

    // Check if AWS environment variables are set
    const awsAccessKeyId = process.env.AWS_ACCESS_KEY_ID;
    const awsSecretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
    const awsRegion = process.env.AWS_REGION;
    const s3BucketName = process.env.S3_BUCKET_NAME;

    if (!awsAccessKeyId || !awsSecretAccessKey || !awsRegion || !s3BucketName) {
      console.warn('Warning: AWS environment variables are not set.');
      return;
    }

    // Upload all files
    await uploadFiles(calendarFiles);
    
    console.log('👍 Updated calendar files in S3');
  } catch (error) {
    console.error('🚨 Error Details:');
    console.error('- Message:', error.message);
    console.error('- Type:', error.name);
    console.error('- Stack:', error.stack);
    throw error;
  }
}

main();
