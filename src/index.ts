import 'reflect-metadata'
import commander from 'commander'
import packageJson from '@/package.json'

import { validate } from '@/src/validators'
import { resolveImportModulePath } from '@/src/helpers/value'

commander
  .version(packageJson.version)
  .description(packageJson.description)
  .parse(process.argv)

// validate()

console.log(
  resolveImportModulePath('/Users/haozuo/codes/github/umi-locale-doctor/src/index.ts', '@/src/validators')
)
