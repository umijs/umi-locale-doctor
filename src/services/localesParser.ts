import { parse } from '@babel/parser'
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
  isImportDefaultSpecifier,
  ObjectProperty
} from '@babel/types'

import { IResourceMatcherToken, IResourceMatcher } from '@/src/services/resourceMatcher'
import { flatten, toILoc } from '@/src/helpers/object'
import { langFromPath } from '@/src/helpers/text'
import { ILocaleKey, ILocale, IKey } from '@/src/types'
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

    const locales = await Promise.all(
      localeFiles.map<Promise<ILocale>>(async l => {
        const data = await parseFileToLocale(l)

        this.emit(PARSE_EVENTS.PARSED, l)

        return {
          lang: langFromPath(l),
          localeKeys: data
        }
      })
    )

    return locales.filter((l): l is ILocale => !!l.localeKeys)
  }
}

async function parseFileToLocale(filePath: string): Promise<ILocaleKey[]> | null {
  const code = await fs.readFile(filePath, { encoding: 'utf-8' })
  const ast = parse(code, BABEL_PARSER_OPTIONS)

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
        if (isObjectProperty(p)) {
          return parseFromObjectProperty(p, filePath)
        }
        if (isSpreadElement(p)) {
          return parseFromSpreadProperty(filePath, p, ast.program.body)
        }
        return null
      })
      .filter((p): p is Promise<ILocaleKey[]> => !!p)
  )

  return flatten<ILocaleKey>(result).filter((l): l is ILocaleKey => !!l)
}

function parseFromObjectProperty(prop: ObjectProperty, filePath: string): Promise<ILocaleKey[]> | null {
  if (isIdentifier(prop.key)) {
    return Promise.resolve([
      {
        key: prop.key.name,
        loc: toILoc(prop.key.loc),
        filePath
      }
    ])
  }
  if (isStringLiteral(prop.key)) {
    return Promise.resolve([
      {
        key: prop.key.value,
        loc: toILoc(prop.key.loc),
        filePath
      }
    ])
  }
  return null
}

function parseFromSpreadProperty(
  filePath: string,
  prop: SpreadElement,
  astbody: Statement[]
): Promise<ILocaleKey[]> | null {
  const { argument } = prop
  if (!isIdentifier(argument)) {
    return null
  }
  const { name } = argument
  return parseByIdentifier(filePath, name, astbody)
}

async function parseByIdentifier(filePath: string, identifier: string, astbody: Statement[]) {
  const found = astbody.find(a => {
    return isImportDeclaration(a) && a.specifiers.some(s => isImportDefaultSpecifier(s) && s.local.name === identifier)
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
