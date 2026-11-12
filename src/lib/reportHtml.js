import { formatDash, formatDateTime } from './dates'
import { reportChecklist, checklistEnabled } from './checklist'

// Builds the "INSPECTION REPORT - PPM" page in the company format as one self-contained HTML file.

const esc = (value) =>
  String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')

// 09-November-2026, as printed on page 2.
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
function formatLong(value) {
  const [y, m, d] = String(value || '').split('-')
  return y && m && d ? `${d}-${MONTHS[Number(m) - 1]}-${y}` : ''
}

const tick = (pass) => (pass ? '<span class="tick">&#10003;</span>' : '')
const cross = (pass) => (pass ? '' : '<span class="cross">&#10007;</span>')

function testsTable(tests) {
  return `<table class="grid tests">
    <colgroup><col style="width:72%"><col style="width:14%"><col style="width:14%"></colgroup>
    <thead><tr><th class="l">TEST</th><th>PASS</th><th>FAIL</th></tr></thead>
    <tbody>${tests.map((t) => `<tr><td class="b">${esc(t.test)}</td><td class="c">${tick(t.pass)}</td><td class="c">${cross(t.pass)}</td></tr>`).join('')}</tbody>
  </table>`
}

// Equipment / customer details table (first table of the report).
function infoTable({ report, device, organization }) {
  const extra =
    device?.installation_date || device?.warranty
      ? `<tr><td><b>INSTALLATION DATE</b></td><td>${esc(formatDash(device?.installation_date))}</td><td><b>WARRANTY</b></td><td>${esc(device?.warranty)}</td></tr>`
      : ''
  return `<table class="grid info">
    <colgroup><col style="width:17%"><col style="width:33%"><col style="width:18%"><col style="width:32%"></colgroup>
    <tr><td><b>EQUIPMENT</b></td><td>${esc(device?.device)}</td><td><b>CUSTOMER</b></td><td>${esc(organization?.name)}</td></tr>
    <tr><td><b>MANUFACTURER</b></td><td>${esc(device?.manufacturer || device?.brand)}</td><td><b>CONTACT PERSON</b></td><td>${esc(organization?.contact_person)}</td></tr>
    <tr><td><b>MODEL</b></td><td>${esc(device?.model)}</td><td><b>CHECKED DATE</b></td><td>${esc(formatLong(report.inspection_date))}</td></tr>
    <tr><td><b>SERIAL NUMBER</b></td><td>${esc(device?.serial_number)}</td><td><b>DUE DATE</b></td><td>${esc(formatLong(report.next_ppm_date))}</td></tr>
    ${extra}
  </table>`
}

// Header of the short "report only" format: customer, date, contact, brand, model, serial, installation, warranty.
function simpleHeader({ report, device, organization, deviceName }) {
  return `<table class="grid">
    <colgroup><col style="width:33%"><col style="width:29%"><col style="width:38%"></colgroup>
    <tr>
      <td><b>CUSTOMER:</b> ${esc(organization?.name)}</td>
      <td><b>DATE:</b> ${esc(formatDash(report.inspection_date))}</td>
      <td><b>CONTACT:</b> ${esc(organization?.contact_person)}</td>
    </tr>
    <tr class="tall">
      <td><b>${esc(deviceName)} BRAND:</b> ${esc(device?.brand)}</td>
      <td><b>MODEL:</b> ${esc(device?.model)}</td>
      <td><b>SERIAL:</b> ${esc(device?.serial_number)}</td>
    </tr>
  </table>

  <table class="grid gap">
    <colgroup><col style="width:50%"><col style="width:50%"></colgroup>
    <tr>
      <td><b>INSTALLATION DATE:</b> ${esc(formatDash(device?.installation_date))}</td>
      <td><b>WARRANTY:</b> ${esc(device?.warranty)}</td>
    </tr>
  </table>`
}

// Optional standard tests and calibration tables.
function checksSection(report) {
  const { tests, calibration } = reportChecklist(report)
  const half = Math.ceil(tests.length / 2)
  return `<div class="sec"><b>GENERAL PREVENTIVE MAINTENANCE:</b></div>
  <div class="two">
    ${testsTable(tests.slice(0, half))}
    ${testsTable(tests.slice(half))}
  </div>

  <table class="grid calib">
    <colgroup><col style="width:19%"><col style="width:19%"><col style="width:17%"><col style="width:17%"><col style="width:14%"><col style="width:14%"></colgroup>
    <thead><tr><th class="l">QUALITY CONTROL &amp; CALIBRATION</th><th class="l">Set Arrhythmia Wave</th><th class="l">Expected value</th><th class="l">Measured Value</th><th>PASS</th><th>FAIL</th></tr></thead>
    <tbody>${calibration
      .map(
        (r, i) => `<tr>${
          i === 0 ? `<td rowspan="${calibration.length}" class="b">Output Energy (±15%)<br><br>Adult Pad Used</td>` : ''
        }<td class="b">${esc(r.wave)}</td><td class="b">${esc(r.expected)}</td><td class="b">${esc(r.measured)}</td><td class="c">${tick(r.pass)}</td><td class="c">${cross(r.pass)}</td></tr>`,
      )
      .join('')}</tbody>
  </table>`
}

// Checklist rows of a report. Reports saved before v1.2 have no rows, so rebuild them from their old fields.
export function reportItems(report) {
  if (Array.isArray(report.inspection_items) && report.inspection_items.length) return report.inspection_items
  const rows = []
  if (report.battery_percent !== null && report.battery_percent !== undefined) {
    rows.push({ description: 'Battery', status: `${report.battery_percent}% remaining` })
  }
  if (report.configuration) rows.push({ description: 'Configuration', status: report.configuration })
  if (report.alarm_status) rows.push({ description: 'Alarm', status: report.alarm_status, comments: report.alarm_notes })
  return rows
}

// "Comments from service engineer": one bullet per line, plus any optional notes that were filled in.
function commentLines(report) {
  const lines = String(report.comments || '')
    .split(/\r?\n/)
    .map((line) => line.replace(/^\s*[•·*-]+\s*/, '').trim())
    .filter(Boolean)
  const extra = [
    ['Work performed', report.work_performed],
    ['Findings', report.findings],
    ['Recommendations', report.recommendations],
  ]
  for (const [label, text] of extra) {
    const value = String(text || '').trim()
    if (value) lines.push(`${label}: ${value.replace(/\s*\r?\n\s*/g, '; ')}`)
  }
  return lines
}

function commentCell(text) {
  const value = String(text || '').trim()
  const key = value.toLowerCase()
  if (key === 'pass') return `<span class="ok">${esc(value)}</span>`
  if (key === 'fail') return `<span class="bad">${esc(value)}</span>`
  return esc(value)
}

function itemsTable(rows) {
  const body = rows.length
    ? rows
        .map(
          (row, index) => `<tr>
        <td class="c">${index + 1}</td>
        <td>${esc(row.description)}</td>
        <td class="c">${esc(row.part_no)}</td>
        <td>${esc(row.status)}</td>
        <td>${commentCell(row.comments)}</td>
        <td>${esc(row.replacement)}</td>
      </tr>`,
        )
        .join('')
    : '<tr><td class="c">1</td><td></td><td></td><td></td><td></td><td></td></tr>'
  return `<table class="grid items">
    <colgroup><col style="width:5%"><col style="width:23%"><col style="width:17%"><col style="width:17%"><col style="width:24%"><col style="width:14%"></colgroup>
    <thead><tr><th>#</th><th>Description</th><th>Part No.</th><th>Status/Expiry</th><th>Comments</th><th>Replacement</th></tr></thead>
    <tbody>${body}</tbody>
  </table>`
}

function signBlock(heading, person = {}, signatureImage = '') {
  const lines = [
    person.name && esc(person.name),
    person.title && esc(person.title),
    person.mobile && `Mob: ${esc(person.mobile)}`,
    person.email && `Email: <span class="mail">${esc(person.email)}</span>`,
    person.company && esc(person.company),
  ].filter(Boolean)
  return `<div class="sign">
    <div class="sign-title">${esc(heading)}</div>
    ${lines.map((line) => `<div>${line}</div>`).join('')}
    <div class="sign-space">${signatureImage}</div>
  </div>`
}

export function buildReportHtml({ report, device, organization, company, toolbar = true }) {
  const companyName = company?.name?.trim()
  const deviceName = (device?.short_name || device?.device || 'Device').toUpperCase()
  const signoff = report.signoff ?? {}
  const doneBy = { ...(signoff.done_by ?? {}), name: report.technician }
  const reviewedBy = signoff.reviewed_by ?? {}
  const bullets = commentLines(report)
  const withChecks = checklistEnabled(report)

  const title = `PPM Report - ${[device?.device, device?.model].filter(Boolean).join(' ')} - ${report.inspection_date}`

  const header = company?.logo
    ? `<img class="logo" src="${esc(company.logo)}" alt="${esc(companyName || 'Company logo')}" />`
    : companyName
      ? `<div class="company">${esc(companyName)}</div>`
      : ''
  const signImg = (src, alt) => (src ? `<img class="signature-img" src="${esc(src)}" alt="${alt}" />` : '')
  const signatureImage = signImg(company?.signature, 'Signature')
  const signatureImage2 = signImg(company?.signature2, 'Signature')

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${esc(title)}</title>
<style>
  * { box-sizing: border-box; }
  body { margin:0; background:#EEF1F6; color:#000; font:14px/1.35 Calibri, Carlito, "Segoe UI", Arial, sans-serif; }
  .toolbar { max-width:8.5in; margin:12px auto 0; padding:0 12px; display:flex; justify-content:flex-end; }
  .toolbar button { background:#356AE6; color:#fff; border:0; border-radius:8px; padding:9px 18px; font-size:14px; font-weight:600; cursor:pointer; }
  .page { width:8.5in; max-width:100%; margin:12px auto; background:#fff; padding:.45in .6in .6in; }
  .page + .page { margin-top:18px; }
  .logo { display:block; margin:0 auto 6px; max-height:96px; max-width:280px; object-fit:contain; }
  .company { text-align:center; font-size:22px; font-weight:700; margin-bottom:6px; }
  h1 { text-align:center; font-size:23px; margin:8px 0 14px; letter-spacing:.01em; }
  table { width:100%; border-collapse:collapse; table-layout:fixed; }
  .grid td, .grid th { border:1px solid #000; padding:2px 6px; vertical-align:top; overflow-wrap:anywhere; white-space:pre-wrap; }
  .grid th { text-align:center; font-weight:700; }
  .tall td { height:34px; }
  .gap { margin-top:18px; }
  .section-title { text-align:center; font-weight:700; margin:18px 0 6px; }
  .c { text-align:center; }
  .ok { color:#5B9E3A; font-weight:700; }
  .bad { color:#C23A45; font-weight:700; }
  .notes { margin-top:18px; }
  .notes ul { margin:0; padding:2px 6px 4px 28px; }
  .notes li { padding-left:6px; }
  .notes .empty { height:24px; }
  .signs { display:grid; grid-template-columns:1fr 1fr; gap:24px; margin-top:26px; padding:0 6px; break-inside:avoid; }
  .sign-title { font-weight:700; }
  .sign-space { height:60px; padding-top:6px; }
  .signature-img { max-height:54px; max-width:200px; object-fit:contain; }
  .mail { color:#0563C1; text-decoration:underline; }
  .foot { margin-top:14px; font-size:10px; color:#777; text-align:right; }
  .sec { margin:18px 0 8px; }
  .two { display:grid; grid-template-columns:1fr 1fr; gap:14px; align-items:start; }
  .tests th, .calib th { font-size:12px; }
  .grid th.l { text-align:left; }
  .grid td.b { font-weight:700; }
  .tests td { height:30px; vertical-align:middle; }
  .calib { margin-top:20px; }
  .calib td { height:32px; vertical-align:middle; }
  .tick { font-weight:700; }
  .cross { color:#C23A45; font-weight:700; }
  .info td { padding:4px 6px; }
  /* No page margin: the browser has no room left to print its own file name, date and page number. */
  @page { size:Letter; margin:0; }
  @media print {
    body { background:#fff; }
    .toolbar { display:none; }
    .page { margin:0; padding:.5in .6in; width:auto; max-width:none; break-after:page; }
    .page:last-of-type { break-after:auto; }
    .page + .page { margin-top:0; }
    * { -webkit-print-color-adjust:exact; print-color-adjust:exact; }
  }
  @media (max-width:640px) {
    body { font-size:11px; }
    .page { padding:14px 10px 20px; }
    h1 { font-size:18px; }
    .grid td, .grid th { padding:2px 3px; }
    .signs { grid-template-columns:1fr; gap:8px; }
    .two { grid-template-columns:1fr; }
  }
</style>
</head>
<body>
${toolbar ? '<div class="toolbar"><button type="button" onclick="window.print()">Print / Save as PDF</button></div>' : ''}
<div class="page">
  ${header}
  <h1>${esc((report.report_title || 'INSPECTION REPORT - PPM').toUpperCase())}</h1>
  ${withChecks ? infoTable({ report, device, organization }) : simpleHeader({ report, device, organization, deviceName })}
  ${withChecks ? checksSection(report) + `\n</div>\n<div class="page">\n  ${header}` : ''}

  <div class="section-title">${esc(deviceName)} INSPECTION/PPM REPORT:</div>
  ${itemsTable(reportItems(report))}

  <table class="grid notes">
    <tr><td><b>Comments:</b></td></tr>
    <tr><td style="padding:0">${
      bullets.length ? `<ul>${bullets.map((line) => `<li>${esc(line)}</li>`).join('')}</ul>` : '<div class="empty"></div>'
    }</td></tr>
  </table>

  <div class="signs">
    ${signBlock('PPM done by:', doneBy, signatureImage)}
    ${signBlock('Reviewed & approved by:', reviewedBy, signatureImage2)}
  </div>

  <div class="foot">${companyName ? `${esc(companyName)} · ` : ''}Report saved ${esc(formatDateTime(report.created_at))}</div>
</div>
</body>
</html>`
}

export function reportFileName(report, device) {
  const base = [device?.device, device?.model, report.inspection_date].filter(Boolean).join('-')
  return `PPM-${base.replace(/[^a-z0-9]+/gi, '-').replace(/^-+|-+$/g, '')}.html`
}

// Opens the report in a new tab (it has its own Print button). Returns false if the browser blocked the tab.
export function openReport(html) {
  const url = URL.createObjectURL(new Blob([html], { type: 'text/html' }))
  const tab = window.open(url, '_blank')
  setTimeout(() => URL.revokeObjectURL(url), 60000)
  return Boolean(tab)
}

export function downloadReport(html, filename) {
  const url = URL.createObjectURL(new Blob([html], { type: 'text/html' }))
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()
  setTimeout(() => URL.revokeObjectURL(url), 10000)
}
