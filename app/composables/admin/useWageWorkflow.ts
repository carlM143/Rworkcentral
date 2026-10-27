import type { WageOrder } from '~/types/wageManagement'
import type { WageFlowState, WageProposal, WageBatch, OrderForm } from '~/types/wageFlow'
import { calculateWageRetro, canApplyWageOrder, employeeDailyRate, evaluateWage, mockWorkedDays, previousWageOrder, roundWage, validateWageOrder, wageToday } from '~/utils/wageWorkflow'

export const useWageWorkflow = () => {
  const master = useWageManagement()
  const auth = useAuth()
  const state = useState<WageFlowState>('wage-flow-v2', () => ({
    employees: master.wageAdjustments.value.map(item => {
      const workedDays = mockWorkedDays(item.employeeId)
      return { employeeId: item.employeeId, employeeNumber: item.employeeNumber, employeeName: item.employeeName,
        department: item.department, position: item.position, positionLevel: item.position.includes('Senior') ? 3 : item.position === 'Driver' ? 1 : 2,
        region: item.region, classification: item.classification ?? 'Non-Agriculture',
        employmentType: item.employeeId === 6 ? 'monthly' : 'daily', dailyRate: item.currentRate,
        monthlyRate: item.employeeId === 6 ? 18000 : undefined, workedDays,
        daysWorkedSinceEffectivity: workedDays.filter(day => day.date >= item.effectiveDate && day.date < wageToday()).reduce((sum, day) => sum + day.days, 0) }
    }), proposals: [], evaluations: [], batches: [], events: [], earnings: [],
    config: { annualFactor: 313, distortionThreshold: 10, paidDays: 26 }, nextId: 1,
  }))
  const nextId = () => state.value.nextId++
  const actor = () => auth.user.value?.name || 'Demo reviewer'
  const log = (action: string, orderCode: string, remarks = '', proposal?: WageProposal, batch?: WageBatch) => {
    state.value.events.unshift({ id: nextId(), actor: actor(), action, orderCode, remarks,
      at: new Date().toISOString(), proposalId: proposal?.id, employee: proposal?.employeeName, batchId: batch?.id })
  }
  const orderByCode = (code: string) => master.wageOrders.value.find(order => order.code === code)
  const batchFor = (code: string) => state.value.batches.find(batch => batch.orderCode === code)
  const rowsFor = (code: string) => state.value.proposals.filter(row => row.wageOrderCode === code)
  const batchRows = (batch?: WageBatch) => batch ? state.value.proposals.filter(row => batch.proposalIds.includes(row.id)) : []
  const configLocked = computed(() => state.value.batches.some(batch => ['For Review', 'Approved'].includes(batch.status))
    || state.value.proposals.some(row => row.result === 'Distortion Review' && ['Approved', 'Scheduled'].includes(row.status)))
  const updateConfig = (factor: number, threshold: number) => {
    if (configLocked.value) throw new Error('Finish or reject pending approvals before changing evaluation rules.')
    if (!Number.isFinite(factor) || factor <= 0 || factor > 366 || !Number.isFinite(threshold) || threshold < 0) throw new Error('Use an annual factor from 1 to 366 and a nonnegative distortion threshold.')
    if (factor === state.value.config.annualFactor && threshold === state.value.config.distortionThreshold) return
    state.value.config.annualFactor = factor; state.value.config.distortionThreshold = threshold
    const preserved = new Set(state.value.proposals.filter(row => row.status === 'Applied').map(row => row.evaluationId))
    state.value.proposals = state.value.proposals.filter(row => row.status === 'Applied')
    state.value.evaluations = state.value.evaluations.filter(evaluation => preserved.has(evaluation.id))
    state.value.batches = state.value.batches.filter(batch => batch.status === 'Applied')
    log('Evaluation rules changed', '', `Annual factor ${factor}; distortion threshold PHP ${threshold}. Unsubmitted proposals cleared; evaluate again.`)
  }
  const orderEditable = (order: WageOrder) => ['Draft', 'Scheduled'].includes(order.status) && !state.value.evaluations.some(item => item.orderCode === order.code)
  const saveOrder = (form: OrderForm, id?: number) => {
    const existing = master.wageOrders.value.find(item => item.id === id)
    if (id && (!existing || !orderEditable(existing))) throw new Error('Only unused draft or scheduled orders can be edited.')
    const prior = previousWageOrder(master.wageOrders.value, form, id)
    const normalized = { ...form, oldMinimumRate: prior?.newMinimumRate ?? form.oldMinimumRate,
      code: form.code.trim(), title: form.title.trim(), classification: form.classification.trim(), tranche: form.tranche.trim() || 'Single Tranche' }
    const problem = validateWageOrder(normalized, master.wageOrders.value, id)
    if (problem) throw new Error(problem)
    const order: WageOrder = { ...normalized, id: id ?? Math.max(0, ...master.wageOrders.value.map(item => item.id)) + 1,
      increaseAmount: roundWage(normalized.newMinimumRate - normalized.oldMinimumRate), status: 'Draft' }
    if (existing) Object.assign(existing, order); else master.wageOrders.value.push(order)
    log(existing ? 'Order updated and returned to Draft' : 'Draft order created', order.code)
    return order
  }
  const publishOrder = (order: WageOrder) => {
    if (!['Draft', 'Scheduled'].includes(order.status)) throw new Error('Only draft or scheduled orders can be published.')
    const problem = validateWageOrder(order, master.wageOrders.value, order.id)
    if (problem) throw new Error(problem)
    order.status = order.effectiveDate > wageToday() ? 'Scheduled' : 'Active'
    log(`Order ${order.status.toLowerCase()}`, order.code)
  }
  const supersedeOrder = (order: WageOrder) => {
    if (order.status !== 'Active') throw new Error('Only active orders can be superseded.')
    if (['For Review', 'Approved'].includes(batchFor(order.code)?.status ?? '') || rowsFor(order.code).some(row => ['Approved', 'Scheduled'].includes(row.status))) throw new Error('Resolve pending or approved proposals before superseding this order.')
    order.status = 'Superseded'; log('Order superseded', order.code)
  }
  const matchingEmployees = (order: WageOrder) => state.value.employees.filter(employee => employee.region === order.region
    && employee.classification.toLowerCase() === order.classification.toLowerCase())
  const evaluationFor = (order: WageOrder) => matchingEmployees(order).map(employee => evaluateWage(employee, order,
    matchingEmployees(order), state.value.config.annualFactor, state.value.config.distortionThreshold, -employee.employeeId, 0, wageToday()))
  const saveEvaluation = (order: WageOrder) => {
    if (!['Active', 'Scheduled'].includes(order.status)) throw new Error('Activate or schedule this order before evaluating employees.')
    if (['For Review', 'Approved', 'Applied'].includes(batchFor(order.code)?.status ?? '') || rowsFor(order.code).some(row => ['Approved', 'Scheduled', 'Applied'].includes(row.status))) throw new Error('This evaluation has approved or applied decisions. Finish or reject the batch before re-evaluating.')
    const employees = matchingEmployees(order)
    if (!employees.length) throw new Error('No sample employees match this region and classification.')
    const evaluationId = nextId()
    const evaluation = { id: evaluationId, orderCode: order.code, at: new Date().toISOString(), annualFactor: state.value.config.annualFactor, distortionThreshold: state.value.config.distortionThreshold }
    state.value.evaluations = state.value.evaluations.filter(item => item.orderCode !== order.code)
    state.value.evaluations.push(evaluation)
    state.value.proposals = state.value.proposals.filter(row => row.wageOrderCode !== order.code)
    const proposals = employees.map(employee => evaluateWage(employee, order, employees, evaluation.annualFactor, evaluation.distortionThreshold, nextId(), evaluationId, wageToday()))
    proposals.forEach(row => { state.value.proposals.push(row); log('Proposal generated: Draft', order.code, `Result: ${row.result}`, row) })
    state.value.batches = state.value.batches.filter(batch => batch.orderCode !== order.code)
    const batch: WageBatch = { id: nextId(), evaluationId, orderCode: order.code, status: 'Draft', proposalIds: proposals.filter(row => row.result === 'Required').map(row => row.id), remarks: '' }
    state.value.batches.push(batch)
    log('Evaluation completed; batch Draft', order.code, `${batch.proposalIds.length} Required proposals. Distortion Review and Compliant rows excluded.`, undefined, batch)
    return proposals.length
  }
  const submitBatch = (batch: WageBatch) => {
    if (!['Draft', 'Rejected'].includes(batch.status) || !batch.proposalIds.length) throw new Error('There are no draft Required proposals to submit.')
    const order = orderByCode(batch.orderCode)
    if (!order || !['Active', 'Scheduled'].includes(order.status)) throw new Error('The wage order is unavailable.')
    const rows = batchRows(batch)
    if (rows.length !== batch.proposalIds.length || rows.some(row => row.result !== 'Required' || row.status !== 'Draft')) throw new Error('Re-evaluate this batch before submitting.')
    batch.status = 'For Review'; batch.submittedBy = actor(); batch.decidedBy = undefined; batch.remarks = ''
    rows.forEach(row => { row.status = 'For Review'; log('Proposal submitted: For Review', row.wageOrderCode, '', row, batch) })
    log('Batch submitted for approval', batch.orderCode, `${rows.length} Required proposals`, undefined, batch)
  }
  const decideBatch = (batch: WageBatch, decision: 'Approve' | 'Reject', remarks: string) => {
    if (batch.status !== 'For Review') throw new Error('Only submitted batches can be decided.')
    if (!remarks.trim()) throw new Error('Add approver remarks for the batch decision.')
    const order = orderByCode(batch.orderCode)
    if (!order || !['Active', 'Scheduled'].includes(order.status)) throw new Error('The wage order is unavailable.')
    batch.status = decision === 'Approve' ? 'Approved' : 'Rejected'; batch.remarks = remarks.trim(); batch.decidedBy = actor()
    batchRows(batch).forEach(row => {
      row.status = decision === 'Reject' ? 'Draft' : order.effectiveDate > wageToday() ? 'Scheduled' : 'Approved'
      row.approvedBy = decision === 'Approve' ? actor() : undefined
      log(`Proposal ${row.status}`, batch.orderCode, remarks, row, batch)
    })
    log(`Batch ${batch.status}`, batch.orderCode, remarks, undefined, batch)
  }
  const retroFor = (row: WageProposal, applyDate = wageToday()) => row.appliedAt ? {
    retroFrom: row.retroFrom, retroTo: row.retroTo, daysCovered: row.daysCovered, retroAmount: row.retroAmount,
  } : calculateWageRetro(row.currentRate, row.proposedRate, row.effectiveDate, applyDate, state.value.employees.find(employee => employee.employeeId === row.employeeId)?.workedDays ?? [])
  const readyProblem = (row: WageProposal) => {
    const problem = canApplyWageOrder(orderByCode(row.wageOrderCode), wageToday())
    if (problem) return problem
    if (!['Approved', 'Scheduled'].includes(row.status) || row.appliedAt) return 'This proposal is not approved or has already been applied.'
    const employee = state.value.employees.find(item => item.employeeId === row.employeeId)
    if (!employee || Math.abs(employeeDailyRate(employee, row.conversionFactor) - row.currentRate) >= 0.01) return 'The employee rate changed after evaluation. Re-evaluate before applying.'
    if (row.proposedRate <= row.currentRate || row.proposedRate < row.newMinimumRate) return 'The proposal must increase the rate and meet the minimum.'
    return ''
  }
  const applyRows = (rows: WageProposal[], batch?: WageBatch) => {
    if (!rows.length) throw new Error('No approved proposals to apply.')
    for (const row of rows) { const problem = readyProblem(row); if (problem) throw new Error(`${row.employeeName}: ${problem}`) }
    rows.forEach(row => {
      const employee = state.value.employees.find(item => item.employeeId === row.employeeId)!
      Object.assign(row, retroFor(row), { appliedAt: wageToday(), status: 'Applied' })
      employee.dailyRate = row.proposedRate
      if (employee.employmentType === 'monthly') employee.monthlyRate = roundWage(row.proposedRate * row.conversionFactor / 12)
      if (row.retroAmount > 0 && !state.value.earnings.some(item => item.proposalId === row.id)) state.value.earnings.push({ id: nextId(), proposalId: row.id,
        employeeId: row.employeeId, employeeName: row.employeeName, orderCode: row.wageOrderCode,
        label: 'Wage Order Retro Pay', payrollRun: 'Next payroll run (preview)', amount: row.retroAmount, includeIn13thMonthBasic: true,
        retroFrom: row.retroFrom, retroTo: row.retroTo, daysCovered: row.daysCovered, retroAmount: row.retroAmount })
      log('Proposal Applied (Effective)', row.wageOrderCode, `Retro PHP ${row.retroAmount}; ${row.daysCovered} actual mock days worked.`, row, batch)
    })
    // A rate change invalidates untouched approvals in other evaluations.
    const changed = new Set(rows.map(row => row.employeeId))
    state.value.batches.filter(other => other.id !== batch?.id && other.status !== 'Applied' && batchRows(other).some(row => changed.has(row.employeeId))).forEach(other => {
      other.status = 'Rejected'; other.remarks = 'Employee rates changed in another applied evaluation. Re-evaluate.'
      batchRows(other).forEach(row => { if (row.status !== 'Applied') { row.status = 'Draft'; row.approvedBy = undefined; log('Proposal reset: Draft', other.orderCode, other.remarks, row, other) } })
      log('Batch invalidated: Rejected', other.orderCode, other.remarks, undefined, other)
    })
  }
  const applyBatch = (batch: WageBatch) => {
    if (batch.status !== 'Approved') throw new Error('Approve the whole batch before applying.')
    const rows = batchRows(batch)
    if (rows.length !== batch.proposalIds.length || rows.some(row => row.result !== 'Required')) throw new Error('This batch does not match its approved evaluation.')
    applyRows(rows, batch); batch.status = 'Applied'; batch.appliedAt = wageToday(); log('Batch Applied', batch.orderCode, batch.remarks, undefined, batch)
  }
  const decideDistortion = (row: WageProposal, decision: 'Approve' | 'Dismiss', proposedRate: number, remarks: string) => {
    if (row.result !== 'Distortion Review' || row.status === 'Applied' || row.distortionDecision) throw new Error('This is not an unresolved distortion proposal.')
    if (!remarks.trim()) throw new Error('Add HR remarks for the distortion decision.')
    if (decision === 'Approve' && (!Number.isFinite(proposedRate) || proposedRate <= row.currentRate || proposedRate < row.newMinimumRate)) throw new Error('Approved distortion corrections must increase the daily rate and meet the minimum.')
    row.proposedRate = decision === 'Approve' ? roundWage(proposedRate) : row.currentRate
    row.distortionDecision = decision === 'Approve' ? 'Approved' : 'Dismissed'; row.remarks = remarks.trim()
    row.status = decision === 'Approve' ? row.effectiveDate > wageToday() ? 'Scheduled' : 'Approved' : 'For Review'
    row.approvedBy = decision === 'Approve' ? actor() : undefined
    log(`Distortion ${row.distortionDecision}; proposal ${row.status}`, row.wageOrderCode, row.remarks, row)
  }
  const applyDistortion = (row: WageProposal) => {
    if (row.result !== 'Distortion Review' || row.distortionDecision !== 'Approved') throw new Error('Only separately approved distortion corrections can be applied here.')
    applyRows([row])
  }
  return { state, employees: computed(() => state.value.employees), wageOrders: master.wageOrders,
    wageAdjustments: computed(() => state.value.proposals), events: computed(() => state.value.events), earnings: computed(() => state.value.earnings), configLocked,
    activeWageOrder: computed(() => master.wageOrders.value.filter(order => order.status === 'Active' && order.effectiveDate <= wageToday()).sort((a, b) => Number(b.region === 'NCR') - Number(a.region === 'NCR') || b.effectiveDate.localeCompare(a.effectiveDate))[0]),
    orderByCode, batchFor, batchRows, rowsFor, updateConfig, orderEditable, saveOrder, publishOrder, supersedeOrder,
    evaluationFor, saveEvaluation, submitBatch, decideBatch, retroFor, readyProblem, applyBatch, decideDistortion, applyDistortion }
}
