export interface ILoc {
  startLine: number
  startLineColumn: number
  endLine: number
  endLineColumn: number
}

export interface IKey {
  key: string
  loc: ILoc
}

export interface ILocaleKey extends IKey {
  filePath: string
}

export interface ILocale {
  lang: string
  localeKeys?: ILocaleKey[]
}

export interface ISource {
  filePath: string
  keys: IKey[]
}

export interface IUnUsedWarning {
  key: string
  loc: ILoc
  filePath: string
}

export interface IUndefinedWarning {
  key: string
  loc: ILoc
  sourcePath: string
  langs: string[]
}
