import babelParser from '@babel/parser'
import { fs } from 'mz'
import path from 'path'

import {
  ExportDefaultDeclaration,
  isExportDefaultDeclaration,
  isObjectExpression,
  isSpreadElement,
  isTSAsExpression,
  isObjectProperty,
  isStringLiteral,
  SpreadElement,
  isIdentifier,
  Statement,
  isImportDeclaration,
  isImportDefaultSpecifier
} from '@babel/types'

import { getLocaleFiles, getLang } from '@/src/helpers/fileUtil'
import { flatten } from '@/src/helpers/object'
import { ILocaleDetail } from '@/src/types'

export async function parseLocales() {
  const localesMap = await getLocaleFiles()
  const localeFiles = flatten<string>(localesMap)

  const localeDetails = await Promise.all(localeFiles.map(l => parseFileToLocale(l)))

  return localeDetails.map(d => ({
    lang: getLang(d[0].filePath),
    details: d
  }))
}

async function parseFileToLocale(filePath: string): Promise<ILocaleDetail[]> {
  const code = await fs.readFile(filePath, { encoding: 'utf-8' })
  const ast = babelParser.parse(code, {
    sourceType: 'module',
    plugins: [
      'typescript',
      'classProperties',
      'dynamicImport',
      'jsx',
      [
        'decorators',
        {
          decoratorsBeforeExport: true
        }
      ]
    ]
  })

  const exportDefaultDeclaration = ast.program.body.find((n): n is ExportDefaultDeclaration =>
    isExportDefaultDeclaration(n)
  )

  if (!exportDefaultDeclaration) {
    return null
  }

  const defaultDeclaration = exportDefaultDeclaration.declaration
  const localeAst = isTSAsExpression(defaultDeclaration) ? defaultDeclaration.expression : defaultDeclaration

  if (!isObjectExpression(localeAst)) {
    return null
  }

  const result = await Promise.all(
    localeAst.properties
      .map(p => {
        let propLoc = p.loc
        let propKey: string = ''

        if (isObjectProperty(p)) {
          propKey = p.key.name
          if (isStringLiteral(p.key)) {
            propKey = p.key.value
            propLoc = p.key.loc
          }
        }
        if (isSpreadElement(p)) {
          return getSpreadProperties(filePath, p, ast.program.body)
        }
        if (!propLoc || !propKey) {
          return null
        }

        return Promise.resolve({
          key: propKey,
          range: {
            startLine: propLoc.start.line - 1,
            startLineColumn: propLoc.start.column,
            endLine: propLoc.end.line - 1,
            endLineColumn: propLoc.end.column
          },
          filePath
        })
      })
      .filter((p): p is Promise<ILocaleDetail> => !!p)
  )

  return flatten<ILocaleDetail>(result)
}

async function getSpreadProperties(filePath: string, prop: SpreadElement, astbody: Statement[]) {
  const { argument } = prop
  if (!isIdentifier(argument)) {
    return []
  }
  const { name } = argument
  return await parseByIdentifier(filePath, name, astbody)
}

async function parseByIdentifier(filePath: string, identifier: string, astbody: Statement[]) {
  const found = astbody.find(a => {
    return (
      isImportDeclaration(a) &&
      a.specifiers.some(s => isImportDefaultSpecifier(s) && s.local.name === identifier)
    )
  })

  if (!found || !isImportDeclaration(found) || !isStringLiteral(found.source)) {
    return []
  }
  const filePathPrefix = path.join(path.dirname(filePath), found.source.value)
  const targetFiles = [filePathPrefix, `${filePathPrefix}.js`, `${filePathPrefix}.ts`]
  const targetFile = targetFiles.find(t => fs.existsSync(t))
  if (!targetFile) {
    return []
  }
  return await parseFileToLocale(targetFile)
}
