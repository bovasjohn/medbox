import { formatDash, monthYear } from './dates'

// A report's checklist rows: Description, Part No., Status/Expiry, Comments, Replacement.
// "kind: 'battery'" marks the row whose status follows the Battery % box.

function accessoryRow(accessory, kind = '') {
  const expiry = accessory.expiry_date
  return {
    kind,
    description: accessory.name || '',
    part_no: accessory.model || '',
    status: expiry ? formatDash(expiry) : '',
    comments: '',
    replacement: expiry ? `By ${monthYear(expiry)}` : '',
  }
}

// Starting rows for a device: its accessories (battery first), then configuration, machine and software.
export function defaultItems(device, accessories = []) {
  if (!device) return []
  const name = device.short_name || device.device || 'Device'
  const isBattery = (a) => (a.category || '').toLowerCase() === 'battery'
  const batteries = accessories.filter(isBattery)
  const others = accessories.filter((a) => !isBattery(a))

  const rows = []
  if (batteries.length === 0) {
    rows.push({ kind: 'battery', description: `${name} Battery`, part_no: '', status: '', comments: '', replacement: '' })
  }
  batteries.forEach((a, index) => rows.push(accessoryRow(a, index === 0 ? 'battery' : '')))
  others.forEach((a) => rows.push(accessoryRow(a)))

  rows.push({ kind: '', description: `${name} Configuration`, part_no: '', status: 'Ok', comments: 'Pass', replacement: '' })
  rows.push({ kind: '', description: `${name} Machine`, part_no: device.serial_number || '', status: 'Ok', comments: '', replacement: '' })
  rows.push({ kind: '', description: `${name} tested with Software`, part_no: '', status: 'Ok', comments: '', replacement: '' })
  return rows
}
