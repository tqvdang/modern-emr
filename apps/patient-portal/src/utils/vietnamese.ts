// Vietnamese-specific utilities and cultural adaptations

import { format } from 'date-fns'
import { vi } from 'date-fns/locale'

// Vietnamese name handling
export interface VietnameseName {
  ho: string        // Family name (Họ)
  tenDem: string    // Middle name (Tên đệm) 
  ten: string       // Given name (Tên)
}

export const parseVietnameseName = (fullName: string): VietnameseName => {
  const parts = fullName.trim().split(/\s+/)
  
  if (parts.length === 1) {
    return { ho: '', tenDem: '', ten: parts[0] }
  } else if (parts.length === 2) {
    return { ho: parts[0], tenDem: '', ten: parts[1] }
  } else {
    return {
      ho: parts[0],
      tenDem: parts.slice(1, -1).join(' '),
      ten: parts[parts.length - 1]
    }
  }
}

export const formatVietnameseName = (name: VietnameseName): string => {
  const parts = [name.ho, name.tenDem, name.ten].filter(part => part.trim())
  return parts.join(' ')
}

// Vietnamese address formatting
export interface VietnameseAddress {
  soNha?: string           // House number
  tenDuong: string         // Street name
  phuongXa: string         // Ward/Commune
  quanHuyen: string        // District
  tinhThanhPho: string     // Province/City
  maBuuDien?: string       // Postal code
}

export const formatVietnameseAddress = (address: VietnameseAddress): string => {
  const parts = [
    address.soNha,
    address.tenDuong,
    address.phuongXa,
    address.quanHuyen,
    address.tinhThanhPho
  ].filter(part => part && part.trim())
  
  return parts.join(', ')
}

// Vietnamese phone number formatting
export const formatVietnamesePhone = (phone: string): string => {
  const cleaned = phone.replace(/\D/g, '')
  
  // Handle different Vietnamese phone formats
  if (cleaned.startsWith('84')) {
    // International format: +84 xxx xxx xxx
    return `+84 ${cleaned.slice(2, 5)} ${cleaned.slice(5, 8)} ${cleaned.slice(8)}`
  } else if (cleaned.startsWith('0')) {
    // Domestic format: 0xxx xxx xxx
    return `${cleaned.slice(0, 4)} ${cleaned.slice(4, 7)} ${cleaned.slice(7)}`
  }
  
  return phone
}

export const validateVietnamesePhone = (phone: string): boolean => {
  const cleaned = phone.replace(/\D/g, '')
  
  // Vietnamese mobile numbers: 03x, 05x, 07x, 08x, 09x (10 digits total)
  // Landline: area code + 7-8 digits
  const mobileRegex = /^(84|0)?(3[2-9]|5[6|8|9]|7[0|6-9]|8[1-9]|9[0-9])[0-9]{7}$/
  const landlineRegex = /^(84|0)?(2[0-9])[0-9]{7,8}$/
  
  return mobileRegex.test(cleaned) || landlineRegex.test(cleaned)
}

// Vietnamese date formatting
export const formatVietnameseDate = (date: Date): string => {
  return format(date, 'dd/MM/yyyy', { locale: vi })
}

export const formatVietnameseDateTime = (date: Date): string => {
  return format(date, 'dd/MM/yyyy HH:mm', { locale: vi })
}

export const formatVietnameseDateLong = (date: Date): string => {
  return format(date, "EEEE, 'ngày' dd 'tháng' MM 'năm' yyyy", { locale: vi })
}

// Vietnamese currency formatting
export const formatVietnameseCurrency = (amount: number): string => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

// Vietnamese ID number validation
export const validateVietnameseIDNumber = (idNumber: string): boolean => {
  const cleaned = idNumber.replace(/\D/g, '')
  
  // Old ID: 9 digits
  // New ID (CCCD): 12 digits
  return /^\d{9}$/.test(cleaned) || /^\d{12}$/.test(cleaned)
}

// Vietnamese insurance number validation
export const validateVietnameseInsuranceNumber = (insuranceNumber: string): boolean => {
  const cleaned = insuranceNumber.replace(/\D/g, '')
  
  // Vietnamese social insurance number format: 10 digits
  return /^\d{10}$/.test(cleaned)
}

// Vietnamese postal code validation
export const validateVietnamesePostalCode = (postalCode: string): boolean => {
  const cleaned = postalCode.replace(/\D/g, '')
  
  // Vietnamese postal codes: 6 digits
  return /^\d{6}$/.test(cleaned)
}

// Vietnamese provinces and cities
export const VIETNAMESE_PROVINCES = [
  { code: '01', name: 'Hà Nội', type: 'Thành phố trực thuộc trung ương' },
  { code: '79', name: 'Thành phố Hồ Chí Minh', type: 'Thành phố trực thuộc trung ương' },
  { code: '31', name: 'Hải Phòng', type: 'Thành phố trực thuộc trung ương' },
  { code: '48', name: 'Đà Nẵng', type: 'Thành phố trực thuộc trung ương' },
  { code: '89', name: 'Cần Thơ', type: 'Thành phố trực thuộc trung ương' },
  { code: '02', name: 'Hà Giang', type: 'Tỉnh' },
  { code: '04', name: 'Cao Bằng', type: 'Tỉnh' },
  { code: '06', name: 'Bắc Kạn', type: 'Tỉnh' },
  { code: '08', name: 'Tuyên Quang', type: 'Tỉnh' },
  { code: '10', name: 'Lào Cai', type: 'Tỉnh' },
  { code: '11', name: 'Điện Biên', type: 'Tỉnh' },
  { code: '12', name: 'Lai Châu', type: 'Tỉnh' },
  { code: '14', name: 'Sơn La', type: 'Tỉnh' },
  { code: '15', name: 'Yên Bái', type: 'Tỉnh' },
  { code: '17', name: 'Hoà Bình', type: 'Tỉnh' },
  { code: '19', name: 'Thái Nguyên', type: 'Tỉnh' },
  { code: '20', name: 'Lạng Sơn', type: 'Tỉnh' },
  { code: '22', name: 'Quảng Ninh', type: 'Tỉnh' },
  { code: '24', name: 'Bắc Giang', type: 'Tỉnh' },
  { code: '25', name: 'Phú Thọ', type: 'Tỉnh' },
  { code: '26', name: 'Vĩnh Phúc', type: 'Tỉnh' },
  { code: '27', name: 'Bắc Ninh', type: 'Tỉnh' },
  { code: '30', name: 'Hải Dương', type: 'Tỉnh' },
  { code: '33', name: 'Hưng Yên', type: 'Tỉnh' },
  { code: '34', name: 'Thái Bình', type: 'Tỉnh' },
  { code: '35', name: 'Hà Nam', type: 'Tỉnh' },
  { code: '36', name: 'Nam Định', type: 'Tỉnh' },
  { code: '37', name: 'Ninh Bình', type: 'Tỉnh' },
  { code: '38', name: 'Thanh Hóa', type: 'Tỉnh' },
  { code: '40', name: 'Nghệ An', type: 'Tỉnh' },
  { code: '42', name: 'Hà Tĩnh', type: 'Tỉnh' },
  { code: '44', name: 'Quảng Bình', type: 'Tỉnh' },
  { code: '45', name: 'Quảng Trị', type: 'Tỉnh' },
  { code: '46', name: 'Thừa Thiên Huế', type: 'Tỉnh' },
  { code: '49', name: 'Quảng Nam', type: 'Tỉnh' },
  { code: '51', name: 'Quảng Ngãi', type: 'Tỉnh' },
  { code: '52', name: 'Bình Định', type: 'Tỉnh' },
  { code: '54', name: 'Phú Yên', type: 'Tỉnh' },
  { code: '56', name: 'Khánh Hòa', type: 'Tỉnh' },
  { code: '58', name: 'Ninh Thuận', type: 'Tỉnh' },
  { code: '60', name: 'Bình Thuận', type: 'Tỉnh' },
  { code: '62', name: 'Kon Tum', type: 'Tỉnh' },
  { code: '64', name: 'Gia Lai', type: 'Tỉnh' },
  { code: '66', name: 'Đắk Lắk', type: 'Tỉnh' },
  { code: '67', name: 'Đắk Nông', type: 'Tỉnh' },
  { code: '68', name: 'Lâm Đồng', type: 'Tỉnh' },
  { code: '70', name: 'Bình Phước', type: 'Tỉnh' },
  { code: '72', name: 'Tây Ninh', type: 'Tỉnh' },
  { code: '74', name: 'Bình Dương', type: 'Tỉnh' },
  { code: '75', name: 'Đồng Nai', type: 'Tỉnh' },
  { code: '77', name: 'Bà Rịa - Vũng Tàu', type: 'Tỉnh' },
  { code: '80', name: 'Long An', type: 'Tỉnh' },
  { code: '82', name: 'Tiền Giang', type: 'Tỉnh' },
  { code: '83', name: 'Bến Tre', type: 'Tỉnh' },
  { code: '84', name: 'Trà Vinh', type: 'Tỉnh' },
  { code: '86', name: 'Vĩnh Long', type: 'Tỉnh' },
  { code: '87', name: 'Đồng Tháp', type: 'Tỉnh' },
  { code: '91', name: 'An Giang', type: 'Tỉnh' },
  { code: '92', name: 'Kiên Giang', type: 'Tỉnh' },
  { code: '93', name: 'Cà Mau', type: 'Tỉnh' },
  { code: '94', name: 'Bạc Liêu', type: 'Tỉnh' },
  { code: '95', name: 'Sóc Trăng', type: 'Tỉnh' },
  { code: '96', name: 'Hậu Giang', type: 'Tỉnh' },
]

// Vietnamese respectful titles based on age and gender
export const getVietnameseTitle = (age: number, gender: 'male' | 'female' | 'other'): string => {
  if (gender === 'male') {
    if (age < 18) return 'Em'
    if (age < 30) return 'Anh'
    if (age < 60) return 'Chú'
    return 'Ông'
  } else if (gender === 'female') {
    if (age < 18) return 'Em'
    if (age < 30) return 'Chị'
    if (age < 60) return 'Cô'
    return 'Bà'
  }
  return 'Bạn'
}

// Vietnamese time periods
export const getVietnameseTimeOfDay = (hour: number): string => {
  if (hour < 6) return 'đêm khuya'
  if (hour < 11) return 'buổi sáng'
  if (hour < 13) return 'buổi trưa'
  if (hour < 18) return 'buổi chiều'
  if (hour < 22) return 'buổi tối'
  return 'đêm'
}

// Vietnamese measurement units conversion
export const convertToVietnameseUnits = {
  // Weight: pounds to kg
  weight: (lbs: number): number => lbs * 0.453592,
  
  // Height: feet/inches to cm
  height: (feet: number, inches: number = 0): number => (feet * 12 + inches) * 2.54,
  
  // Temperature: Fahrenheit to Celsius
  temperature: (fahrenheit: number): number => (fahrenheit - 32) * 5/9,
}

// Vietnamese medical terms translation helper
export const VIETNAMESE_MEDICAL_TERMS = {
  // Body parts
  'head': 'đầu',
  'neck': 'cổ',
  'shoulder': 'vai',
  'arm': 'cánh tay',
  'elbow': 'khuỷu tay',
  'wrist': 'cổ tay',
  'hand': 'bàn tay',
  'finger': 'ngón tay',
  'chest': 'ngực',
  'back': 'lưng',
  'spine': 'cột sống',
  'hip': 'hông',
  'thigh': 'đùi',
  'knee': 'đầu gối',
  'calf': 'bắp chân',
  'ankle': 'mắt cá chân',
  'foot': 'bàn chân',
  'toe': 'ngón chân',
  
  // Common conditions
  'pain': 'đau',
  'swelling': 'sưng',
  'stiffness': 'cứng',
  'weakness': 'yếu',
  'numbness': 'tê',
  'tingling': 'ngứa ran',
  'burning': 'nóng rát',
  'sharp': 'đau nhói',
  'dull': 'đau tức',
  'throbbing': 'đau nhức',
  
  // Treatments
  'exercise': 'bài tập',
  'stretch': 'duỗi giãn',
  'strengthen': 'tăng cường sức mạnh',
  'massage': 'massage',
  'heat therapy': 'liệu pháp nhiệt',
  'ice therapy': 'liệu pháp lạnh',
  'ultrasound': 'siêu âm',
  'electrical stimulation': 'kích thích điện',
}

export const translateMedicalTerm = (englishTerm: string): string => {
  return VIETNAMESE_MEDICAL_TERMS[englishTerm.toLowerCase() as keyof typeof VIETNAMESE_MEDICAL_TERMS] || englishTerm
}