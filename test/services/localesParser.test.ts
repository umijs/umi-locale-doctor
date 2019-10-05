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
              startLine: 4,
              startLineColumn: 2,
              endLine: 4,
              endLineColumn: 6
            },
            filePath: global.toFixturesDir('localesParser', 'only_valid_locales', 'src', 'locales', 'en-US.ts')
          },
          {
            key: 'error-signout',
            loc: {
              startLine: 5,
              startLineColumn: 2,
              endLine: 5,
              endLineColumn: 17
            },
            filePath: global.toFixturesDir('localesParser', 'only_valid_locales', 'src', 'locales', 'en-US.ts')
          },
          {
            key: 'title',
            loc: {
              startLine: 6,
              startLineColumn: 2,
              endLine: 6,
              endLineColumn: 7
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
              startLine: 4,
              startLineColumn: 2,
              endLine: 4,
              endLineColumn: 6
            },
            filePath: global.toFixturesDir('localesParser', 'only_valid_locales', 'src', 'locales', 'zh-CN.ts')
          },
          {
            key: 'error-signout',
            loc: {
              startLine: 5,
              startLineColumn: 2,
              endLine: 5,
              endLineColumn: 17
            },
            filePath: global.toFixturesDir('localesParser', 'only_valid_locales', 'src', 'locales', 'zh-CN.ts')
          },
          {
            key: 'title',
            loc: {
              startLine: 6,
              startLineColumn: 2,
              endLine: 6,
              endLineColumn: 7
            },
            filePath: global.toFixturesDir('localesParser', 'only_valid_locales', 'src', 'locales', 'zh-CN.ts')
          }
        ]
      }
    ])
  })

  it('only valid locales with spread references', async () => {
    const runDir = global.toFixturesDir('localesParser', 'only_valid_locales_references')
    process.chdir(runDir)

    const parser = Container.get(ILocaleParserToken)

    const locales = await parser.parse()

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
              'zh_menus',
              'menus.ts'
            )
          },
          {
            key: 'name',
            loc: {
              startLine: 9,
              startLineColumn: 2,
              endLine: 9,
              endLineColumn: 6
            },
            filePath: global.toFixturesDir(
              'localesParser',
              'only_valid_locales_references',
              'src',
              'locales',
              'zh-CN.ts'
            )
          },
          {
            key: 'bar-1',
            loc: {
              startLine: 4,
              startLineColumn: 2,
              endLine: 4,
              endLineColumn: 9
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

  it('invalid locales with no default export', async () => {
    const runDir = global.toFixturesDir('localesParser', 'invalid_locales_no_default_export')
    process.chdir(runDir)

    const parser = Container.get(ILocaleParserToken)

    const locales = await parser.parse()

    expect(locales).toEqual([])
  })

  it('invalid locales with no local reference defined', async () => {
    const runDir = global.toFixturesDir('localesParser', 'invalid_locales_no_local_ref_defined')
    process.chdir(runDir)

    const parser = Container.get(ILocaleParserToken)

    const locales = await parser.parse()

    expect(locales).toEqual([
      {
        lang: 'zh-CN',
        localeKeys: [
          {
            key: 'name',
            loc: {
              startLine: 4,
              startLineColumn: 2,
              endLine: 4,
              endLineColumn: 6
            },
            filePath: global.toFixturesDir(
              'localesParser',
              'invalid_locales_no_local_ref_defined',
              'src',
              'locales',
              'zh-CN.ts'
            )
          }
        ]
      }
    ])
  })

  it('invalid locales with invalid object property', async () => {
    const runDir = global.toFixturesDir('localesParser', 'invalid_locales')
    process.chdir(runDir)

    const parser = Container.get(ILocaleParserToken)

    const locales = await parser.parse()

    expect(locales).toEqual([])
  })
})
