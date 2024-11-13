import { fetchCheckins } from './fetch.js';
import { generateCalendarData } from './ical.js';
import { uploadFiles } from './upload.js';

async function main() {
  try {
    // Fetch the checkins
    const checkins = await fetchCheckins();
    
    // Generate the calendar files
    const calendarFiles = generateCalendarData(checkins);
    
    // Upload all files
    await uploadFiles(calendarFiles);
    
    console.log('Successfully updated calendar files');
  } catch (error) {
    console.error('Error processing calendars:', error);
    throw error;
  }
}

main();
