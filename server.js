import express from 'express'
import cors from 'cors'
import pg from 'pg'

const { Pool } = pg

const app = express()
app.use(cors())
app.use(express.json())

const pool = new Pool({
  connectionString: 'postgresql://neondb_owner:npg_gmZ90ycXKhBp@ep-proud-tree-a1it2l8y-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require',
  ssl: { rejectUnauthorized: false }
})

// Health check
app.get('/', (req, res) => res.json({ status: '✅ Machine Checklist API running' }))

// Execute SQL query
app.post('/api/query', async (req, res) => {
  try {
    const { query, params = [] } = req.body
    const result = await pool.query(query, params)
    res.json({ rows: result.rows, rowCount: result.rowCount })
  } catch (err) {
    console.error('DB Error:', err.message)
    res.status(500).json({ error: err.message })
  }
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => console.log(`✅ API running on port ${PORT}`))
