/**
 * Detect season based on sowing date month
 * India-centric season detection
 * 
 * - Winter: November - February (10, 11, 0, 1)
 * - Summer: March - June (2, 3, 4, 5)
 * - Monsoon: July - October (6, 7, 8, 9)
 */
export function detectSeason(sowingDate) {
  if (!sowingDate) return null

  const date = new Date(sowingDate)
  const month = date.getMonth() // 0 = January, 11 = December

  if (month >= 10 || month <= 1) {
    return 'Winter'
  } else if (month >= 2 && month <= 5) {
    return 'Summer'
  } else if (month >= 6 && month <= 9) {
    return 'Monsoon'
  }

  return null
}

/**
 * Get list of valid seasons
 */
export function getSeasons() {
  return ['Winter', 'Summer', 'Monsoon']
}

/**
 * Get list of valid crop types
 * (can be extended from backend API later)
 */
export function getCropTypes() {
  return [
    'Rice',
    'Wheat',
    'Corn',
    'Sugarcane',
    'Cotton',
    'Soybean',
    'Mustard',
    'Chickpea',
    'Potato',
    'Onion',
    'Tomato',
    'Cabbage',
    'Carrot',
    'Other'
  ]
}

/**
 * Get list of valid soil types
 */
export function getSoilTypes() {
  return ['Sandy', 'Loamy', 'Clay']
}
