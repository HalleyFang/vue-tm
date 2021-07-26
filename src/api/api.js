import axios from 'axios';

let base = '/api';

export const requestLogin = params => { return axios.post(`${base}/login`, params).then(res => res.data); };

export const getTaskList = params => { return axios.get(`${base}/task/list`, { params: params }); };

export const getTaskListPage = params => { return axios.post(`${base}/task/listPage`, { params: params }); };

export const getTaskListByUser = params => { return axios.post(`${base}/task/listPageByUser`, { params: params }); };

export const removeTask = params => { return axios.post(`${base}/task/remove`, { params: params }); };

export const batchRemoveTask = params => { return axios.post(`${base}/task/batchremove`, { params: params }); };

export const editTask = params => { return axios.post(`${base}/task/edit`, { params: params }); };

export const addTask = params => { return axios.post(`${base}/task/add`, { params: params }); };

export const caseTask = (params,conf) => { return axios.post(`${base}/taskCase/add`, { params: params },{params: conf}); };
