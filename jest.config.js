module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1'
  },
  testPathIgnorePatterns: ['node_modules', 'test/fixtures'],
  collectCoverageFrom: ['src/**/*.{js,ts}'],
  setupFiles: ['./test/helpers.ts']
}
