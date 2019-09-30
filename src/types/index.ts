export interface IRange {
  startLine: number
  startLineColumn: number
  endLine: number
  endLineColumn: number
}

export interface ILocaleDetail {
  key: string
  range: IRange
  filePath: string
}

export interface ILocale {
  lang: string
  details?: ILocaleDetail[]
}
