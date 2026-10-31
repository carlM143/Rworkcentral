import { employeeRequestCategory, type EmployeeRequestCategory } from '~/utils/employeeRequestCategory'
import { employeeLeavePolicy } from '~/utils/employeeLeavePolicy'

export interface LeaveDateItem {
  id?: number
  leave_date: string
  day_type: 'whole_day' | 'half_day'
  day_value?: number
}

export interface EmployeeRequest {
  id: string
  rawId?: number
  requestNo?: string
  category?: EmployeeRequestCategory
  type: string
  requestDate?: string
  start: string
  end: string
  reason: string
  image?: { name: string; dataUrl: string }
  file_url?: string | null
  file_path?: string | null
  status: 'Pending' | 'Approved' | 'Rejected' | 'Cancelled'
  dates?: LeaveDateItem[]
  total_days?: number
  timing?: {
    startTime?: string
    endTime?: string
    endsNextDay?: boolean
    scheduledTimeOut?: string
    requestedTimeOut?: string
    requestedMinutes: number
  }
  leave_type_id?: number
  leave_policy_id?: number
  work_schedule_id?: number
  created_at?: string
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
  restDayNames: string[]
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
  restDays: '',
  restDayNames: [],
  workDays: [],
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
  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
  const dayAliases: Record<string, string> = {
    mon: 'Monday', monday: 'Monday',
    tue: 'Tuesday', tues: 'Tuesday', tuesday: 'Tuesday',
    wed: 'Wednesday', wednesday: 'Wednesday',
    thu: 'Thursday', thur: 'Thursday', thurs: 'Thursday', thursday: 'Thursday',
    fri: 'Friday', friday: 'Friday',
    sat: 'Saturday', saturday: 'Saturday',
    sun: 'Sunday', sunday: 'Sunday',
  }
  const normalizeDayName = (value: unknown) => dayAliases[String(value || '').trim().toLowerCase()] || ''
  const workSchedule = data?.work_schedule || latestEmployment?.work_schedule || {}
  const scheduleDays = Array.isArray(workSchedule?.days) ? workSchedule.days : []
  const responseRestDays = Array.isArray(data?.rest_days)
    ? data.rest_days
        .filter((item: any) => item?.is_working_day === false)
        .map((item: any) => normalizeDayName(item?.day_of_week))
        .filter(Boolean)
    : []
  const legacyRestDay = normalizeDayName(latestEmployment?.restday?.rest_day)
  const restDayNames = [...new Set(responseRestDays.length ? responseRestDays : (legacyRestDay ? [legacyRestDay] : []))]
  const firstScheduleDay = scheduleDays[0] || {}
  const timeIn = String(workSchedule.time_in || firstScheduleDay.time_in || '').slice(0, 5)
  const timeOut = String(workSchedule.time_out || firstScheduleDay.time_out || '').slice(0, 5)
  const workDays = scheduleDays.length
    ? daysOfWeek.map(day => {
        const scheduleDay = scheduleDays.find((item: any) => normalizeDayName(item?.day_of_week) === day)
        return {
          day,
          start: scheduleDay?.time_in ? String(scheduleDay.time_in).slice(0, 5) : '',
          end: scheduleDay?.time_out ? String(scheduleDay.time_out).slice(0, 5) : '',
        }
      })
    : (timeIn && timeOut
        ? daysOfWeek.map(day => ({
            day,
            start: restDayNames.includes(day) ? '' : timeIn,
            end: restDayNames.includes(day) ? '' : timeOut,
          }))
        : [])

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
    restDays: restDayNames.join(', '),
    restDayNames,
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

  const requests = useState<EmployeeRequest[]>('employee-requests', () => [])
  const isLoadingRequests = useState('employee-requests-loading', () => false)
  const requestsError = useState('employee-requests-error', () => '')
  const isSubmittingRequest = useState('employee-request-submitting', () => false)
  const submitError = useState('employee-request-submit-error', () => '')
  const leaveTypesList = useState<any[]>('employee-leave-types', () => [])

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

  const mapBackendRequest = (item: any, category: 'Leave' | 'Undertime' | 'Overtime'): EmployeeRequest => {
    const rawStatus = String(item.status || 'Pending').toLowerCase()
    const status = (rawStatus.charAt(0).toUpperCase() + rawStatus.slice(1)) as EmployeeRequest['status']
    const fileUrl = item.file_url || (item.file_path ? (item.file_path.startsWith('http') ? item.file_path : `/storage/${item.file_path.replace(/^\/+/, '')}`) : null)
    const imageObj = fileUrl ? { name: item.file_path ? item.file_path.split('/').pop() : 'Attachment', dataUrl: fileUrl } : (item.image || undefined)

    const reqDate = item.request_date
      ? (typeof item.request_date === 'string' ? item.request_date.slice(0, 10) : item.request_date)
      : (item.start || item.ot_date || item.undertime_date || '')

    return {
      id: item.request_no || item.id || `${category.toUpperCase().slice(0, 2)}-${item.raw_id || Math.floor(Math.random() * 10000)}`,
      rawId: item.raw_id || (typeof item.id === 'number' ? item.id : undefined),
      requestNo: item.request_no,
      category,
      type: item.type || (category === 'Leave' ? (item.leave_type?.leave_name || 'Vacation Leave') : category),
      requestDate: reqDate,
      start: item.start || item.request_date || item.ot_date || item.undertime_date || '',
      end: item.end || item.request_date || item.ot_date || item.undertime_date || '',
      reason: item.reason || '',
      status,
      image: imageObj,
      file_url: fileUrl,
      file_path: item.file_path,
      timing: item.timing ? {
        startTime: item.timing.startTime,
        endTime: item.timing.endTime,
        endsNextDay: item.timing.endsNextDay,
        scheduledTimeOut: item.timing.scheduledTimeOut,
        requestedTimeOut: item.timing.requestedTimeOut,
        requestedMinutes: item.timing.requestedMinutes ?? 0,
      } : undefined,
      dates: Array.isArray(item.dates) ? item.dates.map((d: any) => ({
        id: d.id,
        leave_date: d.leave_date || d.date,
        day_type: d.day_type || 'whole_day',
        day_value: Number(d.day_value ?? (d.day_type === 'half_day' ? 0.5 : 1.0)),
      })) : undefined,
      total_days: typeof item.total_days === 'number' ? item.total_days : undefined,
      created_at: item.created_at,
    }
  }

  const fetchLeaveTypes = async () => {
    if (!import.meta.client || !auth.isAuthenticated.value) return []
    try {
      const res = await $api<{ success: boolean; data: any[] }>('/employee/leave-types')
      if (res?.success && Array.isArray(res.data)) {
        leaveTypesList.value = res.data
        return res.data
      }
    } catch (err: any) {
      console.warn('Failed to fetch leave types', err)
    }
    return leaveTypesList.value
  }

  const fetchRequests = async () => {
    if (!import.meta.client || !auth.isAuthenticated.value) return requests.value
    isLoadingRequests.value = true
    requestsError.value = ''
    try {
      const [lRes, otRes, utRes] = await Promise.allSettled([
        $api<{ success: boolean; data: any[] }>('/employee/leave-requests'),
        $api<{ success: boolean; data: any[] }>('/employee/overtime-requests'),
        $api<{ success: boolean; data: any[] }>('/employee/undertime-requests'),
      ])

      const lList = (lRes.status === 'fulfilled' && lRes.value?.success && Array.isArray(lRes.value.data))
        ? lRes.value.data.map(i => mapBackendRequest(i, 'Leave')) : []
      const otList = (otRes.status === 'fulfilled' && otRes.value?.success && Array.isArray(otRes.value.data))
        ? otRes.value.data.map(i => mapBackendRequest(i, 'Overtime')) : []
      const utList = (utRes.status === 'fulfilled' && utRes.value?.success && Array.isArray(utRes.value.data))
        ? utRes.value.data.map(i => mapBackendRequest(i, 'Undertime')) : []

      const combined = [...lList, ...otList, ...utList].sort((a, b) => {
        const tA = a.created_at ? new Date(a.created_at).getTime() : new Date(`${a.start}T00:00:00`).getTime()
        const tB = b.created_at ? new Date(b.created_at).getTime() : new Date(`${b.start}T00:00:00`).getTime()
        return tB - tA
      })

      requests.value = combined
      return requests.value
    } catch (err: any) {
      requestsError.value = err?.data?.message || err?.message || 'Failed to load requests.'
      return requests.value
    } finally {
      isLoadingRequests.value = false
    }
  }

  const submitRequest = async (payload: {
    type: string
    requestDate?: string
    start: string
    end?: string
    reason: string
    image?: { name: string; dataUrl: string }
    dates?: LeaveDateItem[]
    timing?: EmployeeRequest['timing']
  }) => {
    if (!import.meta.client) return { success: false, message: 'Client only' }
    isSubmittingRequest.value = true
    submitError.value = ''
    try {
      const category = employeeRequestCategory(payload.type)
      let endpoint = '/employee/leave-requests'
      let body: any = {}

      if (category === 'Overtime') {
        endpoint = '/employee/overtime-requests'
        body = {
          ot_date: payload.start,
          start_time: payload.timing?.startTime,
          end_time: payload.timing?.endTime,
          ends_next_day: payload.timing?.endsNextDay ?? false,
          reason: payload.reason,
          image: payload.image?.dataUrl || undefined,
        }
      } else if (category === 'Undertime') {
        endpoint = '/employee/undertime-requests'
        body = {
          undertime_date: payload.start,
          requested_time: payload.timing?.requestedTimeOut,
          scheduled_time: payload.timing?.endTime || payload.timing?.scheduledTimeOut,
          requested_minutes: payload.timing?.requestedMinutes,
          reason: payload.reason,
          image: payload.image?.dataUrl || undefined,
        }
      } else {
        endpoint = '/employee/leave-requests'
        body = {
          type: payload.type,
          request_date: payload.requestDate || payload.start,
          start_date: payload.start,
          end_date: payload.end || payload.start,
          reason: payload.reason,
          dates: payload.dates,
          image: payload.image?.dataUrl || undefined,
        }
      }

      const response = await $api<{ success: boolean; message: string; data: any }>(endpoint, {
        method: 'POST',
        body,
      })

      if (response?.success) {
        await fetchRequests()
        return { success: true, message: response.message || 'Request submitted successfully.', data: response.data }
      }
      return { success: false, message: response?.message || 'Failed to submit request.' }
    } catch (err: any) {
      const msg = err?.data?.message || (err?.data?.errors ? Object.values(err.data.errors)[0]?.[0] : null) || 'Failed to submit request.'
      submitError.value = msg
      return { success: false, message: msg }
    } finally {
      isSubmittingRequest.value = false
    }
  }

  const addRequest = async (payload: any) => {
    return await submitRequest(payload)
  }

  const updateRequest = async (
    id: string,
    changes: Pick<EmployeeRequest, 'start' | 'end' | 'reason' | 'image' | 'timing'> & {
      type?: string
      dates?: LeaveDateItem[]
      requestDate?: string
      remove_image?: boolean
    }
  ) => {
    if (!import.meta.client) return false
    const existing = requests.value.find(r => r.id === id || String(r.rawId) === String(id))
    if (!existing || existing.status !== 'Pending') return false

    isSubmittingRequest.value = true
    submitError.value = ''
    try {
      const category = employeeRequestCategory(existing.type)
      const rawId = existing.rawId || existing.id
      let endpoint = `/employee/leave-requests/${rawId}`
      let body: any = {}

      const isRemovingImage = changes.remove_image === true || (Boolean(existing.image) && !changes.image)
      const imagePayload = isRemovingImage ? null : (changes.image?.dataUrl || undefined)

      if (category === 'Overtime') {
        endpoint = `/employee/overtime-requests/${rawId}`
        body = {
          ot_date: changes.start,
          start_time: changes.timing?.startTime,
          end_time: changes.timing?.endTime,
          ends_next_day: changes.timing?.endsNextDay ?? false,
          reason: changes.reason,
          image: imagePayload,
          remove_image: isRemovingImage,
        }
      } else if (category === 'Undertime') {
        endpoint = `/employee/undertime-requests/${rawId}`
        body = {
          undertime_date: changes.start,
          requested_time: changes.timing?.requestedTimeOut,
          scheduled_time: changes.timing?.endTime || changes.timing?.scheduledTimeOut,
          requested_minutes: changes.timing?.requestedMinutes,
          reason: changes.reason,
          image: imagePayload,
          remove_image: isRemovingImage,
        }
      } else {
        endpoint = `/employee/leave-requests/${rawId}`
        body = {
          type: changes.type || existing.type,
          request_date: changes.requestDate || existing.requestDate || changes.start,
          start_date: changes.start,
          end_date: changes.end || changes.start,
          reason: changes.reason,
          dates: changes.dates,
          image: imagePayload,
          remove_image: isRemovingImage,
        }
      }

      const response = await $api<{ success: boolean; message: string; data: any }>(endpoint, {
        method: 'PUT',
        body,
      })

      if (response?.success) {
        await fetchRequests()
        return true
      }
      return false
    } catch (err: any) {
      const msg = err?.data?.message || (err?.data?.errors ? Object.values(err.data.errors)[0]?.[0] : null) || 'Failed to update request.'
      submitError.value = msg
      return false
    } finally {
      isSubmittingRequest.value = false
    }
  }

  const cancelRequest = async (id: string) => {
    if (!import.meta.client) return { success: false, message: 'Client only' }
    const existing = requests.value.find(r => r.id === id || String(r.rawId) === String(id))
    if (!existing || existing.status !== 'Pending') {
      return { success: false, message: 'Only pending requests can be cancelled.' }
    }

    const category = employeeRequestCategory(existing.type)
    const rawId = existing.rawId || existing.id
    let endpoint = `/employee/leave-requests/${rawId}/cancel`
    if (category === 'Overtime') {
      endpoint = `/employee/overtime-requests/${rawId}/cancel`
    } else if (category === 'Undertime') {
      endpoint = `/employee/undertime-requests/${rawId}/cancel`
    }

    try {
      const response = await $api<{ success: boolean; message: string; data: any }>(endpoint, {
        method: 'PATCH',
      })
      if (response?.success) {
        existing.status = 'Cancelled'
        await fetchRequests()
        return { success: true, message: response.message || 'Request cancelled successfully.' }
      }
      return { success: false, message: response?.message || 'Unable to cancel request.' }
    } catch (err: any) {
      const msg = err?.data?.message || 'Failed to cancel request.'
      return { success: false, message: msg }
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
      fetchLeaveTypes()
      fetchRequests()
    }
  }, { immediate: true })

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

  const storageError = ref('')

  onMounted(() => {
    if (auth.isAuthenticated.value) {
      fetchProfile()
      fetchLeaveTypes()
      fetchRequests()
    }
  })

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
    submitRequest,
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
    isLoadingRequests,
    requestsError,
    isSubmittingRequest,
    submitError,
    leaveTypesList,
    fetchLeaveTypes,
    fetchRequests,
  }
}
