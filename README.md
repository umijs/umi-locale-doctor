# umi-locale-doctor

[![NPM Version][npm-image]][npm-url]
[![Build Status][travis-image]][travis-url]
[![Coverage Status][coverage-image]][coverage-url]
![][david-url]
![][dt-url]
[![code style: prettier][prettier-image]][prettier-url]
![][license-url]

A useful tool to analyze [umi locale usage](https://umijs.org/api/#locale):

- keys are miss defined in locales
- keys are never used in source code

See below:

![](./docs/demo.gif)

## Install

> not published yet

```bash
yarn global add umi-locale-doctor
```

## Usage

Execute `udoctor` at the root dir of your `umi` based repo.

```bash
udoctor
```

## Want to contribute?

see [contributing](https://github.com/leftstick/umi-locale-doctor/blob/master/CONTRIBUTING.md)

## LICENSE

[MIT License](https://raw.githubusercontent.com/leftstick/umi-locale-doctor/master/LICENSE)

[npm-url]: https://npmjs.org/package/umi-locale-doctor
[npm-image]: https://badge.fury.io/js/umi-locale-doctor.png
[david-url]: https://david-dm.org/leftstick/umi-locale-doctor.png
[travis-image]: https://api.travis-ci.com/leftstick/umi-locale-doctor.svg?branch=master
[travis-url]: https://travis-ci.com/leftstick/umi-locale-doctor
[coverage-image]: https://coveralls.io/repos/github/leftstick/umi-locale-doctor/badge.svg?branch=master
[coverage-url]: https://coveralls.io/github/leftstick/umi-locale-doctor
[dt-url]: https://img.shields.io/npm/dt/umi-locale-doctor.svg
[license-url]: https://img.shields.io/github/license/leftstick/umi-locale-doctor
[prettier-image]: https://img.shields.io/badge/code_style-prettier-ff69b4.svg
[prettier-url]: https://github.com/prettier/prettier
