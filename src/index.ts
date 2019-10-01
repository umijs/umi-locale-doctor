import 'reflect-metadata'
import chalk from 'chalk'
import commander from 'commander'
import packageJson from '@/package.json'

import { validate } from '@/src/validators'

commander
  .version(packageJson.version)
  .description(packageJson.description)
  .parse(process.argv)

validate()
