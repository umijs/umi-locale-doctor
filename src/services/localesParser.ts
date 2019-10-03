import babelParser from '@babel/parser'
import { fs } from 'mz'
import path from 'path'
import { Token, Service, Inject } from 'typedi'
import EventEmitter from 'events'

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

import { IResourceMatcherToken, IResourceMatcher } from '@/src/services/resourceMatcher'
import { flatten } from '@/src/helpers/object'
import { langFromPath } from '@/src/helpers/text'
import { ILocaleKey, ILocale } from '@/src/types'
import { PARSE_EVENTS } from '@/src/types/events'
import { BABEL_PARSER_OPTIONS } from '@/src/helpers/value'

export interface ILocaleParser extends EventEmitter {
  parse(): Promise<ILocale[]>
}

export const ILocaleParserToken = new Token<ILocaleParser>()

@Service(ILocaleParserToken)
export class LocalParser extends EventEmitter implements ILocaleParser {
  @Inject(IResourceMatcherToken)
  private resourceMatcher: IResourceMatcher

  public async parse(): Promise<ILocale[]> {
    const localeFilepaths = await this.resourceMatcher.getLocaleFiles()

    this.emit(PARSE_EVENTS.START, localeFilepaths)

    const localeFiles = flatten<string>(localeFilepaths)

    const localeKeys = await Promise.all(
      localeFiles.map(async l => {
        const data = await parseFileToLocale(l)

        this.emit(PARSE_EVENTS.PARSED, l)

        return data
      })
    )

    return localeKeys
      .filter((l): l is ILocaleKey[] => !!l)
      .map<ILocale>(d => ({
        lang: langFromPath(d[0].filePath),
        localeKeys: d
      }))
  }
}

async function parseFileToLocale(filePath: string): Promise<ILocaleKey[]> {
  const code = await fs.readFile(filePath, { encoding: 'utf-8' })
  const ast = babelParser.parse(code, BABEL_PARSER_OPTIONS)

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
          loc: {
            startLine: propLoc.start.line,
            startLineColumn: propLoc.start.column,
            endLine: propLoc.end.line,
            endLineColumn: propLoc.end.column
          },
          filePath
        })
      })
      .filter((p): p is Promise<ILocaleKey> => !!p)
  )

  return flatten<ILocaleKey>(result).filter((l): l is ILocaleKey => !!l)
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
