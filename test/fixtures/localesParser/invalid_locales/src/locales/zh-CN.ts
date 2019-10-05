const menus = ['test']

export default {
  [Symbol('hello')]: '你好',
  ...[Symbol('hello')],
  ...menus,
  say() {}
} as object
