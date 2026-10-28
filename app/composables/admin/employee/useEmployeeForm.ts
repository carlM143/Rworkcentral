
import type { EmployeeForm, EmployeeDocument } from '~/types/employee-form'

const createInitialForm = (): EmployeeForm => ({
  firstName: '',
  middleName: '',
  lastName: '',
  suffix: '',
  birthDate: '',
  gender: '',
  civilStatus: '',
  email: '',
  mobileNumber: '',
  address: '',
  profilePhoto: null,

  employeeNumber: '',
  dateHired: '',
  departmentId: null,
  department: '',
  positionId: null,
  position: '',
  employmentTypeId: null,
  employmentType: '',
  workScheduleId: null,
  workSchedule: '',
  restDayId: null,
  restDay: '',

  sssNumber: '',
  philHealthNumber: '',
  pagIbigNumber: '',
  tinNumber: '',

  salaryTypeId: null,
  salaryType: '',
  basicSalary: '',
  dailyRate: '',
  hourlyRate: '',
  allowance: '',
  bankName: '',
  accountName: '',
  accountNumber: '',
  payrollGroupId: null,
  payrollGroup: '',
  payrollPeriodId: null,
  
  emergencyContactName: '',
  emergencyRelationship: '',
  emergencyMobileNumber: '',
  emergencyAddress: '',

  documents: [],
})

export const useEmployeeForm = () => {
  const currentStep = useState<number>('employee-form-step', () => 1)
  const form = useState<EmployeeForm>('employee-form-data', createInitialForm)
  const totalSteps = 7

  const steps = [
    { number: 1, title: 'Personal', description: 'Personal information' },
    { number: 2, title: 'Employment', description: 'Employment details' },
    { number: 3, title: 'Government', description: 'Government records' },
    { number: 4, title: 'Payroll', description: 'Salary information' },
    { number: 5, title: 'Contact', description: 'Emergency contact' },
    { number: 6, title: 'Employment Documents', description: 'Employment requirements' },
    { number: 7, title: 'Review', description: 'Review information' },
  ]

  const isFirstStep = computed(() => currentStep.value === 1)
  const isLastStep = computed(() => currentStep.value === totalSteps)
  const progress = computed(() => Math.round((currentStep.value / totalSteps) * 100))

  const nextStep = () => {
    if (currentStep.value < totalSteps) currentStep.value++
  }

  const previousStep = () => {
    if (currentStep.value > 1) currentStep.value--
  }

  const goToStep = (step: number) => {
    if (step >= 1 && step <= totalSteps) currentStep.value = step
  }

  const addDocument = (document: EmployeeDocument) => {
    form.value.documents.push(document)
  }

  const removeDocument = (documentId: string) => {
    form.value.documents = form.value.documents.filter(document => document.id !== documentId)
  }

  const resetForm = () => {
    form.value = createInitialForm()
    currentStep.value = 1
  }

  const setForm = (data: Partial<EmployeeForm>) => {
    form.value = {
      ...createInitialForm(),
      ...data,
      documents: data.documents ?? [],
    }
    currentStep.value = 1
  }

  return {
    form, currentStep, totalSteps, steps,
    isFirstStep, isLastStep, progress,
    nextStep, previousStep, goToStep,
    addDocument, removeDocument,
    resetForm, setForm,
  }
}
