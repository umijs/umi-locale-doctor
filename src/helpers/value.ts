import { ParserOptions } from '@babel/parser'
import { createMatchPath } from 'tsconfig-paths'
import chalk from 'chalk'
import { fs } from 'mz'
import path from 'path'
import { ITsConfig } from '@/src/types'

const TS_JS_REG = /\.(j|t)s$/

export const BABEL_PARSER_OPTIONS: ParserOptions = {
  sourceType: 'module',
  plugins: ['typescript', 'classProperties', 'dynamicImport', 'jsx', 'decorators-legacy', 'exportDefaultFrom']
}

export function resolveImportModulePath(sourcePath: string, importModulePath: string) {
  const config = getTsJsConfig()

  if (!config || !config.compilerOptions || !config.compilerOptions.paths) {
    return tryResolveRelativeFilePath(sourcePath, importModulePath)
  }

  const matchPath = createMatchPath(
    path.join(process.cwd(), config.compilerOptions.baseUrl || '.'),
    config.compilerOptions.paths
  )

  const matched = matchPath(importModulePath, undefined, undefined, ['.js', '.ts'])

  return tryPaths(matched)
}

export function tryPaths(filePath: string) {
  return [
    `${filePath}.ts`,
    `${filePath}.js`,
    path.join(filePath, 'index.ts'),
    path.join(filePath, 'index.js'),
    filePath
  ].find(f => fs.existsSync(f))
}

export function getTsJsConfig(): ITsConfig | null {
  const configFilePath = ['tsconfig.json', 'jsconfig.json']
    .map(f => path.resolve(process.cwd(), f))
    .find(f => fs.existsSync(f))

  if (!configFilePath) {
    return null
  }

  try {
    const content = fs.readFileSync(configFilePath, { encoding: 'utf8' })
    return <ITsConfig>JSON.parse(content)
  } catch (error) {
    console.warn(error && chalk.yellow(error.message))
    return null
  }
}

export function tryResolveRelativeFilePath(sourcePath: string, importModulePath: string): string | null {
  const sourceDir = TS_JS_REG.test(sourcePath) ? path.dirname(sourcePath) : sourcePath
  return [
    path.join(sourceDir, `${importModulePath}.ts`),
    path.join(sourceDir, `${importModulePath}.js`),
    path.join(sourceDir, importModulePath, 'index.ts'),
    path.join(sourceDir, importModulePath, 'index.js'),
    path.join(sourceDir, importModulePath)
  ].find(f => fs.existsSync(f))
}
