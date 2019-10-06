import { parse } from '@babel/parser'
import { fs } from 'mz'
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
  ObjectProperty,
  isVariableDeclaration,
  isVariableDeclarator,
  ObjectExpression
} from '@babel/types'

import { IResourceMatcherToken, IResourceMatcher } from '@/src/services/resourceMatcher'
import { flatten, toILoc } from '@/src/helpers/object'
import { langFromPath } from '@/src/helpers/text'
import { ILocaleKey, ILocale, IKey } from '@/src/types'
import { PARSE_EVENTS } from '@/src/types/events'
import { BABEL_PARSER_OPTIONS, resolveImportModulePath } from '@/src/helpers/value'

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
        const data = await parseFileToLocaleKeys(l)

        this.emit(PARSE_EVENTS.PARSED, l)

        return {
          lang: langFromPath(l),
          localeKeys: data
        }
      })
    )

    return locales.filter((l): l is ILocale => !!l.localeKeys && !!l.localeKeys.length)
  }
}

async function parseFileToLocaleKeys(filePath: string): Promise<ILocaleKey[]> | null {
  const code = await fs.readFile(filePath, { encoding: 'utf-8' })
  const ast = parse(code, BABEL_PARSER_OPTIONS)

  const { body: astbody } = ast.program

  const exportDefaultDeclaration = astbody.find((n): n is ExportDefaultDeclaration => isExportDefaultDeclaration(n))

  if (!exportDefaultDeclaration) {
    return null
  }

  const defaultDeclaration = exportDefaultDeclaration.declaration
  const localeAst = isTSAsExpression(defaultDeclaration) ? defaultDeclaration.expression : defaultDeclaration

  if (isObjectExpression(localeAst)) {
    return parserFromObjectExpression(localeAst, filePath, astbody)
  }

  return null
}

async function parseFromObjectProperty(prop: ObjectProperty, filePath: string): Promise<ILocaleKey[]> | null {
  if (isIdentifier(prop.key)) {
    return [
      {
        key: prop.key.name,
        loc: toILoc(prop.key.loc),
        filePath
      }
    ]
  }
  if (isStringLiteral(prop.key)) {
    return [
      {
        key: prop.key.value,
        loc: toILoc(prop.key.loc),
        filePath
      }
    ]
  }
  return null
}

async function parseFromSpreadProperty(
  filePath: string,
  prop: SpreadElement,
  astbody: Statement[]
): Promise<ILocaleKey[]> | null {
  const { argument } = prop
  if (!isIdentifier(argument)) {
    return null
  }
  const { name: identifierName } = argument

  const targetFile = resolveImportModulePathIfPossible(identifierName, filePath, astbody)
  if (targetFile) {
    return await parseFileToLocaleKeys(targetFile)
  }

  const result = await parseFromLocalModuleIfPossible(identifierName, filePath, astbody)

  if (result) {
    return result
  }

  return null
}

function resolveImportModulePathIfPossible(identifierName: string, sourcePath: string, astbody: Statement[]) {
  const foundImportStatement = astbody.find(a => {
    return (
      isImportDeclaration(a) && a.specifiers.some(s => isImportDefaultSpecifier(s) && s.local.name === identifierName)
    )
  })

  if (
    !foundImportStatement ||
    !isImportDeclaration(foundImportStatement) ||
    !isStringLiteral(foundImportStatement.source)
  ) {
    return null
  }

  return resolveImportModulePath(sourcePath, foundImportStatement.source.value)
}

async function parseFromLocalModuleIfPossible(
  identifierName: string,
  sourcePath: string,
  astbody: Statement[]
): Promise<ILocaleKey[]> | null {
  const foundLocalVarDef = astbody.find(a => {
    return (
      isVariableDeclaration(a) &&
      a.declarations.find(d => isVariableDeclarator(d) && isIdentifier(d.id) && d.id.name === identifierName)
    )
  })

  if (!foundLocalVarDef || !isVariableDeclaration(foundLocalVarDef)) {
    return null
  }

  const foundLocalDef = foundLocalVarDef.declarations.find(
    d => isVariableDeclarator(d) && isIdentifier(d.id) && d.id.name === identifierName
  )

  if (isObjectExpression(foundLocalDef.init)) {
    return await parserFromObjectExpression(foundLocalDef.init, sourcePath, astbody)
  }

  return null
}

async function parserFromObjectExpression(expression: ObjectExpression, sourcePath: string, astbody: Statement[]) {
  const result = await Promise.all(
    expression.properties
      .map(p => {
        if (isObjectProperty(p)) {
          return parseFromObjectProperty(p, sourcePath)
        }
        if (isSpreadElement(p)) {
          return parseFromSpreadProperty(sourcePath, p, astbody)
        }
        return null
      })
      .filter((p): p is Promise<ILocaleKey[]> => !!p)
  )

  return flatten<ILocaleKey>(result).filter((l): l is ILocaleKey => !!l)
}
