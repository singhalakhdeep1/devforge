import ExcelJS from 'exceljs'
import PDFDocument from 'pdfkit'
import type { Report } from './reports'

export type Format = 'json' | 'csv' | 'xlsx' | 'pdf'
export const FORMATS: Format[] = ['json', 'csv', 'xlsx', 'pdf']
export const MIME: Record<Format, string> = { json: 'application/json', csv: 'text/csv; charset=utf-8', xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', pdf: 'application/pdf' }

const csvCell = (v: unknown) => {
  let s = String(v ?? '')
  // spreadsheet formula injection: a cell that starts with = + - @ would be executed by Excel
  if (/^[=+\-@\t\r]/.test(s) && typeof v === 'string') s = `'${s}`
  return `"${s.replace(/"/g, '""')}"`
}

export function toCsv(r: Report): Buffer {
  const lines: string[] = [`# ${r.title}`, `# Generated ${r.generatedAt} for the last ${r.days} days`, '']
  lines.push('Metric,Value', ...r.summary.map((s) => [s.label, s.value].map(csvCell).join(',')), '')
  for (const sec of r.sections) lines.push(`# ${sec.title}`, sec.columns.map(csvCell).join(','), ...sec.rows.map((row) => row.map(csvCell).join(',')), '')
  if (r.missing.length) lines.push(`# Not available (service unreachable): ${r.missing.join(', ')}`)
  return Buffer.from('﻿' + lines.join('\r\n'), 'utf8') // BOM so Excel opens UTF-8 correctly
}

export async function toXlsx(r: Report): Promise<Buffer> {
  const wb = new ExcelJS.Workbook()
  wb.creator = 'DevForge'
  wb.created = new Date(r.generatedAt)
  const head = wb.addWorksheet('Summary')
  head.addRow([r.title]).font = { bold: true, size: 16 }
  head.addRow([`Generated ${r.generatedAt} · last ${r.days} days`])
  head.addRow([])
  const hr = head.addRow(['Metric', 'Value'])
  hr.font = { bold: true }
  for (const s of r.summary) head.addRow([s.label, s.value])
  if (r.missing.length) head.addRow([]).getCell(1).value = `Not available (service unreachable): ${r.missing.join(', ')}`
  head.columns = [{ width: 38 }, { width: 22 }]
  const used = new Set<string>(['Summary'])
  for (const sec of r.sections) {
    let name = sec.title.replace(/[\\/*?:[\]]/g, ' ').slice(0, 28)
    for (let i = 2; used.has(name); i++) name = `${name.slice(0, 25)} ${i}`
    used.add(name)
    const ws = wb.addWorksheet(name)
    const h = ws.addRow(sec.columns)
    h.font = { bold: true, color: { argb: 'FFFFFFFF' } }
    h.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4F46E5' } }
    for (const row of sec.rows) ws.addRow(row.map((v) => (typeof v === 'string' && /^[=+\-@]/.test(v) ? `'${v}` : v)))
    ws.columns.forEach((c, i) => { c.width = Math.min(48, Math.max(12, ...[sec.columns[i], ...sec.rows.map((x) => x[i])].map((x) => String(x ?? '').length + 2))) })
    ws.views = [{ state: 'frozen', ySplit: 1 }]
  }
  return Buffer.from(await wb.xlsx.writeBuffer())
}

export function toPdf(r: Report): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', margin: 40, info: { Title: r.title, Author: 'DevForge' } })
    const chunks: Buffer[] = []
    doc.on('data', (c: Buffer) => chunks.push(c))
    doc.on('end', () => resolve(Buffer.concat(chunks)))
    doc.on('error', reject)

    doc.fontSize(20).fillColor('#4f46e5').text(r.title)
    doc.fontSize(9).fillColor('#71717a').text(`Generated ${new Date(r.generatedAt).toUTCString()} · last ${r.days} days`).moveDown()
    doc.fillColor('#18181b').fontSize(12)
    for (const s of r.summary) doc.font('Helvetica-Bold').text(String(s.value), { continued: true }).font('Helvetica').fillColor('#52525b').text(`   ${s.label}`).fillColor('#18181b')
    if (r.missing.length) doc.moveDown(0.5).fontSize(9).fillColor('#b91c1c').text(`Not available (service unreachable): ${r.missing.join(', ')}`).fillColor('#18181b')

    const pageW = doc.page.width - doc.page.margins.left - doc.page.margins.right
    for (const sec of r.sections) {
      doc.moveDown().fontSize(13).font('Helvetica-Bold').text(sec.title).moveDown(0.3)
      const w = pageW / sec.columns.length
      const row = (cells: (string | number | null)[], bold: boolean) => {
        if (doc.y > doc.page.height - 70) doc.addPage()
        const y = doc.y
        let h = 14
        cells.forEach((c, i) => {
          doc.font(bold ? 'Helvetica-Bold' : 'Helvetica').fontSize(8.5).text(String(c ?? ''), doc.page.margins.left + i * w, y, { width: w - 6, ellipsis: true, height: 24 })
          h = Math.max(h, 14)
        })
        doc.y = y + h
        if (bold) doc.moveTo(doc.page.margins.left, doc.y).lineTo(doc.page.margins.left + pageW, doc.y).strokeColor('#d4d4d8').stroke()
      }
      row(sec.columns, true)
      if (sec.rows.length === 0) doc.font('Helvetica-Oblique').fontSize(9).fillColor('#71717a').text('No data for this period').fillColor('#18181b')
      for (const rw of sec.rows) row(rw, false)
    }
    doc.end()
  })
}

export async function render(r: Report, format: Format): Promise<{ data: Buffer; mimeType: string; ext: string }> {
  switch (format) {
    case 'json': return { data: Buffer.from(JSON.stringify(r, null, 2)), mimeType: MIME.json, ext: 'json' }
    case 'csv': return { data: toCsv(r), mimeType: MIME.csv, ext: 'csv' }
    case 'xlsx': return { data: await toXlsx(r), mimeType: MIME.xlsx, ext: 'xlsx' }
    case 'pdf': return { data: await toPdf(r), mimeType: MIME.pdf, ext: 'pdf' }
  }
}
