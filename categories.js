import config from './config.js';

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
    'default': config.calendar.defaultEmoji
};

// Export the objects and function
export const getIcon = (category) => categoryIcons[category] || categoryIcons.default;
export { categoryIcons };
