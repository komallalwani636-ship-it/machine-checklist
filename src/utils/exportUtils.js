import * as XLSX from 'xlsx'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

export function exportExcel(tableData, fileName) {
  if (!tableData || tableData.length === 0) return

  const ws = XLSX.utils.aoa_to_sheet(tableData)

  // Style header row
  const headerRange = XLSX.utils.decode_range(ws['!ref'])
  for (let col = headerRange.s.c; col <= headerRange.e.c; col++) {
    const cellRef = XLSX.utils.encode_cell({ r: 0, c: col })
    if (!ws[cellRef]) continue
    ws[cellRef].s = {
      font: { bold: true, color: { rgb: 'FFFFFF' } },
      fill: { fgColor: { rgb: '1A237E' } },
      alignment: { horizontal: 'center' }
    }
  }

  // Auto column widths
  const colWidths = tableData[0].map((_, colIdx) => ({
    wch: Math.max(...tableData.map(row => (row[colIdx] || '').toString().length), 12)
  }))
  ws['!cols'] = colWidths

  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Checklist')
  XLSX.writeFile(wb, `${fileName}.xlsx`)
}

export function exportPDF(tableData, title, fileName) {
  if (!tableData || tableData.length === 0) return

  const doc = new jsPDF({ orientation: 'landscape' })

  // Title
  doc.setFontSize(16)
  doc.setTextColor(26, 35, 126)
  doc.text(title, 14, 18)

  // Date
  doc.setFontSize(10)
  doc.setTextColor(100)
  doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 26)

  const headers = tableData[0]
  const rows = tableData.slice(1)

  autoTable(doc, {
    head: [headers],
    body: rows,
    startY: 32,
    headStyles: {
      fillColor: [26, 35, 126],
      textColor: 255,
      fontStyle: 'bold'
    },
    alternateRowStyles: { fillColor: [240, 242, 245] },
    styles: { fontSize: 9, cellPadding: 4 },
    margin: { left: 14, right: 14 }
  })

  doc.save(`${fileName}.pdf`)
}
