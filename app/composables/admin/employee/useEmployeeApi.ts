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

const appendText = (
  payload: FormData,
  key: string,
  value: string | number | null,
) => {
  if (value === null) return

  payload.append(key, String(value).trim())
}

const buildEmployeePayload = (form: EmployeeForm) => {
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
  appendText(payload, 'employment[restday_id]', form.restDayId)
  appendText(payload, 'employment[date_hired]', form.dateHired)

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
        document.employmentDocumentId ?? null,
      )
      appendText(payload, `documents[${index}][submitted]`, 1)

      if (document.file instanceof File) {
        payload.append(`documents[${index}][file]`, document.file)
      }
    })

  // Payroll is intentionally omitted for now. Laravel requires payroll_period_id,
  // but the frontend has no payroll-period field and the backend exposes no
  // payroll-period endpoint. Sending a partial payroll object causes a 422.
  return payload
}

export const useEmployeeApi = () => {
  const { $api } = useNuxtApp()

  const loading = ref(false)
  const errors = ref<Record<string, string[]>>({})

  // CREATE EMPLOYEE
  const createEmployee = async (payload: FormData) => {
    loading.value = true
    errors.value = {}

    try {
      const response = await $api<EmployeeApiResponse>(
        '/admin/employees',
        {
          method: 'POST',
          body: payload,
        },
      )

      return response
    } catch (error: any) {
      const status = error?.statusCode ?? error?.status ?? error?.response?.status

      if (status === 422) {
        errors.value = error?.data?.errors || {}
      }

      throw error
    } finally {
      loading.value = false
    }
  }

  return {
    loading,
    errors,
    buildEmployeePayload,
    createEmployee,
  }
}
