import chalk from 'chalk'
import commander from 'commander'
import packageJson from '@/package.json'

import { parseLocales } from '@/src/parsers/localesParser'
import { parseSources } from '@/src/parsers/sourceParser'

commander
  .version(packageJson.version)
  .description(packageJson.description)
  .parse(process.argv)

parseSources().then(data => {
  console.log(data)
})
