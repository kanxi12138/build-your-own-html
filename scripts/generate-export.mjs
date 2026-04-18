import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import JSZip from "jszip";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");
const projectJsonPath = path.join(rootDir, "projects", "sample-project.json");
const exportsDir = path.join(rootDir, "exports");

function sanitizeFilename(name) {
  return name.trim().replace(/[<>:"/\\|?*\u0000-\u001F]/g, "_") || "page";
}

function renderMarkup(element) {
  if (element.kind === "image") {
    return `    <img class="element element--${element.kind} element--${element.id}" src="${element.imageSrc}" alt="${element.content}" />`;
  }

  if (element.kind === "button") {
    return `    <button class="element element--${element.kind} element--${element.id}" type="button">${element.content}</button>`;
  }

  return `    <div class="element element--${element.kind} element--${element.id}">${element.content}</div>`;
}

function renderCss(element) {
  return renderCssForCanvas(
    {
      width: 1,
      height: 1,
    },
    element,
  );
}

function toPercent(value, total) {
  if (total <= 0) {
    return "0%";
  }

  return `${((value / total) * 100).toFixed(4)}%`;
}

function renderCssForCanvas(canvas, element) {
  return `.element--${element.id} {
  left: ${toPercent(element.style.left, canvas.width)};
  top: ${toPercent(element.style.top, canvas.height)};
  width: ${toPercent(element.style.width, canvas.width)};
  height: ${toPercent(element.style.height, canvas.height)};
  color: ${element.style.color};
  background: ${element.style.background};
  border: 1px solid ${element.style.borderColor};
  border-radius: ${element.style.borderRadius}px;
  font-size: ${element.style.fontSize}px;
  z-index: ${element.style.zIndex};
}`;
}

const project = JSON.parse(await readFile(projectJsonPath, "utf8"));

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
${project.elements.map(renderMarkup).join("\n")}
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

.element--text {
  justify-content: flex-start;
  border: 0;
}

.element--button {
  cursor: pointer;
}

.element--image {
  object-fit: cover;
  padding: 0;
}

${project.elements
  .map((element) =>
    renderCssForCanvas(
      {
        width: project.canvas.width,
        height: project.canvas.height,
      },
      element,
    ),
  )
  .join("\n\n")}
`;

const zip = new JSZip();
zip.file("index.html", html);
zip.file("styles.css", css);
zip.file("project.json", JSON.stringify(project, null, 2));

await mkdir(exportsDir, { recursive: true });
const zipBuffer = await zip.generateAsync({ type: "nodebuffer" });
const zipPath = path.join(exportsDir, `${sanitizeFilename(project.name)}.zip`);
await writeFile(zipPath, zipBuffer);

console.log(`Exported sample project to ${zipPath}`);
