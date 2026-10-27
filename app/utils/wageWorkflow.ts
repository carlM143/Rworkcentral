import type { WageOrder } from '../types/wageManagement'
import type { WageEmployee, WageProposal, WageRetro, WorkedDay, OrderForm } from '../types/wageFlow'

export const wageRegions = ['NCR', 'CAR', 'Region I', 'Region II', 'Region III', 'Region IV-A', 'MIMAROPA', 'Region V', 'Region VI', 'Region VII', 'Region VIII', 'Region IX', 'Region X', 'Region XI', 'Region XII', 'Caraga', 'BARMM']
export const wageToday = () => new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Manila', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date())
export const wageMoney = (value: number) => new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(value)
export const roundWage = (value: number) => Math.round((value + Number.EPSILON) * 100) / 100
export const validWageDate = (date: string) => /^\d{4}-\d{2}-\d{2}$/.test(date) && !Number.isNaN(Date.parse(date)) && new Date(date).toISOString().slice(0, 10) === date
export const previousWageDate = (date: string) => { const day = new Date(date + 'T00:00:00Z'); day.setUTCDate(day.getUTCDate() - 1); return day.toISOString().slice(0, 10) }
export const monthlyToDailyRate = (monthlyRate: number, annualFactor: number) => {
  if (!Number.isFinite(monthlyRate) || monthlyRate < 0 || !Number.isFinite(annualFactor) || annualFactor <= 0) throw new Error('Enter a valid monthly rate and company annual factor.')
  return roundWage(monthlyRate * 12 / annualFactor)
}
export const employeeDailyRate = (employee: WageEmployee, annualFactor: number) => employee.employmentType === 'monthly' ? monthlyToDailyRate(employee.monthlyRate ?? 0, annualFactor) : employee.dailyRate

// Each tranche runs until the next start date. Duplicate start dates for one
// region/classification would make the applicable minimum ambiguous.
export const previousWageOrder = (orders: WageOrder[], form: Pick<WageOrder, 'region' | 'classification' | 'effectiveDate'>, id?: number) => orders
  .filter(item => item.id !== id && ['Active', 'Scheduled'].includes(item.status) && item.region === form.region
    && item.classification.trim().toLowerCase() === form.classification.trim().toLowerCase()
    && (!validWageDate(form.effectiveDate) || item.effectiveDate < form.effectiveDate))
  .sort((a, b) => b.effectiveDate.localeCompare(a.effectiveDate))[0]
export const validateWageOrder = (form: OrderForm, orders: WageOrder[], id?: number) => {
  if (![form.code, form.title, form.region, form.classification, form.effectiveDate].every(value => value?.trim())) return 'Complete the order code, title, region, classification and effective date.'
  if (!wageRegions.includes(form.region)) return 'Select a valid region.'
  if (!validWageDate(form.effectiveDate)) return 'Enter a valid effective date.'
  if (orders.some(item => item.id !== id && item.code.toLowerCase() === form.code.trim().toLowerCase())) return 'Wage order code must be unique.'
  if (orders.some(item => item.id !== id && item.status !== 'Superseded' && item.region === form.region
    && item.classification.trim().toLowerCase() === form.classification.trim().toLowerCase() && item.effectiveDate === form.effectiveDate)) return 'An order already starts on this effective date for the same region and classification.'
  if (!Number.isFinite(form.oldMinimumRate) || !Number.isFinite(form.newMinimumRate) || form.oldMinimumRate < 0 || form.newMinimumRate <= form.oldMinimumRate) return 'New minimum must be greater than the previous daily minimum.'
  const previous = previousWageOrder(orders, form, id)
  if (previous && form.oldMinimumRate !== previous.newMinimumRate) return 'Previous minimum must match the preceding active or scheduled tranche.'
  const next = orders.filter(item => item.id !== id && ['Active', 'Scheduled'].includes(item.status) && item.region === form.region && item.classification.trim().toLowerCase() === form.classification.trim().toLowerCase() && item.effectiveDate > form.effectiveDate).sort((a, b) => a.effectiveDate.localeCompare(b.effectiveDate))[0]
  if (next && form.newMinimumRate >= next.newMinimumRate) return 'This rate conflicts with the next configured tranche. Review its date and minimum.'
  return ''
}
export const classifyWage = (employee: WageEmployee, order: WageOrder, employees: WageEmployee[], annualFactor: number, threshold: number) => {
  const daily = employeeDailyRate(employee, annualFactor)
  if (daily < order.newMinimumRate) return { result: 'Required' as const, proposedRate: order.newMinimumRate, requiredIncrease: roundWage(order.newMinimumRate - daily) }
  const juniors = employees.filter(item => item.employeeId !== employee.employeeId && item.region === employee.region && item.classification === employee.classification && item.positionLevel < employee.positionLevel)
    .map(item => Math.max(employeeDailyRate(item, annualFactor), order.newMinimumRate)).filter(rate => rate <= daily)
  const gap = Math.min(daily - order.newMinimumRate, ...juniors.map(rate => daily - rate))
  return { result: threshold > 0 && gap < threshold ? 'Distortion Review' as const : 'Compliant' as const, proposedRate: daily, requiredIncrease: 0 }
}
export const calculateWageRetro = (oldRate: number, newRate: number, effectiveDate: string, applyDate: string, workedDays: WorkedDay[]): WageRetro => {
  if (!Number.isFinite(oldRate) || !Number.isFinite(newRate) || oldRate < 0 || newRate < 0) throw new Error('Retro calculation requires valid daily rates.')
  if (!validWageDate(effectiveDate) || !validWageDate(applyDate)) throw new Error('Retro calculation requires valid dates.')
  if (applyDate <= effectiveDate || newRate <= oldRate) return { retroFrom: null, retroTo: null, daysCovered: 0, retroAmount: 0 }
  const retroTo = previousWageDate(applyDate)
  const uniqueDays = new Map<string, number>()
  workedDays.filter(item => item.date >= effectiveDate && item.date <= retroTo && validWageDate(item.date) && Number.isFinite(item.days) && item.days > 0)
    .forEach(item => uniqueDays.set(item.date, Math.max(uniqueDays.get(item.date) ?? 0, Math.min(1, item.days))))
  const daysCovered = roundWage([...uniqueDays.values()].reduce((sum, days) => sum + days, 0))
  return { retroFrom: effectiveDate, retroTo, daysCovered, retroAmount: roundWage((newRate - oldRate) * daysCovered) }
}
export const evaluateWage = (employee: WageEmployee, order: WageOrder, employees: WageEmployee[], annualFactor: number, threshold: number, id: number, evaluationId: number, applyDate: string): WageProposal => {
  const currentRate = employeeDailyRate(employee, annualFactor)
  const classification = classifyWage(employee, order, employees, annualFactor, threshold)
  return { id, evaluationId, employeeId: employee.employeeId, employeeNumber: employee.employeeNumber, employeeName: employee.employeeName,
    department: employee.department, position: employee.position, region: employee.region, classification: employee.classification,
    employmentType: employee.employmentType, monthlyRate: employee.monthlyRate, conversionFactor: annualFactor, currentRate,
    newMinimumRate: order.newMinimumRate, ...classification, distortionRisk: classification.result === 'Distortion Review', status: 'Draft',
    wageOrderCode: order.code, effectiveDate: order.effectiveDate, remarks: '',
    ...calculateWageRetro(currentRate, classification.proposedRate, order.effectiveDate, applyDate, employee.workedDays) }
}
export const canApplyWageOrder = (order: WageOrder | undefined, applyDate: string) => {
  if (!order || !['Active', 'Scheduled'].includes(order.status)) return 'The wage order must be active or scheduled.'
  if (order.effectiveDate > applyDate) return `Apply is disabled until ${order.effectiveDate}; this wage order is scheduled for a future date.`
  return ''
}
export const mockWorkedDays = (employeeId: number): WorkedDay[] => {
  const result: WorkedDay[] = []
  for (let day = new Date('2026-01-01T00:00:00Z'); day <= new Date('2027-12-31T00:00:00Z'); day.setUTCDate(day.getUTCDate() + 1)) {
    if (day.getUTCDay() === 0 || (day.getUTCDate() + employeeId) % 13 === 0) continue
    result.push({ date: day.toISOString().slice(0, 10), days: (day.getUTCDate() + employeeId) % 19 === 0 ? 0.5 : 1 })
  }
  return result
}
