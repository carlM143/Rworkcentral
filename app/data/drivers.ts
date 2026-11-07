export interface DriverInventory {
  id: number
  name: string
  route: string
  status: 'Available' | 'Assigned' | 'On Break' | 'Unavailable'
  vehicle: string
  plate: string
  capacity: number
  seatsUsed: number
  lastLocation: string
  nextAvailable: string
  availabilityWindow: string
  assignedTrip: string
  employeeId?: number
  licenseNo?: string
  driverCode?: string
  expiryDate?: string
  phone?: string
  email?: string
}

export const driverInventory: DriverInventory[] = [
  {
    id: 1,
    name: 'Mark Santos',
    route: 'North Loop',
    status: 'Available',
    vehicle: 'Toyota Hiace',
    plate: 'ABC-1234',
    capacity: 12,
    seatsUsed: 0,
    lastLocation: 'Terminal Hub',
    nextAvailable: 'Today, 2:30 PM',
    availabilityWindow: '2:30 PM - 5:00 PM',
    assignedTrip: 'No active trip',
    employeeId: 1001,
    licenseNo: 'N03-2023-18407',
    driverCode: 'DRV-001',
    expiryDate: '2027-07-15',
    phone: '+63 917 123 4567',
    email: 'mark.santos@rworkcentral.com',
  },
  {
    id: 2,
    name: 'Ramon Cruz',
    route: 'Cebu City',
    status: 'Assigned',
    vehicle: 'Isuzu Elf',
    plate: 'XYZ-9988',
    capacity: 10,
    seatsUsed: 7,
    lastLocation: 'Mactan Airport',
    nextAvailable: 'Today, 6:45 PM',
    availabilityWindow: '6:45 PM - 9:00 PM',
    assignedTrip: 'Airport transfer',
    employeeId: 1002,
    licenseNo: 'N03-2024-22411',
    driverCode: 'DRV-002',
    expiryDate: '2028-01-09',
    phone: '+63 918 889 1245',
    email: 'ramon.cruz@rworkcentral.com',
  },
  {
    id: 3,
    name: 'Jerome Dela Cruz',
    route: 'South Service',
    status: 'On Break',
    vehicle: 'Ford Transit',
    plate: 'LMN-7601',
    capacity: 15,
    seatsUsed: 3,
    lastLocation: 'Depot A',
    nextAvailable: 'Today, 1:15 PM',
    availabilityWindow: '1:15 PM - 3:00 PM',
    assignedTrip: 'School route',
    employeeId: 1003,
    licenseNo: 'N03-2022-11184',
    driverCode: 'DRV-003',
    expiryDate: '2026-11-28',
    phone: '+63 909 401 7840',
    email: 'jerome.delacruz@rworkcentral.com',
  },
  {
    id: 4,
    name: 'Aldrin Baguio',
    route: 'Airport Express',
    status: 'Unavailable',
    vehicle: 'Mitsubishi Fuso',
    plate: 'QRS-4432',
    capacity: 8,
    seatsUsed: 8,
    lastLocation: 'Service Bay',
    nextAvailable: 'Tomorrow, 8:00 AM',
    availabilityWindow: 'Tomorrow, 8:00 AM',
    assignedTrip: 'Maintenance check',
    employeeId: 1004,
    licenseNo: 'N03-2021-00991',
    driverCode: 'DRV-004',
    expiryDate: '2026-01-18',
    phone: '+63 926 778 1310',
    email: 'aldrin.baguio@rworkcentral.com',
  },
  {
    id: 5,
    name: 'Neil Ferrer',
    route: 'Dumaguete Route',
    status: 'Available',
    vehicle: 'Hino Van',
    plate: 'TUV-2345',
    capacity: 9,
    seatsUsed: 2,
    lastLocation: 'City Terminal',
    nextAvailable: 'Today, 11:00 AM',
    availabilityWindow: '11:00 AM - 2:00 PM',
    assignedTrip: 'No active trip',
    employeeId: 1005,
    licenseNo: 'N03-2025-00318',
    driverCode: 'DRV-005',
    expiryDate: '2028-06-29',
    phone: '+63 929 611 7908',
    email: 'neil.ferrer@rworkcentral.com',
  },
  {
    id: 6,
    name: 'Joshua Rivera',
    route: 'Bacolod Shuttle',
    status: 'Assigned',
    vehicle: 'Mercedes Sprinter',
    plate: 'DEF-5441',
    capacity: 14,
    seatsUsed: 11,
    lastLocation: 'Central Station',
    nextAvailable: 'Tomorrow, 7:30 AM',
    availabilityWindow: 'Tomorrow, 7:30 AM - 10:00 AM',
    assignedTrip: 'Intercity shuttle',
    employeeId: 1006,
    licenseNo: 'N03-2023-77120',
    driverCode: 'DRV-006',
    expiryDate: '2027-02-12',
    phone: '+63 945 109 6271',
    email: 'joshua.rivera@rworkcentral.com',
  },
]
