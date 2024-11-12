const fs = require('fs');
const { getIcon } = require('./categories');

/* Depending on what you specify in the config variables, the location for calendar events
will be formatted differently:
    * 1. Check-in is in MY_CITY (e.g. San Francisco):
    *    - Leave location string empty to keep calendar entries clean for local events
    * 
    * 2. Check-in is in MY_COUNTRY but not in MY_CITY (e.g. within United States):
    *    - Format: "City, State"
    *    - Example: "Los Angeles, CA"
    * 
    * 3. Check-in is in a different country than MY_COUNTRY:
    *    - Format: "City, Country"
    *    - Example: "Paris, France"
    */
const CONFIG = {
    MY_CITY: 'San Francisco',
    MY_COUNTRY: 'United States'
};

// Read the checkins data
const checkinsData = JSON.parse(fs.readFileSync('checkins.json', 'utf8'));

// Helper function to format date to iCal format
function formatDate(timestamp) {
    // Convert Unix timestamp (in seconds) to milliseconds
    const date = new Date(timestamp * 1000);

    if (isNaN(date.getTime())) {
        console.error(`Invalid timestamp: ${timestamp}`);
        return null;
    }
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
}

// Generate unique identifier for each event
function generateUID() {
    return 'id' + Math.random().toString(36).substr(2, 9);
}

// Create iCal content
function generateICalContent(checkins) {
    let icalContent = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//Lokesh Dhakar//private app//EN',
        'CALSCALE:GREGORIAN'
    ];

    checkins.forEach(checkin => {
        const startDateTime = formatDate(checkin.createdAt);
        const endDateTime = formatDate(checkin.createdAt + 3600);
        const eventUID = generateUID();
        
        const primaryCategory = checkin.venue.categories[0]?.name || '';
        const categoryEmoji = getIcon(primaryCategory);

        const location = checkin.venue.location;
        let locationString = '';
        
        if (location.city === CONFIG.MY_CITY) {
            // Leave empty for default city
            locationString = '';
        } else if (location.country === CONFIG.MY_COUNTRY) {
            // City and state for domestic locations outside default city
            locationString = [location.city, location.state]
                .filter(Boolean)
                .join(', ');
        } else {
            // City and country for international locations
            locationString = [location.city, location.country]
                .filter(Boolean)
                .join(', ');
        }

        icalContent = icalContent.concat([
            'BEGIN:VEVENT',
            `UID:${eventUID}`,
            `DTSTAMP:${formatDate(Math.floor(Date.now() / 1000))}`,
            `DTSTART:${startDateTime}`,
            `DTEND:${endDateTime}`,
            `SUMMARY:${categoryEmoji} ${checkin.venue.name || 'Checkin'}`,
            `DESCRIPTION:${checkin.venue.url || ''}`,
            `LOCATION:${locationString}`,
            'END:VEVENT'
        ]);
    });

    icalContent.push('END:VCALENDAR');
    return icalContent.join('\r\n');
}

// Group checkins by 5-year periods
function groupCheckinsByPeriod(checkins) {
    const periods = {};
    
    checkins.forEach(checkin => {
        const date = new Date(checkin.createdAt * 1000);
        const year = date.getFullYear();
        const periodStart = Math.floor(year / 5) * 5;
        const periodKey = `${periodStart}-${periodStart + 4}`;
        
        if (!periods[periodKey]) {
            periods[periodKey] = [];
        }
        periods[periodKey].push(checkin);
    });
    
    return periods;
}

// Generate and save the iCal files for each period
const checkinsByPeriod = groupCheckinsByPeriod(checkinsData);

for (const [period, checkins] of Object.entries(checkinsByPeriod)) {
    const icalContent = generateICalContent(checkins);
    const filename = `calendar-${period}.ics`;
    fs.writeFileSync(filename, icalContent);
    console.log(`Generated ${filename} with ${checkins.length} checkins`);
}

console.log('All iCal files have been generated successfully!');
