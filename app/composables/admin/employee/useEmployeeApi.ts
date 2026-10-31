import type { EmployeeForm } from '~/types/employee-form'

export interface EmployeeApiResponse {
  success: boolean
  message: string
  data: {
    id: number
    emp_id: number
    firstname: string
    lastname: string
  }
}

export interface EmployeeStatusResponse {
  success: boolean
  message: string
  data: {
    id: number
    status: boolean | number | string
  }
}

const appendText = (
  payload: FormData,
  key: string,
  value: string | number | null | undefined,
) => {
  if (value == null) return
  payload.append(key, String(value).trim())
}

const buildEmployeePayload = (form: EmployeeForm): FormData => {
  const payload = new FormData()

  appendText(payload, 'employee[firstname]', form.firstName)
  appendText(payload, 'employee[middlename]', form.middleName)
  appendText(payload, 'employee[lastname]', form.lastName)
  appendText(payload, 'employee[suffix]', form.suffix)
  appendText(payload, 'employee[birthday]', form.birthDate)
  appendText(payload, 'employee[gender]', form.gender)
  appendText(payload, 'employee[civil_status]', form.civilStatus)

  if (form.profilePhoto instanceof File) {
    payload.append('employee[profile_photo]', form.profilePhoto)
  }

  appendText(payload, 'contact[email]', form.email)
  appendText(payload, 'contact[mobile]', form.mobileNumber)
  appendText(payload, 'contact[residential_address]', form.address)

  appendText(payload, 'employment[employment_type_id]', form.employmentTypeId)
  appendText(payload, 'employment[department_id]', form.departmentId)
  appendText(payload, 'employment[position_id]', form.positionId)
  appendText(payload, 'employment[work_schedule_id]', form.workScheduleId)
  appendText(payload, 'employment[date_hired]', form.dateHired)

  // Rest days come from the selected work schedule's days relation.
  // Never send the removed employment[restday_id] field.
  const governmentRequirements = [
    { name: 'Tax Identification Number (TIN)', number: form.tinNumber },
    { name: 'SSS Number', number: form.sssNumber },
    { name: 'PhilHealth Number', number: form.philHealthNumber },
    { name: 'Pag-IBIG (HDMF) Number', number: form.pagIbigNumber },
  ].filter(item => item.number.trim())

  governmentRequirements.forEach((item, index) => {
    appendText(payload, `government_requirements[${index}][id_name]`, item.name)
    appendText(payload, `government_requirements[${index}][id_number]`, item.number)
  })

  appendText(payload, 'contact_persons[0][name]', form.emergencyContactName)
  appendText(payload, 'contact_persons[0][relationship]', form.emergencyRelationship)
  appendText(payload, 'contact_persons[0][contact_number]', form.emergencyMobileNumber)
  appendText(payload, 'contact_persons[0][address]', form.emergencyAddress)

  form.documents
    .filter(document => document.employmentDocumentId != null)
    .forEach((document, index) => {
      appendText(
        payload,
        `documents[${index}][employment_document_id]`,
        document.employmentDocumentId,
      )
      appendText(payload, `documents[${index}][submitted]`, 1)

      if (document.file instanceof File) {
        payload.append(`documents[${index}][file]`, document.file)
      }
    })

  // Salary setup is added by the Create Employee page when supplied.
  return payload
}

export const useEmployeeApi = () => {
  const { $api } = useNuxtApp()
  const loading = ref(false)
  const errors = ref<Record<string, string[]>>({})

  const createEmployee = async (payload: FormData): Promise<EmployeeApiResponse> => {
    loading.value = true
    errors.value = {}

    try {
      return await $api<EmployeeApiResponse>('/admin/employees', {
        method: 'POST',
        body: payload,
      })
    } catch (error: any) {
      const status = error?.statusCode ?? error?.status ?? error?.response?.status
      if (status === 422) {
        errors.value = error?.data?.errors ?? error?.response?._data?.errors ?? {}
      }
      throw error
    } finally {
      loading.value = false
    }
  }

  const changeEmployeeStatus = async (
    id: number,
    action: 'deactivate' | 'reactivate',
  ): Promise<EmployeeStatusResponse> => {
    if (!Number.isInteger(id) || id < 1) {
      throw new Error('Invalid employee ID.')
    }

    loading.value = true
    errors.value = {}

    try {
      const response = await $api<EmployeeStatusResponse>(
        `/admin/employees/${id}/${action}`,
        { method: 'PATCH' },
      )

      const returnedStatus = response.data?.status
      const active = returnedStatus === true
        || returnedStatus === 1
        || returnedStatus === '1'
        || returnedStatus === 'true'
      const expectedActive = action === 'reactivate'

      if (response.success !== true || returnedStatus == null || active !== expectedActive) {
        throw new Error(`Employee ${action} was not confirmed by the API.`)
      }

      return response
    } catch (error: any) {
      const status = error?.statusCode ?? error?.status ?? error?.response?.status
      if (status === 422) {
        errors.value = error?.data?.errors ?? error?.response?._data?.errors ?? {}
      }
      throw error
    } finally {
      loading.value = false
    }
  }

  const deactivateEmployee = (id: number) => changeEmployeeStatus(id, 'deactivate')
  const reactivateEmployee = (id: number) => changeEmployeeStatus(id, 'reactivate')

  return {
    loading,
    errors,
    buildEmployeePayload,
    createEmployee,
    deactivateEmployee,
    reactivateEmployee,
  }
}
