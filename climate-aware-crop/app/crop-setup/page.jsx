'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../context/AuthContext'
import { ProtectedRoute } from '../components/ProtectedRoute'
import { saveCropCycle, validateCropData } from '../services/cropService'
import { detectSeason, getCropTypes, getSoilTypes, getSeasons } from '../utils/seasonHelper'
import styles from './cropsetup.module.css'

function CropSetupForm() {
  const router = useRouter()
  const { user } = useAuth()

  const [formData, setFormData] = useState({
    crop_type: '',
    soil_type: '',
    sowing_date: '',
    season: '',
    location: {
      village: '',
      lat: '',
      lng: '',
    },
  })

  const [seasonSource, setSeasonSource] = useState('auto')
  const [errors, setErrors] = useState([])
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  // Auto-detect season when sowing date changes
  useEffect(() => {
    if (formData.sowing_date && seasonSource === 'auto') {
      const detectedSeason = detectSeason(formData.sowing_date)
      if (detectedSeason) {
        setFormData(prev => ({
          ...prev,
          season: detectedSeason,
        }))
      }
    }
  }, [formData.sowing_date, seasonSource])

  const handleInputChange = (e) => {
    const { name, value } = e.target

    if (name.startsWith('location_')) {
      const fieldName = name.replace('location_', '')
      setFormData(prev => ({
        ...prev,
        location: {
          ...prev.location,
          [fieldName]: value,
        },
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value,
      }))
    }
  }

  const handleSeasonChange = (e) => {
    const { value } = e.target
    setFormData(prev => ({
      ...prev,
      season: value,
    }))
    // If farmer manually changes season, mark as "farmer" source
    setSeasonSource('farmer')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrors([])
    setSuccess(false)

    // Validate
    const validation = validateCropData(formData)
    if (!validation.isValid) {
      setErrors(validation.errors)
      return
    }

    setLoading(true)

    try {
      // Save to Firestore
      const docId = await saveCropCycle({
        ...formData,
        userId: user.uid,
        season_source: seasonSource,
      })

      setSuccess(true)
      setFormData({
        crop_type: '',
        soil_type: '',
        sowing_date: '',
        season: '',
        location: {
          village: '',
          lat: '',
          lng: '',
        },
      })
      setSeasonSource('auto')

      // Redirect to dashboard after 2 seconds
      setTimeout(() => {
        router.push('/dashboard')
      }, 2000)
    } catch (error) {
      console.error('Error saving crop data:', error)
      setErrors(['Failed to save crop details. Please try again.'])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>🌾 Crop Setup</h1>
        <p className={styles.subtitle}>Tell us about your crop</p>

        {errors.length > 0 && (
          <div className={styles.errorBox}>
            <p className={styles.errorTitle}>⚠️ Please fix the following:</p>
            <ul>
              {errors.map((error, idx) => (
                <li key={idx}>{error}</li>
              ))}
            </ul>
          </div>
        )}

        {success && (
          <div className={styles.successBox}>
            <p>✅ Crop details saved successfully!</p>
            <p style={{ fontSize: '14px', marginTop: '8px' }}>Redirecting to dashboard...</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className={styles.form}>
          {/* Crop Type */}
          <div className={styles.formGroup}>
            <label htmlFor="crop_type" className={styles.label}>
              What are you growing? <span className={styles.required}>*</span>
            </label>
            <select
              id="crop_type"
              name="crop_type"
              value={formData.crop_type}
              onChange={handleInputChange}
              className={styles.select}
              required
            >
              <option value="">Select a crop</option>
              {getCropTypes().map(crop => (
                <option key={crop} value={crop}>
                  {crop}
                </option>
              ))}
            </select>
          </div>

          {/* Soil Type */}
          <div className={styles.formGroup}>
            <label htmlFor="soil_type" className={styles.label}>
              What type of soil? <span className={styles.required}>*</span>
            </label>
            <select
              id="soil_type"
              name="soil_type"
              value={formData.soil_type}
              onChange={handleInputChange}
              className={styles.select}
              required
            >
              <option value="">Select soil type</option>
              {getSoilTypes().map(soil => (
                <option key={soil} value={soil}>
                  {soil}
                </option>
              ))}
            </select>
            <p className={styles.hint}>
              Sandy: Light, drains quickly | Loamy: Balanced | Clay: Heavy, retains water
            </p>
          </div>

          {/* Sowing Date */}
          <div className={styles.formGroup}>
            <label htmlFor="sowing_date" className={styles.label}>
              When did you sow? <span className={styles.required}>*</span>
            </label>
            <input
              id="sowing_date"
              type="date"
              name="sowing_date"
              value={formData.sowing_date}
              onChange={handleInputChange}
              className={styles.input}
              required
            />
          </div>

          {/* Season */}
          <div className={styles.formGroup}>
            <label htmlFor="season" className={styles.label}>
              Season <span className={styles.required}>*</span>
              <span className={styles.badge}>{seasonSource === 'auto' ? '(auto-detected)' : '(your choice)'}</span>
            </label>
            <select
              id="season"
              name="season"
              value={formData.season}
              onChange={handleSeasonChange}
              className={styles.select}
              required
            >
              <option value="">Select season</option>
              {getSeasons().map(season => (
                <option key={season} value={season}>
                  {season}
                </option>
              ))}
            </select>
            {seasonSource === 'auto' && formData.sowing_date && (
              <p className={styles.hint}>We detected "{formData.season}" based on your sowing date. Change if needed.</p>
            )}
          </div>

          {/* Location */}
          <div className={styles.formGroup}>
            <label htmlFor="location_village" className={styles.label}>
              Village / Location <span className={styles.required}>*</span>
            </label>
            <input
              id="location_village"
              type="text"
              name="location_village"
              placeholder="e.g., Nashik, Maharashtra"
              value={formData.location.village}
              onChange={handleInputChange}
              className={styles.input}
              required
            />
          </div>

          {/* Coordinates (Optional) */}
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label htmlFor="location_lat" className={styles.label}>
                Latitude (Optional)
              </label>
              <input
                id="location_lat"
                type="number"
                step="0.0001"
                name="location_lat"
                placeholder="19.1136"
                value={formData.location.lat}
                onChange={handleInputChange}
                className={styles.input}
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="location_lng" className={styles.label}>
                Longitude (Optional)
              </label>
              <input
                id="location_lng"
                type="number"
                step="0.0001"
                name="location_lng"
                placeholder="73.5142"
                value={formData.location.lng}
                onChange={handleInputChange}
                className={styles.input}
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || success}
            className={styles.submitBtn}
          >
            {loading ? '💾 Saving...' : success ? '✅ Saved!' : '💾 Save Crop Details'}
          </button>
        </form>

        <p className={styles.footerNote}>
          💡 You can update this later from your dashboard.
        </p>
      </div>
    </div>
  )
}

export default function CropSetupPage() {
  return (
    <ProtectedRoute>
      <CropSetupForm />
    </ProtectedRoute>
  )
}
