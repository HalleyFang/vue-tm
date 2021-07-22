<template>
  <el-container style="border: 1px solid #eee;">
    <el-aside width="40%" style="background-color: rgb(238, 241, 246)">

      <div style="margin-left: 5px;margin-right: 5px">
        <el-input
            placeholder="输入关键字进行过滤"
            v-model="filterText" style="padding-top: 10px" size="small">
        </el-input>
        <div style="display: flex;justify-content: space-between;margin-top: 5px">
          <div>
            <el-tooltip class="item" effect="dark" content="添加根目录" placement="top">
              <el-button style="margin: 3px 0 3px 0;" size="small" type="primary" icon="el-icon-folder-add"
                         @click="addNode" circle>
              </el-button>
            </el-tooltip>
            <el-tooltip class="item" effect="dark" content="刷新" placement="top" style="margin-left: 10px">
              <el-button style="margin: 3px 0 3px 0;" size="small" type="primary" icon="el-icon-refresh"
                         @click="refreshNode" circle>
              </el-button>
            </el-tooltip>
          </div>
          <el-tooltip class="item" effect="dark" content="导入" placement="top" style="margin-left: 10px">
            <el-upload
                class="upload"
                action="/api/case/importExcel"
                :on-preview="handlePreview"
                :on-remove="handleRemove"
                :before-remove="beforeRemove"
                multiple
                :limit="3"
                :on-exceed="handleExceed"
                :file-list="fileList">
              <el-button size="small" type="primary">Excel用例导入</el-button>
            </el-upload>
          </el-tooltip>
        </div>
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
import TreeItem from './TreeItem.vue'
import axios from "axios";
import Sortable from 'sortablejs'

export default {
  data() {
    return {
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
    addNode() {
      this.treeData.splice(0, 0, {
        value: this.$utilHelper.generateUUID(),
        label: '',
        children: [],
        status: 1,
        isAdd: true
      })
    },
    refreshNode() {
      axios.get('/api/tree').then(
          (res) => {
            this.treeData = JSON.parse(JSON.stringify(res.data));
          }
      ).catch(() => {
        this.$router.push('/login')
      })
    },
    handleNodeClick(nodeData) {
      if (nodeData.status == -1) {
        this.isShowForm = true;
        axios.post("/api/case/query", null, {
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
    renderContent(h, {node, data}) {
      return h(TreeItem, {
        props: {
          value: data,
          treeNode: node
        },
        on: {
          input: (node) => {
            data = node
          },
          Append: () => {
            node.expanded = true
            data.children.push({
              value: this.$utilHelper.generateUUID(),
              label: '',
              children: [],
              status: 1,
              isAdd: true
            })
          },
          AddFile: () => {
            node.expanded = true
            data.children.push({
              value: this.$utilHelper.generateUUID(),
              label: '',
              status: 2,
              isAdd: true
            })
          },
          //删除节点
          Delete: (nodeData) => {
            //递归查找父节点
            var parentNode = this.$utilHelper.clearTable(this.treeData, data.value).parentNode
            this.runParam.parentNode = parentNode
            this.runParam.data = data
            this.runParam.nodeData = nodeData
          },
          //保存节点
          SaveEdit: (nodeData) => {
            //递归查找父节点
            let parentNode = this.$utilHelper.getNode(this.treeData, data.value).parentNode
            let preNode = this.$utilHelper.getNode(this.treeData, data.value).preNode;
            let postNode = this.$utilHelper.getNode(this.treeData, data.value).postNode;
            axios.post('/api/tree/add', {parentNode, preNode, postNode}).then(
                (resp) => {
                  if(resp.data.status == 200){this.$message({
                    message: '新增目录成功',
                    type: 'success'
                  })}
                }
            )
            this.runParam.parentNode = parentNode
            this.runParam.data = data
            this.runParam.nodeData = nodeData
          },
          SaveFile: (nodeData) => {
            //递归查找父节点
            let parentNode = this.$utilHelper.getNode(this.treeData, data.value).parentNode;
            let preNode = this.$utilHelper.getNode(this.treeData, data.value).preNode;
            let postNode = this.$utilHelper.getNode(this.treeData, data.value).postNode;
            axios.post('/api/case/add', {parentNode, preNode, postNode}).then(
                (resp) => {
                  if(resp.data.status == 200){this.$message({
                    message: '新增用例成功',
                    type: 'success'
                  })}
                }
            )
            this.runParam.parentNode = parentNode
            this.runParam.data = data
            this.runParam.nodeData = nodeData
          },
          //撤销修改
          CancelEdit: (nodeData) => {
            //递归查找父节点
            var parentNode = this.$utilHelper.getNode(this.treeData, data.value).parentNode
            if (data.isAdd) {
              parentNode.children.forEach((v, i) => {
                if (v.value == data.value) {
                  parentNode.children.splice(i, 1)
                }
              })
            } else {
              parentNode.children.forEach((v, i) => {
                if (v.value == data.value) {
                  parentNode.children.splice(i, 1, JSON.parse(JSON.stringify(nodeData)))
                }
              })
            }
          }
        }
      })
    },
    CanSaveNext(isNext, nodeId) {
      let parentNode = this.runParam.parentNode
      let nodeData = this.runParam.nodeData
      let data = this.runParam.data
      if (isNext) {
        parentNode.children.forEach((v, i) => {
          if (v.value == data.value) {
            if (this.HOST != "static" && data.isAdd) {
              data.value = nodeId
            }
            data.status = 0
            parentNode.children.splice(i, 1, data)
          }
        })
      } else {
        if (!data.isAdd) {
          parentNode.children.forEach((v, i) => {
            if (v.value == nodeData.value) {
              data.label = nodeData.label
              parentNode.children.splice(i, 1, data)
            }
          })
        }
      }
      this.runParam = {}
    },
    CanDelNext(isNext) {
      let parentNode = this.runParam.parentNode
      // let nodeData = this.runParam.nodeData
      let data = this.runParam.data
      if (isNext) {
        parentNode.children.forEach((v, i) => {
          if (v.value == data.value) {
            parentNode.children.splice(i, 1)
          }
        })
      }
      this.runParam = {}
    },
    reload() {
      this.isRouterAlive = false
      this.$nextTick(function () {
        this.isRouterAlive = true
      })
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
    onDelete: function () {
      axios.post('/api/case/delete', this.form.data.case_id)
          .then((resp) => {
            if (resp.status == 200) {
              this.$message.success("删除成功");
            } else {
              this.$message.error("删除失败");
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
    handleDragStart(node) {
      console.log('drag start', node);
    },
    handleDragEnter(draggingNode, dropNode) {
      console.log('tree drag enter: ', dropNode.label);
    },
    handleDragLeave(draggingNode, dropNode) {
      console.log('tree drag leave: ', dropNode.label);
    },
    handleDragOver(draggingNode, dropNode) {
      console.log('tree drag over: ', dropNode.label);
    },
    handleDragEnd(draggingNode, dropNode, dropType) {
      console.log('tree drag end: ', dropNode && dropNode.label, dropType);
    },
    handleDrop(draggingNode, dropNode, dropType) {
      console.log('tree drop: ', dropNode.label, dropType);
    },
    allowDrop(draggingNode, dropNode, type) {
      if (dropNode.data.label === '二级 3-1') {
        return type !== 'inner';
      } else {
        return true;
      }
    },
    allowDrag(draggingNode) {
      return draggingNode.data.label.indexOf('三级 3-2-2') === -1;
    },
    handleRemove(file, fileList) {
      console.log(file, fileList);
    },
    handlePreview(file) {
      console.log(file);
    },
    handleExceed(files, fileList) {
      this.$message.warning(`当前限制选择 3 个文件，本次选择了 ${files.length} 个文件，共选择了 ${files.length + fileList.length} 个文件`);
    },
    beforeRemove(file) {
      return this.$confirm(`确定移除 ${file.name}？`);
    }
  },
  mounted() {
    this.refreshNode();
    this.rowDrop();
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

<style>

.el-tree-node.is-current > .el-tree-node__content {
  background: #c0ccda !important;
}

.el-icon-caret-right:before {
  color: cornflowerblue;
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
