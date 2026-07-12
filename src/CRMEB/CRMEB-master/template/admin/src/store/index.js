// +----------------------------------------------------------------------
// | CRMEB [ CRMEB赋能开发者，助力企业发展 ]
// +----------------------------------------------------------------------
// | Copyright (c) 2016~2023 https://www.crmeb.com All rights reserved.
// +----------------------------------------------------------------------
// | Licensed CRMEB并不是自由软件，未经许可不能去掉CRMEB相关版权
// +----------------------------------------------------------------------
// | Author: CRMEB Team <admin@crmeb.com>
// +----------------------------------------------------------------------

import Vue from 'vue';
import Vuex from 'vuex';
import VuexPersistence from 'vuex-persist';

import user from './module/user';
import app from './module/app';
import menus from './module/menus';
import menu from './module/menu';
import userInfo from './module/userInfo';
import userLevel from './module/userLevel';
import media from './module/media';
import layout from './module/layout';
import themeConfig from './module/themeConfig';
import routesList from './module/routesList';
import tagsViewRoutes from './module/tagsViewRoutes';
import userInfos from './module/userInfos';
import keepAliveNames from './module/keepAliveNames';

Vue.use(Vuex);
// 持久化储存
// const vuexLocal = new VuexPersistence({
//     storage: window.localStorage,
//
// })

export default new Vuex.Store({
  state: {
    //
  },
  mutations: {
    //
  },
  actions: {
    //
  },
  plugins: [
    new VuexPersistence({
      reducer: (state) => ({
        user: state.user, //这个就是存入localStorage的值
        app: state.app,
        menus: state.menus,
        menu: state.menu,
        userInfo: state.userInfo,
        userLevel: state.userLevel,
        media: state.media,
        layout: state.layout,
        themeConfig: state.themeConfig,
        routesList: state.routesList,
        keepAliveNames: state.keepAliveNames,
      }),
      storage: window.localStorage,
    }).plugin,
  ],
  modules: {
    user,
    app,
    menus,
    menu,
    userInfo,
    userLevel,
    media,
    layout,
    themeConfig,
    routesList,
    tagsViewRoutes,
    userInfos,
    keepAliveNames,
  },
});
