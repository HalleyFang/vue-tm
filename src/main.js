import Vue from 'vue'
import App from './App.vue'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import VueRouter from 'vue-router'
import routes from './router'
import 'font-awesome/css/font-awesome.min.css'
import axios from "axios";
import util from './util/util'
import moment from 'moment/moment'
import VueParticles from 'vue-particles'

Vue.use(ElementUI)
Vue.use(VueRouter)
Vue.prototype.axios = axios;
Vue.config.productionTip = false
Vue.prototype.$utilHelper = util;
Vue.use(VueParticles)

const router = new VueRouter({
    mode: 'history',
    base: process.env.BASE_URL,
    routes
})

router.beforeEach((to, from, next) => {
    if (to.path == '/login') {
        sessionStorage.removeItem('user');
        localStorage.removeItem('user');
    }
    let user = JSON.parse(localStorage.getItem('user'));
    if (!user && to.path != '/login') {
        next({path: '/login'})
    } else {
        next()
    }
    next()
})

Vue.filter('moment', function (value, formatString) {
    formatString = formatString || 'YYYY-MM-DD';
    return moment(value).format(formatString);
});

Vue.filter('momentTime', function (value, formatString) {
    formatString = formatString || 'YYYY-MM-DD HH:mm:ss';
    return moment(value).format(formatString);
});

new Vue({
    router,
    render: h => h(App),
}).$mount('#app')
