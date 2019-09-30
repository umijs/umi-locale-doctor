import EventEmitter from 'events'
import ProgressBar from 'progress'

import { flatten } from '@/src/helpers/object'
import { parseLocales } from '@/src/parsers/localesParser'
import { parseSources } from '@/src/parsers/sourceParser'
import { ILocale, IUnUsedWarning, IUndefinedWarning, ISource, IKey } from '@/src/types'
import { LOCALE_PARSE_EVENTS, SOURCE_PARSE_EVENTS } from '@/src/types/events'

export function validate() {
  const emitter = new EventEmitter()

  progress(emitter)

  Promise.all([parseLocales(emitter), parseSources(emitter)]).then(([locales, sources]) => {
    const usedKeys = new Set(flatten<IKey>(sources.map(s => s.keys)).map(kr => kr.key))
    const neverUsedKeys = findNeverUsedKeys(locales, usedKeys)

    const undefinedKeys = findUndefinedKeys(locales, sources)
  })
}

function progress(emitter: EventEmitter) {
  let localeBar: ProgressBar = null
  let sourceBar: ProgressBar = null
  emitter.on(LOCALE_PARSE_EVENTS.START, (localeFilepaths: string[]) => {
    localeBar = new ProgressBar('Parsing locales :file [:bar] :rate/bps :percent :etas', {
      total: localeFilepaths.length
    })
  })

  emitter.on(LOCALE_PARSE_EVENTS.PARSED, (localeFilepath: string) => {
    localeBar.tick()
  })

  emitter.on(SOURCE_PARSE_EVENTS.START, (sourceFilepaths: string[]) => {
    sourceBar = new ProgressBar('Parsing source :file [:bar] :rate/bps :percent :etas', {
      total: sourceFilepaths.length
    })
  })

  emitter.on(SOURCE_PARSE_EVENTS.PARSED, (sourceFilepath: string) => {
    sourceBar.tick()
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
