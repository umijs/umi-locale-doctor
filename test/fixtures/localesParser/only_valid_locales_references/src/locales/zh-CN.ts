import menus from './zh_menus/menus'

const sideBars = {
  'bar-1': '菜单一'
}

export default {
  ...menus,
  name: '名字',
  ...sideBars
}
