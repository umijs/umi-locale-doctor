# Contribute

## Setup env

Install dependencies after git clone the repo.

```bash
yarn
```

Link `umi-locale-doctor` globally.

```bash
yarn link
```

> now, `udoctor` is available at your working system.

## Common Tasks

**debug compilation**

Monitor file changes and transform with `rollup`.

```bash
yarn build --watch
```

**execute tests**

```bash
# run all tests
yarn test

# Test specified file and watch
yarn test cal.test.ts

# with code coverage
yarn test --coverage
```
