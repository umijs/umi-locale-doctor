import { flatten } from '@/src/helpers/object'

test('multilevel-dimensional array', () => {
  expect(flatten<number>([1, [2], [[3]]])).toEqual([1, 2, 3])
})

test('null val', () => {
  expect(flatten<number>(null)).toEqual([])
})

test('invalid val', () => {
  expect(flatten<number>('hello')).toEqual([])
})
