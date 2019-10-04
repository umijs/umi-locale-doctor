import { flatten, toILoc } from '@/src/helpers/object'

describe('flatten', () => {
  it('multilevel-dimensional array', () => {
    expect(flatten<number>([1, [2], [[3]]])).toEqual([1, 2, 3])
  })

  it('null val', () => {
    expect(flatten<number>(null)).toEqual([])
  })

  it('invalid val', () => {
    expect(flatten<number>('hello')).toEqual([])
  })
})

test('to Iloc', () => {
  expect(
    toILoc({
      start: {
        line: 1,
        column: 1
      },
      end: {
        line: 2,
        column: 2
      }
    })
  ).toEqual({
    startLine: 1,
    startLineColumn: 1,
    endLine: 2,
    endLineColumn: 2
  })
})
