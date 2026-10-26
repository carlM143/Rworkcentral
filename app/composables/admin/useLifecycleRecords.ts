
export type LifecycleSection =
  | 'onboarding'
  | 'regularization'
  | 'transfers'
  | 'promotions'
  | 'changes'
  | 'offboarding'
  | 'history'

export type LifecycleStatus =
  | 'Pending'
  | 'In Progress'
  | 'Scheduled'
  | 'Completed'
  | 'Cancelled'

export interface LifecycleRecord {
  id: number
  reference: string
  employeeId: string
  employeeName: string
  department: string
  transaction: string
  previousValue: string
  newValue: string
  effectiveDate: string
  requestedBy: string
  status: LifecycleStatus
  remarks: string
  section: LifecycleSection
}

export const lifecycleSections: Record<
  LifecycleSection,
  { title: string; description: string }
> = {
  onboarding: {
    title: 'Employee Onboarding',
    description: 'Monitor newly hired employees and onboarding progress.',
  },
  regularization: {
    title: 'Regularization',
    description: 'Monitor employee milestones and regularization status.',
  },
  transfers: {
    title: 'Employee Transfers',
    description: 'Track department transfers and their effective dates.',
  },
  promotions: {
    title: 'Employee Promotions',
    description: 'Monitor position changes and promotion records.',
  },
  changes: {
    title: 'Employment Changes',
    description: 'Track changes in employee employment information.',
  },
  offboarding: {
    title: 'Employee Offboarding',
    description: 'Monitor employee exit processing and clearance status.',
  },
  history: {
    title: 'Lifecycle History',
    description: 'Review historical employee lifecycle transactions.',
  },
}

// Sample frontend records only.
// Replace with Laravel API data when endpoints are ready.
const sampleRecords: LifecycleRecord[] = [
  {
    id: 1,
    reference: 'LC-2026-001',
    employeeId: 'EMP-001',
    employeeName: 'Mark Lopez',
    department: 'Operations',
    transaction: 'Regularization',
    previousValue: 'Probationary',
    newValue: 'Regular',
    effectiveDate: '2026-09-18',
    requestedBy: 'HR Administrator',
    status: 'Pending',
    remarks: 'Pending HR review.',
    section: 'regularization',
  },
  {
    id: 2,
    reference: 'LC-2026-002',
    employeeId: 'EMP-003',
    employeeName: 'Pedro Reyes',
    department: 'Finance',
    transaction: 'Department Transfer',
    previousValue: 'Finance',
    newValue: 'Billing',
    effectiveDate: '2026-09-15',
    requestedBy: 'HR Administrator',
    status: 'Scheduled',
    remarks: 'Scheduled department transfer.',
    section: 'transfers',
  },
  {
    id: 3,
    reference: 'LC-2026-003',
    employeeId: 'EMP-005',
    employeeName: 'Carlo Mendoza',
    department: 'Operations',
    transaction: 'Promotion',
    previousValue: 'Driver',
    newValue: 'Senior Driver',
    effectiveDate: '2026-09-20',
    requestedBy: 'HR Administrator',
    status: 'Pending',
    remarks: 'Pending approval.',
    section: 'promotions',
  },
  {
    id: 4,
    reference: 'LC-2026-004',
    employeeId: 'EMP-008',
    employeeName: 'Jenny Ramos',
    department: 'Human Resources',
    transaction: 'Employment Change',
    previousValue: 'Contractual',
    newValue: 'Regular',
    effectiveDate: '2026-10-01',
    requestedBy: 'HR Administrator',
    status: 'In Progress',
    remarks: 'Employment record update in progress.',
    section: 'changes',
  },
  {
    id: 5,
    reference: 'LC-2026-005',
    employeeId: 'EMP-010',
    employeeName: 'Grace Navarro',
    department: 'Billing',
    transaction: 'Regularization',
    previousValue: 'Probationary',
    newValue: 'Regular',
    effectiveDate: '2026-10-01',
    requestedBy: 'HR Administrator',
    status: 'Pending',
    remarks: 'Awaiting milestone review.',
    section: 'regularization',
  },
  {
    id: 6,
    reference: 'LC-2026-006',
    employeeId: 'EMP-004',
    employeeName: 'Ana Garcia',
    department: 'Operations',
    transaction: 'Offboarding',
    previousValue: 'Active',
    newValue: 'Inactive',
    effectiveDate: '2026-09-30',
    requestedBy: 'HR Administrator',
    status: 'In Progress',
    remarks: 'Clearance processing.',
    section: 'offboarding',
  },
  {
    id: 7,
    reference: 'LC-2026-007',
    employeeId: 'EMP-012',
    employeeName: 'Rica Santos',
    department: 'Administration',
    transaction: 'Onboarding',
    previousValue: 'New Hire',
    newValue: 'Onboarding',
    effectiveDate: '2026-10-12',
    requestedBy: 'HR Administrator',
    status: 'Completed',
    remarks: 'Initial onboarding completed.',
    section: 'onboarding',
  },
]

export const useLifecycleRecords = () => {
  const records = useState<LifecycleRecord[]>(
    'lifecycle-records',
    () => sampleRecords.map(item => ({ ...item })),
  )

  return { records }
}
