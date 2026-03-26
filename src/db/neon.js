// API URL - points to our Express backend on Render
const API_URL = 'https://machine-checklist.onrender.com'

export async function query(sql, params = []) {
  const response = await fetch(`${API_URL}/api/query`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: sql, params })
  })
  if (!response.ok) {
    const err = await response.json()
    throw new Error(err.error || 'Query failed')
  }
  return response.json()
}

export async function initDB() {
  await query(`CREATE TABLE IF NOT EXISTS checklists (
    checklist_id TEXT PRIMARY KEY, name TEXT NOT NULL,
    record_no TEXT, revision TEXT, indexing_method TEXT,
    storage_location TEXT, maintained_by TEXT,
    retention_period TEXT, disposition_method TEXT, table_structure TEXT
  )`)

  await query(`CREATE TABLE IF NOT EXISTS reports (
    report_id TEXT PRIMARY KEY, checklist_id TEXT,
    checklist_name TEXT, date_created BIGINT, created_by TEXT,
    table_data TEXT, file_url_excel TEXT DEFAULT '', file_url_pdf TEXT DEFAULT ''
  )`)

  const res = await query('SELECT COUNT(*) as count FROM checklists')
  const count = parseInt(res.rows?.[0]?.count || '0')
  if (count === 0) await seedChecklists()
}

const CHECKLIST_NAMES = [
  'Laser beam Welder Check list',
  'Scale Breaker elongation Check list',
  'Trimmer Check list',
  'CPL 2 Trimmer inspection details',
  'Electrostatic oiler Check list',
  'Weigh bridge verification record',
  'Entry DPI Weight Verification Report',
  'Crane Checklist',
  'Equipment checklist for CPL',
  'Start up check list',
  'Acid tank and oiler tank cleaning',
  'Safety shower Check list',
  'Looper Swing arm roll check list',
  'Scale Breaker Roll Changing',
  'Scale Breaker Support roll Cleaning',
  'Inhibitor check list-1129',
  'Teflon/Felt Check list-1130'
]

const DEFAULT_STRUCTURE = JSON.stringify([
  { columnName: 'Parameter', type: 'text' },
  { columnName: 'Status', type: 'text' },
  { columnName: 'Remarks', type: 'text' }
])

async function seedChecklists() {
  for (let i = 0; i < CHECKLIST_NAMES.length; i++) {
    const id = `CL${String(i + 1).padStart(3, '0')}`
    await query(
      `INSERT INTO checklists (checklist_id,name,record_no,revision,indexing_method,
       storage_location,maintained_by,retention_period,disposition_method,table_structure)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) ON CONFLICT DO NOTHING`,
      [id, CHECKLIST_NAMES[i], `REC-${String(i+1).padStart(3,'0')}`,
       'Rev 1.0', 'Chronological', 'Factory Floor',
       'Maintenance Team', '2 Years', 'Archive', DEFAULT_STRUCTURE]
    )
  }
}
