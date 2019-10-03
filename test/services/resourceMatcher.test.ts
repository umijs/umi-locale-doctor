import * as glob from 'glob'
import { Container } from 'typedi'
import { IResourceMatcherToken } from '@/src/services/resourceMatcher'

let CWD: string = null

describe('locale files', () => {
  beforeAll(() => {
    CWD = process.cwd()
  })

  afterEach(() => {
    process.chdir(CWD)
  })

  it('only valid locales', async () => {
    const runDir = global['toFixturesDir']('resourceMatcher', 'only_valid_locales')
    process.chdir(runDir)

    const matcher = Container.get(IResourceMatcherToken)

    const files = await matcher.getLocaleFiles()

    expect(files.map(f => f.replace(runDir, ''))).toEqual(['/src/locales/en-US.js', '/src/locales/zh-CN.js'])
  })

  it('with invalid locales', async () => {
    const runDir = global['toFixturesDir']('resourceMatcher', 'with_invalid_locales')
    process.chdir(runDir)

    const matcher = Container.get(IResourceMatcherToken)

    const files = await matcher.getLocaleFiles()

    expect(files.map(f => f.replace(runDir, ''))).toEqual(['/src/locales/zh-CN.js'])
  })

  it('with no locales', async () => {
    const runDir = global['toFixturesDir']('resourceMatcher', 'with_no_locales')
    process.chdir(runDir)

    const matcher = Container.get(IResourceMatcherToken)

    const files = await matcher.getLocaleFiles()

    expect(files).toEqual([])
  })
})
