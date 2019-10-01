import { flatten } from '@/src/helpers/object'

test('multilevel-dimensional array', () => {
  expect(flatten<number>([1, [2], [[3]]])).toEqual([1, 2, 3])
})
