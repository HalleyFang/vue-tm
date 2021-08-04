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
            :expand-on-click-node="true"
            draggable>
          <span class="custom-tree-node" slot-scope="{ node,data }">
            <span v-if="data.result==0 || !data.result"><i :class="data.icon"></i>{{ node.label }}</span>
            <span v-if="data.result==1" style="background: greenyellow"><i :class="data.icon"></i>{{
                node.label
              }}</span>
            <span v-if="data.result==2" style="background: #F08080"><i :class="data.icon"></i>{{ node.label }}</span>
            <span v-if="data.result==3" style="background: orange"><i :class="data.icon"></i>{{ node.label }}</span>
            <span v-if="data.result==4" style="background: #9370D8"><i :class="data.icon"></i>{{ node.label }}</span>
          </span>
        </el-tree>
      </div>
    </el-aside>
    <el-container v-show="this.isShowForm">
      <el-header style="text-align: left; font-size: 12px;height: 48px;border-bottom: 1px solid #bbbbbb">
        <div style="padding-top: 10px;height: 99%">
          <el-button type="primary" @click="onSubmit" size="small" :disabled="!this.isModify">保存</el-button>
        </div>
      </el-header>
      <el-main style="padding: 1px">
        <el-form ref="form" :model="form" label-width="80px" @submit.prevent="onSubmit" style="margin:2px;width: 99%">
          <el-form :inline="true" style="margin:2px;text-align: left;padding-left: 12px">
            <el-form-item label="用例编号" style="padding-top: 10px;padding-right: 10px;width: auto">
              <el-input v-model="form.data.case_id" :value="form.data.case_id" :disabled="true"></el-input>
            </el-form-item>
            <el-form-item label="作者" style="padding-top: 10px;padding-right: 10px;width: auto">
              <el-input v-model="form.data.create_user" :value="form.data.create_user" :disabled="true"></el-input>
            </el-form-item>
          </el-form>
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
            <el-input type="textarea" :rows="1" placeholder="请输入内容"
                      v-model="form.data.remark" :value="form.data.remark"></el-input>
          </el-form-item>
          <el-form :inline="true" style="margin:2px;text-align: left;padding-left: 12px">
            <el-form-item label="更新时间" style="padding-top: 10px;padding-right: 10px;width: auto">
              <el-date-picker v-model="form.data.update_date" :value="form.data.update_date" type="datetime"
                              format="yyyy-MM-dd HH:mm:ss" value-format="yyyy-MM-dd HH:mm:ss"
                              :disabled="true"></el-date-picker>
            </el-form-item>
            <el-form-item label="更新人" style="padding-top: 10px;padding-right: 10px;width: auto">
              <el-input v-model="form.data.update_user" :value="form.data.update_user" :disabled="true"></el-input>
            </el-form-item>
          </el-form>
        </el-form>
        <el-form :inline="true" :model="resultForm">
          <el-form-item>
            <i v-if="resultForm.status==0||!resultForm.status" class="el-icon-bell"></i>
            <i v-if="resultForm.status==1" class="el-icon-success" style="color: green"></i>
            <i v-if="resultForm.status==2" class="el-icon-error" style="color: red"></i>
            <i v-if="resultForm.status==3" class="el-icon-warning" style="color: orange"></i>
            <i v-if="resultForm.status==4" class="el-icon-s-help" style="color: blueviolet"></i>
          </el-form-item>
          <el-form-item>
            <el-select label="执行结果" v-model="resultForm.status" placeholder="执行结果" size="small" style="width: 100px">
              <el-option
                  v-for="item in options"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value">
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="onSubmitResult" size="small">提交</el-button>
          </el-form-item>
        </el-form>

      </el-main>
    </el-container>
  </el-container>
</template>

<script>


import axios from "axios";
import Sortable from "sortablejs";

export default {
  data() {
    return {
      taskId: 0,
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
      fileList: [],
      resultForm: {
        status: ''
      },
      options: [{
        value: 0,
        label: '未执行'
      }, {
        value: 1,
        label: '成功'
      }, {
        value: 2,
        label: '失败'
      }, {
        value: 3,
        label: '跳过'
      }, {
        value: 4,
        label: '阻塞'
      }, {
        value: 5,
        label: '执行中'
      }],
      caseId: ''
    }
  },
  methods: {
    getId() {
      this.taskId = this.$route.params && this.$route.params.id
    },
    filterNode(value, data) {
      if (!value) return true
      return data.label.indexOf(value) !== -1
    },
    handleNodeClick(nodeData) {
      if (nodeData.status == -1 && nodeData.case_id) {
        this.isShowForm = true;
        this.caseId = nodeData.case_id;
        axios.post("/api/case/queryById", null, {
          params: {
            caseId: nodeData.case_id
          }
        })
            .then((response) => {
              // console.log(response);
              this.form.data = JSON.parse(JSON.stringify(response.data));
              this.ruleForm.evidenceTemplateList = eval(this.form.data.case_step);
              // console.log(this.ruleForm.evidenceTemplateList);
            });
        axios.get("/api/taskCase/queryStatus", {
          params: {
            caseId: nodeData.case_id,
            taskId: this.taskId
          }
        }).then(
            (resp) => {
              if (resp.status == 200) {
                this.resultForm.status = resp.data.case_status;
              }
            }
        )
        if (this.ruleForm.evidenceTemplateList.length == 0) {
          this.addTableItem();
        }
      } else {
        this.isShowForm = false;
      }
      this.modifyCount = 0;
      this.isModify = false;
    },
    onSubmitResult() {
      axios.post('/api/taskCase/update', {
        params: {
          result: this.resultForm,
          caseId: this.caseId,
          taskId: this.taskId
        }
      })
          .then((resp) => {
            if (resp.status == 200) {
              this.$message.success("保存成功");
            } else {
              this.$message.error("保存失败");
            }
          });
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
      let vm = this;
      axios.get('/api/tree/taskTreeCase', {
        params: {
          taskId: this.taskId
        }
      }).then(
          (res) => {
            this.treeData = JSON.parse(JSON.stringify(res.data));
          }
      ).catch(() => {
        vm.$router.push('/login')
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
    this.getId();
    // this.taskId = this.getQueryString("taskId");
    this.refreshNode();
  },
  watch: {
    filterText(val) {
      this.$refs.tree.filter(val)
    },
    value: {
      handler: function (val) {
        this.treeData = val
      },
      deep: true
    },
    treeData: {
      handler: function (val) {
        this.$emit('input', val)
      },
      deep: true
    },
    label: {
      handler: function (val) {
        if (!val) return ''
        if (val.length > 30) {
          return val.slice(0, 30) + '...'
        }
        return val
      }
    },
    form: {
      handler(val) {
        if (this.isShowForm) {
          if (val) {
            this.modifyCount++;
          }
          if (this.modifyCount > 1) {
            this.isModify = true;
          }
        }
        console.log("count" + this.modifyCount)
      },
      deep: true
    }
  },
  components: {}
}

</script>

<style scoped lang="scss">
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
