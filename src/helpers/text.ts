const LANG_REG = /(([a-z]{2})-([A-Z]{2}))\.(j|t)s$/

export function langFromPath(filePath: string) {
  try {
    return filePath.match(LANG_REG)[1]
  } catch (error) {
    return ''
  }
}
