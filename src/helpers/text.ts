import { dirname } from 'path'
const LANG_REG = /(([a-z]{2})-([A-Z]{2}))(\.(j|t)s)?$/

export function langFromPath(filePath: string): string {
  if (filePath.length < 5) {
    return ''
  }

  try {
    return filePath.match(LANG_REG)[1]
  } catch (error) {
    return langFromPath(dirname(filePath))
  }
}
