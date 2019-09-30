import glob from 'glob'
import { fs } from 'mz'
import path from 'path'

const langFileReg = /([a-z]{2})-([A-Z]{2})(\.(j|t)s)?$/
const langReg = /([a-z]{2})-([A-Z]{2})/
const jsOrTsReg = /\.(j|t)s$/

export async function getLocaleFiles(): Promise<string[]> {
  const rawFiles = await Promise.all([getFiles('src/locales/*'), getFiles('src/locale/*')])
  const flattenLocaleFiles = rawFiles.reduce((prev, cur) => prev.concat(cur), [])

  const nameMatched = flattenLocaleFiles.filter(f => langFileReg.test(f))

  const localeFiles = nameMatched
    .filter(f => jsOrTsReg.test(f))
    .reduce((prev, cur) => {
      const lang = getLang(cur)
      prev[lang] = cur
      return prev
    }, {})

  nameMatched
    .filter(f => !jsOrTsReg.test(f))
    .forEach(cur => {
      const lang = getLang(cur)
      if (localeFiles[lang]) {
        return
      }
      const filePath = [path.resolve(cur, 'index.js'), path.resolve(cur, 'index.ts')].find(f =>
        fs.existsSync(f)
      )
      if (!filePath) {
        return
      }
      localeFiles[lang] = filePath
    })

  return Object.values(localeFiles)
}

export async function getSourceFiles() {
  const rawFiles = await Promise.all([
    getFiles('src/**/*.js', ['src/locales/**', 'src/locale/**', 'src/**/*.d.ts', 'src/e2e/**']),
    getFiles('src/**/*.ts', ['src/locales/**', 'src/locale/**', 'src/**/*.d.ts', 'src/e2e/**'])
  ])

  return rawFiles.reduce((prev, cur) => prev.concat(cur), [])
}

function getFiles(pattern: string, ignore?: string | string[]): Promise<string[]> {
  return new Promise((resolve, reject) => {
    glob(pattern, { absolute: true, ignore }, (err, files) => {
      if (err) {
        return reject(err)
      }
      return resolve(files || [])
    })
  })
}

export function getLang(filePath: string) {
  return filePath.match(langReg)[0]
}
