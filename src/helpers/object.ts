export function flatten<T>(maps: any): T[] {
  if (maps === undefined || maps === null) {
    return []
  }
  if (!Array.isArray(maps)) {
    return []
  }
  return maps.reduce((prev, cur) => prev.concat(Array.isArray(cur) ? flatten(cur) : [cur]), [])
}
