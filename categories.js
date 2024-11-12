const fs = require('fs');

// Load the checkins data
const checkinsData = JSON.parse(fs.readFileSync('checkins.json', 'utf8'));

// Extract unique categories from the checkins data with safety checks
const categories = [...new Set(checkinsData.map(checkin => {
    // Check if venue and categories exist and have length
    if (checkin?.venue?.categories?.length > 0) {
        return checkin.venue.categories[0].name;
    }
    return null;
}).filter(Boolean))];

// Create an object of categories to icons
const categoryIcons = {
    // Dining & Drinking
    'Restaurant': '🍽️',
    'Fast Food Restaurant': '🍔',
    'Pizza Place': '🍕',
    'Japanese Restaurant': '🍱',
    'Chinese Restaurant': '🥢',
    'Mexican Restaurant': '🌮',
    'Italian Restaurant': '🍝',
    'Café': '☕',
    'Coffee Shop': '☕',
    'Bar': '🍺',
    'Pub': '🍺',
    'Night Club': '🎉',
    'Food Court': '🍴',
    'Food Truck': '🚚',
    'Bakery': '🥖',
    'Ice Cream Shop': '🍦',
    'Juice Bar': '🥤',
    
    // Shopping & Retail
    'Shopping Mall': '🛍️',
    'Grocery Store': '🛒',
    'Supermarket': '🛒',
    'Convenience Store': '🏪',
    'Bookstore': '📚',
    'Electronics Store': '📱',
    'Clothing Store': '👕',
    'Shoe Store': '👟',
    'Jewelry Store': '💍',
    'Department Store': '🏬',
    'Furniture Store': '🪑',
    'Hardware Store': '🔧',
    'Pet Store': '🐾',
    'Toy Store': '🧸',
    
    // Entertainment & Arts
    'Movie Theater': '🎬',
    'Theater': '🎭',
    'Museum': '🏛️',
    'Art Gallery': '🎨',
    'Concert Hall': '🎵',
    'Casino': '🎰',
    'Arcade': '🎮',
    'Bowling Alley': '🎳',
    'Zoo': '🦁',
    'Aquarium': '🐠',
    'Amusement Park': '🎡',
    
    // Sports & Recreation
    'Gym': '💪',
    'Stadium': '🏟️',
    'Sports Center': '⚽',
    'Swimming Pool': '🏊',
    'Tennis Court': '🎾',
    'Golf Course': '⛳',
    'Ski Resort': '🎿',
    'Basketball Court': '🏀',
    'Baseball Field': '⚾',
    'Skating Rink': '⛸️',
    
    // Transportation
    'Airport': '✈️',
    'Train Station': '🚂',
    'Bus Station': '🚌',
    'Subway Station': '🚇',
    'Ferry Terminal': '⛴️',
    'Parking': '🅿️',
    'Gas Station': '⛽',
    'Car Rental': '🚗',
    'Bike Rental': '🚲',
    
    // Lodging
    'Hotel': '🏨',
    'Motel': '🏨',
    'Resort': '🌴',
    'Hostel': '🛏️',
    'Campground': '⛺',
    
    // Healthcare
    'Hospital': '🏥',
    'Medical Center': '⚕️',
    'Pharmacy': '💊',
    'Dentist': '🦷',
    'Veterinarian': '🐾',
    
    // Education
    'School': '🏫',
    'University': '🎓',
    'Library': '📚',
    'Bookstore': '📚',
    
    // Services
    'Bank': '🏦',
    'Post Office': '📮',
    'Hair Salon': '💇',
    'Spa': '💆',
    'Gym': '💪',
    'Laundromat': '🧺',
    'Car Wash': '🚿',
    
    // Outdoor & Recreation
    'Park': '🌳',
    'Beach': '🏖️',
    'Garden': '🌸',
    'Hiking Trail': '🥾',
    'Camping': '⛺',
    'Mountain': '⛰️',
    'Lake': '💧',
    
    // Religious Places
    'Church': '⛪',
    'Mosque': '🕌',
    'Temple': '🛕',
    'Synagogue': '🕍',
    
    // Business
    'Office Building': '🏢',
    'Conference Center': '🏢',
    'Factory': '🏭',
    'Construction Site': '🏗️',
    
    // Government
    'City Hall': '🏛️',
    'Police Station': '👮',
    'Fire Station': '🚒',
    'Post Office': '📮',
    'Embassy': '🏛️',
    
    // Catch-all
    'default': '📍'
};

// Export both the categories array and the icon object
module.exports = {
    categories,
    categoryIcons,
    // Helper function to get icon for a category
    getIcon: (category) => categoryIcons[category] || categoryIcons.default
};
