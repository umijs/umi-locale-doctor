import { Container } from 'typedi'
import { IResultMatcherToken } from '@/src/services/resultMatcher'

describe('result matcher', () => {
  it('matched NeverUsedKeys', () => {
    const matcher = Container.get(IResultMatcherToken)

    const warnings = matcher.matchNeverUsedKeys(
      [
        {
          lang: 'zh-CN',
          localeKeys: [
            {
              key: 'name',
              loc: {
                startLine: 1,
                startLineColumn: 3,
                endLine: 1,
                endLineColumn: 7
              },
              filePath: '/a/b/locales/zh-CN.ts'
            }
          ]
        }
      ],
      new Set([])
    )

    expect(warnings).toEqual([
      {
        key: 'name',
        loc: { startLine: 1, startLineColumn: 3, endLine: 1, endLineColumn: 7 },
        filePath: '/a/b/locales/zh-CN.ts'
      }
    ])
  })

  it('nothing matched NeverUsedKeys', () => {
    const matcher = Container.get(IResultMatcherToken)

    const warnings = matcher.matchNeverUsedKeys(
      [
        {
          lang: 'zh-CN',
          localeKeys: [
            {
              key: 'name',
              loc: {
                startLine: 1,
                startLineColumn: 3,
                endLine: 1,
                endLineColumn: 7
              },
              filePath: '/a/b/locales/zh-CN.ts'
            }
          ]
        }
      ],
      new Set(['name'])
    )

    expect(warnings).toEqual([])
  })

  it('matched NeverUsedKeys case 1', () => {
    const matcher = Container.get(IResultMatcherToken)

    const warnings = matcher.matchUndefinedKeys(
      [],
      [
        {
          filePath: '/a/b/pages/home.ts',
          keys: [
            {
              key: 'name',
              loc: {
                startLine: 1,
                startLineColumn: 3,
                endLine: 1,
                endLineColumn: 7
              }
            }
          ]
        }
      ]
    )

    expect(warnings).toEqual([
      {
        key: 'name',
        sourcePath: '/a/b/pages/home.ts',
        loc: { startLine: 1, startLineColumn: 3, endLine: 1, endLineColumn: 7 },
        langs: ['none']
      }
    ])
  })

  it('matched NeverUsedKeys case 2', () => {
    const matcher = Container.get(IResultMatcherToken)

    const warnings = matcher.matchUndefinedKeys(
      [
        {
          lang: 'en-US',
          localeKeys: [
            {
              key: 'title',
              loc: {
                startLine: 2,
                startLineColumn: 3,
                endLine: 2,
                endLineColumn: 8
              },
              filePath: '/a/locales/en-US.ts'
            }
          ]
        }
      ],
      [
        {
          filePath: '/a/b/pages/home.ts',
          keys: [
            {
              key: 'name',
              loc: {
                startLine: 1,
                startLineColumn: 3,
                endLine: 1,
                endLineColumn: 7
              }
            }
          ]
        }
      ]
    )

    expect(warnings).toEqual([
      {
        key: 'name',
        sourcePath: '/a/b/pages/home.ts',
        loc: { startLine: 1, startLineColumn: 3, endLine: 1, endLineColumn: 7 },
        langs: ['en-US']
      }
    ])
  })
})
