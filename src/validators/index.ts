import EventEmitter from 'events'
import ora from 'ora'
import chalk from 'chalk'
import { table } from 'table'
import { Container } from 'typedi'

import { flatten } from '@/src/helpers/object'
import { ILocaleParserToken } from '@/src/services/localesParser'
import { ISourceParserToken } from '@/src/services/sourceParser'
import { ILocale, IUnUsedWarning, IUndefinedWarning, ISource, IKey } from '@/src/types'
import { LOCALE_PARSE_EVENTS, SOURCE_PARSE_EVENTS } from '@/src/types/events'
import { toPercent } from '@/src/helpers/cal'

export async function validate() {
  const localeParser = Container.get(ILocaleParserToken)
  const sourceParser = Container.get(ISourceParserToken)

  progress(localeParser, sourceParser)

  const [locales, sources] = await Promise.all([localeParser.parse(), sourceParser.parse()])

  const usedKeys = new Set(flatten<IKey>(sources.map(s => s.keys)).map(kr => kr.key))

  const neverUsedKeys = findNeverUsedKeys(locales, usedKeys)
  const undefinedKeys = findUndefinedKeys(locales, sources)

  printNeverUsedKeys(neverUsedKeys)
  printUndefinedKeys(undefinedKeys)
}

function progress(localeEmitter: EventEmitter, sourceEmitter: EventEmitter) {
  let localeSpinner: ora.Ora = null
  let sourceSpinner: ora.Ora = null
  let localeSpinnerTotal: number = null
  let localeSpinnerCounted: number = 0
  let sourceSpinnerTotal: number = null
  let sourceSpinnerCounted: number = 0
  localeEmitter.on(LOCALE_PARSE_EVENTS.START, (localeFilepaths: string[]) => {
    localeSpinner = ora('Parsing locales 0%').start()
    localeSpinnerTotal = localeFilepaths.length
  })

  localeEmitter.on(LOCALE_PARSE_EVENTS.PARSED, (localeFilepath: string) => {
    localeSpinnerCounted++
    localeSpinner.text = `Parsing locales ${toPercent(
      localeSpinnerTotal,
      localeSpinnerCounted
    )}% => ${localeFilepath.replace(process.cwd(), '').slice(1)}`

    if (localeSpinnerCounted === localeSpinnerTotal) {
      localeSpinner.succeed()
    }
  })

  sourceEmitter.on(SOURCE_PARSE_EVENTS.START, (sourceFilepaths: string[]) => {
    sourceSpinner = ora('Parsing locales 0%').start()
    sourceSpinnerTotal = sourceFilepaths.length
  })

  sourceEmitter.on(SOURCE_PARSE_EVENTS.PARSED, (sourceFilepath: string) => {
    sourceSpinnerCounted++
    sourceSpinner.text = `Parsing sources ${toPercent(
      sourceSpinnerTotal,
      sourceSpinnerCounted
    )}% => ${sourceFilepath.replace(process.cwd(), '').slice(1)}`

    if (sourceSpinnerCounted === sourceSpinnerTotal) {
      sourceSpinner.succeed()
    }
  })
}

function findNeverUsedKeys(locales: ILocale[], usedKeys: Set<string>) {
  const rawWarnings: IUnUsedWarning[][] = locales.map(locale => {
    return locale.localeKeys
      .filter(d => !usedKeys.has(d.key))
      .map(d => ({
        key: d.key,
        loc: d.loc,
        filePath: d.filePath
      }))
  })
  return flatten<IUnUsedWarning>(rawWarnings)
}

function findUndefinedKeys(locales: ILocale[], sources: ISource[]) {
  const rawWarnings: IUndefinedWarning[][] = sources.map(source => {
    return source.keys
      .filter(kr => locales.filter(l => l.localeKeys.every(d => d.key !== kr.key)).length)
      .map<IUndefinedWarning>(kr => ({
        key: kr.key,
        loc: kr.loc,
        sourcePath: source.filePath,
        langs: locales.filter(l => l.localeKeys.every(d => d.key !== kr.key)).map(l => l.lang)
      }))
  })
  return flatten<IUndefinedWarning>(rawWarnings)
}

function printNeverUsedKeys(neverUsedKeys: IUnUsedWarning[]) {
  const data = []

  console.log('')
  console.log('  ' + chalk.yellow.bold.bold('Keys defined but never used'))

  data.push([chalk.bold('Key'), chalk.bold('Location')])

  let rawData = neverUsedKeys
  if (neverUsedKeys.length > 10) {
    rawData = neverUsedKeys.slice(0, 10)
  }
  rawData.forEach(unusedKey => {
    data.push([
      unusedKey.key,
      `${unusedKey.filePath.replace(process.cwd(), '').slice(1)}:${unusedKey.loc.startLine}`
    ])
  })
  if (neverUsedKeys.length > 10) {
    data.push(['...', 'too many unused keys'])
  }
  console.log(table(data))
}

function printUndefinedKeys(undefinedKeys: IUndefinedWarning[]) {
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
}
