import { getIcon } from './categories.js';
import config from './config.js';

/* Depending on what you specify in the config variables, the location for calendar events
will be formatted differently:
    * 1. Check-in is in myCity (e.g. San Francisco):
    *    - Leave location string empty to keep calendar entries clean for local events
    * 
    * 2. Check-in is in myCountry but not in myCity (e.g. within United States):
    *    - Format: "City, State"
    *    - Example: "Los Angeles, CA"
    * 
    * 3. Check-in is in a different country than myCountry:
    *    - Format: "City, Country"
    *    - Example: "Paris, France"
    */

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

// Format location string based on config rules
function formatLocation(location) {
    if (location.city === config.location.myCity) {
        // Leave empty for default city
        return '';
    } else if (location.country === config.location.myCountry) {
        // City and state for domestic locations outside default city
        return [location.city, location.state]
            .filter(Boolean)
            .join(', ');
    } else {
        // City and country for international locations
        return [location.city, location.country]
            .filter(Boolean)
            .join(', ');
    }
}

// Create iCal content
function generateICalContent(checkins) {
    let icalContent = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//Pinback//private app//EN',
        'CALSCALE:GREGORIAN'
    ];

    checkins.forEach(checkin => {
        const startDateTime = formatDate(checkin.createdAt);
        
        // Convert minutes to seconds and ensure all values are numbers
        const durationInSeconds = Number(config.calendar.eventDurationInMinutes) * 60;
        const endTimestamp = Number(checkin.createdAt) + durationInSeconds;        
        const endDateTime = formatDate(endTimestamp);

        const eventUID = generateUID();
        
        const primaryCategory = checkin.venue.categories[0]?.name || '';
        const categoryEmoji = getIcon(primaryCategory);

        const locationString = formatLocation(checkin.venue.location);
        
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

// New main export function
function generateCalendarData(checkinsData) {
    const calendarFiles = [];
    const checkinsByPeriod = groupCheckinsByPeriod(checkinsData);

    for (const [period, checkins] of Object.entries(checkinsByPeriod)) {
        const icalContent = generateICalContent(checkins);
        const filename = `calendar-${period}.ics`;
        console.log(`📅 ${filename} generated with ${checkins.length} check-ins`);
        calendarFiles.push({
            filename,
            data: icalContent
        });
    }

    return calendarFiles;
}

export { generateCalendarData };
