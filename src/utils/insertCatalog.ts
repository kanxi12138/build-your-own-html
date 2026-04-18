import type { EditorElement, EditorElementKind, InsertCategoryId } from "../types/editor";

export type InsertCategory = {
  id: InsertCategoryId;
  label: string;
  description: string;
};

export type InsertDefinition = {
  kind: EditorElementKind;
  category: InsertCategoryId;
  label: string;
  description: string;
  create: () => Omit<EditorElement, "id">;
};

const baseStyle = {
  left: 72,
  top: 72,
  color: "#21324d",
  background: "#ffffff",
  borderColor: "#adc4ef",
  borderRadius: 12,
  fontSize: 16,
  fontFamily: "\"Segoe UI\", \"PingFang SC\", sans-serif",
  zIndex: 1,
};

function makeElement(
  overrides: Partial<Omit<EditorElement, "id" | "style">> & {
    kind: EditorElementKind;
    category: InsertCategoryId;
    content: string;
    style: Partial<EditorElement["style"]>;
  },
): Omit<EditorElement, "id"> {
  return {
    label: "",
    value: "",
    checked: false,
    options: [],
    min: 0,
    max: 100,
    step: 1,
    ...overrides,
    style: {
      ...baseStyle,
      width: 220,
      height: 48,
      ...overrides.style,
    },
  };
}

export const insertCategories: InsertCategory[] = [
  { id: "buttons", label: "按钮类", description: "点击触发操作" },
  { id: "text-inputs", label: "文本输入类", description: "打字输入内容" },
  { id: "selections", label: "选择类", description: "挑一个或挑多个" },
  { id: "date-time", label: "日期时间类", description: "选择年月日和时间" },
  { id: "range-values", label: "范围数值类", description: "调节或展示数值" },
  { id: "functional", label: "其他功能控件", description: "颜色、隐藏域、分组等" },
];

export const insertDefinitions: InsertDefinition[] = [
  {
    kind: "button",
    category: "buttons",
    label: "普通按钮",
    description: "button",
    create: () =>
      makeElement({
        kind: "button",
        category: "buttons",
        content: "点击我",
        style: { width: 160, height: 48, background: "#d8e7ff" },
      }),
  },
  {
    kind: "submit",
    category: "buttons",
    label: "提交按钮",
    description: "input submit",
    create: () =>
      makeElement({
        kind: "submit",
        category: "buttons",
        content: "提交",
        inputType: "submit",
        value: "提交",
        style: { width: 150, height: 46, background: "#d8f1df" },
      }),
  },
  {
    kind: "reset",
    category: "buttons",
    label: "重置按钮",
    description: "input reset",
    create: () =>
      makeElement({
        kind: "reset",
        category: "buttons",
        content: "重置",
        inputType: "reset",
        value: "重置",
        style: { width: 150, height: 46, background: "#f6ead4" },
      }),
  },
  {
    kind: "image-button",
    category: "buttons",
    label: "图片按钮",
    description: "input image",
    create: () =>
      makeElement({
        kind: "image-button",
        category: "buttons",
        content: "图片按钮",
        imageSrc: "/placeholder.svg",
        inputType: "image",
        style: { width: 180, height: 120, background: "#edf3fb" },
      }),
  },
  {
    kind: "file",
    category: "buttons",
    label: "文件选择按钮",
    description: "input file",
    create: () =>
      makeElement({
        kind: "file",
        category: "buttons",
        content: "选择文件",
        inputType: "file",
        style: { width: 220, height: 44 },
      }),
  },
  {
    kind: "text-input",
    category: "text-inputs",
    label: "单行文本框",
    description: "input text",
    create: () =>
      makeElement({
        kind: "text-input",
        category: "text-inputs",
        content: "",
        placeholder: "请输入文本",
        inputType: "text",
        style: { width: 240, height: 44 },
      }),
  },
  {
    kind: "password",
    category: "text-inputs",
    label: "密码框",
    description: "input password",
    create: () =>
      makeElement({
        kind: "password",
        category: "text-inputs",
        content: "",
        placeholder: "请输入密码",
        inputType: "password",
        style: { width: 240, height: 44 },
      }),
  },
  {
    kind: "textarea",
    category: "text-inputs",
    label: "多行文本域",
    description: "textarea",
    create: () =>
      makeElement({
        kind: "textarea",
        category: "text-inputs",
        content: "这里可以输入大段文字",
        placeholder: "多行输入",
        style: { width: 280, height: 120, borderRadius: 16 },
      }),
  },
  {
    kind: "search",
    category: "text-inputs",
    label: "搜索框",
    description: "input search",
    create: () =>
      makeElement({
        kind: "search",
        category: "text-inputs",
        content: "",
        placeholder: "搜索关键字",
        inputType: "search",
        style: { width: 240, height: 44 },
      }),
  },
  {
    kind: "email",
    category: "text-inputs",
    label: "邮箱输入框",
    description: "input email",
    create: () =>
      makeElement({
        kind: "email",
        category: "text-inputs",
        content: "",
        placeholder: "name@example.com",
        inputType: "email",
        style: { width: 260, height: 44 },
      }),
  },
  {
    kind: "number",
    category: "text-inputs",
    label: "数字输入框",
    description: "input number",
    create: () =>
      makeElement({
        kind: "number",
        category: "text-inputs",
        content: "",
        inputType: "number",
        value: "0",
        min: 0,
        max: 100,
        style: { width: 180, height: 44 },
      }),
  },
  {
    kind: "tel",
    category: "text-inputs",
    label: "电话号码框",
    description: "input tel",
    create: () =>
      makeElement({
        kind: "tel",
        category: "text-inputs",
        content: "",
        placeholder: "13800000000",
        inputType: "tel",
        style: { width: 220, height: 44 },
      }),
  },
  {
    kind: "url",
    category: "text-inputs",
    label: "网址框",
    description: "input url",
    create: () =>
      makeElement({
        kind: "url",
        category: "text-inputs",
        content: "",
        placeholder: "https://example.com",
        inputType: "url",
        style: { width: 280, height: 44 },
      }),
  },
  {
    kind: "checkbox",
    category: "selections",
    label: "复选框",
    description: "input checkbox",
    create: () =>
      makeElement({
        kind: "checkbox",
        category: "selections",
        content: "复选项",
        checked: true,
        style: { width: 180, height: 36, background: "transparent", borderColor: "transparent" },
      }),
  },
  {
    kind: "radio",
    category: "selections",
    label: "单选框",
    description: "input radio",
    create: () =>
      makeElement({
        kind: "radio",
        category: "selections",
        content: "单选项",
        checked: true,
        style: { width: 180, height: 36, background: "transparent", borderColor: "transparent" },
      }),
  },
  {
    kind: "select",
    category: "selections",
    label: "下拉菜单",
    description: "select",
    create: () =>
      makeElement({
        kind: "select",
        category: "selections",
        content: "",
        options: ["选项一", "选项二", "选项三"],
        value: "选项一",
        style: { width: 220, height: 44 },
      }),
  },
  {
    kind: "multi-select",
    category: "selections",
    label: "多选列表框",
    description: "select multiple",
    create: () =>
      makeElement({
        kind: "multi-select",
        category: "selections",
        content: "",
        options: ["北京", "上海", "深圳", "杭州"],
        multiple: true,
        style: { width: 220, height: 110 },
      }),
  },
  {
    kind: "switch",
    category: "selections",
    label: "开关",
    description: "checkbox switch",
    create: () =>
      makeElement({
        kind: "switch",
        category: "selections",
        content: "开关",
        checked: true,
        role: "switch",
        style: { width: 120, height: 36, background: "transparent", borderColor: "transparent" },
      }),
  },
  {
    kind: "date",
    category: "date-time",
    label: "日期选择器",
    description: "input date",
    create: () =>
      makeElement({
        kind: "date",
        category: "date-time",
        content: "",
        inputType: "date",
        value: "2026-04-18",
        style: { width: 210, height: 44 },
      }),
  },
  {
    kind: "time",
    category: "date-time",
    label: "时间选择器",
    description: "input time",
    create: () =>
      makeElement({
        kind: "time",
        category: "date-time",
        content: "",
        inputType: "time",
        value: "09:30",
        style: { width: 180, height: 44 },
      }),
  },
  {
    kind: "week",
    category: "date-time",
    label: "周选择器",
    description: "input week",
    create: () =>
      makeElement({
        kind: "week",
        category: "date-time",
        content: "",
        inputType: "week",
        value: "2026-W16",
        style: { width: 190, height: 44 },
      }),
  },
  {
    kind: "month",
    category: "date-time",
    label: "月份选择器",
    description: "input month",
    create: () =>
      makeElement({
        kind: "month",
        category: "date-time",
        content: "",
        inputType: "month",
        value: "2026-04",
        style: { width: 180, height: 44 },
      }),
  },
  {
    kind: "datetime-local",
    category: "date-time",
    label: "本地日期时间",
    description: "input datetime-local",
    create: () =>
      makeElement({
        kind: "datetime-local",
        category: "date-time",
        content: "",
        inputType: "datetime-local",
        value: "2026-04-18T09:30",
        style: { width: 250, height: 44 },
      }),
  },
  {
    kind: "range",
    category: "range-values",
    label: "滑块",
    description: "input range",
    create: () =>
      makeElement({
        kind: "range",
        category: "range-values",
        content: "",
        inputType: "range",
        value: "45",
        min: 0,
        max: 100,
        style: { width: 240, height: 42, background: "transparent", borderColor: "transparent" },
      }),
  },
  {
    kind: "progress",
    category: "range-values",
    label: "进度条",
    description: "progress",
    create: () =>
      makeElement({
        kind: "progress",
        category: "range-values",
        content: "",
        value: "60",
        max: 100,
        style: { width: 240, height: 26, background: "transparent", borderColor: "transparent" },
      }),
  },
  {
    kind: "meter",
    category: "range-values",
    label: "计量条",
    description: "meter",
    create: () =>
      makeElement({
        kind: "meter",
        category: "range-values",
        content: "",
        value: "80",
        min: 0,
        max: 100,
        style: { width: 240, height: 28, background: "transparent", borderColor: "transparent" },
      }),
  },
  {
    kind: "color",
    category: "functional",
    label: "颜色选择器",
    description: "input color",
    create: () =>
      makeElement({
        kind: "color",
        category: "functional",
        content: "",
        inputType: "color",
        value: "#2f6ecd",
        style: { width: 90, height: 44, background: "transparent", borderColor: "transparent" },
      }),
  },
  {
    kind: "hidden",
    category: "functional",
    label: "隐藏域",
    description: "input hidden",
    create: () =>
      makeElement({
        kind: "hidden",
        category: "functional",
        content: "隐藏域",
        hiddenValue: "hidden-value",
        style: { width: 180, height: 36, background: "#fff7d6", borderColor: "#e8d186" },
      }),
  },
  {
    kind: "label",
    category: "functional",
    label: "标签",
    description: "label",
    create: () =>
      makeElement({
        kind: "label",
        category: "functional",
        content: "字段标签",
        style: { width: 140, height: 32, background: "transparent", borderColor: "transparent" },
      }),
  },
  {
    kind: "fieldset",
    category: "functional",
    label: "字段集边框",
    description: "fieldset",
    create: () =>
      makeElement({
        kind: "fieldset",
        category: "functional",
        content: "",
        legend: "表单分组",
        style: { width: 280, height: 140, background: "#ffffff", borderRadius: 18 },
      }),
  },
];

export function createElementFromKind(kind: EditorElementKind): Omit<EditorElement, "id"> {
  const definition = insertDefinitions.find((item) => item.kind === kind);
  if (!definition) {
    return makeElement({
      kind: "container",
      category: "functional",
      content: "未定义元素",
      style: { width: 220, height: 80 },
    });
  }

  return definition.create();
}
