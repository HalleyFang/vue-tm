<template>
  <span class="span_item">
    <span @click="Expanded">
      <el-input v-if="node.status == 1 || node.status == 2" style="width: 200px;margin: 2px;" placeholder="请输入模块名称"
                v-model="node.label"
                size="mini" maxlength="50">
      </el-input>
      <span v-if="node.status != 1 && node.status != 2"><i :class="node.icon"></i>{{ node.label }}</span>
    </span>
    <span v-if="node.status == 1">
                <el-tooltip class="item" effect="dark" content="保存" placement="top">
      <i style="margin-left: 8px;" class="el-icon-circle-check"
         @click="SaveEdit"></i>
                </el-tooltip>
                <el-tooltip class="item" effect="dark" content="关闭" placement="top">
      <i style="margin-left: 8px;" class="el-icon-circle-close"
         @click="CancelEdit"></i>
                </el-tooltip>
    </span>
    <span v-if="node.status == 2">
                <el-tooltip class="item" effect="dark" content="保存" placement="top">
      <i style="margin-left: 8px;" class="el-icon-circle-check"
         @click="SaveFile"></i>
                </el-tooltip>
                <el-tooltip class="item" effect="dark" content="关闭" placement="top">
      <i style="margin-left: 8px;" class="el-icon-circle-close"
         @click="CancelEdit"></i>
                </el-tooltip>
    </span>
    <span class="span_icon">
      <el-tooltip class="item" effect="dark" content="修改名称" placement="top">
       <i class="el-icon-edit" v-if="node.status == 0" style="margin-left: 8px" @click="OpenEdit"></i>
      </el-tooltip>
     <el-tooltip class="item" effect="dark" content="新增目录" placement="top">
       <i v-if="node.status == 0" style="margin-left: 8px" class="el-icon-folder-add" @click="Append"></i>
     </el-tooltip>
      <el-tooltip class="item" effect="dark" content="新增文件" placement="top">
       <i v-if="node.status == 0" style="margin-left: 8px" class="el-icon-document-add" @click="AddFile"></i>
      </el-tooltip>
       <el-tooltip class="item" effect="dark" content="删除" placement="top">
       <i v-if="node.status == 0&&node.children.length < 1" style="margin-left: 8px" class="el-icon-delete" color="red"
          size="18" @click="Delete"></i>
       </el-tooltip>
    </span>
  </span>
</template>

<script>
export default {
  data() {
    return {
      node: this.value,
      nodeData: JSON.parse(JSON.stringify(this.value))
    }
  },
  props: {
    value: {
      default: function () {
        return {}
      }
    },
    treeNode: {
      default: function () {
        return {}
      }
    }
  },
  methods: {
    OpenEdit() {
      this.node.status = 1
      this.node.isAdd = false
    },
    Append() {
      //添加节点事件
      this.$emit('Append')
    },
    AddFile() {
      //添加节点事件
      this.$emit('AddFile')
    },
    SaveFile() {
      //保存节点事件
      this.$emit('SaveFile', this.nodeData);
      this.node.status = -1
    },
    SaveEdit() {
      //保存节点事件
      this.$emit('SaveEdit', this.nodeData);
      this.node.status = 0
    },
    CancelEdit() {
      this.node.status = 0
      this.$emit('CancelEdit', this.nodeData)
    },
    Delete() {
      this.node.p = 1
      this.$emit('Delete', this.nodeData);
    },
    Expanded() {
      this.treeNode.expanded = this.treeNode.expanded ? false : true
    }
  },
  watch: {
    value: {
      handler: function (val) {
        this.node = val
      },
      deep: true
    },
    node: {
      handler: function (val) {
        this.$emit('input', val)
      },
      deep: true
    }
  }
}
</script>
<style>
.span_item:hover > .span_icon {
  display: inline;
}

.span_icon {
  margin-left: 10px;
  display: none;
}

</style>
