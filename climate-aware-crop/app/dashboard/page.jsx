'use client'

import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useRouter } from 'next/navigation'

export default function FarmerInputDashboard() {
  const { user } = useAuth()
  const router = useRouter()

  // State management
  const [formData, setFormData] = useState({
    cropType: 'wheat',
    soilType: 'loam',
    sowingDate: '2025-10-06',
    location: 'Ludhiana, Punjab',
    season: 'summer'
  })

  const [autoDetectSeason, setAutoDetectSeason] = useState(false)
  const [activityLog, setActivityLog] = useState([
    {
      id: 1,
      timestamp: 'Just now',
      message: 'Form data updated',
      source: 'farmer_input',
      type: 'Farmer Input'
    },
    {
      id: 2,
      timestamp: '10 mins ago',
      message: 'Stress severity recalibrated',
      source: 'system',
      type: 'System'
    },
    {
      id: 3,
      timestamp: 'Dec 22, 2023',
      message: 'Season override applied',
      source: 'context',
      type: 'Context'
    }
  ])

  // Calculated values
  const sowingDateObj = new Date(formData.sowingDate)
  const today = new Date()
  const daysAfterSowing = Math.floor((today - sowingDateObj) / (1000 * 60 * 60 * 24))

  const getGrowthStage = (das) => {
    if (das <= 20) return 'Germination'
    if (das <= 45) return 'Vegetative (Tillering)'
    if (das <= 75) return 'Stem Elongation'
    if (das <= 105) return 'Flowering'
    if (das <= 135) return 'Grain Filling'
    return 'Maturity'
  }

  const handleFormChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))

    // Add activity log entry
    const actionMap = {
      cropType: `Crop type changed to ${value}`,
      soilType: `Soil type changed to ${value}`,
      sowingDate: `Sowing date updated`,
      location: `Location updated to ${value}`,
      season: `Season changed to ${value}`
    }

    if (name === 'season') {
      setActivityLog(prev => [{
        id: prev.length + 1,
        timestamp: 'Just now',
        message: actionMap[name],
        source: 'farmer_input',
        type: 'Farmer Input'
      }, ...prev])
    }
  }

  const handleUpdateMonitoring = () => {
    setActivityLog(prev => [{
      id: prev.length + 1,
      timestamp: 'Just now',
      message: 'Monitoring configuration updated',
      source: 'farmer_input',
      type: 'Farmer Input'
    }, ...prev])
  }

  const getActivityDotColor = (source) => {
    switch(source) {
      case 'farmer_input': return 'bg-blue-500'
      case 'system': return 'bg-amber-500'
      case 'context': return 'bg-green-500'
      default: return 'bg-gray-500'
    }
  }

  if (!user) {
    router.push('/login')
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        
        {/* 1️⃣ PAGE HEADER */}
        <header className="mb-8">
          <h1 className="text-3xl font-semibold text-gray-900 mb-2">
            Farmer-Input Dashboard
          </h1>
          <p className="text-gray-600 text-sm">
            Configure field parameters for precise stress monitoring
          </p>
        </header>

        {/* 2️⃣ STATUS SUMMARY BAR */}
        <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-6 flex-wrap">
              {/* Crop */}
              <div>
                <span className="text-xs text-gray-500 block mb-1">Crop</span>
                <span className="text-sm font-medium text-gray-900 capitalize">{formData.cropType}</span>
              </div>

              {/* Growth Stage */}
              <div>
                <span className="text-xs text-gray-500 block mb-1">Stage</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-900">{getGrowthStage(daysAfterSowing)}</span>
                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">Derived</span>
                </div>
              </div>

              {/* Season */}
              <div>
                <span className="text-xs text-gray-500 block mb-1">Season</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-900 capitalize">{formData.season}</span>
                  <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">Manual Override</span>
                </div>
              </div>

              {/* Stress */}
              <div>
                <span className="text-xs text-gray-500 block mb-1">Stress</span>
                <span className="text-sm font-medium text-gray-900">Moisture Stress</span>
              </div>

              {/* Severity */}
              <div>
                <span className="text-xs text-gray-500 block mb-1">Severity</span>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                  <span className="text-sm font-medium text-gray-900">High</span>
                </div>
              </div>
            </div>

            <div className="text-xs text-gray-500">
              Last updated 1m ago
            </div>
          </div>
        </div>

        {/* 3️⃣ PRIMARY ADVISORY CARD */}
        <div className="bg-white border-l-4 border-l-amber-500 border border-gray-200 rounded-lg p-6 mb-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">
                Recommended Action: Optimize Irrigation Frequency
              </h2>
              <p className="text-sm text-gray-700">
                During the {getGrowthStage(daysAfterSowing)} stage in {formData.season} season, 
                {' '}{formData.cropType} grown in {formData.soilType} soil requires careful water management. 
                Increase irrigation frequency by 20% over the next 48 hours to maintain optimal soil moisture levels 
                and prevent yield reduction from moisture stress.
              </p>
            </div>
            <button className="flex items-center gap-2 text-sm font-medium text-gray-700 border border-gray-300 rounded px-4 py-2 hover:bg-gray-50 flex-shrink-0">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
              </svg>
              Listen
            </button>
          </div>
        </div>

        {/* 4️⃣ MAIN GRID (2 Columns) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          
          {/* LEFT COLUMN */}
          <div className="space-y-6">
            
            {/* 4.1 FIELD CONFIGURATION CARD */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-semibold text-gray-900">Field Configuration</h3>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={autoDetectSeason}
                    onChange={(e) => setAutoDetectSeason(e.target.checked)}
                    className="w-4 h-4 border-gray-300 rounded text-blue-600"
                  />
                  <span className="text-xs text-gray-600">Auto-detect Season</span>
                </label>
              </div>

              <div className="space-y-4">
                {/* Crop Type */}
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Crop Type</label>
                  <select
                    name="cropType"
                    value={formData.cropType}
                    onChange={handleFormChange}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="wheat">Wheat</option>
                    <option value="rice">Rice</option>
                    <option value="maize">Maize</option>
                    <option value="cotton">Cotton</option>
                  </select>
                </div>

                {/* Soil Type */}
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Soil Type</label>
                  <select
                    name="soilType"
                    value={formData.soilType}
                    onChange={handleFormChange}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="clay">Clay</option>
                    <option value="sandy_loam">Sandy Loam</option>
                    <option value="loam">Loam</option>
                    <option value="sandy">Sandy</option>
                  </select>
                </div>

                {/* Sowing Date */}
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Sowing Date</label>
                  <input
                    type="date"
                    name="sowingDate"
                    value={formData.sowingDate}
                    onChange={handleFormChange}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Location */}
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Location</label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleFormChange}
                    placeholder="Village / Plot ID"
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Season */}
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Current Season</label>
                  <select
                    name="season"
                    value={formData.season}
                    onChange={handleFormChange}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="monsoon">Monsoon</option>
                    <option value="winter">Winter</option>
                    <option value="summer">Summer</option>
                  </select>
                </div>

                <button
                  onClick={handleUpdateMonitoring}
                  className="w-full mt-4 bg-blue-600 text-white text-sm font-medium px-4 py-2 rounded hover:bg-blue-700"
                >
                  Update Monitoring
                </button>
              </div>
            </div>

            {/* 4.2 CALCULATED METRICS */}
            <div className="space-y-3">
              {/* Days After Sowing */}
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Days After Sowing</span>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-semibold text-gray-900">{daysAfterSowing} Days</span>
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">Calculated</span>
                  </div>
                </div>
              </div>

              {/* Growth Stage */}
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Growth Stage</span>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-semibold text-gray-900">{getGrowthStage(daysAfterSowing)}</span>
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">Calculated</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 4.3 LOCATION WEATHER CARD */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-base font-semibold text-gray-900 mb-4">Location Weather</h3>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-amber-500" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z" />
                  </svg>
                </div>
                <div>
                  <div className="text-2xl font-semibold text-gray-900">32°C</div>
                  <div className="text-sm text-gray-600">{formData.location}</div>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div className="space-y-6">
            
            {/* 5.1 ACTIVITY LOG */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-base font-semibold text-gray-900 mb-4">Activity Log</h3>
              <div className="space-y-4">
                {activityLog.slice(0, 5).map((log, idx) => (
                  <div key={log.id} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className={`w-2 h-2 rounded-full ${getActivityDotColor(log.source)}`}></div>
                      {idx < activityLog.length - 1 && (
                        <div className="w-px h-12 bg-gray-200"></div>
                      )}
                    </div>
                    <div className="flex-1 pb-4">
                      <div className="text-xs text-gray-500 mb-1">{log.timestamp}</div>
                      <div className="text-sm text-gray-900 mb-1">{log.message}</div>
                      <div className="text-xs text-gray-600">
                        Source: {log.type}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 6️⃣ EXPLAINABILITY CARD */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-base font-semibold text-gray-900 mb-3">
                Why this alert was generated
              </h3>
              <p className="text-sm text-gray-700 mb-4 leading-relaxed">
                Current weather deviation of +3.5°C above seasonal average, combined with 
                your {formData.soilType} soil moisture retention characteristics, indicates 
                elevated evapotranspiration. During the {getGrowthStage(daysAfterSowing).toLowerCase()} stage, 
                {' '}{formData.cropType} requires consistent soil moisture. Satellite thermal 
                imagery suggests 12% deviation from expected thermal time accumulation.
              </p>
              
              <div className="space-y-2 border-t border-gray-200 pt-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Season Context</span>
                  <span className="font-medium text-gray-900 capitalize">
                    {formData.season} (Manual Override)
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Logic Confidence</span>
                  <span className="font-medium text-gray-900">94% (Input-driven)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

