import Vue from 'vue'
import App from './App.vue'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import VueRouter from 'vue-router'
import routes from './router'
import 'font-awesome/css/font-awesome.min.css'
import axios from "axios";
import util from './util/util'

Vue.use(ElementUI)
Vue.use(VueRouter)
Vue.prototype.axios = axios;
Vue.config.productionTip = false
Vue.prototype.$utilHelper = util;

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

router.beforeEach((to, from, next) => {
    if (to.path == '/login') {
      localStorage.removeItem('user');
  }
  let user = JSON.parse(localStorage.getItem('user'));
  if (!user && to.path != '/login') {
    next({ path: '/login' })
  } else {
    next()
  }
  next()
})

new Vue({
  router,
  render: h => h(App),
}).$mount('#app')
