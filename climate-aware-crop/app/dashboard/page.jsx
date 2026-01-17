'use client'

import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useRouter } from 'next/navigation'

export default function DashboardPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [selectedSeason, setSelectedSeason] = useState('Monsoon')
  const [whatsappAlerts, setWhatsappAlerts] = useState(false)
  const [fieldObservations, setFieldObservations] = useState({
    visibleWilting: false,
    pestActivity: false,
    soilCracking: false,
    leafDiscoloration: false,
    standingWater: false,
    rainfall: '',
    notes: ''
  })

  // Mock data
  const cropData = {
    type: 'Wheat',
    sowingDate: 'Nov 15, 2025',
    daysAfterSowing: 64,
    soilType: 'Sandy Loam',
    location: 'Punjab, India'
  }

  const stressHistory = [
    { date: 'Jan 17', event: 'Season context applied: Monsoon', severity: 'info' },
    { date: 'Jan 16', event: 'Moisture stress detected', severity: 'warning' },
    { date: 'Jan 14', event: 'Optimal health - stable', severity: 'success' },
    { date: 'Jan 12', event: 'Fertigation applied', severity: 'info' },
    { date: 'Jan 10', event: 'Field mapping initialized', severity: 'success' }
  ]

  const handleObservationSubmit = (e) => {
    e.preventDefault()
    console.log('Field observations submitted:', fieldObservations)
    // TODO: Submit to Firebase
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
            Crop Stress Dashboard
          </h1>
          <p className="text-gray-600 text-sm">
            Real-time monitoring and climate-informed stress assessment for precision agriculture
          </p>
        </header>

        {/* 2️⃣ STATUS SUMMARY BAR */}
        <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-6 flex-wrap">
              <div>
                <span className="text-xs text-gray-500 block mb-1">Crop</span>
                <span className="text-sm font-medium text-gray-900">Wheat</span>
              </div>
              <div>
                <span className="text-xs text-gray-500 block mb-1">Stage</span>
                <span className="text-sm font-medium text-gray-900">Tillering</span>
              </div>
              <div>
                <span className="text-xs text-gray-500 block mb-1">Season</span>
                <select
                  value={selectedSeason}
                  onChange={(e) => setSelectedSeason(e.target.value)}
                  className="text-sm font-medium text-gray-900 border border-gray-300 rounded px-2 py-1"
                >
                  <option>Monsoon</option>
                  <option>Winter</option>
                  <option>Summer</option>
                </select>
              </div>
              <div>
                <span className="text-xs text-gray-500 block mb-1">Stress</span>
                <span className="text-sm font-medium text-gray-900">Moisture Stress</span>
              </div>
              <div>
                <span className="text-xs text-gray-500 block mb-1">Severity</span>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                  <span className="text-sm font-medium text-gray-900">Medium</span>
                </div>
              </div>
              <div>
                <span className="text-xs text-gray-500 block mb-1">Confidence</span>
                <span className="text-sm font-medium text-gray-900">89%</span>
              </div>
            </div>
            <div className="text-xs text-gray-500">
              Last updated 4m ago
            </div>
          </div>
        </div>

        {/* 3️⃣ PRIMARY ADVISORY CARD */}
        <div className="bg-white border-l-4 border-l-amber-500 border border-gray-200 rounded-lg p-6 mb-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">
                Recommended Action: Increase irrigation frequency by 20% for 48 hours.
              </h2>
              <p className="text-sm text-gray-600 mb-3">
                Apply at 6:00 AM and 4:00 PM daily for the next two days
              </p>
              <p className="text-sm text-gray-700">
                This recommendation is based on declining soil moisture levels detected by sensors, 
                combined with upcoming high temperatures and low rainfall forecast. Early intervention 
                can prevent yield loss during the critical tillering stage.
              </p>
            </div>
            <div className="flex flex-col items-end gap-3">
              <select className="text-xs border border-gray-300 rounded px-3 py-1.5">
                <option>English (US)</option>
                <option>Hindi</option>
                <option>Punjabi</option>
              </select>
              <button className="flex items-center gap-2 text-xs font-medium text-gray-700 border border-gray-300 rounded px-4 py-2 hover:bg-gray-50">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                </svg>
                Listen to Advisory
              </button>
            </div>
          </div>
        </div>

        {/* 4️⃣ MAIN GRID (2 Columns) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          
          {/* LEFT COLUMN */}
          <div className="space-y-6">
            
            {/* 4.1 CROP DETAILS CARD */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-base font-semibold text-gray-900 mb-4">Crop Details</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Crop Type</span>
                  <span className="text-sm font-medium text-gray-900">{cropData.type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Sowing Date</span>
                  <span className="text-sm font-medium text-gray-900">{cropData.sowingDate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Days After Sowing</span>
                  <span className="text-sm font-medium text-gray-900">{cropData.daysAfterSowing} days</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Soil Type</span>
                  <span className="text-sm font-medium text-gray-900">{cropData.soilType}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Location</span>
                  <div className="flex items-center gap-1">
                    <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className="text-sm font-medium text-gray-900">{cropData.location}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 4.2 FIELD OBSERVATIONS INPUT */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-base font-semibold text-gray-900 mb-4">Field Observations</h3>
              <form onSubmit={handleObservationSubmit}>
                <div className="space-y-3 mb-4">
                  {[
                    { key: 'visibleWilting', label: 'Visible Wilting' },
                    { key: 'pestActivity', label: 'Pest Activity' },
                    { key: 'soilCracking', label: 'Soil Cracking' },
                    { key: 'leafDiscoloration', label: 'Leaf Discoloration' },
                    { key: 'standingWater', label: 'Standing Water' }
                  ].map(({ key, label }) => (
                    <label key={key} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={fieldObservations[key]}
                        onChange={(e) => setFieldObservations({ ...fieldObservations, [key]: e.target.checked })}
                        className="w-4 h-4 border-gray-300 rounded text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">{label}</span>
                    </label>
                  ))}
                </div>

                <div className="mb-4">
                  <label className="block text-sm text-gray-700 mb-1">Recent Rainfall (mm)</label>
                  <input
                    type="number"
                    value={fieldObservations.rainfall}
                    onChange={(e) => setFieldObservations({ ...fieldObservations, rainfall: e.target.value })}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0"
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm text-gray-700 mb-1">Additional Notes</label>
                  <textarea
                    value={fieldObservations.notes}
                    onChange={(e) => setFieldObservations({ ...fieldObservations, notes: e.target.value })}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows="3"
                    placeholder="Enter any observations..."
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-blue-600 text-white text-sm font-medium px-4 py-2 rounded hover:bg-blue-700"
                >
                  Submit Observation
                </button>
              </form>
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div className="space-y-6">
            
            {/* 5.1 STRESS HISTORY (Timeline) */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-base font-semibold text-gray-900 mb-4">Stress History</h3>
              <div className="space-y-4">
                {stressHistory.map((item, index) => (
                  <div key={index} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className={`w-2 h-2 rounded-full ${
                        item.severity === 'success' ? 'bg-green-500' :
                        item.severity === 'warning' ? 'bg-amber-500' :
                        'bg-blue-500'
                      }`}></div>
                      {index < stressHistory.length - 1 && (
                        <div className="w-px h-8 bg-gray-200"></div>
                      )}
                    </div>
                    <div className="flex-1 pb-4">
                      <div className="text-xs text-gray-500 mb-1">{item.date}</div>
                      <div className="text-sm text-gray-900">{item.event}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 5.2 NEXT 48H FORECAST CARD */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-base font-semibold text-gray-900 mb-4">Next 48H Forecast</h3>
              <div className="flex items-center gap-4">
                <div className="flex items-center justify-center w-16 h-16 bg-amber-100 rounded-full">
                  <svg className="w-8 h-8 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
                <div>
                  <div className="text-2xl font-semibold text-gray-900">32°C</div>
                  <div className="text-sm text-gray-600">Partly Sunny</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 6️⃣ EXPLAINABILITY CARD */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
          <h3 className="text-base font-semibold text-gray-900 mb-3">
            Why this alert was generated
          </h3>
          <p className="text-sm text-gray-700 mb-4 leading-relaxed">
            The moisture stress alert was triggered based on declining readings from soil moisture 
            sensors (below 30% threshold), corroborated by Sentinel-2 NDVI imagery showing reduced 
            vegetation vigor. The 48-hour weather forecast predicts high temperatures (32-35°C) with 
            minimal rainfall, increasing evapotranspiration risk during the critical tillering stage. 
            This combination of factors indicates immediate intervention is required.
          </p>
          <div className="text-xs text-gray-500 border-t border-gray-200 pt-3">
            Seasonal baseline applied: Monsoon
          </div>
        </div>

        {/* 7️⃣ DATA SOURCES USED */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
          <h3 className="text-base font-semibold text-gray-900 mb-4">Data Sources Used</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
            {[
              { icon: '☁️', name: 'Weather Data', source: 'OpenWeather / IMD' },
              { icon: '🌍', name: 'Soil & Land Data', source: 'SoilGrids / Soil Health Card' },
              { icon: '🌱', name: 'Crop Growth Model', source: 'FAO AquaCrop' },
              { icon: '👨‍🌾', name: 'Farmer Inputs', source: 'Field Observations' }
            ].map((item, index) => (
              <div key={index} className="flex items-center gap-3 p-2">
                <div className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded text-lg">
                  {item.icon}
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-900">{item.name}</div>
                  <div className="text-xs text-gray-500">{item.source}</div>
                </div>
              </div>
            ))}
          </div>
          <div className="text-xs text-gray-500 border-t border-gray-200 pt-3">
            No private data is shared.
          </div>
        </div>

        {/* 8️⃣ WHATSAPP ALERT TOGGLE */}
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 flex items-center justify-center bg-green-100 rounded-full">
                <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                </svg>
              </div>
              <span className="text-sm font-medium text-gray-900">
                Receive automated WhatsApp alerts
              </span>
            </div>
            <button
              onClick={() => setWhatsappAlerts(!whatsappAlerts)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                whatsappAlerts ? 'bg-blue-600' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  whatsappAlerts ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}
