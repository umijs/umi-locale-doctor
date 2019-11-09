import { Token, Service, Inject } from 'typedi'

import { flatten } from '@/src/helpers/object'
import { ILocale, IUnUsedWarning, IUndefinedWarning, ISource, IKey } from '@/src/types'

export interface IResultMatcher {
  matchNeverUsedKeys(locales: ILocale[], usedKeys: Set<string>): IUnUsedWarning[]
  matchUndefinedKeys(locales: ILocale[], sources: ISource[]): IUndefinedWarning[]
}

export const IResultMatcherToken = new Token<IResultMatcher>()

@Service(IResultMatcherToken)
export class ResultMatcher implements IResultMatcher {
  public matchNeverUsedKeys(locales: ILocale[], usedKeys: Set<string>): IUnUsedWarning[] {
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
  public matchUndefinedKeys(locales: ILocale[], sources: ISource[]): IUndefinedWarning[] {
    const rawWarnings: IUndefinedWarning[][] = sources.map(source => {
      return source.keys
        .filter(
          kr => !locales || !locales.length || locales.filter(l => l.localeKeys.every(d => d.key !== kr.key)).length
        )
        .map<IUndefinedWarning>(kr => ({
          key: kr.key,
          loc: kr.loc,
          sourcePath: source.filePath,
          langs:
            !locales || !locales.length
              ? ['none']
              : locales.filter(l => l.localeKeys.every(d => d.key !== kr.key)).map(l => l.lang)
        }))
    })
    return flatten<IUndefinedWarning>(rawWarnings)
  }
}
