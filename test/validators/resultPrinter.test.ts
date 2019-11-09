import { IUndefinedWarning } from '@/src/types'

describe('ResultPrinter', () => {
  afterEach(() => {
    jest.resetModules()
  })

  it('printNeverUsedKeys many keys', () => {
    const mockLog = jest.fn(text => {})
    const mockBold = jest.fn(text => '')
    const mockTable = jest.fn(data => '')
    global.console = { ...global.console, log: mockLog }

    jest.mock('table', () => {
      return {
        table: mockTable
      }
    })
    jest.mock('chalk', () => {
      return {
        get yellow() {
          return this
        },
        bold: mockBold
      }
    })

    const { default: ResultPrinter } = require('@/src/validators/resultPrinter')
    new ResultPrinter().printNeverUsedKeys(makeIUnUsedWarnings())

    expect(mockBold).toBeCalledTimes(3)
    expect(mockTable).toBeCalledTimes(1)
    expect(mockLog).toBeCalledTimes(3)
  })

  it('printNeverUsedKeys less keys', () => {
    const mockLog = jest.fn(text => {})
    const mockBold = jest.fn(text => '')
    const mockTable = jest.fn(data => '')
    global.console = { ...global.console, log: mockLog }

    jest.mock('table', () => {
      return {
        table: mockTable
      }
    })
    jest.mock('chalk', () => {
      return {
        get yellow() {
          return this
        },
        bold: mockBold
      }
    })

    const { default: ResultPrinter } = require('@/src/validators/resultPrinter')
    new ResultPrinter().printNeverUsedKeys([])

    expect(mockBold).toBeCalledTimes(3)
    expect(mockTable).toBeCalledTimes(1)
    expect(mockLog).toBeCalledTimes(3)
  })

  it('printUndefinedKeys many keys', () => {
    const mockLog = jest.fn(text => {})
    const mockBold = jest.fn(text => '')
    const mockTable = jest.fn(data => '')
    global.console = { ...global.console, log: mockLog }

    jest.mock('table', () => {
      return {
        table: mockTable
      }
    })
    jest.mock('chalk', () => {
      return {
        get yellow() {
          return this
        },
        bold: mockBold
      }
    })
    const { default: ResultPrinter } = require('@/src/validators/resultPrinter')
    new ResultPrinter().printUndefinedKeys(makeIUndefinedWarnings())

    expect(mockBold).toBeCalledTimes(4)
    expect(mockTable).toBeCalledTimes(1)
    expect(mockLog).toBeCalledTimes(3)
  })

  it('printUndefinedKeys less keys', () => {
    const mockLog = jest.fn(text => {})
    const mockBold = jest.fn(text => '')
    const mockTable = jest.fn(data => '')
    global.console = { ...global.console, log: mockLog }

    jest.mock('table', () => {
      return {
        table: mockTable
      }
    })
    jest.mock('chalk', () => {
      return {
        get yellow() {
          return this
        },
        bold: mockBold
      }
    })
    const { default: ResultPrinter } = require('@/src/validators/resultPrinter')
    new ResultPrinter().printUndefinedKeys([])

    expect(mockBold).toBeCalledTimes(4)
    expect(mockTable).toBeCalledTimes(1)
    expect(mockLog).toBeCalledTimes(3)
  })
})

function makeIUnUsedWarnings() {
  // tslint:disable-next-line: prefer-array-literal
  return new Array(16).fill(null).map((a, i) => {
    return {
      key: 'name' + i,
      filePath: '/a/b/' + i,
      loc: {
        startLine: i,
        startLineColumn: i,
        endLine: i,
        endLineColumn: i + 1
      }
    }
  })
}

function makeIUndefinedWarnings(): IUndefinedWarning[] {
  // tslint:disable-next-line: prefer-array-literal
  return new Array(16).fill(null).map((a, i) => {
    return {
      key: `name${i}`,
      sourcePath: `/a/b/${i}`,
      loc: {
        startLine: i,
        startLineColumn: i,
        endLine: i,
        endLineColumn: i + 1
      },
      langs: ['zh-CN']
    }
  })
}
