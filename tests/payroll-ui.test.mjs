import { test } from 'node:test'
import assert from 'node:assert/strict'
import { payrollAmountChecks, payrollSummaryRows, payrollUiTotals } from '../app/utils/payrollUi.ts'

test('overview and detailed ledgers preserve their recorded monetary totals', () => {
  assert.deepEqual(payrollUiTotals([{ basicPay: 1000, overtimePay: 100, allowance: 50, deductions: 150, netPay: 1000 }]), { basicPay: 1000, grossPay: 1150, totalDeductions: 150, netPay: 1000 })
  assert.deepEqual(payrollUiTotals([{ basicPay: 1000, grossPay: 1200, totalDeductions: 200, netPay: 1000 }]), { basicPay: 1000, grossPay: 1200, totalDeductions: 200, netPay: 1000 })
  assert.equal(payrollUiTotals([]).netPay, 0)
})
test('preview checks identify inconsistencies without mutating recorded amounts', () => {
  const record = { basicPay: 1000, overtimePay: 100, holidayPay: 0, nightDifferential: 0, allowances: 0, otherEarnings: 0, grossPay: 1100, sss: 50, philHealth: 25, pagIbig: 25, totalDeductions: 100, netPay: 1000 }
  const before = structuredClone(record)
  assert.deepEqual(payrollAmountChecks(record), [])
  assert.equal(payrollAmountChecks({ ...record, netPay: 900 }).length, 1)
  assert.equal(payrollAmountChecks({ ...record, otherEarnings: 5 }).length, 1)
  assert.deepEqual(record, before)
})
test('summaries count unique employees and all payroll records across periods', () => {
  const records = [{ employeeId: 1, department: 'HR', periodName: 'A', grossPay: 100, totalDeductions: 10, netPay: 90 }, { employeeId: 1, department: 'HR', periodName: 'B', grossPay: 200, totalDeductions: 20, netPay: 180 }]
  assert.equal(payrollSummaryRows(records, 'department')[0].employees, 1)
  assert.equal(payrollSummaryRows(records, 'department')[0].records, 2)
  assert.equal(payrollSummaryRows(records, 'department')[0].netPay, 270)
  assert.equal(payrollSummaryRows(records, 'periodName').length, 2)
})
