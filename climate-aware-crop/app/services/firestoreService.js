import { db } from '../config/firebase'
import { collection, query, where, onSnapshot } from 'firebase/firestore'

/**
 * Subscribe to real-time crop cycle data for a user
 * @param {string} userId - The user's UID
 * @param {function} callback - Callback function to handle data updates
 * @returns {function} Unsubscribe function
 */
export const subscribeToCropCycle = (userId, callback) => {
  try {
    const cropsCollection = collection(db, 'crops')
    const q = query(cropsCollection, where('userId', '==', userId))

    // Subscribe to real-time updates
    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        // Get the first crop document (most recent)
        const cropData = snapshot.docs[0].data()
        callback(cropData)
      } else {
        callback(null)
      }
    }, (error) => {
      console.error('Error fetching crop cycle data:', error)
      callback(null)
    })

    return unsubscribe
  } catch (error) {
    console.error('Error setting up crop cycle subscription:', error)
    return () => {} // Return no-op unsubscribe
  }
}
