// Illustrative frontend company rules only. HR must confirm these before use.
// Statutory eligibility is never inferred from employment type or sex alone.
export const employeeLeavePolicy = (employmentType: string) => {
  const type = employmentType.trim().toLowerCase()
  const regular = ['regular', 'regular employee'].includes(type)
  const probationary = type === 'probationary'
  const known = regular || probationary || ['contractual', 'project-based', 'part-time', 'intern'].includes(type)
  const company = (name: string, allowed: boolean, rule: string, credits: number | null = null) => ({
    name, category: 'Company Leave', status: !known ? 'HR review required' : allowed ? 'Available to request' : 'Not available under current policy',
    canRequest: !known || allowed, rule,
    allocated: !known || credits === null ? null : allowed ? credits : 0,
    used: !known || credits === null ? null : 0,
    available: !known || credits === null ? null : allowed ? credits : 0,
  })
  const statutory = (name: string, rule: string) => ({ name, category: 'Statutory Leave', status: 'HR review required', canRequest: true, rule, allocated: null, used: null, available: null })
  return [
    company('Vacation Leave', regular, 'Current frontend rule: regular employees only; credits and dates require HR approval.', 12),
    company('Sick Leave', regular || probationary, 'Current frontend rule: regular and probationary employees; documentation and paid credits require HR confirmation.', 8),
    company('Emergency Leave', regular || probationary, 'Current frontend rule: regular and probationary employees; qualifying emergencies require HR approval.', 3),
    company('Leave Without Pay', true, 'Current frontend rule: all listed employment types may request unpaid time off, subject to approval.'),
    statutory('Maternity Leave', 'HR must assess applicable legal eligibility, documentation and benefit requirements.'),
    statutory('Paternity Leave', 'HR must assess applicable legal eligibility and supporting documentation.'),
    statutory('Solo Parent Leave', 'HR must verify solo-parent qualification, required documentation and applicable service requirements.'),
    statutory('Special Leave', 'HR must identify the applicable statutory entitlement and verify its eligibility requirements.'),
  ]
}
