import { Container } from 'typedi'
import { ISourceParserToken } from '@/src/services/sourceParser'

let CWD: string = null

describe('source files', () => {
  beforeAll(() => {
    CWD = process.cwd()
  })

  afterEach(() => {
    process.chdir(CWD)
  })

  it('only valid sources', async () => {
    const runDir = global.toFixturesDir('sourcesParser', 'only_valid_sources')
    process.chdir(runDir)

    const parser = Container.get(ISourceParserToken)

    const sources = await parser.parse()

    expect(sources).toEqual([
      {
        filePath: global.toFixturesDir('sourcesParser', 'only_valid_sources', 'src', 'pages', 'home.ts'),
        keys: [
          {
            key: 'name',
            loc: {
              startLine: 6,
              startLineColumn: 27,
              endLine: 6,
              endLineColumn: 33
            }
          },
          {
            key: 'name',
            loc: {
              startLine: 7,
              startLineColumn: 31,
              endLine: 7,
              endLineColumn: 37
            }
          },
          {
            key: 'name',
            loc: {
              startLine: 8,
              startLineColumn: 27,
              endLine: 8,
              endLineColumn: 33
            }
          },
          {
            key: 'name',
            loc: {
              startLine: 9,
              startLineColumn: 31,
              endLine: 9,
              endLineColumn: 37
            }
          }
        ]
      }
    ])
  })

  it('with invalid sources', async () => {
    const runDir = global.toFixturesDir('sourcesParser', 'invalid_sources')
    process.chdir(runDir)

    const parser = Container.get(ISourceParserToken)

    const sources = await parser.parse()

    expect(sources).toEqual([])
  })
})
