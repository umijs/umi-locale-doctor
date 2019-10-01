import { Service, Token, Inject } from 'typedi'
import glob from 'glob'
import { fs } from 'mz'
import path from 'path'
import { flatten } from '@/src/helpers/object'
import { langFromPath } from '@/src/helpers/text'

const LANG_FILE_DIR_REG = /([a-z]{2})-([A-Z]{2})(\.(j|t)s)?$/
const JS_TS_REG = /\.(j|t)s$/
const SOURCE_IGNORE_PATTERNS = ['src/locales/**', 'src/locale/**', 'src/**/*.d.ts', 'src/e2e/**', 'test/**']

export interface IResourceMatcher {
  getLocaleFiles(): Promise<string[]>
  getSourceFiles(): Promise<string[]>
}

export const IResourceMatcherToken = new Token<IResourceMatcher>()

@Service(IResourceMatcherToken)
class ResourceMatcher implements IResourceMatcher {
  public async getLocaleFiles(): Promise<string[]> {
    const rawFiles = await Promise.all([this.getFiles('src/locales/*'), this.getFiles('src/locale/*')])
    const flattenLocaleFiles = flatten<string>(rawFiles)

    const nameMatched = flattenLocaleFiles.filter(f => LANG_FILE_DIR_REG.test(f))

    const localeFiles = nameMatched
      .filter(f => JS_TS_REG.test(f))
      .reduce((prev, cur) => {
        const lang = langFromPath(cur)
        prev[lang] = cur
        return prev
      }, {})

    nameMatched
      .filter(f => !JS_TS_REG.test(f))
      .forEach(cur => {
        const lang = langFromPath(cur)
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

  public async getSourceFiles(): Promise<string[]> {
    const rawFiles = await Promise.all([
      this.getFiles('src/**/*.js', SOURCE_IGNORE_PATTERNS),
      this.getFiles('src/**/*.ts', SOURCE_IGNORE_PATTERNS)
    ])

    return flatten<string>(rawFiles)
  }

  private getFiles(pattern: string, ignore?: string | string[]): Promise<string[]> {
    return new Promise((resolve, reject) => {
      glob(pattern, { absolute: true, ignore }, (err, files) => {
        if (err) {
          return reject(err)
        }
        return resolve(files || [])
      })
    })
  }
}
