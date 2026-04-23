const DEFAULT_PASSWORD_HASH = '$2a$10$xGJ9Q7K5X8M0YNw5ZK8YuO5Yv8Q6W5K8Yv9Z0A1B2C3D4E5F6G7H8'; 

const mockUsers = [
  { fullName: 'Admin System', email: 'admin@flight.com', password: DEFAULT_PASSWORD_HASH, role: 'admin' },
  { fullName: 'Nguyễn Văn User', email: 'user@flight.com', password: DEFAULT_PASSWORD_HASH, role: 'user' }
];

const mockAirlines = [
  { name: 'Vietnam Airlines', code: 'VN', logoUrl: 'https://vna.com/logo.png' },
  { name: 'Vietjet Air', code: 'VJ', logoUrl: 'https://vj.com/logo.png' },
  { name: 'Bamboo Airways', code: 'QH', logoUrl: 'https://bb.com/logo.png' }
];

const mockAirports = [
  { code: 'SGN', name: 'Tân Sơn Nhất', city: 'Hồ Chí Minh', country: 'Việt Nam' },
  { code: 'HAN', name: 'Nội Bài', city: 'Hà Nội', country: 'Việt Nam' },
  { code: 'DAD', name: 'Đà Nẵng', city: 'Đà Nẵng', country: 'Việt Nam' }
];

const mockFlights = [
  {
    flightNumber: 'VN-213',
    airlineCode: 'VN', 
    departureAirportCode: 'HAN',
    arrivalAirportCode: 'SGN',
    departureTime: new Date('2026-05-01T08:00:00Z'),
    arrivalTime: new Date('2026-05-01T10:15:00Z'),
    basePrice: 1500000,
    seatCapacity: 180,
    bookedSeats: [],
    status: 'Scheduled'
  },
  {
    flightNumber: 'VJ-124',
    airlineCode: 'VJ',
    departureAirportCode: 'SGN',
    arrivalAirportCode: 'DAD',
    departureTime: new Date('2026-05-02T14:00:00Z'),
    arrivalTime: new Date('2026-05-02T15:20:00Z'),
    basePrice: 800000,
    seatCapacity: 220,
    bookedSeats: [],
    status: 'Scheduled'
  }
];

const mockVouchers = [
  {
    code: 'SUMMER26',
    discountType: 'Percentage',
    discountValue: 10, 
    minPurchaseValue: 2000000,
    validFrom: new Date('2026-04-01T00:00:00Z'),
    validUntil: new Date('2026-08-31T23:59:59Z'),
    usageLimit: 100
  }
];

module.exports = { mockUsers, mockAirlines, mockAirports, mockFlights, mockVouchers };