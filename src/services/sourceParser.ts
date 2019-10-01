import * as babelParser from '@babel/parser'
import { fs } from 'mz'
import traverse from '@babel/traverse'
import EventEmitter from 'events'
import { Inject, Service, Token } from 'typedi'

import {
  isStringLiteral,
  JSXAttribute,
  isJSXIdentifier,
  isJSXAttribute,
  isIdentifier,
  isObjectExpression,
  ObjectProperty,
  isObjectProperty
} from '@babel/types'

import { IResourceMatcherToken, IResourceMatcher } from '@/src/services/resourceMatcher'
import { ISource } from '@/src/types'
import { SOURCE_PARSE_EVENTS } from '@/src/types/events'
import { toILoc } from '@/src/helpers/object'
import { BABEL_PARSER_OPTIONS } from '@/src/helpers/value'

export interface ISourceParser extends EventEmitter {
  parse(): Promise<ISource[]>
}

export const ISourceParserToken = new Token<ISourceParser>()

@Service(ISourceParserToken)
export class SourceParser extends EventEmitter implements ISourceParser {
  private resourceMatcher: IResourceMatcher

  constructor(@Inject(IResourceMatcherToken) resourceMatcher: IResourceMatcher) {
    super()
    this.resourceMatcher = resourceMatcher
  }

  public async parse(): Promise<ISource[]> {
    const sourceFiles = await this.resourceMatcher.getSourceFiles()

    this.emit(SOURCE_PARSE_EVENTS.START, sourceFiles)

    const sources: ISource[] = await this.parseRest(sourceFiles)
    return sources.filter(s => s.keys.length)
  }

  private async parseRest(filePaths: string[]): Promise<ISource[]> {
    if (filePaths === undefined || filePaths === null || !filePaths.length) {
      return []
    }
    const filePath = filePaths[0]
    const code = await fs.readFile(filePath, { encoding: 'utf-8' })

    const ast = babelParser.parse(code, BABEL_PARSER_OPTIONS)

    const source: ISource = {
      filePath,
      keys: []
    }

    traverse(ast, {
      JSXOpeningElement(path) {
        if (
          isJSXIdentifier(path.node.name, { name: 'FormattedMessage' }) ||
          isJSXIdentifier(path.node.name, { name: 'FormattedHTMLMessage' })
        ) {
          const attr = path.node.attributes
            .filter((a): a is JSXAttribute => isJSXAttribute(a))
            .find(a => a.name.name === 'id')
          if (attr && isStringLiteral(attr.value)) {
            source.keys.push({
              key: attr.value.value,
              loc: toILoc(attr.value.loc)
            })
            return
          }
        }
      },

      CallExpression(path) {
        if (
          isIdentifier(path.node.callee, { name: 'formatMessage' }) ||
          isIdentifier(path.node.callee, { name: 'formatHTMLMessage' })
        ) {
          if (path.node.arguments && isObjectExpression(path.node.arguments[0])) {
            const arg = path.node.arguments[0]
            const property = arg.properties
              .filter((p): p is ObjectProperty => isObjectProperty(p))
              .find(p => isIdentifier(p.key) && p.key.name === 'id')
            if (property) {
              if (isStringLiteral(property.value)) {
                source.keys.push({
                  key: property.value.value,
                  loc: toILoc(property.value.loc)
                })
                return
              }
            }
          }
        }
      }
    })

    this.emit(SOURCE_PARSE_EVENTS.PARSED, filePath)

    return [source].concat(await this.parseRest(filePaths.slice(1)))
  }
}
