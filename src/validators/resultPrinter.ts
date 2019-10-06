import chalk from 'chalk'
import { table } from 'table'
import { IUnUsedWarning, IUndefinedWarning, IKey } from '@/src/types'

export default class ResultPrinter {
  public printNeverUsedKeys(neverUsedKeys: IUnUsedWarning[]) {
    const data = []

    console.log('')
    console.log('  ' + chalk.yellow.bold.bold('Keys defined but never used'))

    data.push([chalk.bold('Key'), chalk.bold('Location')])

    let rawData = neverUsedKeys
    if (neverUsedKeys.length > 10) {
      rawData = neverUsedKeys.slice(0, 10)
    }
    rawData.forEach(unusedKey => {
      data.push([unusedKey.key, `${unusedKey.filePath.replace(process.cwd(), '').slice(1)}:${unusedKey.loc.startLine}`])
    })
    if (neverUsedKeys.length > 10) {
      data.push(['...', 'too many unused keys'])
    }
    console.log(table(data))
    return this
  }

  public printUndefinedKeys(undefinedKeys: IUndefinedWarning[]) {
    const data = []

    console.log('')
    console.log('  ' + chalk.yellow.bold.bold('Keys used but never defined'))

    data.push([chalk.bold('Key'), chalk.bold('Langs'), chalk.bold('Location')])

    let rawData = undefinedKeys
    if (undefinedKeys.length > 10) {
      rawData = undefinedKeys.slice(0, 10)
    }
    rawData.forEach(undefinedKey => {
      data.push([
        undefinedKey.key,
        undefinedKey.langs.join(', '),
        `${undefinedKey.sourcePath.replace(process.cwd(), '').slice(1)}:${undefinedKey.loc.startLine}`
      ])
    })
    if (undefinedKeys.length > 10) {
      data.push(['...', '...', 'too many undefined keys'])
    }
    console.log(table(data))

    return this
  }
}
