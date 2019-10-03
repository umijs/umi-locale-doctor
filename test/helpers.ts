import * as path from 'path'

global['toFixturesDir'] = (...args: string[]) => {
  return path.resolve(__dirname, 'fixtures', ...args)
}
