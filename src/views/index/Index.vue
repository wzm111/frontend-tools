<script setup>
import { ref } from 'vue'
import MonacoEditor from 'monaco-editor-vue3'
const jsonOptions = {
  theme: 'vs-dark',
  language: 'json',
  automaticLayout: true
}
const jsonValue = ref('')

const tsOptions = {
  theme: 'vs-dark',
  language: 'typescript',
  automaticLayout: true
}
const tsValue = ref('')
const defaultTabSize = ref(4)
const defaultInterfaceName = ref('Idefault')
function getTypeDefine() {
  const originObj = JSON.parse(jsonValue.value)
  const typeObj = {}
  assignType(originObj, typeObj)
  tsValue.value = `interface ${defaultInterfaceName.value} {
${getTypeString(typeObj)}
}`
}

function assignType(originObj, typeObj) {
  Object.keys(originObj).forEach((key) => {
    const type = Object.prototype.toString.call(originObj[key]).slice(8, -1)
    if (type === 'Array') {
      // 是数组的话，默认第一项的类型是数组的所有类型(不考虑联合类型)
      typeObj[key] = [{}]
      // 数组子项类型
      const arrInnerType = Object.prototype.toString
        .call(originObj[key][0])
        .slice(8, -1)
      // 只有数组和对象走递归
      const loopMap = new Set(['Array', 'Object'])
      if (loopMap.has(arrInnerType)) {
        assignType(originObj[key][0], typeObj[key][0])
      } else {
        typeObj[key] = [arrInnerType.toLowerCase()]
      }
    } else if (type === 'Object') {
      // 是对象的话，需要获得这个对象内部的所有键的类型
      typeObj[key] = {}
      assignType(originObj[key], typeObj[key])
    } else {
      // 基本类型直接赋值
      typeObj[key] = type.toLowerCase()
    }
  })
}

//  定义递归获取 TypeScript 接口字符串的函数 默认缩进级数deep为1
function getTypeString(typeObj, deep = 1) {
  const typeList = []
  Object.keys(typeObj).forEach((key) => {
    // 获取属性值的类型
    const type = Object.prototype.toString.call(typeObj[key]).slice(8, -1)
    if (type === 'Array') {
      // 为数组的话，把整个数组传进去(数组长度为1)，同时不需要增加缩进层数
      const type = getTypeString(typeObj[key], deep)
      typeList.push(`${generateTab(deep)}${key}: ${type}[]`)
    } else if (type === 'Object') {
      // 如果是对象，递归获取子项类型，并加到类型列表中
      const type = getTypeString(typeObj[key], deep + 1)
      // 添加补全缩进和大括号的字符串到类型列表中
      typeList.push(`${omitNumber(key, deep)}{\n${type}\n${generateTab(deep)}}`)
    } else {
      // 如果是其他基本类型，添加键值对字符串到类型列表中
      typeList.push(`${omitNumber(key, deep)}${typeObj[key]}`)
    }
  })
  return typeList.join(';\n')
}

function omitNumber(key, deep) {
  // key可以转成数字说明是数组的下标，数组的下标不展示，也不补充缩进
  // 如果不能转成数字，说明是对象的键值，此时显示键值并补充缩进
  return Number.isNaN(Number(key)) ? `${generateTab(deep)}${key}: ` : ''
}

function generateTab(deep) {
  const spaceArr = new Array(deep * defaultTabSize.value).fill(' ')
  return spaceArr.join('')
}
</script>

<template>
  <div class="json-trans-ts">
    <MonacoEditor
      ref="monaco"
      :options="jsonOptions"
      v-model:value="jsonValue"
      :width="700"
      :height="800"
    />
    <div class="op-bar">
      <div class="item-view">
        <div class="title">默认缩进:</div>
        <input v-model="defaultTabSize" type="text" />
      </div>
      <div class="item-view">
        <div class="title">接口名:</div>
        <input v-model="defaultInterfaceName" type="text" />
      </div>

      <div class="item-view">
        <button @click="getTypeDefine">转换</button>
      </div>
    </div>
    <MonacoEditor
      ref="monaco"
      :options="tsOptions"
      v-model:value="tsValue"
      :width="700"
      :height="800"
    />
  </div>
</template>

<style scoped lang="less">
.json-trans-ts {
  background-color: #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  .item-view {
    margin-bottom: 10px;
    .title {
      color:#333;
      font-size: 12px;
    }
  }
}
</style>
