import React, { useEffect, useState } from 'react'
import { Routes, Route, Link, useNavigate } from 'react-router-dom'
import { initDB } from './db/neon'
import MainScreen from './pages/MainScreen'
import EditorScreen from './pages/EditorScreen'
import ReportsScreen from './pages/ReportsScreen'

export default function App() {
  const [ready, setReady] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    initDB()
      .then(() => setReady(true))
      .catch(e => setError('Database connection failed: ' + e.message))
  }, [])

  if (error) return (
    <div style={{ padding: 40, textAlign: 'center', color: 'red' }}>
      <h2>Connection Error</h2>
      <p>{error}</p>
      <p style={{ marginTop: 12, color: '#666' }}>Check your internet connection and try again.</p>
    </div>
  )

  if (!ready) return (
    <div className="loading">
      <h2>🏭 Machine Checklist System</h2>
      <p style={{ marginTop: 12 }}>Connecting to database...</p>
    </div>
  )

  return (
    <>
      <nav className="navbar">
        <h1>🏭 Machine Checklist System</h1>
        <div>
          <Link to="/">Checklists</Link>
          <Link to="/reports">Reports</Link>
        </div>
      </nav>
      <Routes>
        <Route path="/" element={<MainScreen />} />
        <Route path="/editor/:id/:name" element={<EditorScreen />} />
        <Route path="/reports" element={<ReportsScreen />} />
      </Routes>
    </>
  )
}
