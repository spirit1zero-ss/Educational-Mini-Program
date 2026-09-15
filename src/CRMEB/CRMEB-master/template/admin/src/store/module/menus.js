// +----------------------------------------------------------------------
// | CRMEB [ CRMEB赋能开发者，助力企业发展 ]
// +----------------------------------------------------------------------
// | Copyright (c) 2016~2023 https://www.crmeb.com All rights reserved.
// +----------------------------------------------------------------------
// | Licensed CRMEB并不是自由软件，未经许可不能去掉CRMEB相关版权
// +----------------------------------------------------------------------
// | Author: CRMEB Team <admin@crmeb.com>
// +----------------------------------------------------------------------

/**
 * 布局菜单配置
 * */
import { menusApi } from '@/api/account';
import { formatFlatteningRoutes } from '@/libs/system';
function getMenusName() {
  let storage = window.localStorage;
  let menuList = JSON.parse(storage.getItem('menuList'));
  if (typeof menuList !== 'object' || menuList === null) {
    menuList = [];
  }
  return menuList;
}
export default {
  namespaced: true,
  state: {
    menusName: getMenusName(),
    openMenus: [],
    childMenuList: [],
    oneLvMenus: [],
    oneLvRoutes: [],
  },
  mutations: {
    getmenusNav(state, menuList) {
      state.menusName = menuList;
    },
    // getopenMenus (state, openList) {
    //   state.openMenus = openList
    // }
    setopenMenus(state, openList) {
      state.openMenus = openList;
    },
    setOneLvMenus(state, oneLvMenus) {
      state.oneLvMenus = oneLvMenus;
    },
    setOneLvRoute(state, oneLvMenus) {
      state.oneLvRoutes = oneLvMenus;
    },
    childMenuList(state, list) {
      state.childMenuList = list;
    },
  },
  actions: {
    async getMenusNavList({ commit }) {
      const res = await menusApi();
      const data = res.data;
      if (!data || !Array.isArray(data.menus) || !Array.isArray(data.unique)) {
        throw new Error('菜单数据格式错误');
      }
      // The sidebar, breadcrumbs and search restore separate persisted copies.
      // Replace them together using the current authenticated menu response.
      commit('getmenusNav', data.menus);
      commit('routesList/getRoutesList', data.menus, { root: true });
      commit('setOneLvRoute', formatFlatteningRoutes(data.menus));
      commit('userInfo/uniqueAuth', data.unique, { root: true });
      commit('userInfo/access', data.unique, { root: true });
      return res;
    },
  },
};
