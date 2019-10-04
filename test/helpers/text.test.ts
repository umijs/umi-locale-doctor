import { langFromPath } from '@/src/helpers/text'

describe('file match', () => {
  it('normal case', () => {
    expect(langFromPath('/a/b/zh-CN.js')).toEqual('zh-CN')
  })

  it('bad case', () => {
    expect(langFromPath('/a/b/zh.js')).toEqual('')
  })
})
