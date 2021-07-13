<template>
  <el-container style="border: 1px solid #eee;">
    <el-aside width="40%" style="background-color: rgb(238, 241, 246)">

      <div style="margin-left: 5px;margin-right: 5px">
        <el-input
          placeholder="输入关键字进行过滤"
          v-model="filterText" style="padding-top: 10px" size="small">
        </el-input>
        <el-button style="margin: 3px 0 3px 0" size="small" type="primary" icon="el-icon-folder-add" @click="addNode">
          添加根目录
        </el-button>
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
    <el-container v-show="this.form.isShow">
      <el-header style="text-align: left; font-size: 12px;height: 48px;border-bottom: 1px solid #bbbbbb">
        <div style="padding-top: 10px;height: 99%">
          <el-button type="primary" @click="onSubmit" size="small">保存</el-button>
          <el-button type="primary" @click="onSubmit" size="small">删除</el-button>
        </div>
      </el-header>
      <el-main style="padding: 1px">
        <el-form ref="form" :model="form" label-width="80px" @submit.prevent="onSubmit" style="margin:2px;width: 99%">
          <el-form-item label="用例编号" style="padding-top: 10px;padding-right: 10px;width: auto">
            <el-input v-model="form.id" :value="form.id" :disabled="true"></el-input>
          </el-form-item>
          <el-form-item label="用例标题" style="padding-right: 10px">
            <el-input v-model="form.name" :value="form.name"></el-input>
          </el-form-item>
          <el-form-item label="前置条件" style="padding-right: 10px">
            <textarea class="el-textarea__inner" rows="1" placeholder="请输入内容"></textarea>
          </el-form-item>
          <el-form-item label="用例步骤" style="padding-right: 10px;" :model="ruleForm" :rules="rules" ref="ruleForm">
            <el-table :data="ruleForm.evidenceTemplateList" stripe border style="width: 100%" size="mini">
              <el-table-column type="index" label="序号" min-width="20" align="center"></el-table-column>
              <el-table-column label="操作步骤" min-width="50" align="center">
                <template slot-scope="scope">
                  <el-form-item :prop="'evidenceTemplateList.' + scope.$index + '.sealName'" :rules='rules.sealName'>
                    <el-input v-model="scope.row.sealName" size="small" :maxlength="30"></el-input>
                  </el-form-item>
                </template>
              </el-table-column>
              <el-table-column label="预期结果" min-width="50" align="center">
                <template slot-scope="scope">
                  <el-form-item :prop="'evidenceTemplateList.' + scope.$index + '.sealValue'" :rules='rules.sealName'>
                    <el-input v-model="scope.row.sealName" size="small" :maxlength="30"></el-input>
                  </el-form-item>
                </template>
              </el-table-column>
              <el-table-column align="center" label="操作" min-width="20">
                <template slot-scope="scope">
                  <el-button type="text" @click="addTableItem(scope.row,scope.$index)" icon="el-icon-circle-plus-outline"
                             size="small"></el-button>
                  <el-button type="text" @click="delTableItem(scope.row,scope.$index)" icon="el-icon-delete"
                             size="small"></el-button>
                </template>
              </el-table-column>
            </el-table>
          </el-form-item>
          <el-form-item label="备注" style="padding-right: 10px">
            <textarea class="el-textarea__inner" rows="1" placeholder="请输入内容"></textarea>
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

    const data = [{
      id: 1,
      label: '一级 1',
      status: 0,
      value: 1,
      children: [{
        id: 4,
        label: '二级 1-1',
        status: 0,
        value: 2,
        children: [{
          id: 9,
          label: '三级 1-1-1',
          status: -1,
          children: [],
          value: 3,
        }, {
          id: 10,
          label: '三级 1-1-2',
          status: -1,
          children: [],
          value: 4,
        }]
      }]
    }, {
      id: 2,
      label: '一级 2',
      status: 0,
      value: 5,
      children: [{
        id: 5,
        label: '二级 2-1',
        status: -1,
        children: [],
        value: 6,
      }, {
        id: 6,
        label: '二级 2-2',
        status: -1,
        children: [],
        value: 7,
      }]
    }, {
      id: 3,
      label: '一级 3',
      status: 0,
      value: 8,
      children: [{
        id: 7,
        label: '二级 3-1',
        status: -1,
        children: [],
        value: 9,
      }, {
        id: 8,
        label: '二级 3-2',
        status: -1,
        children: [],
        value: 10,
      }]
    }];
    let formData = {
      isShow : false,
      id: 'test001',
      name: '123'
    };
    return {
      filterText: '',
      treeData: JSON.parse(JSON.stringify(data)),
      runParam: {},
      defaultProps: {
        children: 'children',
        label: 'label'
      },
      form: JSON.parse(JSON.stringify(formData)),
      ruleForm: {
        evidenceTemplateList: []
      },
      rules: {
        sealName: [
          {required: true, message: '请输入', trigger: 'blur'}
        ]
      },
      removeSealDescriptionIdArray: []//要删除的table每一行 的SealDescriptionId数组
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
        label: '请输入模块名称',
        children: [],
        status: 1,
        isAdd: true
      })
    },
    handleNodeClick(nodeData) {
      if (nodeData.status == -1) {
        this.form.isShow = true;
        axios.get("/api/test1")
          .then((response) => {
            console.log(response);
            this.form.name = response.data;
          });
        if (this.ruleForm.evidenceTemplateList.length == 0) {
          this.addTableItem();
        }
      }else {
        this.form.isShow = false;
      }
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
              label: '请输入模块名称',
              children: [],
              status: 1,
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
            var parentNode = this.$utilHelper.getNode(this.treeData, data.value).parentNode
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
      console.log("submit===========");
    },
    addTableItem(row,index) {
      this.ruleForm.evidenceTemplateList.splice(index+1,0,{
        sealName: "",
        sealValue: ""
      });
    },
    delTableItem(row,index) {
      // 确认删除
      if (this.ruleForm.evidenceTemplateList.length > 1) {
        let arrs = [];
        this.ruleForm.evidenceTemplateList.forEach(
          (rows,ids) => {
            if (ids != index){
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
        onEnd({ newIndex, oldIndex }) {
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
    }
  },
  mounted() {
    this.rowDrop()
  },
  props: {
    value: Array
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
    }
  },
  components: {
  }
}
</script>

<style>

.el-tree-node.is-current > .el-tree-node__content {
  background: #c0ccda !important;
}

</style>
