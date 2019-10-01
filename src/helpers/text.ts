const LANG_REG = /([a-z]{2})-([A-Z]{2})/

export function langFromPath(filePath: string) {
  try {
    return filePath.match(LANG_REG)[0]
  } catch (error) {
    return ''
  }
}
