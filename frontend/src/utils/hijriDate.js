import DateObject from 'react-date-object'
import gregorian from 'react-date-object/calendars/gregorian'
import arabic from 'react-date-object/calendars/arabic'
import gregorian_ar from 'react-date-object/locales/gregorian_ar'
import arabic_ar from 'react-date-object/locales/arabic_ar'

const pad2 = (n) => String(n).padStart(2, '0')

export const isIsoDate = (value) => typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)

// Hijri representation formatted as YYYY-MM-DD, using the same underlying date-object conversion
export const isoToHijriString = (isoDate) => {
  if (!isIsoDate(isoDate)) return ''
  const [y, m, d] = isoDate.split('-').map((x) => parseInt(x, 10))
  try {
    const g = new DateObject({ year: y, month: m, day: d, calendar: gregorian, locale: gregorian_ar })
    const h = g.convert(arabic, arabic_ar)
    return `${pad2(h.year)}-${pad2(h.month.number)}-${pad2(h.day)}`
  } catch {
    return ''
  }
}

export const hijriStringToIso = (hijriStr) => {
  if (!hijriStr || typeof hijriStr !== 'string') return null
  const m = hijriStr.trim().match(/^(\d{1,4})[-/](\d{1,2})[-/](\d{1,2})$/)
  if (!m) return null

  const hy = parseInt(m[1], 10)
  const hm = parseInt(m[2], 10)
  const hd = parseInt(m[3], 10)

  if (Number.isNaN(hy) || Number.isNaN(hm) || Number.isNaN(hd)) return null
  if (hm < 1 || hm > 12) return null
  if (hd < 1 || hd > 30) return null

  try {
    const h = new DateObject({ year: hy, month: hm, day: hd, calendar: arabic, locale: arabic_ar })
    const g = h.convert(gregorian, gregorian_ar)
    return `${pad2(g.year)}-${pad2(g.month.number)}-${pad2(g.day)}`
  } catch {
    return null
  }
}

// Format date in Hijri format for display (e.g., "1445-06-15" or Date object)
export const formatDateHijri = (dateInput) => {
  if (!dateInput) return ''
  
  try {
    let isoDate = ''
    
    // Handle different input types
    if (typeof dateInput === 'string') {
      // Check if it's already in ISO format (YYYY-MM-DD)
      if (isIsoDate(dateInput)) {
        isoDate = dateInput
      } else {
        // Try to parse as Date and convert to ISO
        const date = new Date(dateInput)
        if (!isNaN(date.getTime())) {
          const year = date.getFullYear()
          const month = String(date.getMonth() + 1).padStart(2, '0')
          const day = String(date.getDate()).padStart(2, '0')
          isoDate = `${year}-${month}-${day}`
        } else {
          return dateInput // Return as-is if can't parse
        }
      }
    } else if (dateInput instanceof Date) {
      const year = dateInput.getFullYear()
      const month = String(dateInput.getMonth() + 1).padStart(2, '0')
      const day = String(dateInput.getDate()).padStart(2, '0')
      isoDate = `${year}-${month}-${day}`
    } else {
      return String(dateInput)
    }

    // Convert ISO to Hijri
    if (isoDate && isIsoDate(isoDate)) {
      const hijriStr = isoToHijriString(isoDate)
      if (hijriStr) {
        // Format as YYYY/MM/DD for display
        return hijriStr.replace(/-/g, '/')
      }
    }
    
    return ''
  } catch (error) {
    console.error('Error formatting Hijri date:', error)
    return String(dateInput)
  }
}
