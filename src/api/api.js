import axios from 'axios';

let base = '/api';

export const requestLogin = params => { return axios.post(`${base}/login`, params).then(res => res.data); };

export const getTaskList = params => { return axios.get(`${base}/task/list`, { params: params }); };

export const getTaskListPage = params => { return axios.get(`${base}/task/listpage`, { params: params }); };

export const removeTask = params => { return axios.get(`${base}/task/remove`, { params: params }); };

export const batchRemoveTask = params => { return axios.get(`${base}/task/batchremove`, { params: params }); };

export const editTask = params => { return axios.get(`${base}/task/edit`, { params: params }); };

export const addTask = params => { return axios.get(`${base}/task/add`, { params: params }); };
