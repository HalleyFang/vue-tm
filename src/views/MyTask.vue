<template>
  <section>
    <!--工具条-->
    <el-col :span="24" class="toolbar" style="padding-bottom: 0px;">
      <el-form :inline="true" :model="filters" style="float:right;margin-right: 30px">
        <el-form-item>
          <el-select v-model="filters.taskStatus" placeholder="任务状态">
            <el-option
                v-for="item in taskStatus"
                :key="item.value"
                :label="item.label"
                :value="item.value">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-input v-model="filters.label" placeholder="任务ID或任务名称" style="width: 300px"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" v-on:click="getTasks">查询</el-button>
        </el-form-item>
      </el-form>
    </el-col>

    <!--列表-->
    <el-table :data="tasks" highlight-current-row v-loading="listLoading" @selection-change="selsChange"
              style="width: 100%;">
      <el-table-column label="序号" type="index" >
      </el-table-column>
      <el-table-column prop="id" label="ID"  sortable>
      </el-table-column>
      <el-table-column prop="label" label="名称" width="260">
      </el-table-column>
      <el-table-column prop="ms" label="MileStone" >
      </el-table-column>
      <el-table-column prop="case_count" label="用例数" >
      </el-table-column>
      <el-table-column label="进度" >
        <template slot-scope="scope">
          <el-progress :percentage="scope.row.status"></el-progress>
        </template>
      </el-table-column>
      <el-table-column prop="executor" label="责任人" width="120">
      </el-table-column>
      <el-table-column prop="start_date" label="开始时间"  sortable>
        <template slot-scope="scope">{{ scope.row.start_date | moment }}</template>
      </el-table-column>
      <el-table-column prop="end_date" label="结束时间"  sortable>
        <template slot-scope="scope">{{ scope.row.end_date | moment }}</template>
      </el-table-column>
      <el-table-column label="操作" width="200">
        <template slot-scope="scope">
          <el-button size="small" @click="handleCase(scope.$index, scope.row)">关联用例</el-button>
          <el-button v-if="scope.row.case_count>0" size="small" @click="addRouter(scope.$index, scope.row)">执行测试
          </el-button>
          <el-button v-if="scope.row.case_count==0" size="small" @click="addRouter(scope.$index, scope.row)" disabled>
            执行测试
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!--工具条-->
    <el-col :span="24" class="toolbar">
      <el-pagination layout="prev, pager, next" @current-change="handleCurrentChange" :page-size="10" :total="total"
                     style="float:left;">
      </el-pagination>
    </el-col>


    <el-dialog title="关联用例" :visible.sync="caseFormVisible" :close-on-click-modal="false">
      <el-input
          placeholder="输入关键字进行过滤"
          v-model="filterText" style="padding-top: 10px" size="small">
      </el-input>
      <el-tree
          class="filter-tree"
          style="overflow:auto;height: 99%;background-color: rgb(238, 241, 246)"
          :data="treeData"
          :props="defaultProps"
          :filter-node-method="filterNode"
          ref="tree"
          node-key="id"
          :expand-on-click-node="true"
          :default-checked-keys="checkedKeys"
          draggable
          show-checkbox
      >
        <span slot-scope="{ node,data }">
            <span><i :class="data.icon"></i>{{ node.label }}</span>
        </span>
      </el-tree>
      <div slot="footer" class="dialog-footer">
        <el-button @click.native="caseFormVisible = false">取消</el-button>
        <el-button type="primary" @click.native="caseSubmit" :loading="caseLoading">提交</el-button>
      </div>
    </el-dialog>

  </section>
</template>

<script>
import {getTaskListByUser} from '../api/api';
import axios from "axios";

export default {
  data() {
    return {
      filters: {
        label: '',
        taskStatus:''
      },
      tasks: [],
      total: 0,
      page: 1,

      listLoading: false,
      caseFormVisible: false,
      caseLoading: false,
      caseForm: '',

      options: [],
      taskStatus:[{
        value: 'all',
        label: '所有'
      },{
        value: 'running',
        label: '进行中'
      },{
        value: 'complete',
        label: '已完成'
      }],
      filterText: '',
      treeData: null,
      runParam: {},
      defaultProps: {
        children: 'children',
        label: 'label'
      },
      taskId: 0,
      checkedKeys: []
    }
  },
  methods: {
    handleCurrentChange(val) {
      this.page = val;
      this.getTasks();
    },
    //获取任务列表
    getTasks() {
      let para = {
        page: this.page,
        pageSize: 10,
        label: this.filters.label,
        taskStatus: this.filters.taskStatus
      };
      this.listLoading = true;
      //NProgress.start();
      getTaskListByUser(para).then((res) => {
        let array = res.data.array;
        if (array.length == 0) {
          this.tasks = null;
        } else {
          this.tasks = array;
        }
        this.total = res.data.total;
        this.listLoading = false;
        //NProgress.done();
      }).catch(() => {
        this.listLoading = false;
      });
    },
    selsChange: function (sels) {
      this.sels = sels;
    },
    addRouter(index, row) {
      this.$router.push('/testing/' + row.id)
    },
    handleCase: function (index, row) {
      let vm = this;
      this.caseFormVisible = true;
      this.taskId = row.id;
      axios.get('/api/tree', {params: {taskId: this.taskId}}).then(
          (res) => {
            this.treeData = JSON.parse(JSON.stringify(res.data));
          }
      ).catch(() => {
        vm.$router.push('/login')
      });
      axios.get('/api/tree/taskCaseChecked', {params: {taskId: this.taskId}}).then(
          (res) => {
            this.checkedKeys = JSON.parse(JSON.stringify(res.data));
          }
      ).catch(() => {
        vm.$router.push('/login')
      });

    },
    filterNode(value, data) {
      if (!value) return true
      return data.label.indexOf(value) !== -1
    },
  },
  watch: {
    filterText(val) {
      this.$refs.tree.filter(val)
    }
  },
  mounted() {
    this.getTasks();
  }
}

</script>

<style scoped lang="scss">

.toolbar {
  background: #f2f2f2;
  padding: 10px;
  margin: 10px 0px;
  .el-form {
    .el-form-item {
      margin-bottom: 10px;
    }
  }
}

</style>
