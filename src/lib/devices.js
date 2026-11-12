// Earliest expiry date among a device's accessories (already-expired ones count).
export function nextAccessoryExpiry(accessories = []) {
  let earliest = null
  for (const a of accessories) {
    if (a.expiry_date && (!earliest || a.expiry_date < earliest)) earliest = a.expiry_date
  }
  return earliest
}

export function deviceTitle(device) {
  if (!device) return 'Unknown device'
  return [device.device, device.model].filter(Boolean).join(' · ')
}
