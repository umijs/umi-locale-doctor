import { Service, Token } from 'typedi'
import * as glob from 'glob'
import { fs } from 'mz'
import path from 'path'
import { flatten } from '@/src/helpers/object'
import { langFromPath } from '@/src/helpers/text'

const SOURCE_IGNORE_PATTERNS = [
  'src/locales/**',
  'src/locale/**',
  'src/**/*.d.ts',
  'src/e2e/**',
  'test/**',
  'src/test/**'
]

export interface IResourceMatcher {
  getLocaleFiles(): Promise<string[]>
  getSourceFiles(): Promise<string[]>
}

export const IResourceMatcherToken = new Token<IResourceMatcher>()

@Service(IResourceMatcherToken)
class ResourceMatcher implements IResourceMatcher {
  public async getLocaleFiles(): Promise<string[]> {
    const rawFiles = await Promise.all([
      this.getFiles('src/locales/*.{js,ts}'),
      this.getFiles('src/locale/*.{js,ts}')
    ])

    return flatten<string>(rawFiles).filter(f => langFromPath(f))
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
