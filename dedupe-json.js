const fs = require('fs');

// Read the checkins.json file
const checkins = JSON.parse(fs.readFileSync('checkins.json', 'utf8'));

// Create a Map to store unique checkins by id
const uniqueCheckinsMap = new Map();

// Iterate through checkins and keep only the latest entry for each id
checkins.forEach(checkin => {
    uniqueCheckinsMap.set(checkin.id, checkin);
});

// Convert Map values back to array
const uniqueCheckins = Array.from(uniqueCheckinsMap.values());

// Write the deduplicated data back to a new file
fs.writeFileSync('checkins-deduped.json', JSON.stringify(uniqueCheckins, null, 2));

console.log(`Original checkins count: ${checkins.length}`);
console.log(`Deduplicated checkins count: ${uniqueCheckins.length}`);
console.log(`Removed ${checkins.length - uniqueCheckins.length} duplicates`);
