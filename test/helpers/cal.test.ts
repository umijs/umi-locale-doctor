import { toPercent } from '@/src/helpers/cal'

test('divisible progress val', () => {
  expect(toPercent(40, 10)).toBe('25.0')
})

test('non-divisible progress val', () => {
  expect(toPercent(47, 10)).toBe('21.3')
})
