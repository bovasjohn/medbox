// The standard tests printed on page 2 of every report (same for all reports).
// Each report stores its own ticks, so a failed test can be recorded.

export const GENERAL_TESTS = [
  'Check the exterior of equipment for any signs of damage',
  'Top panel and housing undamaged',
  'Unit is clean with no spills or dust, clear of objects on top.',
  'Input connectors are undamaged.',
  'Battery replaced (if necessary).',
  'Verified the self-test',
  'Open user accessible covers turn ON the unit check Audio output circuitry is functional.',
  'Display screen is functional',
  'Visually inspect the general condition.',
  'Visual/Audible service alarm',
  'Verify Battery installation and status',
  'Unit ok',
]

// Output energy check: wave, expected value, default measured value.
export const CALIBRATION_ROWS = [
  { wave: 'Asystole', expected: 'NO SHOCK', measured: '0 JOULES' },
  { wave: 'Normal Sinus', expected: 'NO SHOCK', measured: '0 JOULES' },
  { wave: 'V Fib', expected: '120-200J', measured: '170J' },
]

// Starting checklist for a new report: everything passes.
export function defaultChecklist() {
  return {
    enabled: true,
    tests: GENERAL_TESTS.map((test) => ({ test, pass: true })),
    calibration: CALIBRATION_ROWS.map((row) => ({ ...row, pass: true })),
  }
}

// Page 2 is optional. Reports saved before the option existed keep it.
export const checklistEnabled = (report) => report.checklist?.enabled !== false

// Reports saved before the checklist existed print the standard list, all passed.
export function reportChecklist(report) {
  const saved = report.checklist
  const base = defaultChecklist()
  if (!saved) return base
  return {
    enabled: saved.enabled !== false,
    tests: Array.isArray(saved.tests) && saved.tests.length ? saved.tests : base.tests,
    calibration: Array.isArray(saved.calibration) && saved.calibration.length ? saved.calibration : base.calibration,
  }
}
