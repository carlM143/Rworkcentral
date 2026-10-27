import { test } from 'node:test'
import assert from 'node:assert/strict'
import { calculateWageRetro, classifyWage, evaluateWage, monthlyToDailyRate, previousWageOrder, validateWageOrder, canApplyWageOrder, validWageDate } from '../app/utils/wageWorkflow.ts'

const order = { id: 1, code: 'TEST-01', title: 'Sample Order', region: 'NCR', classification: 'Non-Agriculture', oldMinimumRate: 700, newMinimumRate: 750, increaseAmount: 50, effectiveDate: '2026-07-25', tranche: '1', source: 'Sample', status: 'Active' }
const employee = { employeeId: 1, employeeNumber: 'EMP-001', employeeName: 'Sample Employee', department: 'Operations', position: 'Driver', positionLevel: 1, region: 'NCR', classification: 'Non-Agriculture', employmentType: 'daily', dailyRate: 720, daysWorkedSinceEffectivity: 2.5, workedDays: [{ date: '2026-07-25', days: 1 }, { date: '2026-07-27', days: 0.5 }, { date: '2026-07-28', days: 1 }] }

test('monthly conversion uses the configured annual factor', () => {
  assert.equal(monthlyToDailyRate(18000, 313), 690.1)
  assert.equal(monthlyToDailyRate(18000, 261), 827.59)
  assert.throws(() => monthlyToDailyRate(18000, 0))
  assert.equal(classifyWage({ ...employee, employmentType: 'monthly', monthlyRate: 18000 }, order, [], 313, 10).result, 'Required')
  assert.equal(classifyWage({ ...employee, employmentType: 'monthly', monthlyRate: 18000 }, order, [], 261, 10).result, 'Compliant')
})
test('Required has priority; distortion is a separate compliant classification', () => {
  assert.equal(classifyWage(employee, order, [], 313, 50).result, 'Required')
  assert.equal(classifyWage({ ...employee, dailyRate: 755 }, order, [], 313, 10).result, 'Distortion Review')
  assert.equal(classifyWage({ ...employee, dailyRate: 755 }, order, [], 313, 0).result, 'Compliant')
  const junior = { ...employee, employeeId: 2, dailyRate: 800, positionLevel: 1 }
  assert.equal(classifyWage({ ...employee, dailyRate: 805, positionLevel: 2 }, order, [junior], 313, 10).result, 'Distortion Review')
  const proposal = evaluateWage(employee, order, [employee], 313, 10, 1, 1, '2026-07-29')
  assert.equal(proposal.result, 'Required'); assert.equal(proposal.status, 'Draft')
  assert.equal(proposal.proposedRate, 750); assert.equal(proposal.requiredIncrease, 30)
})
test('retro uses dated actual work, includes half days and excludes apply day', () => {
  const workedDays = [...employee.workedDays, { date: '2026-07-25', days: 1 }, { date: '2026-07-24', days: 1 }, { date: '2026-07-29', days: 1 }]
  assert.deepEqual(calculateWageRetro(720, 750, '2026-07-25', '2026-07-29', workedDays), { retroFrom: '2026-07-25', retroTo: '2026-07-28', daysCovered: 2.5, retroAmount: 75 })
  assert.equal(calculateWageRetro(720, 750, '2026-07-25', '2026-07-25', workedDays).retroAmount, 0)
  assert.equal(calculateWageRetro(720, 750, '2027-01-01', '2026-07-29', workedDays).retroAmount, 0)
  assert.equal(calculateWageRetro(750, 750, '2026-07-25', '2026-07-29', workedDays).retroAmount, 0)
  assert.throws(() => calculateWageRetro(NaN, 750, '2026-07-25', '2026-07-29', workedDays))
})
test('previous minimum follows the preceding active or scheduled tranche', () => {
  const tranche2 = { ...order, id: 2, code: 'TEST-02', oldMinimumRate: 750, newMinimumRate: 780, effectiveDate: '2027-01-01', status: 'Scheduled' }
  assert.equal(previousWageOrder([order, tranche2], { ...tranche2 }, 2).newMinimumRate, 750)
  assert.equal(previousWageOrder([order, tranche2], { ...order, effectiveDate: '2027-03-01' }).newMinimumRate, 780)
  assert.equal(previousWageOrder([order], { ...order, region: 'Region III' }), undefined)
})
test('order validation prevents duplicate dates and non-increasing minimums', () => {
  assert.equal(validateWageOrder(order, [], undefined), '')
  assert.match(validateWageOrder({ ...order, code: 'ANOTHER' }, [order]), /effective date/)
  assert.match(validateWageOrder({ ...order, newMinimumRate: 700 }, []), /greater/)
  assert.match(validateWageOrder({ ...order, effectiveDate: '2026-02-30' }, []), /valid effective/)
  assert.match(validateWageOrder({ ...order, region: 'Free text' }, []), /valid region/)
  assert.equal(validWageDate('2024-02-29'), true)
})
test('scheduled orders cannot be applied before effectivity', () => {
  assert.match(canApplyWageOrder({ ...order, status: 'Scheduled', effectiveDate: '2027-01-01' }, '2026-10-26'), /disabled until/)
  assert.equal(canApplyWageOrder(order, '2026-10-26'), '')
  assert.match(canApplyWageOrder({ ...order, status: 'Draft' }, '2026-10-26'), /active or scheduled/)
})
