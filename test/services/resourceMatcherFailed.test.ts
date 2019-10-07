describe('failed to get locale files', () => {
  it('glob error', async () => {
    jest.mock('glob', () => {
      return jest.fn().mockImplementation((pattern: string, options: object, cb: Function) => {
        cb(new Error('error happened'))
      })
    })
    const { Container } = require('typedi')
    const { IResourceMatcherToken } = require('@/src/services/resourceMatcher')
    const matcher = Container.get(IResourceMatcherToken)

    expect(matcher.getLocaleFiles()).rejects.toBeInstanceOf(Error)
  })
})
