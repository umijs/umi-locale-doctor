import { Service, Token } from 'typedi'
import * as glob from 'glob'
import * as path from 'path'
import { flatten } from '@/src/helpers/object'
import { langFromPath } from '@/src/helpers/text'

const SOURCE_IGNORE_PATTERNS = [
  'src/locales/**',
  'src/locale/**',
  '**/*.d.ts',
  '**/test/**',
  '**/e2e/**',
  '**/*.test.{js,ts}',
  '**/__mocks__/**',
  '**/__tests__/**'
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
      glob(pattern, { ignore }, (err, files) => {
        if (err) {
          return reject(err)
        }
        return resolve(files.map(f => path.resolve(process.cwd(), f)) || [])
      })
    })
  }
}
