<template>
  <section>
    <!--工具条-->
    <el-col :span="24" class="toolbar" style="padding-bottom: 0px;">
      <el-form :inline="true" :model="filters" style="float:right;margin-right: 30px">
        <el-form-item>
          <el-input v-model="filters.label" placeholder="任务ID或任务名称" style="width: 300px"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" v-on:click="getTasks">查询</el-button>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleAdd">新增</el-button>
        </el-form-item>
      </el-form>
    </el-col>

    <!--列表-->
    <el-table :data="tasks" highlight-current-row v-loading="listLoading" @selection-change="selsChange"
              style="width: 100%;">
      <!--      <el-table-column type="selection" width="55">
            </el-table-column>-->
      <el-table-column label="序号" type="index" >
      </el-table-column>
      <el-table-column prop="id" label="ID" sortable>
      </el-table-column>
      <el-table-column prop="label" label="名称" width="180">
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
      <el-table-column label="操作" width="350">
        <template slot-scope="scope">
          <el-button size="small" @click="handleCase(scope.$index, scope.row)">关联用例</el-button>
          <el-button v-if="scope.row.case_count>0" size="small" @click="addRouter(scope.$index, scope.row)">执行测试
          </el-button>
          <el-button v-if="scope.row.case_count==0" size="small" @click="addRouter(scope.$index, scope.row)" disabled>
            执行测试
          </el-button>
          <el-button size="small" @click="handleEdit(scope.$index, scope.row)">编辑</el-button>
          <el-button type="danger" size="small" @click="handleDel(scope.$index, scope.row)">删除</el-button>
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

    <!--编辑界面-->
    <el-dialog title="编辑" :visible.sync="editFormVisible" :close-on-click-modal="false">
      <el-form :model="editForm" label-width="80px" ref="editForm">
        <el-form-item label="名称" prop="label">
          <el-input v-model="editForm.label"></el-input>
        </el-form-item>
        <el-form-item label="MileStone" prop="ms">
          <el-select v-model="editForm.ms" placeholder="请选择">
            <el-option
                v-for="item in options"
                :key="item.value"
                :label="item.label"
                :value="item.value">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="责任人" prop="executor">
          <el-select v-model="editForm.executor" placeholder="请选择">
            <el-option
                v-for="item in executors"
                :key="item.value"
                :label="item.label"
                :value="item.value">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="开始时间">
          <el-date-picker type="date" value-format="yyyy-MM-dd" placeholder="选择日期"
                          v-model="editForm.start_date"></el-date-picker>
        </el-form-item>
        <el-form-item label="结束时间">
          <el-date-picker type="date" value-format="yyyy-MM-dd" placeholder="选择日期"
                          v-model="editForm.end_date"></el-date-picker>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click.native="editFormVisible = false">取消</el-button>
        <el-button type="primary" @click.native="editSubmit" :loading="editLoading">提交</el-button>
      </div>
    </el-dialog>

    <!--新增界面-->
    <el-dialog title="新增" :visible.sync="addFormVisible" :close-on-click-modal="false">
      <el-form :model="addForm" label-width="80px" ref="addForm">
        <el-form-item label="名称" prop="label">
          <el-input v-model="addForm.label"></el-input>
        </el-form-item>
        <el-form-item label="责任人" prop="executor">
          <el-select v-model="addForm.executor" placeholder="请选择">
            <el-option
                v-for="item in executors"
                :key="item.value"
                :label="item.label"
                :value="item.value">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="开始时间">
          <el-date-picker type="date" value-format="yyyy-MM-dd" placeholder="选择日期"
                          v-model="addForm.start_date"></el-date-picker>
        </el-form-item>
        <el-form-item label="结束时间">
          <el-date-picker type="date" value-format="yyyy-MM-dd" placeholder="选择日期"
                          v-model="addForm.end_date"></el-date-picker>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click.native="addFormVisible = false">取消</el-button>
        <el-button type="primary" @click.native="addSubmit" :loading="addLoading">提交</el-button>
      </div>
    </el-dialog>
  </section>
</template>

<script>
import {getTaskListPage, removeTask, batchRemoveTask, editTask, addTask, caseTask} from '../api/api';
import axios from "axios";
import moment from "moment/moment";

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

      caseFormVisible: false,
      caseLoading: false,
      caseForm: '',

      editFormVisible: false,//编辑界面是否显示
      editLoading: false,
      //编辑界面数据
      editForm: {
        label: '',
        ms: '',
        executor: '',
        start_date: '',
        end_date: ''
      },

      addFormVisible: false,//新增界面是否显示
      addLoading: false,
      //新增界面数据
      addForm: {
        label: '',
        executor: '',
        start_date: '',
        end_date: ''
      },
      options: [],
      executors: [],
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
        label: this.filters.label
      };
      this.listLoading = true;
      //NProgress.start();
      getTaskListPage(para).then((res) => {
        let array = res.data.array;
        if (array.length == 0) {
          this.tasks = null;
        } else {
          this.tasks = array
        }
        this.total = res.data.total;
        this.listLoading = false;
        //NProgress.done();
      }).catch(() => {
        this.listLoading = false;
      });
    },
    //删除
    handleDel: function (index, row) {
      this.$confirm('确认删除该记录吗?', '提示', {
        type: 'warning'
      }).then(() => {
        this.listLoading = true;
        //NProgress.start();
        let para = {id: row.id};
        removeTask(para).then(() => {
          this.listLoading = false;
          //NProgress.done();
          this.$message({
            message: '删除成功',
            type: 'success'
          });
          this.getTasks();
        });
      }).catch(() => {

      });
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
    //编辑
    caseSubmit: function () {
      this.$confirm('确认提交吗？', '提示', {}).then(() => {
        this.caseLoading = true;
        let para = this.$refs.tree.getCheckedKeys();
        let conf = {taskId: this.taskId};
        //NProgress.start();
        caseTask(para, conf).then(() => {
          this.caseLoading = false;
          //NProgress.done();
          this.$message({
            message: '提交成功',
            type: 'success'
          });
          this.caseFormVisible = false;
          this.getTasks();
        });
      });
    },
    filterNode(value, data) {
      if (!value) return true
      return data.label.indexOf(value) !== -1
    },
    //显示编辑界面
    handleEdit: function (index, row) {
      this.editFormVisible = true;
      row.start_date = moment(row.start_date).format("YYYY-MM-DD");
      row.end_date = moment(row.end_date).format("YYYY-MM-DD");
      this.editForm = Object.assign({}, row);
    },
    //显示新增界面
    handleAdd: function () {
      this.addFormVisible = true;
    },
    //编辑
    editSubmit: function () {
      this.$refs.editForm.validate((valid) => {
        if (valid) {
          this.$confirm('确认提交吗？', '提示', {}).then(() => {
            this.editLoading = true;
            //NProgress.start();
            let para = Object.assign({}, this.editForm);
            editTask(para).then(() => {
              this.editLoading = false;
              //NProgress.done();
              this.$message({
                message: '提交成功',
                type: 'success'
              });
              this.$refs['editForm'].resetFields();
              this.editFormVisible = false;
              this.getTasks();
            });
          });
        }
      });
    },
    //新增
    addSubmit: function () {
      this.$refs.addForm.validate((valid) => {
        if (valid) {
          this.$confirm('确认提交吗？', '提示', {}).then(() => {
            this.addLoading = true;
            //NProgress.start();
            let para = Object.assign({}, this.addForm);
            addTask(para).then(() => {
              this.addLoading = false;
              //NProgress.done();
              this.$message({
                message: '提交成功',
                type: 'success'
              });
              this.$refs['addForm'].resetFields();
              this.addFormVisible = false;
              this.getTasks();
            });
          });
        }
      });
    },
    selsChange: function (sels) {
      this.sels = sels;
    },
    //批量删除
    batchRemove: function () {
      var ids = this.sels.map(item => item.id);
      this.$confirm('确认删除选中记录吗？', '提示', {
        type: 'warning'
      }).then(() => {
        this.listLoading = true;
        //NProgress.start();
        let para = {ids: ids};
        batchRemoveTask(para).then(() => {
          this.listLoading = false;
          //NProgress.done();
          this.$message({
            message: '删除成功',
            type: 'success'
          });
          this.getTasks();
        });
      }).catch(() => {

      });
    },
    addRouter(index, row) {
      this.$router.push('/testing/' + row.id)
    },
    getUsers() {
      axios.get('/api/users').then(
          (resp) => {
            if (resp.status == 200) {
              // console.log("users" + resp.data)
              this.executors = JSON.parse(JSON.stringify(resp.data));
            }
          }
      )
    }
  },
  watch: {
    filterText(val) {
      this.$refs.tree.filter(val)
    }
  },
  mounted() {
    this.getTasks();
    this.getUsers();
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

<style lang="scss">
.el-tree .el-tree-node__expand-icon.expanded {
  -webkit-transform: rotate(0deg);
  transform: rotate(0deg);
}

.el-tree .el-icon-caret-right:before {
  content: "\e723";
}

.el-tree .el-tree-node__expand-icon.expanded.el-icon-caret-right:before {
  content: "\e722";
}

.el-tree .is-leaf.el-tree-node__expand-icon.el-icon-caret-right:before {
  display: none;
}
</style>
