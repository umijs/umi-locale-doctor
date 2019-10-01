import { ParserOptions } from '@babel/parser'

export const BABEL_PARSER_OPTIONS: ParserOptions = {
  sourceType: 'module',
  plugins: ['typescript', 'classProperties', 'dynamicImport', 'jsx', 'decorators-legacy', 'exportDefaultFrom']
}
