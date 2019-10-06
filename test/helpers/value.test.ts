import path from 'path'
import {
  BABEL_PARSER_OPTIONS,
  tryPaths,
  tryResolveRelativeFilePath,
  getTsJsConfig,
  resolveImportModulePath
} from '@/src/helpers/value'

let CWD: string = null

test('babel options', () => {
  expect(BABEL_PARSER_OPTIONS.sourceType).toEqual('module')
  expect(BABEL_PARSER_OPTIONS.plugins).toEqual([
    'typescript',
    'classProperties',
    'dynamicImport',
    'jsx',
    'decorators-legacy',
    'exportDefaultFrom'
  ])
})

describe('path resolve', () => {
  beforeAll(() => {
    CWD = process.cwd()
  })

  afterEach(() => {
    process.chdir(CWD)
  })

  describe('tryPaths', () => {
    it('valid relative paths', () => {
      const bPath = global.toFixturesDir('pathResolve', 'valid_relative_paths', 'a', 'b')
      const bPathIndex = global.toFixturesDir('pathResolve', 'valid_relative_paths', 'a', 'b', 'index')
      const bPathMatched = tryPaths(bPath)
      const bPathIndexMatched = tryPaths(bPathIndex)

      const realPath = global.toFixturesDir('pathResolve', 'valid_relative_paths', 'a', 'b', 'index.ts')

      expect(bPathMatched).toBe(realPath)
      expect(bPathIndexMatched).toBe(realPath)
    })
  })

  describe('tryResolveRelativeFilePath', () => {
    it('valid relative paths', () => {
      const sourcePath = global.toFixturesDir('pathResolve', 'valid_relative_paths', 'home.ts')
      const importModulePath = './a/b'
      const realPath = global.toFixturesDir('pathResolve', 'valid_relative_paths', 'a', 'b', 'index.ts')

      expect(tryResolveRelativeFilePath(sourcePath, importModulePath)).toBe(realPath)
    })

    it('valid relative paths with source dir', () => {
      const sourcePath = global.toFixturesDir('pathResolve', 'valid_relative_paths')
      const importModulePath = './a/b'
      const realPath = global.toFixturesDir('pathResolve', 'valid_relative_paths', 'a', 'b', 'index.ts')

      expect(tryResolveRelativeFilePath(sourcePath, importModulePath)).toBe(realPath)
    })
  })

  describe('getTsJsConfig', () => {
    it('valid tsconfig', () => {
      const runDir = global.toFixturesDir('pathResolve', 'valid_tsconfig')

      process.chdir(runDir)

      const config = getTsJsConfig()

      expect(config).toEqual({
        compilerOptions: {
          baseUrl: '.',
          paths: {
            '@/*': ['./*']
          }
        }
      })
    })

    it('valid jsconfig', () => {
      const runDir = global.toFixturesDir('pathResolve', 'valid_jsconfig')

      process.chdir(runDir)

      const config = getTsJsConfig()

      expect(config).toEqual({
        compilerOptions: {
          baseUrl: '.',
          paths: {
            '@/*': ['./*']
          }
        }
      })
    })

    it('no config', () => {
      const runDir = global.toFixturesDir('pathResolve', 'no_config')

      process.chdir(runDir)

      const config = getTsJsConfig()

      expect(config).toEqual(null)
    })

    it('invalid config', () => {
      const runDir = global.toFixturesDir('pathResolve', 'invalid_config')

      const originWarn = console.warn

      console.warn = (arg: object) => {
        expect(typeof arg === 'string').toBeTruthy()
      }

      process.chdir(runDir)

      const config = getTsJsConfig()

      expect(config).toEqual(null)

      console.warn = originWarn
    })
  })

  describe('resolveImportModulePath', () => {
    it('valid relative paths', () => {
      const runDir = global.toFixturesDir('pathResolve', 'valid_relative_paths')
      process.chdir(runDir)

      const sourcePath = global.toFixturesDir('pathResolve', 'valid_relative_paths', 'home.ts')
      const matched = resolveImportModulePath(sourcePath, './a/b')

      const realPath = global.toFixturesDir('pathResolve', 'valid_relative_paths', 'a', 'b', 'index.ts')

      expect(matched).toBe(realPath)
    })

    it('valid relative paths with config', () => {
      const runDir = global.toFixturesDir('pathResolve', 'valid_relative_paths_config')
      process.chdir(runDir)

      const sourcePath = global.toFixturesDir('pathResolve', 'valid_relative_paths_config', 'home.ts')
      const matched = resolveImportModulePath(sourcePath, '@/a/b')

      const realPath = global.toFixturesDir('pathResolve', 'valid_relative_paths_config', 'a', 'b', 'index.ts')

      expect(matched).toBe(realPath)
    })

    it('valid relative paths with config no baseUrl', () => {
      const runDir = global.toFixturesDir('pathResolve', 'valid_relative_paths_config_nobase')
      process.chdir(runDir)

      const sourcePath = global.toFixturesDir('pathResolve', 'valid_relative_paths_config_nobase', 'home.ts')
      const matched = resolveImportModulePath(sourcePath, '@/a/b')

      const realPath = global.toFixturesDir('pathResolve', 'valid_relative_paths_config_nobase', 'a', 'b', 'index.ts')

      expect(matched).toBe(realPath)
    })

    it('valid relative paths with config', () => {
      const runDir = global.toFixturesDir('pathResolve', 'valid_relative_paths_config')
      process.chdir(runDir)

      const sourcePath = global.toFixturesDir('pathResolve', 'valid_relative_paths_config', 'home.ts')
      const matched = resolveImportModulePath(sourcePath, './a/b')

      const realPath = global.toFixturesDir('pathResolve', 'valid_relative_paths_config', 'a', 'b', 'index.ts')

      expect(matched).toBe(realPath)
    })
  })
})
