import { employeeRequestCategory } from '~/utils/employeeRequestCategory'
import { employeeLeavePolicy } from '~/utils/employeeLeavePolicy'

export interface EmployeeRequest {
  id: string
  type: string
  start: string
  end: string
  reason: string
  image?: { name: string; dataUrl: string }
  status: 'Pending' | 'Approved' | 'Rejected' | 'Cancelled'
  timing?: {
    startTime?: string
    endTime?: string
    endsNextDay?: boolean
    scheduledTimeOut?: string
    requestedTimeOut?: string
    requestedMinutes: number
  }
}

export interface EmployeeRequirement {
  id: string
  name: string
  status: 'Submitted' | 'Pending' | 'Verified' | 'Expired' | 'Not provided'
  submittedAt?: string
  remarks?: string
  filePath?: string | null
  category?: string
  code?: string
}

export interface EmployeeProfileData {
  id?: number
  name: string
  firstName?: string
  lastName?: string
  middleName?: string
  suffix?: string
  employeeId: string
  rawEmpId?: number
  sex: string
  gender: string
  age: number | string
  birthday: string
  civilStatus: string
  position: string
  department: string
  departmentCode: string
  location: string
  email: string
  phone: string
  address: string
  emergencyName: string
  emergencyRelationship: string
  emergencyPhone: string
  emergencyAddress: string
  employmentType: string
  employmentStatus: 'Active' | 'Inactive'
  employmentStartDate: string
  salaryType: string
  salaryRate: string
  allowance: string
  bankName: string
  bankAccountName: string
  bankAccountNumber: string
  workSchedule: string
  workScheduleCode?: string
  workScheduleHours?: string
  workScheduleGracePeriod?: number | string
  scheduleTimeIn: string
  scheduleTimeOut: string
  breakTime?: string
  restDays: string
  workDays: Array<{ day: string; start: string; end: string }>
  sssNumber: string
  philhealthNumber: string
  pagibigNumber: string
  tinNumber: string
  governmentIds?: Array<{ id: number; name: string; number: string }>
  requirements: EmployeeRequirement[]
  profilePhoto?: string | null
  profilePhotoUrl?: string | null
}

const defaultProfile = (): EmployeeProfileData => ({
  name: 'Employee',
  profilePhoto: null,
  profilePhotoUrl: null,
  firstName: '',
  lastName: '',
  middleName: '',
  suffix: '',
  employeeId: 'EMP-2026-001',
  rawEmpId: undefined,
  sex: 'Not specified',
  gender: 'Not specified',
  age: '',
  birthday: '',
  civilStatus: 'Single',
  position: 'Administrative Staff',
  department: 'Operations',
  departmentCode: 'OPS',
  location: 'Main Branch',
  email: '',
  phone: '',
  address: '',
  emergencyName: '',
  emergencyRelationship: '',
  emergencyPhone: '',
  emergencyAddress: '',
  employmentType: 'Probationary',
  employmentStatus: 'Active',
  employmentStartDate: '',
  salaryType: 'Semi-Monthly',
  salaryRate: '',
  allowance: '',
  bankName: '',
  bankAccountName: '',
  bankAccountNumber: '',
  workSchedule: 'Regular',
  workScheduleCode: 'WS-001',
  workScheduleHours: '8.00',
  workScheduleGracePeriod: 0,
  scheduleTimeIn: '08:00',
  scheduleTimeOut: '17:00',
  breakTime: '12:00 – 13:00',
  restDays: 'Sunday',
  workDays: [
    { day: 'Monday', start: '08:00', end: '17:00' },
    { day: 'Tuesday', start: '08:00', end: '17:00' },
    { day: 'Wednesday', start: '08:00', end: '17:00' },
    { day: 'Thursday', start: '08:00', end: '17:00' },
    { day: 'Friday', start: '08:00', end: '17:00' },
    { day: 'Saturday', start: '08:00', end: '17:00' },
    { day: 'Sunday', start: '', end: '' },
  ],
  sssNumber: '',
  philhealthNumber: '',
  pagibigNumber: '',
  tinNumber: '',
  governmentIds: [],
  requirements: [
    { id: 'contract-of-employment', name: 'Contract of Employment', status: 'Submitted', submittedAt: '2026-05-04', remarks: 'Signed contract on file.' },
  ],
})

const mapBackendProfile = (data: any, fallbackUser?: any): EmployeeProfileData => {
  const firstname = data?.firstname || ''
  const lastname = data?.lastname || ''
  const middlename = data?.middlename || ''
  const suffix = data?.suffix || ''
  const computedName = [firstname, middlename, lastname, suffix].filter(Boolean).join(' ').trim()
    || data?.user?.name
    || fallbackUser?.name
    || 'Employee'

  const latestEmployment = Array.isArray(data?.employments) && data.employments.length > 0
    ? data.employments[0]
    : null

  const contact = data?.contact_information || {}
  const emergency = Array.isArray(data?.contact_persons) && data.contact_persons.length > 0
    ? data.contact_persons[0]
    : null

  const salary = data?.salary_setup || {}
  const workSchedule = latestEmployment?.work_schedule || {}
  const restDayName = latestEmployment?.restday?.rest_day || 'Sunday'

  const timeIn = workSchedule.time_in ? workSchedule.time_in.slice(0, 5) : '08:00'
  const timeOut = workSchedule.time_out ? workSchedule.time_out.slice(0, 5) : '17:00'

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
  const workDays = daysOfWeek.map(day => ({
    day,
    start: day.toLowerCase() === restDayName.toLowerCase() ? '' : timeIn,
    end: day.toLowerCase() === restDayName.toLowerCase() ? '' : timeOut,
  }))

  const govtList: Array<{ id: number; name: string; number: string }> = Array.isArray(data?.government_requirements)
    ? data.government_requirements.map((g: any) => ({
      id: g.id,
      name: g.id_name,
      number: g.id_number,
    }))
    : []

  const findGovt = (pattern: RegExp) => govtList.find(g => pattern.test(g.name))?.number || ''

  const sssNumber = findGovt(/sss|social\s*security/i)
  const philhealthNumber = findGovt(/philhealth/i)
  const pagibigNumber = findGovt(/pag-?ibig|hdmf/i)
  const tinNumber = findGovt(/tin|tax/i)

  const requirements: EmployeeRequirement[] = Array.isArray(data?.documents) && data.documents.length > 0
    ? data.documents.map((doc: any) => ({
      id: String(doc.id),
      name: doc.employment_document?.document_name || 'Document',
      category: doc.employment_document?.category || 'General',
      code: doc.employment_document?.document_code || '',
      status: (doc.file_path ? 'Submitted' : 'Pending') as EmployeeRequirement['status'],
      submittedAt: doc.created_at ? doc.created_at.slice(0, 10) : '',
      remarks: doc.employment_document?.description || 'Awaiting file verification.',
      filePath: doc.file_path,
    }))
    : [
      { id: '1', name: 'Contract of Employment', status: 'Submitted', submittedAt: '2026-05-04', remarks: 'Signed contract on file.' },
    ]

  const dateHired = latestEmployment?.date_hired
    ? (typeof latestEmployment.date_hired === 'string' ? latestEmployment.date_hired.slice(0, 10) : '')
    : ''

  const birthday = data?.birthday
    ? (typeof data.birthday === 'string' ? data.birthday.slice(0, 10) : '')
    : ''

  return {
    id: data?.id,
    name: computedName,
    firstName: firstname,
    lastName: lastname,
    middleName: middlename,
    suffix: suffix,
    employeeId: data?.emp_id ? `EMP-${data.emp_id}` : (data?.id ? `EMP-${data.id}` : 'EMP-2026-001'),
    rawEmpId: data?.emp_id,
    sex: data?.gender || 'Not specified',
    gender: data?.gender || 'Not specified',
    age: data?.age ?? '',
    birthday,
    civilStatus: data?.civil_status || 'Single',
    department: latestEmployment?.department?.department_name || data?.department?.department_name || 'Operations',
    departmentCode: latestEmployment?.department?.department_code || data?.department?.department_code || 'OPS',
    position: latestEmployment?.position?.position || 'Administrative Staff',
    location: latestEmployment?.department?.company?.location || 'Main Office',
    email: contact.email || data?.user?.email || fallbackUser?.email || '',
    phone: contact.mobile || latestEmployment?.mobile || '',
    address: contact.residential_address || latestEmployment?.residential_address || '',
    emergencyName: emergency?.name || '',
    emergencyRelationship: emergency?.relationship || '',
    emergencyPhone: emergency?.contact_number || '',
    emergencyAddress: emergency?.address || '',
    employmentType: latestEmployment?.employment_type?.name || 'Regular',
    employmentStatus: data?.status === false ? 'Inactive' : 'Active',
    employmentStartDate: dateHired,
    salaryType: salary.salary_type?.type_name || 'Monthly',
    salaryRate: salary.basic_salary ? String(salary.basic_salary) : '',
    allowance: salary.allowance ? String(salary.allowance) : '',
    bankName: salary.bank_name || '',
    bankAccountName: salary.account_name || '',
    bankAccountNumber: salary.account_number || '',
    workSchedule: workSchedule.schedule_name || 'Regular Shift',
    workScheduleCode: workSchedule.schedule_code || '',
    workScheduleHours: workSchedule.required_work_hours ? String(workSchedule.required_work_hours) : '8.00',
    workScheduleGracePeriod: workSchedule.grace_period ?? 0,
    scheduleTimeIn: timeIn,
    scheduleTimeOut: timeOut,
    breakTime: workSchedule.break_start && workSchedule.break_end ? `${workSchedule.break_start.slice(0, 5)} – ${workSchedule.break_end.slice(0, 5)}` : '',
    restDays: restDayName,
    workDays,
    sssNumber,
    philhealthNumber,
    pagibigNumber,
    tinNumber,
    governmentIds: govtList,
    requirements,
    profilePhoto: data?.profile_photo || null,
    profilePhotoUrl: data?.profile_photo_url || data?.profile_photo_base64 || (data?.profile_photo ? `/api/employee/profile/photo` : null),
  }
}

export const useEmployeePortal = () => {
  const auth = useAuth()
  const { $api } = useNuxtApp()

  const profile = useState<EmployeeProfileData>('employee-profile', () => {
    const base = defaultProfile()
    if (auth.user.value?.name) base.name = auth.user.value.name
    if (auth.user.value?.email) base.email = auth.user.value.email
    return base
  })

  const isLoadingProfile = useState('employee-profile-loading', () => false)
  const profileError = useState('employee-profile-error', () => '')
  const isSavingContact = useState('employee-contact-saving', () => false)
  const contactError = useState('employee-contact-error', () => '')
  const isSavingPassword = useState('employee-password-saving', () => false)
  const passwordError = useState('employee-password-error', () => '')
  const isUploadingPhoto = useState('employee-photo-uploading', () => false)
  const photoError = useState('employee-photo-error', () => '')

  const uploadProfilePhoto = async (photoData: string | File) => {
    if (!import.meta.client) return { success: false, message: 'Client only' }
    isUploadingPhoto.value = true
    photoError.value = ''
    try {
      let body: any
      if (typeof photoData === 'string') {
        body = { photo_base64: photoData }
      } else {
        const formData = new FormData()
        formData.append('photo', photoData)
        body = formData
      }

      const response = await $api<{
        success: boolean
        message: string
        data?: { profile_photo: string; profile_photo_url: string; profile_photo_base64?: string }
      }>('/employee/profile/photo', {
        method: 'POST',
        body,
      })

      if (response?.success) {
        const newUrl = response.data?.profile_photo_url || (typeof photoData === 'string' ? photoData : null)
        profile.value.profilePhoto = response.data?.profile_photo || null
        profile.value.profilePhotoUrl = newUrl
        return { success: true, message: response.message || 'Photo uploaded successfully.', url: newUrl }
      }
      return { success: false, message: response?.message || 'Failed to upload photo.' }
    } catch (err: any) {
      const msg = err?.data?.message || err?.message || 'Failed to upload profile photo.'
      photoError.value = msg
      return { success: false, message: msg }
    } finally {
      isUploadingPhoto.value = false
    }
  }

  const deleteProfilePhoto = async () => {
    if (!import.meta.client) return { success: false, message: 'Client only' }
    isUploadingPhoto.value = true
    photoError.value = ''
    try {
      const response = await $api<{ success: boolean; message: string }>('/employee/profile/photo', {
        method: 'DELETE',
      })
      if (response?.success) {
        profile.value.profilePhoto = null
        profile.value.profilePhotoUrl = null
        return { success: true, message: response.message || 'Photo removed.' }
      }
      return { success: false, message: response?.message || 'Failed to remove photo.' }
    } catch (err: any) {
      const msg = err?.data?.message || err?.message || 'Failed to delete photo.'
      photoError.value = msg
      return { success: false, message: msg }
    } finally {
      isUploadingPhoto.value = false
    }
  }

  const fetchProfile = async () => {
    if (!import.meta.client || !auth.isAuthenticated.value) return null
    isLoadingProfile.value = true
    profileError.value = ''
    try {
      const response = await $api<{ success: boolean; data: any; message?: string }>('/employee/profile')
      if (response?.data) {
        profile.value = mapBackendProfile(response.data, auth.user.value)
      }
      return profile.value
    } catch (err: any) {
      profileError.value = err?.data?.message || err?.message || 'Failed to retrieve employee profile.'
      return null
    } finally {
      isLoadingProfile.value = false
    }
  }

  const updateContactInfo = async (payload: {
    mobile?: string
    residential_address?: string
    emergency_name?: string
    emergency_relationship?: string
    emergency_phone?: string
    emergency_address?: string
  }) => {
    if (!import.meta.client) return { success: false, message: 'Client only' }
    isSavingContact.value = true
    contactError.value = ''
    try {
      const response = await $api<{ success: boolean; data: any; message: string }>('/employee/profile/contact', {
        method: 'PUT',
        body: payload,
      })
      if (response?.success) {
        await fetchProfile()
        return { success: true, message: response.message || 'Contact details updated successfully.' }
      }
      return { success: false, message: response?.message || 'Unable to update contact.' }
    } catch (err: any) {
      const msg = err?.data?.message || (err?.data?.errors ? Object.values(err.data.errors)[0]?.[0] : null) || 'Failed to update contact.'
      contactError.value = msg
      return { success: false, message: msg }
    } finally {
      isSavingContact.value = false
    }
  }

  const updatePassword = async (payload: {
    current_password: string
    password: string
    password_confirmation: string
  }) => {
    if (!import.meta.client) return { success: false, message: 'Client only' }
    isSavingPassword.value = true
    passwordError.value = ''
    try {
      const response = await $api<{ success: boolean; message: string }>('/employee/profile/password', {
        method: 'PUT',
        body: payload,
      })
      return { success: true, message: response?.message || 'Password updated successfully.' }
    } catch (err: any) {
      const msg = err?.data?.message || (err?.data?.errors ? Object.values(err.data.errors)[0]?.[0] : null) || 'Failed to update password.'
      passwordError.value = msg
      return { success: false, message: msg }
    } finally {
      isSavingPassword.value = false
    }
  }

  // Synchronize authenticated user details
  watch(() => auth.user.value, (currentUser) => {
    if (currentUser?.name && !profile.value.firstName) {
      profile.value.name = currentUser.name
    }
    if (currentUser?.email && !profile.value.phone) {
      profile.value.email = currentUser.email
    }
    if (auth.isAuthenticated.value) {
      fetchProfile()
    }
  }, { immediate: true })

  const timedRequestRecords: EmployeeRequest[] = [
    { id: 'UT-2026-001', type: 'Undertime', start: '2026-10-23', end: '2026-10-23', reason: 'Medical appointment', status: 'Pending', timing: { startTime: '15:00', endTime: '17:00', scheduledTimeOut: '17:00', requestedTimeOut: '15:00', requestedMinutes: 120 } },
    { id: 'UT-2026-002', type: 'Undertime', start: '2026-10-16', end: '2026-10-16', reason: 'Family appointment', status: 'Approved', timing: { startTime: '16:30', endTime: '17:00', scheduledTimeOut: '17:00', requestedTimeOut: '16:30', requestedMinutes: 30 } },
    { id: 'OT-2026-001', type: 'Overtime', start: '2026-10-23', end: '2026-10-23', reason: 'Complete inventory reconciliation', status: 'Pending', timing: { startTime: '17:00', endTime: '19:00', endsNextDay: false, requestedMinutes: 120 } },
    { id: 'OT-2026-002', type: 'Overtime', start: '2026-10-15', end: '2026-10-15', reason: 'Additional operational support', status: 'Approved', timing: { startTime: '17:00', endTime: '18:30', endsNextDay: false, requestedMinutes: 90 } },
  ]

  const requests = useState<EmployeeRequest[]>('employee-requests', () => [
    ...timedRequestRecords,
    { id: 'REQ-1001', type: 'Vacation Leave', start: '2026-05-29', end: '2026-05-30', reason: 'Family commitment', status: 'Pending' },
    { id: 'REQ-1002', type: 'Overtime', start: '2026-05-22', end: '2026-05-22', reason: 'Additional operational support', status: 'Approved' },
    { id: 'REQ-1003', type: 'Time Log Correction', start: '2026-05-20', end: '2026-05-20', reason: 'Attendance record correction', status: 'Approved' },
  ])

  const attendanceRecords = {
    '2026-10-12': { timeIn: '2026-10-12T09:00:00', timeOut: '2026-10-12T17:00:00', hoursWorked: 7, status: 'On Time' },
    '2026-10-13': { timeIn: '2026-10-13T08:00:00', timeOut: '2026-10-13T17:00:00', hoursWorked: 8, status: 'On Time' },
    '2026-10-14': { timeIn: '2026-10-14T08:12:00', timeOut: '2026-10-14T17:00:00', hoursWorked: 7.8, status: 'Late' },
    '2026-10-15': { timeIn: '2026-10-15T07:58:00', timeOut: '2026-10-15T17:00:00', hoursWorked: 8, status: 'On Time' },
    '2026-10-16': { timeIn: '2026-10-16T08:00:00', timeOut: '2026-10-16T16:30:00', hoursWorked: 7.5, status: 'Undertime' },
    '2026-10-17': { timeIn: '2026-10-17T08:00:00', timeOut: '2026-10-17T12:00:00', hoursWorked: 4, status: 'On Time' },
  }

  const punches = useState<Record<string, { timeIn?: string; timeOut?: string; hoursWorked?: number; status?: string }>>('employee-punches', () => ({ ...attendanceRecords }))

  for (const [date, record] of Object.entries(attendanceRecords)) {
    if (!punches.value[date]) punches.value[date] = { ...record }
  }

  const loaded = useState('employee-storage-loaded', () => false)
  const storageError = ref('')

  const populateTimedRequests = () => {
    for (const record of timedRequestRecords) {
      if (!requests.value.some(request => request.id === record.id)) {
        requests.value.push({ ...record, timing: record.timing ? { ...record.timing } : undefined })
      }
    }
  }

  populateTimedRequests()

  onMounted(() => {
    if (auth.isAuthenticated.value) {
      fetchProfile()
    }

    if (loaded.value) return
    loaded.value = true
    try {
      const saved = JSON.parse(localStorage.getItem('rworkcentral-employee-demo') || 'null')
      if (saved && typeof saved === 'object') {
        if (Array.isArray(saved.requests) && saved.requests.every((row: EmployeeRequest) => row && ['id', 'type', 'start', 'end', 'reason'].every(key => typeof (row as unknown as Record<string, unknown>)[key] === 'string') && ['Pending', 'Approved', 'Rejected', 'Cancelled'].includes(row.status) && (!row.image || (typeof row.image.name === 'string' && typeof row.image.dataUrl === 'string' && row.image.dataUrl.length <= 4 * Math.ceil(2 * 1024 * 1024 / 3) + 23 && /^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/.test(row.image.dataUrl))))) {
          requests.value = saved.requests
        }
      }
    } catch {
      storageError.value = 'Saved data could not be loaded.'
    }
    populateTimedRequests()
  })

  const addRequest = (request: Omit<EmployeeRequest, 'status'>) => requests.value.unshift({ ...request, status: 'Pending' })

  const updateRequest = (id: string, changes: Pick<EmployeeRequest, 'start' | 'end' | 'reason' | 'image' | 'timing'> & { type?: string }) => {
    const request = requests.value.find(row => row.id === id)
    if (!request || request.status !== 'Pending') return false
    const category = employeeRequestCategory(request.type)
    const nextType = changes.type ?? request.type
    if (!category || !['Leave', 'Undertime', 'Overtime'].includes(category) || employeeRequestCategory(nextType) !== category) return false
    if (nextType !== request.type && category === 'Leave' && !employeeLeavePolicy(profile.value.employmentType).some(leave => leave.name === nextType && leave.canRequest)) return false
    Object.assign(request, { type: nextType, start: changes.start, end: changes.end, reason: changes.reason, image: changes.image, timing: changes.timing })
    return true
  }

  const cancelRequest = (id: string) => {
    const request = requests.value.find(row => row.id === id && row.status === 'Pending')
    if (request) request.status = 'Cancelled'
  }

  const displayName = computed(() => {
    if (profile.value.name && profile.value.name !== 'Employee') return profile.value.name
    return auth.user.value?.name || profile.value.name || 'Employee'
  })
  const email = computed(() => auth.user.value?.email || profile.value.email || '')
  const initials = computed(() => displayName.value
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part[0]?.toUpperCase())
    .join(''))

  return {
    profile,
    requests,
    punches,
    addRequest,
    updateRequest,
    cancelRequest,
    storageError,
    displayName,
    email,
    initials,
    isLoadingProfile,
    profileError,
    fetchProfile,
    updateContactInfo,
    updatePassword,
    isSavingContact,
    contactError,
    isSavingPassword,
    passwordError,
    isUploadingPhoto,
    photoError,
    uploadProfilePhoto,
    deleteProfilePhoto,
  }
}
