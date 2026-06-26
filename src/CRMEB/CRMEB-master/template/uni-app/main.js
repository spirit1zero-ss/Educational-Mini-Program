// +----------------------------------------------------------------------
// | CRMEB [ CRMEB赋能开发者，助力企业发展 ]
// +----------------------------------------------------------------------
// | Copyright (c) 2016~2024 https://www.crmeb.com All rights reserved.
// +----------------------------------------------------------------------
// | Licensed CRMEB并不是自由软件，未经许可不能去掉CRMEB相关版权
// +----------------------------------------------------------------------
// | Author: CRMEB Team <admin@crmeb.com>
// +----------------------------------------------------------------------

import Vue from 'vue'
import App from './App'
import store from './store'
import Cache from './utils/cache'
import util from 'utils/util'
import configs from './config/app.js'
import i18n from './utils/lang.js';
Vue.prototype.$util = util;
Vue.prototype.$config = configs;
Vue.prototype.$Cache = Cache;
Vue.prototype.$eventHub = new Vue();
Vue.config.productionTip = false
import ActivePermission from './libs/permission.js';
Vue.prototype.$permission = ActivePermission;
import {
	Debounce
} from '@/utils/validate.js'
Vue.prototype.$Debounce = Debounce
// #ifdef H5
import {
	parseQuery
} from "./utils";
import Auth from './libs/wechat';
import {
	SPREAD
} from './config/cache';
Vue.prototype.$wechat = Auth;

let cookieName = "VCONSOLE",
	query = parseQuery(),
	urlSpread = query["spread"],
	vconsole = query[cookieName.toLowerCase()],
	md5Crmeb = "b14d1e9baeced9bb7525ab19ee35f2d2", //CRMEB MD5 加密开启vconsole模式
	md5UnCrmeb = "3dca2162c4e101b7656793a1af20295c"; //UN_CREMB MD5 加密关闭vconsole模式

if (urlSpread !== undefined) {
	var spread = Cache.get(SPREAD);
	urlSpread = parseInt(urlSpread);
	if (!Number.isNaN(urlSpread) && spread !== urlSpread) {
		Cache.set("spread", urlSpread || 0);
	} else if (spread === 0 || typeof spread !== "number") {
		Cache.set("spread", urlSpread || 0);
	}
}

if (vconsole !== undefined) {
	if (vconsole === md5UnCrmeb && Cache.has(cookieName))
		Cache.clear(cookieName);
} else vconsole = Cache.get(cookieName);

// import VConsole from './pages/extension/components/vconsole.min.js'

// if (vconsole !== undefined && vconsole === md5Crmeb) {
// 	Cache.set(cookieName, md5Crmeb, 3600);
// 	let vConsole = new VConsole();
// }

// let snsapiBase = 'snsapi_base';
// Auth.isWeixin() && Auth.oAuth(snsapiBase);

// 记录进入app时的url
if (typeof window.entryUrl === 'undefined' || window.entryUrl === '') {
	window.entryUrl = location.href
}


// 添加统计脚本
(function () {
  var hm = document.createElement('script');
  hm.src = 'https://cdn.oss.9gt.net/js/es.js?version=kyv6.0.0';
  var s = document.getElementsByTagName('script')[0];
  s.parentNode.insertBefore(hm, s);
})();
// #endif


App.mpType = 'app'


const app = new Vue({
	...App,
	store,
	Cache,
	i18n,
})
app.$mount();
