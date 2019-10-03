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

    expect(global['removeCwd'](...files)).toEqual(['/src/locales/en-US.js', '/src/locales/zh-CN.js'])
  })

  it('with invalid locales', async () => {
    const runDir = global['toFixturesDir']('resourceMatcher', 'with_invalid_locales')
    process.chdir(runDir)

    const matcher = Container.get(IResourceMatcherToken)

    const files = await matcher.getLocaleFiles()

    expect(global['removeCwd'](...files)).toEqual(['/src/locales/zh-CN.js'])
  })

  it('with no locales', async () => {
    const runDir = global['toFixturesDir']('resourceMatcher', 'with_no_locales')
    process.chdir(runDir)

    const matcher = Container.get(IResourceMatcherToken)

    const files = await matcher.getLocaleFiles()

    expect(files).toEqual([])
  })

  it('with no valid locales', async () => {
    const runDir = global['toFixturesDir']('resourceMatcher', 'with_novalid_locales')
    process.chdir(runDir)

    const matcher = Container.get(IResourceMatcherToken)

    const files = await matcher.getLocaleFiles()

    expect(files).toEqual([])
  })
})

describe('source files', () => {
  beforeAll(() => {
    CWD = process.cwd()
  })

  afterEach(() => {
    process.chdir(CWD)
  })

  it('only valid sources', async () => {
    const runDir = global['toFixturesDir']('resourceMatcher', 'only_valid_sources')
    process.chdir(runDir)

    const matcher = Container.get(IResourceMatcherToken)

    const files = await matcher.getSourceFiles()

    expect(global['removeCwd'](...files)).toEqual(['/src/pages/home.js', '/src/pages/login.js'])
  })

  it('with invalid sources', async () => {
    const runDir = global['toFixturesDir']('resourceMatcher', 'with_invalid_sources')
    process.chdir(runDir)

    const matcher = Container.get(IResourceMatcherToken)

    const files = await matcher.getSourceFiles()

    expect(global['removeCwd'](...files)).toEqual(['/src/pages/login.js'])
  })

  it('with no sources', async () => {
    const runDir = global['toFixturesDir']('resourceMatcher', 'with_no_sources')
    process.chdir(runDir)

    const matcher = Container.get(IResourceMatcherToken)

    const files = await matcher.getSourceFiles()

    expect(files).toEqual([])
  })

  it('with no valid sources', async () => {
    const runDir = global['toFixturesDir']('resourceMatcher', 'with_novalid_sources')
    process.chdir(runDir)

    const matcher = Container.get(IResourceMatcherToken)

    const files = await matcher.getSourceFiles()

    expect(files).toEqual([])
  })
})
