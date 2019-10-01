import { BABEL_PARSER_OPTIONS } from '@/src/helpers/value'

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
