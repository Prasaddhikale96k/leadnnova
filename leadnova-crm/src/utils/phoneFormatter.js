// Phone number formatting utility for Indian leads
export function formatIndianPhoneNumber(phone) {
  if (!phone) return null

  // Remove all spaces and special characters
  let cleaned = phone.replace(/[\s\-\(\)\[\]\{\}\+\.\/]/g, '')

  if (cleaned.startsWith('0')) {
    cleaned = cleaned.substring(1)
  }

  const digitsOnly = cleaned.replace(/\D/g, '')

  if (digitsOnly.length < 10) return null

  const tenDigit = digitsOnly.slice(-10)

  return '91' + tenDigit
}