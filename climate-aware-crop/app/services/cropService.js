import { db } from '../config/firebase'
import { addDoc, collection, serverTimestamp } from 'firebase/firestore'

/**
 * Save a new crop cycle to Firestore
 * 
 * @param {Object} cropData - Crop cycle data
 * @param {string} cropData.userId - Logged-in farmer's user ID
 * @param {string} cropData.crop_type - Type of crop
 * @param {string} cropData.soil_type - Type of soil
 * @param {Date} cropData.sowing_date - Date when crop is sown
 * @param {string} cropData.season - Season (auto-detected or farmer-selected)
 * @param {string} cropData.season_source - "auto" or "farmer"
 * @param {Object} cropData.location - Location info
 * @param {string} cropData.location.village - Village/area name
 * @param {number} cropData.location.lat - Latitude
 * @param {number} cropData.location.lng - Longitude
 * @returns {Promise<string>} Document ID of saved crop cycle
 */
export async function saveCropCycle(cropData) {
  try {
    const cropCyclesRef = collection(db, 'crop_cycles')
    
    const docData = {
      userId: cropData.userId,
      crop_type: cropData.crop_type,
      soil_type: cropData.soil_type,
      sowing_date: new Date(cropData.sowing_date), // Firestore stores as timestamp
      season: cropData.season,
      season_source: cropData.season_source,
      location: {
        village: cropData.location.village,
        lat: parseFloat(cropData.location.lat) || 0,
        lng: parseFloat(cropData.location.lng) || 0,
      },
      createdAt: serverTimestamp(),
    }

    const docRef = await addDoc(cropCyclesRef, docData)
    console.log('Crop cycle saved:', docRef.id)
    return docRef.id
  } catch (error) {
    console.error('Error saving crop cycle:', error)
    throw error
  }
}

/**
 * Validate crop cycle data before saving
 * 
 * @param {Object} data - Crop data to validate
 * @returns {Object} { isValid: boolean, errors: string[] }
 */
export function validateCropData(data) {
  const errors = []

  if (!data.crop_type?.trim()) {
    errors.push('Crop type is required')
  }

  if (!data.soil_type?.trim()) {
    errors.push('Soil type is required')
  }

  if (!data.sowing_date) {
    errors.push('Sowing date is required')
  }

  if (!data.season?.trim()) {
    errors.push('Season is required')
  }

  if (!data.location?.village?.trim()) {
    errors.push('Village/Location name is required')
  }

  // Validate that sowing date is not in the future
  const sowingDate = new Date(data.sowing_date)
  if (sowingDate > new Date()) {
    errors.push('Sowing date cannot be in the future')
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}
