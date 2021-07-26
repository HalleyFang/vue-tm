<template>
  <section>
    <!--工具条-->
    <el-col :span="24" class="toolbar" style="padding-bottom: 0px;">
      <el-form :inline="true" :model="filters">
        <el-form-item>
          <el-input v-model="filters.label" placeholder="任务ID或任务名称"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" v-on:click="getTasks">查询</el-button>
        </el-form-item>
      </el-form>
    </el-col>

    <!--列表-->
    <el-table :data="tasks" highlight-current-row v-loading="listLoading" @selection-change="selsChange"
              style="width: 100%;">
      <el-table-column type="selection" width="55">
      </el-table-column>
      <el-table-column label="序号" type="index" width="60">
      </el-table-column>
      <el-table-column prop="id" label="ID" width="120" sortable>
      </el-table-column>
      <el-table-column prop="label" label="名称" width="120" sortable>
      </el-table-column>
      <el-table-column prop="status" label="状态" :formatter="taskStatus" width="120" sortable>
      </el-table-column>
      <el-table-column prop="executor" label="责任人" width="100" sortable>
      </el-table-column>
      <el-table-column prop="startTime" label="开始时间" width="120" sortable>
      </el-table-column>
      <el-table-column prop="endTime" label="结束时间" width="120" sortable>
      </el-table-column>
      <el-table-column label="操作" width="300">
        <template slot-scope="scope">
          <el-button size="small" @click="addRouter(scope.$index, scope.row)">执行测试</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!--工具条-->
    <el-col :span="24" class="toolbar">
      <el-pagination layout="prev, pager, next" @current-change="handleCurrentChange" :page-size="20" :total="total"
                     style="float:right;">
      </el-pagination>
    </el-col>

  </section>
</template>

<script>
import {getTaskListByUser} from '../api/api';

export default {
  data() {
    return {
      filters: {
        label: ''
      },
      tasks: [],
      total: 0,
      page: 1,
      listLoading: false,
      sels: [],//列表选中列
    }
  },
  methods: {
    taskStatus: function (row) {
      let showStatus = '';
      switch (row.status) {
        case 0:
          showStatus = '未开始';
          break;
        case 1:
          showStatus = '进行中';
          break;
        case 2:
          showStatus = '已完成';
          break;
        case 3:
          showStatus = '阻塞';
          break;
        default:
          showStatus = '未知状态';
          break;
      }
      return showStatus;
    },
    handleCurrentChange(val) {
      this.page = val;
      this.getTasks();
    },
    //获取用户列表
    getTasks() {
      let para = {
        page: this.page,
        label: this.filters.label
      };
      this.listLoading = true;
      //NProgress.start();
      getTaskListByUser(para).then((res) => {
        let array = res.data;
        if (!array.length) {
          this.tasks = []
          this.tasks.push(array)
        } else {
          this.tasks = array
        }
        this.total = this.tasks.length;
        this.listLoading = false;
        //NProgress.done();
      }).catch(() => {
        this.listLoading = false;
      });
    },
    selsChange: function (sels) {
      this.sels = sels;
    },
    addRouter(index,row){
      this.$router.push('/testing?id='+row.id)
    }
  },
  mounted() {
    this.getTasks();
  }
}

</script>

<style scoped lang="scss">

</style>
