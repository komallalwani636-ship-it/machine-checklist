import React, { useEffect, useState, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { query } from '../db/neon'
import { exportExcel, exportPDF } from '../utils/exportUtils'

export default function EditorScreen() {
  const { id, name } = useParams()
  const checklistName = decodeURIComponent(name)
  const navigate = useNavigate()

  const [tableData, setTableData] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    query('SELECT * FROM checklists WHERE checklist_id = $1', [id])
      .then(res => {
        const row = res.rows?.[0]
        if (row) {
          const structure = JSON.parse(row.table_structure || '[]')
          const headers = structure.map(s => s.columnName)
          const emptyRows = Array.from({ length: 5 }, () => Array(headers.length).fill(''))
          setTableData([headers, ...emptyRows])
        }
      })
      .finally(() => setLoading(false))
  }, [id])

  const updateCell = (rowIdx, colIdx, value) => {
    setTableData(prev => {
      const updated = prev.map(r => [...r])
      updated[rowIdx][colIdx] = value
      return updated
    })
  }

  const addRow = () => {
    const cols = tableData[0]?.length || 3
    setTableData(prev => [...prev, Array(cols).fill('')])
  }

  const deleteRow = (rowIdx) => {
    if (rowIdx === 0) return
    setTableData(prev => prev.filter((_, i) => i !== rowIdx))
  }

  const addColumn = () => {
    const colName = prompt('Enter column name:')
    if (!colName?.trim()) return
    setTableData(prev => prev.map((row, i) => [...row, i === 0 ? colName.trim() : '']))
  }

  const deleteColumn = (colIdx) => {
    if (tableData[0]?.length <= 1) return
    setTableData(prev => prev.map(row => row.filter((_, i) => i !== colIdx)))
  }

  const saveReport = async () => {
    setSaving(true)
    try {
      const reportId = crypto.randomUUID()
      await query(
        `INSERT INTO reports (report_id,checklist_id,checklist_name,date_created,created_by,table_data)
         VALUES ($1,$2,$3,$4,$5,$6)`,
        [reportId, id, checklistName, Date.now(), 'Worker', JSON.stringify(tableData)]
      )
      alert('✅ Report saved successfully!')
    } catch (e) {
      alert('❌ Save failed: ' + e.message)
    } finally {
      setSaving(false)
    }
  }

  const handleExportExcel = () => {
    const date = new Date().toISOString().split('T')[0]
    exportExcel(tableData, `${checklistName.replace(/ /g, '_')}_${date}_Report`)
  }

  const handleExportPDF = () => {
    const date = new Date().toISOString().split('T')[0]
    exportPDF(tableData, checklistName, `${checklistName.replace(/ /g, '_')}_${date}_Report`)
  }

  if (loading) return <div className="loading">Loading checklist...</div>

  return (
    <div className="container" style={{ marginTop: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
        <button className="btn btn-sm" onClick={() => navigate('/')}>← Back</button>
        <div className="page-title" style={{ margin: 0 }}>{checklistName}</div>
      </div>

      <div className="toolbar">
        <button className="btn btn-primary btn-sm" onClick={addRow}>+ Add Row</button>
        <button className="btn btn-primary btn-sm" onClick={addColumn}>+ Add Column</button>
        <button className="btn btn-success" onClick={saveReport} disabled={saving}>
          {saving ? 'Saving...' : '💾 Save Report'}
        </button>
        <button className="btn btn-warning" onClick={handleExportExcel}>📊 Export Excel</button>
        <button className="btn btn-danger" onClick={handleExportPDF}>📄 Export PDF</button>
      </div>

      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th style={{ width: 40 }}>#</th>
              {tableData[0]?.map((header, colIdx) => (
                <th key={colIdx}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <input
                      value={header}
                      onChange={e => updateCell(0, colIdx, e.target.value)}
                      style={{ background: 'transparent', color: 'white', border: 'none', fontWeight: 'bold', minWidth: 100 }}
                    />
                    <span
                      style={{ cursor: 'pointer', opacity: 0.7, fontSize: 12 }}
                      onClick={() => deleteColumn(colIdx)}
                      title="Delete column"
                    >✕</span>
                  </div>
                </th>
              ))}
              <th style={{ width: 50 }}>Del</th>
            </tr>
          </thead>
          <tbody>
            {tableData.slice(1).map((row, rowIdx) => (
              <tr key={rowIdx + 1}>
                <td style={{ textAlign: 'center', color: '#999', fontSize: 12 }}>{rowIdx + 1}</td>
                {row.map((cell, colIdx) => (
                  <td key={colIdx}>
                    <input
                      value={cell}
                      onChange={e => updateCell(rowIdx + 1, colIdx, e.target.value)}
                      placeholder="Enter value..."
                    />
                  </td>
                ))}
                <td style={{ textAlign: 'center' }}>
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => deleteRow(rowIdx + 1)}
                    style={{ padding: '4px 8px' }}
                  >✕</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ marginTop: 12, color: '#999', fontSize: 13 }}>
        {tableData.length - 1} rows · {tableData[0]?.length || 0} columns
      </div>
    </div>
  )
}
