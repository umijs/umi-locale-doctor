import { SourceLocation } from '@babel/types'

export function flatten<T>(maps: any): T[] {
  if (maps === undefined || maps === null) {
    return []
  }
  if (!Array.isArray(maps)) {
    return []
  }
  return maps.reduce((prev, cur) => prev.concat(Array.isArray(cur) ? flatten(cur) : [cur]), [])
}

export function toILoc(sourceLoc: SourceLocation) {
  return {
    startLine: sourceLoc.start.line,
    startLineColumn: sourceLoc.start.column,
    endLine: sourceLoc.end.line,
    endLineColumn: sourceLoc.end.column
  }
}
