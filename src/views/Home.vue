<template>
  <el-container class="container">
    <el-header class="header">
      <el-row>
        <el-col :span="4" class="logo" :class="collapsed?'logo-collapse-width':'logo-width'">
          {{ collapsed ? '' : sysName }}
        </el-col>
        <el-col :span="12">
          <el-menu
              :default-active="$route.path"
              class="el-menu-demo"
              mode="horizontal"
              @open="handleopen"
              @close="handleclose"
              @select="handleselect"
              background-color="#20a0ff"
              text-color="#fff"
              active-text-color="#ffd04b"
              unique-opened
              router>
            <el-menu-item index="myTask">我的工作台</el-menu-item>
            <el-submenu index="2">
              <template slot="title">用例管理</template>
              <el-menu-item index="caseTree">基线库</el-menu-item>
<!--              <el-menu-item index="2-2">用例评审</el-menu-item>
              <el-menu-item index="2-3">用例归档</el-menu-item>-->
            </el-submenu>
            <el-submenu index="3">
              <template slot="title">测试管理</template>
              <el-menu-item index="tasks">任务管理</el-menu-item>
<!--              <el-menu-item index="testing">测试执行</el-menu-item>-->
            </el-submenu>
            <el-submenu index="4">
              <template slot="title">测试报告</template>
              <el-menu-item index="simpleReport">简要报告</el-menu-item>
              <el-menu-item index="report">详细报告</el-menu-item>
            </el-submenu>
          </el-menu>
        </el-col>
        <el-col :span="2">
          <el-select
              v-model="isV"
              placeholder="请选择版本"
              size="small"
              @change="switchVersion"
          >
            <el-option
                label="v1"
                value="v1"
            ></el-option>
            <el-option
                label="v2"
                value="v2"
            ></el-option>
          </el-select>
        </el-col>
        <el-col :span="4">
          <div style="margin-top: 10px">
            <el-avatar :src="this.sysUserAvatar"></el-avatar>
          <el-dropdown trigger="hover" style="position: relative;bottom: 15px;margin-left: 5px">
            <span class="el-dropdown-link userinfo-inner" style="font-size: large;color: white"> {{ sysUserName }}</span>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item>我的消息</el-dropdown-item>
              <el-dropdown-item>设置</el-dropdown-item>
              <el-dropdown-item divided @click.native="logout">退出登录</el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
          </div>
        </el-col>
      </el-row>
    </el-header>
    <el-main class="main">
      <section class="content-container">
        <div class="grid-content bg-purple-light">
          <el-col :span="24" class="breadcrumb-container">
            <strong class="title">{{ $route.name }}</strong>
            <el-breadcrumb separator="/" class="breadcrumb-inner">
              <el-breadcrumb-item v-for="item in $route.matched" :key="item.path" style="background: gainsboro">
                {{ item.name }}
              </el-breadcrumb-item>
            </el-breadcrumb>
          </el-col>
          <el-col :span="24" class="content-wrapper">
            <transition name="fade" mode="out-in">
              <router-view></router-view>
            </transition>
          </el-col>
        </div>
      </section>
    </el-main>
  </el-container>
</template>

<script>

import axios from "axios";

export default {
  data() {
    return {
      sysName: 'TestManagement',
      collapsed: false,
      sysUserName: '',
      sysUserAvatar: '',
      form: {
        name: '',
        region: '',
        date1: '',
        date2: '',
        delivery: false,
        type: [],
        resource: '',
        desc: ''
      },
      isV:''
    }
  },
  methods: {
    onSubmit() {
      console.log('submit!');
    },
    handleopen() {
      //console.log('handleopen');
    },
    handleclose() {
      //console.log('handleclose');
    },
    handleselect: function () {
    },
    //退出登录
    logout: function () {
      var _this = this;
      this.$confirm('确认退出吗?', '提示', {
        //type: 'warning'
      }).then(() => {
        sessionStorage.removeItem('user');
        localStorage.removeItem('user');
        _this.$router.push('/login');
      }).catch(() => {

      });


    },
    //折叠导航栏
    collapse: function () {
      this.collapsed = !this.collapsed;
    },
    showMenu(i, status) {
      this.$refs.menuCollapsed.getElementsByClassName('submenu-hook-' + i)[0].style.display = status ? 'block' : 'none';
    },
    switchVersion(){
      const params = new URLSearchParams();
      params.append('value',this.isV);
      axios.post('/api/userConf/setV',params).then(
          (resp) => {
            if(resp){
              location.reload();
              this.$router.go(0)
            }
          }
      );
    },
    getVersion(){
      axios.get('/api/userConf/getV').then(
          (resp) => {
            this.isV = resp.data;
          }
      )

    }
  },
  mounted() {
    var user = localStorage.getItem('user');
    if (user) {
      console.log("uuu  " + user)
      user = JSON.parse(user);
      this.sysUserName = user || '';
      this.sysUserAvatar = '/api/avatar' || '';
    }
    this.getVersion();
  }
}

</script>

<style scoped lang="scss">

.container {
  position: absolute;
  top: 0px;
  bottom: 0px;
  width: 100%;

  .header {
    height: 60px;
    line-height: 60px;
    background: #20a0ff;
    color: #fff;

    .userinfo {
      text-align: right;
      padding-right: 35px;
      float: right;

      .userinfo-inner {
        cursor: pointer;
        color: #fff;

        img {
          width: 40px;
          height: 40px;
          border-radius: 20px;
          margin: 10px 0px 10px 10px;
          float: right;
        }
      }
    }

    .logo {
      //width:230px;
      height: 60px;
      font-size: 22px;
      padding-left: 20px;
      padding-right: 20px;
      border-color: rgba(238, 241, 146, 0.3);
      border-right-width: 1px;
      border-right-style: solid;

      img {
        width: 40px;
        float: left;
        margin: 10px 10px 10px 18px;
      }

      .txt {
        color: #fff;
      }
    }

    .logo-width {
      width: 230px;
    }

    .logo-collapse-width {
      width: 60px
    }

    .tools {
      padding: 0px 23px;
      width: 14px;
      height: 60px;
      line-height: 60px;
      cursor: pointer;
    }
  }

  .main {
    .breadcrumb-container {
      .title {
        display: none;
      }
    }

    .content-wrapper {
      background-color: #fff;
      box-sizing: border-box;
    }

    .breadcrumb-inner{
      margin-bottom: 5px;
    }
  }

}
</style>
