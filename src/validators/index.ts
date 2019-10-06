import { Container } from 'typedi'

import { flatten } from '@/src/helpers/object'
import { ILocaleParserToken } from '@/src/services/localesParser'
import { ISourceParserToken } from '@/src/services/sourceParser'
import { IResultMatcherToken } from '@/src/services/resultMatcher'
import { IKey } from '@/src/types'
import ProgressPrinter from '@/src/validators/progressPrinter'
import ResultPrinter from '@/src/validators/resultPrinter'

export async function validate() {
  const localeParser = Container.get(ILocaleParserToken)
  const sourceParser = Container.get(ISourceParserToken)
  const resultMatcher = Container.get(IResultMatcherToken)

  new ProgressPrinter(localeParser, 'locales').start()
  new ProgressPrinter(sourceParser, 'sources').start()

  const [locales, sources] = await Promise.all([localeParser.parse(), sourceParser.parse()])

  const usedKeys = new Set(flatten<IKey>(sources.map(s => s.keys)).map(kr => kr.key))

  const neverUsedKeys = resultMatcher.matchNeverUsedKeys(locales, usedKeys)
  const undefinedKeys = resultMatcher.matchUndefinedKeys(locales, sources)

  new ResultPrinter().printNeverUsedKeys(neverUsedKeys).printUndefinedKeys(undefinedKeys)
}
