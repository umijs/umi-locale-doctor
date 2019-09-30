import babelParser from '@babel/parser'
import { fs } from 'mz'
import traverse from '@babel/traverse'

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

import { getSourceFiles } from '@/src/helpers/fileUtil'

export async function parseSources() {
  const sourceFiles = await getSourceFiles()
  console.log(sourceFiles)
  await parserAndValidate(sourceFiles)
}

async function parserAndValidate(filePaths: string[]): Promise<void> {
  const filePath = filePaths[2]
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

  traverse(ast, {
    JSXIdentifier(path, state) {
      if (path.node.name === 'FormattedMessage') {
        if (path.container && path.container['attributes']) {
          const attr = path.container['attributes'].find((a: object) => a['name']['name'] === 'id')
          if (attr) {
            console.log(attr['value']['value'])
          }
        }
      }
    }
  })
}
