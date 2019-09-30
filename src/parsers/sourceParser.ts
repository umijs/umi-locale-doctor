import babelParser from '@babel/parser'
import { fs } from 'mz'
import traverse from '@babel/traverse'
import EventEmitter from 'events'

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

import { getSourceFiles } from '@/src/helpers/fileUtil'
import { ISource } from '@/src/types'
import { SOURCE_PARSE_EVENTS } from '@/src/types/events'

export async function parseSources(emitter: EventEmitter) {
  const sourceFiles = await getSourceFiles()

  emitter.emit(SOURCE_PARSE_EVENTS.START, sourceFiles)

  const sources: ISource[] = await parseRest(sourceFiles, emitter)
  return sources.filter(s => s.keys.length)
}

async function parseRest(filePaths: string[], emitter: EventEmitter): Promise<ISource[]> {
  if (filePaths === undefined || filePaths === null || !filePaths.length) {
    return []
  }
  const filePath = filePaths[0]
  const code = await fs.readFile(filePath, { encoding: 'utf-8' })

  const ast = babelParser.parse(code, {
    sourceType: 'module',
    plugins: ['typescript', 'classProperties', 'dynamicImport', 'jsx', 'decorators-legacy']
  })

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
            loc: {
              startLine: attr.value.loc.start.line,
              startLineColumn: attr.value.loc.start.column,
              endLine: attr.value.loc.end.line,
              endLineColumn: attr.value.loc.end.column
            }
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
                loc: {
                  startLine: property.value.loc.start.line,
                  startLineColumn: property.value.loc.start.column,
                  endLine: property.value.loc.end.line,
                  endLineColumn: property.value.loc.end.column
                }
              })
              return
            }
          }
        }
      }
    }
  })

  emitter.emit(SOURCE_PARSE_EVENTS.PARSED, filePath)

  return [source].concat(await parseRest(filePaths.slice(1), emitter))
}
