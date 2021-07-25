<template>
  <section>
    <!--工具条-->
    <el-col :span="24" class="toolbar" style="padding-bottom: 0px;">
      <el-form :inline="true" :model="filters">
        <el-form-item>
          <el-input v-model="filters.name" placeholder="任务ID或任务名称"></el-input>
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
    <el-table :data="users" highlight-current-row v-loading="listLoading" @selection-change="selsChange"
              style="width: 100%;">
      <el-table-column type="selection" width="55">
      </el-table-column>
      <el-table-column type="index" width="60">
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
      <el-table-column label="操作" width="150">
        <template slot-scope="scope">
          <el-button size="small" @click="handleEdit(scope.$index, scope.row)">编辑</el-button>
          <el-button type="danger" size="small" @click="handleDel(scope.$index, scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!--工具条-->
    <el-col :span="24" class="toolbar">
      <el-pagination layout="prev, pager, next" @current-change="handleCurrentChange" :page-size="20" :total="total"
                     style="float:right;">
      </el-pagination>
    </el-col>

    <!--编辑界面-->
    <el-dialog title="编辑" v-model="editFormVisible" :close-on-click-modal="false">
      <el-form :model="editForm" label-width="80px" :rules="editFormRules" ref="editForm">
        <el-form-item label="姓名" prop="name">
          <el-input v-model="editForm.name" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="性别">
          <el-radio-group v-model="editForm.sex">
            <el-radio class="radio" :label="1">男</el-radio>
            <el-radio class="radio" :label="0">女</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="年龄">
          <el-input-number v-model="editForm.age" :min="0" :max="200"></el-input-number>
        </el-form-item>
        <el-form-item label="生日">
          <el-date-picker type="date" placeholder="选择日期" v-model="editForm.birth"></el-date-picker>
        </el-form-item>
        <el-form-item label="地址">
          <el-input type="textarea" v-model="editForm.addr"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click.native="editFormVisible = false">取消</el-button>
        <el-button type="primary" @click.native="editSubmit" :loading="editLoading">提交</el-button>
      </div>
    </el-dialog>

    <!--新增界面-->
    <el-dialog title="新增" :visible.sync="addFormVisible" :close-on-click-modal="false">
      <el-form :model="addForm" label-width="80px" :rules="addFormRules" ref="addForm">
        <el-form-item label="ID" prop="id">
          <el-input v-model="addForm.id" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="名称" prop="label">
          <el-input v-model="addForm.label" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="责任人" prop="executor">
          <el-input v-model="addForm.executor" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="开始时间">
          <el-date-picker type="date"  value-format="yyyy-MM-dd" placeholder="选择日期" v-model="addForm.startTime"></el-date-picker>
        </el-form-item>
        <el-form-item label="结束时间">
          <el-date-picker type="date" value-format="yyyy-MM-dd" placeholder="选择日期" v-model="addForm.endTime"></el-date-picker>
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
import util from '../util/util'
//import NProgress from 'nprogress'
import {getTaskListPage, removeTask, batchRemoveTask, editTask, addTask} from '../api/api';

export default {
  data() {
    return {
      filters: {
        id:'',
        label: ''
      },
      users: [],
      total: 0,
      page: 1,
      listLoading: false,
      sels: [],//列表选中列

      editFormVisible: false,//编辑界面是否显示
      editLoading: false,
      editFormRules: {
        name: [
          {required: true, message: '请输入姓名', trigger: 'blur'}
        ]
      },
      //编辑界面数据
      editForm: {
        id: 0,
        name: '',
        sex: -1,
        age: 0,
        birth: '',
        addr: ''
      },

      addFormVisible: false,//新增界面是否显示
      addLoading: false,
      addFormRules: {
        name: [
          {required: true, message: '请输入姓名', trigger: 'blur'}
        ]
      },
      //新增界面数据
      addForm: {
        id:'',
        label: '',
        executor: '',
        startTime: '',
        endTime:''
      }

    }
  },
  methods: {
    taskStatus: function (row) {
      let showStatus = '';
      switch (row.taskStatus) {
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
        id:this.filters.id,
        label: this.filters.label
      };
      this.listLoading = true;
      //NProgress.start();
      getTaskListPage(para).then((res) => {
        this.total = res.data.size;
        this.users = res.data.users;
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
    //显示编辑界面
    handleEdit: function (index, row) {
      this.editFormVisible = true;
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
            para.birth = (!para.birth || para.birth == '') ? '' : util.formatDate.format(new Date(para.birth), 'yyyy-MM-dd');
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
      var ids = this.sels.map(item => item.id).toString();
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
    }
  },
  mounted() {
    this.getTasks();
  }
}

</script>

<style scoped lang="scss">

/*.toolbar {
  background: #f2f2f2;
  padding: 10px;
  margin: 10px 0px;
.el-form {
  .el-form-item {
    margin-bottom: 10px;
  }
}
}*/

</style>
