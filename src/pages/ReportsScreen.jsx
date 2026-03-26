import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { query } from '../db/neon'
import { exportExcel, exportPDF } from '../utils/exportUtils'
import { format } from 'date-fns'

export default function ReportsScreen() {
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    query('SELECT * FROM reports ORDER BY date_created DESC')
      .then(res => setReports(res.rows || []))
      .finally(() => setLoading(false))
  }, [])

  const filtered = reports.filter(r =>
    r.checklist_name?.toLowerCase().includes(search.toLowerCase())
  )

  const downloadExcel = (report) => {
    const tableData = JSON.parse(report.table_data || '[]')
    const date = format(new Date(parseInt(report.date_created)), 'yyyy-MM-dd')
    exportExcel(tableData, `${report.checklist_name.replace(/ /g, '_')}_${date}_Report`)
  }

  const downloadPDF = (report) => {
    const tableData = JSON.parse(report.table_data || '[]')
    const date = format(new Date(parseInt(report.date_created)), 'yyyy-MM-dd')
    exportPDF(tableData, report.checklist_name, `${report.checklist_name.replace(/ /g, '_')}_${date}_Report`)
  }

  const openReport = (report) => {
    navigate(`/editor/${report.checklist_id}/${encodeURIComponent(report.checklist_name)}`)
  }

  if (loading) return <div className="loading">Loading reports...</div>

  return (
    <div className="container" style={{ marginTop: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div className="page-title">📊 Report History</div>
        <button className="btn btn-primary btn-sm" onClick={() => navigate('/')}>← Back</button>
      </div>

      <input
        className="search-box"
        placeholder="🔍 Search reports..."
        value={search}
        onChange={e => setSearch(e.target.value)}
      />

      {filtered.length === 0 && <div className="empty">No reports found</div>}

      {filtered.map(report => {
        const date = format(new Date(parseInt(report.date_created)), 'dd MMM yyyy, hh:mm a')
        return (
          <div key={report.report_id} className="card">
            <h3>{report.checklist_name}</h3>
            <p style={{ marginTop: 4 }}>
              <span className="badge">📅 {date}</span>
              <span className="badge">👤 {report.created_by}</span>
            </p>
            <div className="report-actions">
              <button className="btn btn-primary btn-sm" onClick={() => openReport(report)}>
                ✏️ Open
              </button>
              <button className="btn btn-success btn-sm" onClick={() => downloadExcel(report)}>
                📊 Excel
              </button>
              <button className="btn btn-danger btn-sm" onClick={() => downloadPDF(report)}>
                📄 PDF
              </button>
            </div>
          </div>
        )
      })}
    </div>
  )
}
