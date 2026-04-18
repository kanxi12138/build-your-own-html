import type { EditorElement, EditorProject } from "../types/editor";

function classNameForElement(element: EditorElement) {
  return `element element--${element.kind} element--${element.id}`;
}

function escapeAttribute(value: string) {
  return value.replace(/"/g, "&quot;");
}

function renderOptions(options: string[]) {
  return options.map((option) => `<option value="${escapeAttribute(option)}">${option}</option>`).join("");
}

function renderElementMarkup(element: EditorElement) {
  const className = classNameForElement(element);
  const options = element.options ?? [];

  switch (element.kind) {
    case "image":
      return `    <img class="${className}" src="${element.imageSrc ?? ""}" alt="${element.content}" />`;
    case "button":
      return `    <button class="${className}" type="button">${element.content}</button>`;
    case "submit":
    case "reset":
    case "file":
    case "text-input":
    case "password":
    case "search":
    case "email":
    case "number":
    case "tel":
    case "url":
    case "date":
    case "time":
    case "week":
    case "month":
    case "datetime-local":
    case "range":
    case "color":
      return `    <input class="${className}" type="${element.inputType}" value="${escapeAttribute(element.value ?? "")}" placeholder="${escapeAttribute(element.placeholder ?? "")}" />`;
    case "image-button":
      return `    <input class="${className}" type="image" src="${element.imageSrc ?? ""}" alt="${element.content}" />`;
    case "textarea":
      return `    <textarea class="${className}" placeholder="${escapeAttribute(element.placeholder ?? "")}">${element.content}</textarea>`;
    case "checkbox":
    case "radio":
      return `    <label class="${className}"><input type="${element.kind}" ${element.checked ? "checked" : ""} /> <span>${element.content}</span></label>`;
    case "switch":
      return `    <label class="${className} switch-export"><input type="checkbox" role="switch" ${element.checked ? "checked" : ""} /><span>${element.content}</span></label>`;
    case "select":
      return `    <select class="${className}">${renderOptions(options)}</select>`;
    case "multi-select":
      return `    <select class="${className}" multiple>${renderOptions(options)}</select>`;
    case "progress":
      return `    <progress class="${className}" value="${element.value ?? "0"}" max="${element.max ?? 100}"></progress>`;
    case "meter":
      return `    <meter class="${className}" value="${element.value ?? "0"}" min="${element.min ?? 0}" max="${element.max ?? 100}"></meter>`;
    case "hidden":
      return `    <input class="${className}" type="hidden" value="${escapeAttribute(element.hiddenValue ?? "")}" />`;
    case "label":
      return `    <label class="${className}">${element.content}</label>`;
    case "fieldset":
      return `    <fieldset class="${className}"><legend>${element.legend ?? "表单分组"}</legend>${element.content ? `<div>${element.content}</div>` : ""}</fieldset>`;
    case "container":
      return `    <div class="${className}">${element.content}</div>`;
    case "text":
    default:
      return `    <div class="${className}">${element.content}</div>`;
  }
}

function renderElementCss(element: EditorElement) {
  return renderElementCssForCanvas(
    {
      width: 1,
      height: 1,
    },
    element,
  );
}

function toPercent(value: number, total: number) {
  if (total <= 0) {
    return "0%";
  }

  return `${((value / total) * 100).toFixed(4)}%`;
}

function renderElementCssForCanvas(
  canvas: { width: number; height: number },
  element: EditorElement,
) {
  const selector = `.element--${element.id}`;

  return `${selector} {
  left: ${toPercent(element.style.left, canvas.width)};
  top: ${toPercent(element.style.top, canvas.height)};
  width: ${toPercent(element.style.width, canvas.width)};
  height: ${toPercent(element.style.height, canvas.height)};
  color: ${element.style.color};
  background: ${element.style.background};
  border: 1px solid ${element.style.borderColor};
  border-radius: ${element.style.borderRadius}px;
  font-size: ${element.style.fontSize}px;
  font-family: ${element.style.fontFamily};
  z-index: ${element.style.zIndex};
}`;
}

export function buildExportFiles(project: EditorProject) {
  const html = `<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${project.name}</title>
    <link rel="stylesheet" href="./styles.css" />
  </head>
  <body>
    <main class="page">
${project.elements.map(renderElementMarkup).join("\n")}
    </main>
  </body>
</html>
`;

  const css = `body {
  width: 100vw;
  min-height: 100vh;
  margin: 0;
  font-family: "Segoe UI", "PingFang SC", "Microsoft YaHei", sans-serif;
  background: linear-gradient(180deg, #dbe5f2 0%, #eef4f9 100%);
  overflow: hidden;
}

html,
body {
  width: 100%;
  height: 100%;
}

.page {
  position: relative;
  width: 100%;
  height: 100%;
  background: ${project.canvas.background};
  overflow: hidden;
}

.element {
  position: absolute;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
}

.element input,
.element textarea,
.element select,
.element progress,
.element meter,
.element button,
.element fieldset {
  width: 100%;
  height: 100%;
  box-sizing: border-box;
}

.switch-export {
  justify-content: flex-start;
  gap: 8px;
}

${project.elements
  .map((element) =>
    renderElementCssForCanvas(
      {
        width: project.canvas.width,
        height: project.canvas.height,
      },
      element,
    ),
  )
  .join("\n\n")}
`;

  return {
    html,
    css,
    json: project,
  };
}
