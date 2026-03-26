import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { query } from '../db/neon'

export default function MainScreen() {
  const [checklists, setChecklists] = useState([])
  const [filtered, setFiltered] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    query('SELECT * FROM checklists ORDER BY name')
      .then(res => {
        setChecklists(res.rows || [])
        setFiltered(res.rows || [])
      })
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (!search.trim()) {
      setFiltered(checklists)
    } else {
      setFiltered(checklists.filter(c =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.record_no?.toLowerCase().includes(search.toLowerCase())
      ))
    }
  }, [search, checklists])

  if (loading) return <div className="loading">Loading checklists...</div>

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, marginTop: 20 }}>
        <div className="page-title">📋 Machine Checklists</div>
        <button className="btn btn-primary" onClick={() => navigate('/reports')}>
          📊 View Reports
        </button>
      </div>

      <input
        className="search-box"
        placeholder="🔍 Search checklist..."
        value={search}
        onChange={e => setSearch(e.target.value)}
      />

      {filtered.length === 0 && <div className="empty">No checklists found</div>}

      {filtered.map((c, i) => (
        <div
          key={c.checklist_id}
          className="card"
          onClick={() => navigate(`/editor/${c.checklist_id}/${encodeURIComponent(c.name)}`)}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <h3>{i + 1}. {c.name}</h3>
              <p>
                <span className="badge">Record: {c.record_no}</span>
                <span className="badge">Rev: {c.revision}</span>
                <span className="badge">By: {c.maintained_by}</span>
              </p>
            </div>
            <span style={{ fontSize: 22 }}>→</span>
          </div>
        </div>
      ))}
    </div>
  )
}
