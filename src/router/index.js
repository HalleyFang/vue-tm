import Login from '../views/Login.vue'
import NotFound from '../views/404.vue'
import MyTask from "@/views/MyTask";
import CaseTree from "@/views/CaseTree";
import Home from "@/views/Home";
import Tasks from "../views/Tasks";
import Testing from "@/views/Testing";
import HomeWithoutMenu from "@/views/HomeWithoutMenu";

let routes = [
    {
        path: '/',
        redirect: '/myTask'
    },
    {
        path: '/login',
        component: Login,
        name: '',
        hidden: true
    },
    {
        path: '/404',
        component: NotFound,
        name: '',
        hidden: true
    }, {
        path: '/',
        component: Home,
        name: 'MyTask',
        iconCls: 'el-icon-message',
        children: [
            {path: '/myTask', component: MyTask, name: 'MyTask', hidden: true}
        ]
    },
    {
        path: '/',
        component: Home,
        name: 'CaseManagement',
        iconCls: 'el-icon-message',
        children: [
            {path: '/caseTree', component: CaseTree, name: 'CaseMaster', hidden: true}
        ]
    }, {
        path: '/',
        component: Home,
        name: 'TaskManagement',
        iconCls: 'el-icon-message',
        children: [
            {path: '/tasks', component: Tasks, name: 'Tasks', hidden: true}
        ]
    }, {
        path: '/',
        component: HomeWithoutMenu,
        name: 'CaseExecute',
        iconCls: 'el-icon-message',
        children: [
            {path: '/testing/:id', component: Testing, name: 'Testing', hidden: true}
        ]
    },
    {
        path: '*',
        hidden: true,
        redirect: {path: '/404'}
    }
];

export default routes;