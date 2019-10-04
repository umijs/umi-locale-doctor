import { Container } from 'typedi'
import { ILocaleParserToken } from '@/src/services/localesParser'

let CWD: string = null

describe('locale files', () => {
  beforeAll(() => {
    CWD = process.cwd()
  })

  afterEach(() => {
    process.chdir(CWD)
  })

  it('only valid locales', async () => {
    const runDir = global.toFixturesDir('localesParser', 'only_valid_locales')
    process.chdir(runDir)

    const parser = Container.get(ILocaleParserToken)

    const locales = await parser.parse()

    expect(locales).toEqual([
      {
        lang: 'en-US',
        localeKeys: [
          {
            key: 'name',
            loc: {
              startLine: 2,
              startLineColumn: 2,
              endLine: 2,
              endLineColumn: 6
            },
            filePath: global.toFixturesDir('localesParser', 'only_valid_locales', 'src', 'locales', 'en-US.ts')
          },
          {
            key: 'age',
            loc: {
              startLine: 3,
              startLineColumn: 2,
              endLine: 3,
              endLineColumn: 5
            },
            filePath: global.toFixturesDir('localesParser', 'only_valid_locales', 'src', 'locales', 'en-US.ts')
          }
        ]
      },
      {
        lang: 'zh-CN',
        localeKeys: [
          {
            key: 'name',
            loc: {
              startLine: 2,
              startLineColumn: 2,
              endLine: 2,
              endLineColumn: 6
            },
            filePath: global.toFixturesDir('localesParser', 'only_valid_locales', 'src', 'locales', 'zh-CN.ts')
          },
          {
            key: 'age',
            loc: {
              startLine: 3,
              startLineColumn: 2,
              endLine: 3,
              endLineColumn: 5
            },
            filePath: global.toFixturesDir('localesParser', 'only_valid_locales', 'src', 'locales', 'zh-CN.ts')
          }
        ]
      }
    ])
  })

  it('only valid locales with references, default export', async () => {
    const runDir = global.toFixturesDir('localesParser', 'only_valid_locales_references')
    process.chdir(runDir)

    const parser = Container.get(ILocaleParserToken)

    const locales = await parser.parse()

    console.log('locales', locales)

    expect(locales).toEqual([
      {
        lang: 'zh-CN',
        localeKeys: [
          {
            key: 'menu1',
            loc: {
              startLine: 2,
              startLineColumn: 2,
              endLine: 2,
              endLineColumn: 7
            },
            filePath: global.toFixturesDir(
              'localesParser',
              'only_valid_locales_references',
              'src',
              'locales',
              'zh-CN',
              'menu.ts'
            )
          },
          {
            key: 'name',
            loc: {
              startLine: 5,
              startLineColumn: 2,
              endLine: 5,
              endLineColumn: 6
            },
            filePath: global.toFixturesDir(
              'localesParser',
              'only_valid_locales_references',
              'src',
              'locales',
              'zh-CN.ts'
            )
          }
        ]
      }
    ])
  })
})
