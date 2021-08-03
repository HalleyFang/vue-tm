import axios from 'axios';
import Vue from "vue";

let base = '/api';

export const requestLogin = params => {
    return axios.post(`${base}/auth/login`, params).then(res => res.data);
};

export const getTaskList = params => {
    return axios.get(`${base}/task/list`, {params: params});
};

export const getTaskListPage = params => {
    return axios.post(`${base}/task/listPage`, {params: params});
};


export const getTaskListByUser = params => {
    return axios.post(`${base}/task/listPageByUser`, {params: params});
};

export const removeTask = params => {
    return axios.post(`${base}/task/remove`, {params: params});
};

export const batchRemoveTask = params => {
    return axios.post(`${base}/task/batchremove`, {params: params});
};

export const editTask = params => {
    return axios.post(`${base}/task/edit`, {params: params});
};

export const addTask = params => {
    return axios.post(`${base}/task/add`, {params: params});
};

export const caseTask = (params, conf) => {
    return axios.post(`${base}/taskCase/add`, {params: params}, {params: conf});
};

// 添加请求拦截器
axios.interceptors.request.use(function (config) {
    // 在发送请求之前做些什么
    if (window.localStorage.getItem('access-token')) {
        config.headers.Authorization = window.localStorage.getItem('access-token');
    }
    // console.log(window.localStorage.getItem('access-token'));
    return config
}, function (error) {
    // 对请求错误做些什么
    return Promise.reject(error)
});

// 添加响应拦截器
axios.interceptors.response.use(function (response) {
    // 对响应数据做点什么

    if (response.status === 401) {
        // to re-login
        Vue.prototype.$confirm("认证失败，请重新登录!").then(
            () => {
                sessionStorage.removeItem('user');
                localStorage.removeItem('user');
                location.reload();
            }
        )

    }
    if(response.status === 200 && response.data.toString().indexOf("doesn't work properly without JavaScript enabled") != -1){
        Vue.prototype.$confirm("认证失败，请重新登录!").then(
            () => {
                sessionStorage.removeItem('user');
                localStorage.removeItem('user');
                location.reload();
            }
        )
    }
    return response
}, function (error) {
    Vue.prototype.$message.error("错误码："+error.response.status);
    if(error.config.url == '/api/auth/login' && error.response.status == 500){
        location.reload();
    }
    // 对响应错误做点什么
    return Promise.reject(error)
});