<template>
  <el-container style="border: 1px solid #eee;">
    <el-aside width="40%" style="background-color: rgb(238, 241, 246)">

      <div style="margin-left: 5px;margin-right: 5px">
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
            @node-click="handleNodeClick"
            ref="tree"
            node-key="id"
            :expand-on-click-node="false"
            :render-content="renderContent"
            @node-drag-start="handleDragStart"
            @node-drag-enter="handleDragEnter"
            @node-drag-leave="handleDragLeave"
            @node-drag-over="handleDragOver"
            @node-drag-end="handleDragEnd"
            @node-drop="handleDrop"
            draggable
            :allow-drop="allowDrop"
            :allow-drag="allowDrag">
        </el-tree>
      </div>
    </el-aside>
    <el-container v-show="this.isShowForm">
      <el-header style="text-align: left; font-size: 12px;height: 48px;border-bottom: 1px solid #bbbbbb">
        <div style="padding-top: 10px;height: 99%">
          <el-button type="primary" @click="onSubmit" size="small" :disabled="!this.isModify">保存</el-button>
          <el-popconfirm title="确定删除这条测试用例吗？" @confirm="onDelete" style="margin-left: 10px">
            <el-button type="danger" size="small" slot="reference">删除</el-button>
          </el-popconfirm>
        </div>
      </el-header>
      <el-main style="padding: 1px">
        <el-form ref="form" :model="form" label-width="80px" @submit.prevent="onSubmit" style="margin:2px;width: 99%">
          <el-form-item label="用例编号" style="padding-top: 10px;padding-right: 10px;width: auto">
            <el-input v-model="form.data.case_id" :value="form.data.case_id" :disabled="true"></el-input>
          </el-form-item>
          <el-form-item label="用例标题" style="padding-right: 10px">
            <el-input v-model="form.data.case_name" :value="form.data.case_name"></el-input>
          </el-form-item>
          <el-form-item label="前置条件" style="padding-right: 10px">
            <!--            <textarea class="el-textarea__inner" rows="1" placeholder="请输入内容"></textarea>-->
            <el-input type="textarea" :rows="1" placeholder="请输入内容"
                      v-model="form.data.case_pre" :value="form.data.case_pre"></el-input>
          </el-form-item>
          <el-form-item label="用例步骤" style="padding-right: 10px;" :model="ruleForm" ref="ruleForm">
            <el-table :data="ruleForm.evidenceTemplateList" stripe border style="width: 100%" size="mini">
              <el-table-column type="index" label="序号" min-width="20" align="center"></el-table-column>
              <el-table-column label="操作步骤" min-width="50" align="center">
                <template slot-scope="scope">
                  <el-form-item :prop="'evidenceTemplateList.' + scope.$index + '.step'">
                    <el-input v-model="scope.row.step" size="small" :maxlength="30"></el-input>
                  </el-form-item>
                </template>
              </el-table-column>
              <el-table-column label="预期结果" min-width="50" align="center">
                <template slot-scope="scope">
                  <el-form-item :prop="'evidenceTemplateList.' + scope.$index + '.expect'">
                    <el-input v-model="scope.row.expect" size="small" :maxlength="30"></el-input>
                  </el-form-item>
                </template>
              </el-table-column>
              <el-table-column align="center" label="操作" min-width="20">
                <template slot-scope="scope">
                  <el-button type="text" @click="addTableItem(scope.row,scope.$index)"
                             icon="el-icon-circle-plus-outline"
                             size="small"></el-button>
                  <el-button type="text" @click="delTableItem(scope.row,scope.$index)" icon="el-icon-delete"
                             size="small"></el-button>
                </template>
              </el-table-column>
            </el-table>
          </el-form-item>
          <el-form-item label="备注" style="padding-right: 10px">
            <!--            <textarea class="el-textarea__inner" rows="1" placeholder="请输入内容"></textarea>-->
            <el-input type="textarea" :rows="1" placeholder="请输入内容"
                      v-model="form.data.case_remark" :value="form.data.case_remark"></el-input>
          </el-form-item>
          <!--          <el-form-item>
                      <el-button type="primary" @click="onSubmit">保存</el-button>
                    </el-form-item>-->
        </el-form>
      </el-main>
      <!--      </div>-->
    </el-container>
  </el-container>
</template>

<script>


import axios from "axios";
import Sortable from "sortablejs";

export default {
  data() {
    return {
      taskid:0,
      filterText: '',
      treeData: null,
      runParam: {},
      defaultProps: {
        children: 'children',
        label: 'label'
      },
      form: {
        data: ''
      },
      ruleForm: {
        evidenceTemplateList: []
      },
      removeSealDescriptionIdArray: [],//要删除的table每一行 的SealDescriptionId数组
      modifyCount: 0,
      isModify: false,
      isShowForm: false,
      fileList: []
    }
  },
  methods: {
    filterNode(value, data) {
      if (!value) return true
      return data.label.indexOf(value) !== -1
    },
    handleNodeClick(nodeData) {
      if (nodeData.status == -1 && nodeData.case_id) {
        this.isShowForm = true;
        axios.post("/api/case/queryById", null, {
          params: {
            caseId: nodeData.case_id
          }
        })
            .then((response) => {
              console.log(response);
              this.form.data = JSON.parse(JSON.stringify(response.data));
              this.ruleForm.evidenceTemplateList = eval(this.form.data.case_step);
              console.log(this.ruleForm.evidenceTemplateList);
            });
        if (this.ruleForm.evidenceTemplateList.length == 0) {
          this.addTableItem();
        }
      } else {
        this.isShowForm = false;
      }
      this.modifyCount = 0;
      this.isModify = false;
    },
    onSubmit: function () {
      axios.post('/api/case/update', this.form.data)
          .then((resp) => {
            if (resp.status == 200) {
              this.$message.success("保存成功");
            } else {
              this.$message.error("保存失败");
            }
          });
    },
    addTableItem(row, index) {
      this.ruleForm.evidenceTemplateList.splice(index + 1, 0, {
        step: "",
        expect: ""
      });
    },
    delTableItem(row, index) {
      // 确认删除
      if (this.ruleForm.evidenceTemplateList.length > 1) {
        let arrs = [];
        this.ruleForm.evidenceTemplateList.forEach(
            (rows, ids) => {
              if (ids != index) {
                arrs.push(rows)
              }
            }
        )
        this.ruleForm.evidenceTemplateList = arrs;
      } else {
        this.$message.warning("必须保留一行");
      }
    },
    //行拖拽
    rowDrop() {
      const tbody = document.querySelector('.el-table__body-wrapper tbody')
      const _this = this
      Sortable.create(tbody, {
        onEnd({newIndex, oldIndex}) {
          const currRow = _this.tableData.splice(oldIndex, 1)[0]
          _this.tableData.splice(newIndex, 0, currRow)
        }
      })
    },
    refreshNode() {
      axios.get('/api/tree/taskTreeCase',{params: {
          taskId: this.taskId
        }
      }).then(
          (res) => {
            this.treeData = JSON.parse(JSON.stringify(res.data));
          }
      ).catch(() => {
        this.$router.push('/login')
      })
    },
    getQueryString: function (name) {
      let reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
      let r = window.location.search.substr(1).match(reg);
      if (r != null) return unescape(r[2]);
      return null;
    }
  },
  mounted() {
    this.taskid = this.getQueryString("taskId");
    this.refreshNode();
  }
}

</script>

<style scoped lang="scss">

</style>
