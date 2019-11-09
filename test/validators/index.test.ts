import { Container } from 'typedi'
import EventEmitter from 'events'
import { ILocaleParserToken, ILocaleParser } from '@/src/services/localesParser'
import { ISourceParserToken, ISourceParser } from '@/src/services/sourceParser'
import { ILocale, ISource } from '@/src/types'

describe('validator', () => {
  it('normal case', async () => {
    Container.set(
      ILocaleParserToken,
      new (class LocalesParser extends EventEmitter implements ILocaleParser {
        parse(): Promise<ILocale[]> {
          return Promise.resolve([])
        }
      })()
    )

    Container.set(
      ISourceParserToken,
      new (class SourcesParser extends EventEmitter implements ISourceParser {
        parse(): Promise<ISource[]> {
          return Promise.resolve<ISource[]>([
            {
              filePath: '/a/b/a.ts',
              keys: [
                {
                  key: 'name',
                  loc: {
                    startLine: 1,
                    startLineColumn: 1,
                    endLine: 1,
                    endLineColumn: 1
                  }
                }
              ]
            }
          ])
        }
      })()
    )

    const mockProgressPrinterStart = jest.fn()
    const mockPrintNeverUsedKeys = jest.fn(function() {
      return this
    })
    const mockprintUndefinedKeys = jest.fn(function() {
      return this
    })

    jest.mock('@/src/validators/progressPrinter', () => {
      return jest.fn().mockImplementation(() => {
        return { start: mockProgressPrinterStart }
      })
    })
    jest.mock('@/src/validators/resultPrinter', () => {
      return jest.fn().mockImplementation(() => {
        return { printNeverUsedKeys: mockPrintNeverUsedKeys, printUndefinedKeys: mockprintUndefinedKeys }
      })
    })

    const { validate } = require('@/src/validators')

    await validate()

    expect(mockProgressPrinterStart).toBeCalledTimes(2)
    expect(mockPrintNeverUsedKeys).toBeCalledTimes(1)
    expect(mockprintUndefinedKeys).toBeCalledTimes(1)
  })
})
