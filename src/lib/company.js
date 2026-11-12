// Company name, logo and the two signatures used on the HTML report.
// Saved on this device only (browser storage), so set them once on each device you print from.
const KEY = 'mm-company'

export const EMPTY_COMPANY = { name: '', logo: '', signature: '', signature2: '' }

export function readCompany() {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? { ...EMPTY_COMPANY, ...JSON.parse(raw) } : { ...EMPTY_COMPANY }
  } catch {
    return { ...EMPTY_COMPANY }
  }
}

// Returns true when saved, false when the browser refused (storage full or blocked).
export function writeCompany(company) {
  try {
    localStorage.setItem(KEY, JSON.stringify(company))
    return true
  } catch {
    return false
  }
}

// Shrink an uploaded image to a small PNG data URL so it stays light in storage and in the report.
export function imageToDataUrl(file, maxWidth, maxHeight) {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      reject(new Error('Please choose an image file (PNG or JPG).'))
      return
    }
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      const scale = Math.min(1, maxWidth / img.width, maxHeight / img.height)
      const canvas = document.createElement('canvas')
      canvas.width = Math.max(1, Math.round(img.width * scale))
      canvas.height = Math.max(1, Math.round(img.height * scale))
      canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height)
      URL.revokeObjectURL(url)
      resolve(canvas.toDataURL('image/png'))
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('That image could not be read. Try a PNG or JPG.'))
    }
    img.src = url
  })
}
