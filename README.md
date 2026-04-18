# Build Your Own HTML

<p align="center">
  <strong>可视化 HTML 页面编辑器</strong>
</p>

<p align="center">
  基于 <code>React + Vite + TypeScript + Zustand</code> 构建，面向“拖拽搭页面、编辑 HTML 元素、导出静态页面”的桌面式编辑体验。
</p>

<p align="center">
  一个更接近“画布 + HTML 元素编辑”的前端页面搭建工具。
</p>

---

**Build Your Own HTML** 是一个运行在本地的可视化 HTML 编辑器原型。

它的核心目标很明确：

- 用类 Ribbon 的交互方式组织常用操作
- 用可直接拖拽和缩放的画布编辑页面
- 用更接近真实 HTML 控件的方式管理页面元素
- 最终导出浏览器可直接打开的静态页面 ZIP

如果你想做一个“不是低代码后台，而是偏页面画布编辑”的工具，这个项目就是围绕这个方向构建的。

当前工作目录：

```txt
D:\Claude_Code\MyProjects\build-your-own-html
```

## Highlights

- **Ribbon 式操作区**：顶部以 `文件 / 修改` 分区组织操作，接近桌面编辑器的使用方式。
- **多标签页编辑**：支持创建、切换、重命名、关闭页面标签。
- **可视化画布**：支持元素拖拽、缩放、画布尺寸调整与常用预设。
- **HTML 控件导向**：插入元素围绕真实前端控件组织，而不是抽象图形对象。
- **悬浮工具栏 + 属性面板**：兼顾高频样式编辑和精细属性编辑。
- **静态页面导出**：导出 `index.html + styles.css + project.json` 的 ZIP。
- **百分比布局导出策略**：编辑阶段使用像素，导出阶段转换成百分比布局。

## 当前支持的核心能力

### 页面与标签页

- 支持多标签页并行编辑
- 支持新建标签页
- 支持单击切换标签页
- 支持双击重命名标签页
- 支持关闭标签页并弹出确认框
- 每个标签页拥有独立画布和元素状态

### 顶部 Ribbon

当前顶部菜单保留两个主分区：

- `文件`
- `修改`

其中：

- `文件` 下支持：
  - 新建
  - 导出 HTML
- `修改` 下支持：
  - 选择
  - 复制
  - 删除
  - 插入元素

### 元素插入

插入元素按分类展示，当前分类包括：

- 按钮类
- 文本输入类
- 选择类
- 日期时间类
- 范围数值类
- 其他功能控件

当前已支持的典型元素包括：

- 普通按钮、提交按钮、重置按钮、图片按钮、文件选择
- 单行输入框、密码框、文本域、搜索框、邮箱、数字、电话、网址
- 复选框、单选框、下拉框、多选列表、开关
- 日期、时间、周、月份、本地日期时间
- 滑块、进度条、计量条
- 颜色选择器、隐藏域、标签、字段集

### 画布能力

- 画布支持独立宽高
- 支持手动输入画布尺寸
- 支持常用画布预设
- 支持八方向拖拽调整画布大小
- 支持每个标签页独立画布状态

### 元素编辑

- 元素可直接拖动
- 元素支持边框 / 角点缩放
- 元素不会超出画布范围
- 调整画布大小时，越界元素会自动回到画布内
- 支持复制当前选中元素
- 支持删除当前选中元素
- 支持层级操作：
  - 置于上层
  - 上移一层
  - 下移一层
  - 置于下层

### 快速样式编辑

选中元素后，会显示悬浮工具栏。

当前支持快速调整：

- 字体颜色
- 背景颜色
- 边框颜色
- 字体大小
- 字体
- 层级
- 删除元素

### 属性面板

右侧属性面板负责更细粒度的编辑，当前可编辑信息包括：

- 位置
- 尺寸
- 内容
- 占位符
- 选项
- 其他元素相关属性

## 导出

### 浏览器内导出

点击 `文件 -> 导出 HTML` 后，编辑器会自动生成 ZIP，包含：

- `index.html`
- `styles.css`
- `project.json`

ZIP 文件名默认使用当前页面名称。

### 本地脚本导出

项目也提供了本地脚本方式生成示例导出：

```powershell
npm run export:sample
```

导出文件会生成到：

```txt
exports/
```

### 导出布局策略

编辑器内部当前使用 **像素坐标** 记录元素：

- `left`
- `top`
- `width`
- `height`

导出时，再按当前画布宽高换算成百分比。

这样做的好处是：

- 编辑阶段更直观
- 导出页面可以自适应浏览器视口
- 页面元素按相对比例铺满页面，而不是死板固定在某个像素区域

## 快速开始

运行环境建议：

- Node.js
- npm

### 安装依赖

```powershell
cd D:\Claude_Code\MyProjects\build-your-own-html
npm install
```

### 启动开发环境

```powershell
npm run dev
```

### 构建生产版本

```powershell
npm run build
```

### Windows 下快速启动

```powershell
.\start.bat
```

## Docs By Goal

### 如果你想快速理解这个项目

先读：

- 本 README
- `src/components/RibbonBar.tsx`
- `src/components/CanvasViewport.tsx`
- `src/store/editorStore.ts`
- `src/utils/exportHtml.ts`

### 如果你想改顶部交互

重点看：

- `src/components/RibbonBar.tsx`
- `src/styles/editor.css`

### 如果你想改画布与拖拽行为

重点看：

- `src/components/CanvasViewport.tsx`
- `src/store/editorStore.ts`

### 如果你想改导出结果

重点看：

- `src/utils/exportHtml.ts`
- `scripts/generate-export.mjs`

### 如果你想扩展可插入元素

重点看：

- `src/utils/insertCatalog.ts`
- `src/types/editor.ts`

## 技术栈

- React
- Vite
- TypeScript
- Zustand
- Lucide React
- JSZip

## 项目结构

### 核心组件

- `src/components/RibbonBar.tsx`
  Ribbon、文件/修改菜单、标签页、插入元素浮层

- `src/components/CanvasViewport.tsx`
  画布渲染、元素拖拽、元素缩放、画布尺寸调整、悬浮工具栏

- `src/components/PropertiesPanel.tsx`
  右侧属性面板

### 状态与逻辑

- `src/store/editorStore.ts`
  全局状态、标签页状态、元素增删改、拖拽缩放、层级调整、导出逻辑入口

- `src/utils/insertCatalog.ts`
  插入元素分类与元素定义

- `src/utils/exportHtml.ts`
  浏览器端导出逻辑

- `src/utils/defaultProject.ts`
  默认页面与初始项目结构

### 辅助脚本与样式

- `scripts/generate-export.mjs`
  本地示例导出脚本

- `src/styles/editor.css`
  编辑器主样式

## 当前设计原则

这个项目当前有几个重要设计前提：

- 编辑器内部保留像素坐标模型
- 导出时再做百分比换算
- 交互优先贴近“页面编辑器”，而不是“矢量设计器”
- 插入元素优先围绕真实 HTML 表单和常用页面元素构建

这些前提会直接影响后续功能扩展方式。

## 开发说明

这个仓库已经不是一个刚起步的脚手架，而是一个已经具备较多交互基础的可视化编辑器原型。

