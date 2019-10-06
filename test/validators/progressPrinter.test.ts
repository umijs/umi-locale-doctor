import EventEmitter from 'events'
import { PARSE_EVENTS } from '@/src/types/events'

describe('ProgressPinter', () => {
  it('normal case', done => {
    const mockStart = jest.fn(function() {
      return this
    })
    const mockSucceed = jest.fn()

    const texts: string[] = []

    const mockOra = jest.fn(() => {
      console.log('sdfdsfdsfs')
      return {
        start: mockStart,
        set text(text: string) {
          texts.push(text)
        },
        succeed: mockSucceed
      }
    })

    jest.mock('ora', () => {
      return jest.fn().mockImplementation(mockOra)
    })

    const { default: ProgressPrinter } = require('@/src/validators/progressPrinter')
    const emitter = new EventEmitter()
    new ProgressPrinter(emitter, 'testType').start()

    setTimeout(() => {
      emitter.emit(PARSE_EVENTS.START, ['/src/locales/zh-CN.ts', '/src/locales/en-US.ts'])
    }, 10)

    setTimeout(() => {
      emitter.emit(PARSE_EVENTS.PARSED, '/src/locales/zh-CN.ts')
    }, 50)

    setTimeout(() => {
      emitter.emit(PARSE_EVENTS.PARSED, '/src/locales/en-US.ts')
    }, 100)

    setTimeout(() => {
      expect(mockOra).toBeCalledWith('Parsing testType 0%')
      expect(mockStart).toBeCalled()
      expect(mockSucceed).toBeCalled()
      expect(texts).toEqual([
        'Parsing testType 50.0% => src/locales/zh-CN.ts',
        'Parsing testType 100.0% => src/locales/en-US.ts'
      ])

      done()
    }, 500)
  })
})
