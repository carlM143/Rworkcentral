# Wage order and adjustment flow

Implemented as a frontend-only, session-backed workflow. The existing Wage Orders and Wage Adjustments routes and design system are retained. There are no backend calls or changes to other payroll modules.

## What changed

1. **Wage Orders:** configure master data and save a Draft, then activate/schedule separately. Region is a dropdown. The preceding active/scheduled tranche supplies a read-only previous minimum; manual entry is allowed only when no preceding order exists. Validation rejects duplicate codes, non-increasing rates, conflicting tranche rates and duplicate effective dates for the same region/classification. Each tranche applies until the next start date.
2. **Evaluate Employees:** available only on Wage Adjustments. Wage Orders provides “View Affected Employees,” which selects the order through a query parameter without starting evaluation. Evaluation generates a new proposal snapshot for each matching sample employee.
3. **Classification:** Required takes priority when the daily equivalent is below minimum. Compliant employees may instead require Distortion Review when their minimum/junior rate gap is below the configured daily threshold. Monthly conversion is `monthly rate × 12 ÷ company annual factor`, rounded to cents. The default factor is 313; it can be changed, for example to 261. Angela Flores is a monthly-paid sample below minimum with the default factor.
4. **Batch approval:** all Required proposals in the evaluation form one batch, independently of table search/filter/pagination. Submit once; approve or reject once with remarks. Rejection returns those proposals to Draft. Compliant and Distortion Review rows never enter this batch. Required row menus contain only View Details and View History.
5. **HR distortion decisions:** approve a justified increase or dismiss individually, with remarks. Approved HR corrections must be applied separately; dismissal is a decision field, not another workflow status.
6. **Apply and retro:** only an Approved batch can apply. A future order keeps approved rows Scheduled and disables Apply until effectivity. Apply snapshots retro, updates sample employee rates and creates separate next-payroll earning previews labeled **Wage Order Retro Pay**. It does not modify a real payroll run. Reapplication is blocked.
7. **History:** status transitions record actor, action, Manila-displayed timestamp and remarks. Proposal and batch history remain available locally.

Result (`Required / Compliant / Distortion Review`) is separate from proposal workflow (`Draft / For Review / Approved / Scheduled / Applied`). The UI labels the last status “Applied (Effective).” Result remains the classification at evaluation even after application.

## Retro rules

- From the order effective date through the day before application.
- `(proposed daily rate − old daily rate) × actual recorded mock days worked`.
- Dated mock attendance is provided for 2026–2027 and includes absences and half-days. Repeated dates are not counted twice. The employee's `daysWorkedSinceEffectivity` field is descriptive; the calculation uses the dated records for the exact selected period.
- No retro if application is on/before effectivity or there is no increase.
- Table columns, summary cards and review/apply dialogs show the period, days and amount. A separate earning-line preview is shown for each positive amount.
- `includeIn13thMonthBasic: true` and the requested UI note represent the basic-salary inclusion rule in this mock flow. No 13th-month computation in another module is changed.
- The paid-days/month control affects only the potential monthly impact card, never retro.

## State shape

The composable owns `useState('wage-flow-v2')`:

```text
employees[]    identity, region/classification, positionLevel,
               employmentType daily/monthly, dailyRate/monthlyRate,
               daysWorkedSinceEffectivity, workedDays[{date, days}]
config         annualFactor, distortionThreshold, paidDays
evaluations[]  id, orderCode, timestamp, frozen factor/threshold
proposals[]    evaluation/employee IDs, frozen old rate and conversion factor,
               proposed rate, result, workflow status, HR decision,
               remarks/approver, retro snapshot and applied date
batches[]      evaluation/order IDs, Required proposal IDs,
               Draft/For Review/Approved/Rejected/Applied,
               remarks, submitter, decision actor, applied date
earnings[]     proposal/employee IDs, separate retro earning preview,
               amount/period/days and includeIn13thMonthBasic
events[]       actor, action, timestamp, remarks, order/proposal/batch IDs
nextId         session-local sequence
```

Wage order master records continue to use the existing mock `wage-management-orders` state. Refreshing the app resets the sample workspace. Applied proposals preserve old rates and retro snapshots while employee records receive the new rate; this prevents historical retro from disappearing after application.

Pure conversion, classification, tranche-validation and retro helpers are in `app/utils/wageWorkflow.ts`. State transitions are isolated in `useWageWorkflow.ts` so persistence can later be replaced by API calls. Pending/approved decisions freeze evaluation rules; changed employee rates invalidate affected unapplied approvals rather than silently applying stale snapshots.

## Comparison with the earlier flow

This is better for standard wage-order compliance: fewer repeated decisions, an explicit evaluation scope and visible retro-pay handling. The tradeoff is that one rejected batch returns all Required proposals for review, so evaluation accuracy and clear batch scope matter more. Individual HR discretion remains available for distortion cases.

## Verification

`npm run test:wages` builds the app, runs the pure helper tests and exercises the batch flow in the browser. Tests cover monthly factors, classification priority, actual-day retro, tranche autofill/overlap validation, filter-independent batch decisions, reject/resubmit, future-order guards, separate HR decisions and the no-required empty state.
