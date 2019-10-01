jest.mock('glob')
import * as glob from 'glob'
import { Container } from 'typedi'
import { IResourceMatcherToken } from '@/src/services/resourceMatcher'

describe('locale files', () => {
  it('normal case', async () => {
    glob['mockImplementation']((pattern: string, options: glob.IOptions, cb: Function) => {
      if (pattern === 'src/locales/*') {
        return cb(null, ['/a/b/locales/zh-CN.js', '/a/b/locales/en-US.js'])
      }
      return cb(null, [])
    })
    const matcher = Container.get(IResourceMatcherToken)

    const files = await matcher.getLocaleFiles()

    expect(files).toEqual(['/a/b/locales/zh-CN.js', '/a/b/locales/en-US.js'])
  })
})
