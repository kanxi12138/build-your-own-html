import { useEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties, PointerEvent as ReactPointerEvent } from "react";
import { ChevronDown, Trash2 } from "lucide-react";
import { useEditorStore } from "../store/editorStore";
import type { EditorElement } from "../types/editor";

const canvasPresets = [
  { label: "桌面 1280 × 820", width: 1280, height: 820 },
  { label: "宽屏 1440 × 900", width: 1440, height: 900 },
  { label: "笔记本 1366 × 768", width: 1366, height: 768 },
  { label: "平板 1024 × 768", width: 1024, height: 768 },
  { label: "手机 390 × 844", width: 390, height: 844 },
];

const fontFamilies = [
  { label: "默认无衬线", value: "\"Segoe UI\", \"PingFang SC\", sans-serif" },
  { label: "微软雅黑", value: "\"Microsoft YaHei\", sans-serif" },
  { label: "苹方", value: "\"PingFang SC\", sans-serif" },
  { label: "乔治亚", value: "Georgia, serif" },
  { label: "等宽字体", value: "Consolas, monospace" },
];

type ResizeHandle =
  | "top"
  | "right"
  | "bottom"
  | "left"
  | "top-left"
  | "top-right"
  | "bottom-left"
  | "bottom-right";

const resizeHandles: ResizeHandle[] = [
  "top",
  "left",
  "right",
  "bottom",
  "top-left",
  "top-right",
  "bottom-left",
  "bottom-right",
];

function renderElementContent(element: EditorElement) {
  const options = element.options ?? [];

  switch (element.kind) {
    case "image":
      return <img src={element.imageSrc} alt={element.content} draggable={false} />;
    case "button":
      return <button type="button">{element.content}</button>;
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
      return (
        <input
          type={element.inputType}
          value={element.inputType === "file" ? undefined : element.value}
          placeholder={element.placeholder}
          min={element.min}
          max={element.max}
          step={element.step}
          onChange={() => undefined}
        />
      );
    case "image-button":
      return <img src={element.imageSrc} alt={element.content} draggable={false} />;
    case "textarea":
      return <textarea value={element.content} placeholder={element.placeholder} readOnly />;
    case "checkbox":
    case "radio":
      return (
        <label className="control-inline">
          <input type={element.kind} checked={element.checked} readOnly />
          <span>{element.content}</span>
        </label>
      );
    case "switch":
      return (
        <label className="switch-control">
          <input type="checkbox" checked={element.checked} readOnly />
          <span className="switch-control__track" />
          <em>{element.content}</em>
        </label>
      );
    case "select":
      return (
        <select value={element.value} onChange={() => undefined}>
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      );
    case "multi-select":
      return (
        <select multiple value={options.slice(0, 2)} onChange={() => undefined}>
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      );
    case "progress":
      return <progress value={Number(element.value ?? 0)} max={element.max ?? 100} />;
    case "meter":
      return (
        <meter
          value={Number(element.value ?? 0)}
          min={element.min ?? 0}
          max={element.max ?? 100}
        />
      );
    case "hidden":
      return <span className="hidden-chip">hidden: {element.hiddenValue}</span>;
    case "label":
      return <label>{element.content}</label>;
    case "fieldset":
      return (
        <fieldset>
          <legend>{element.legend ?? "表单分组"}</legend>
          <div className="fieldset-preview">{element.content || "字段内容区域"}</div>
        </fieldset>
      );
    case "container":
      return <span>{element.content || "容器"}</span>;
    case "text":
    default:
      return <span>{element.content}</span>;
  }
}

export function CanvasViewport() {
  const activeTab = useEditorStore((state) =>
    state.tabs.find((tab) => tab.id === state.activeTabId),
  );
  const selectElement = useEditorStore((state) => state.selectElement);
  const moveElement = useEditorStore((state) => state.moveElement);
  const resizeElement = useEditorStore((state) => state.resizeElement);
  const setCanvasSize = useEditorStore((state) => state.setCanvasSize);
  const updateElement = useEditorStore((state) => state.updateElement);
  const removeSelected = useEditorStore((state) => state.removeSelected);
  const bringToFront = useEditorStore((state) => state.bringToFront);
  const sendToBack = useEditorStore((state) => state.sendToBack);
  const bringForward = useEditorStore((state) => state.bringForward);
  const sendBackward = useEditorStore((state) => state.sendBackward);
  const canvasRef = useRef<HTMLDivElement | null>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  const [isSizeMenuOpen, setIsSizeMenuOpen] = useState(false);
  const [customWidth, setCustomWidth] = useState("");
  const [customHeight, setCustomHeight] = useState("");
  const [activeResizeHandle, setActiveResizeHandle] = useState<ResizeHandle | null>(null);

  const canvasStyle = useMemo<CSSProperties>(
    () => ({
      width: activeTab?.project.canvas.width ?? 0,
      height: activeTab?.project.canvas.height ?? 0,
      background: activeTab?.project.canvas.background ?? "#ffffff",
    }),
    [activeTab],
  );

  const selectedElement =
    activeTab?.project.elements.find((element) => element.id === activeTab.selectedElementId) ??
    null;

  const floatingToolbarStyle = useMemo<CSSProperties | null>(() => {
    if (!selectedElement || !activeTab) {
      return null;
    }

    const toolbarWidth = 220;
    const preferredLeft = selectedElement.style.left + selectedElement.style.width + 16;
    const left = Math.min(
      Math.max(12, preferredLeft),
      Math.max(12, activeTab.project.canvas.width - toolbarWidth - 12),
    );
    const top = Math.min(
      Math.max(12, selectedElement.style.top),
      Math.max(12, activeTab.project.canvas.height - 320),
    );

    return { left, top, width: toolbarWidth };
  }, [activeTab, selectedElement]);

  useEffect(() => {
    if (!activeTab) {
      return;
    }

    setCustomWidth(String(activeTab.project.canvas.width));
    setCustomHeight(String(activeTab.project.canvas.height));
  }, [activeTab]);

  useEffect(() => {
    if (!isSizeMenuOpen) {
      return;
    }

    const handlePointerDown = (event: PointerEvent) => {
      if (!dropdownRef.current?.contains(event.target as Node)) {
        setIsSizeMenuOpen(false);
      }
    };

    window.addEventListener("pointerdown", handlePointerDown);
    return () => window.removeEventListener("pointerdown", handlePointerDown);
  }, [isSizeMenuOpen]);

  if (!activeTab) {
    return null;
  }

  const beginDrag = (event: ReactPointerEvent<HTMLDivElement>, element: EditorElement) => {
    event.stopPropagation();
    selectElement(element.id);

    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) {
      return;
    }

    const offsetX = event.clientX - rect.left - element.style.left;
    const offsetY = event.clientY - rect.top - element.style.top;

    const handleMove = (moveEvent: PointerEvent) => {
      moveElement(element.id, {
        left: moveEvent.clientX - rect.left - offsetX,
        top: moveEvent.clientY - rect.top - offsetY,
      });
    };

    const handleUp = () => {
      window.removeEventListener("pointermove", handleMove);
      window.removeEventListener("pointerup", handleUp);
    };

    window.addEventListener("pointermove", handleMove);
    window.addEventListener("pointerup", handleUp);
  };

  const beginCanvasResize = (event: ReactPointerEvent<HTMLDivElement>, handle: ResizeHandle) => {
    event.stopPropagation();
    event.preventDefault();

    const startWidth = activeTab.project.canvas.width;
    const startHeight = activeTab.project.canvas.height;
    const startX = event.clientX;
    const startY = event.clientY;

    setActiveResizeHandle(handle);

    const handleMove = (moveEvent: PointerEvent) => {
      const deltaX = moveEvent.clientX - startX;
      const deltaY = moveEvent.clientY - startY;
      const affectsLeft = handle === "left" || handle === "top-left" || handle === "bottom-left";
      const affectsRight =
        handle === "right" || handle === "top-right" || handle === "bottom-right";
      const affectsTop = handle === "top" || handle === "top-left" || handle === "top-right";
      const affectsBottom =
        handle === "bottom" || handle === "bottom-left" || handle === "bottom-right";

      const nextWidth =
        affectsRight ? startWidth + deltaX : affectsLeft ? startWidth - deltaX : startWidth;
      const nextHeight =
        affectsBottom ? startHeight + deltaY : affectsTop ? startHeight - deltaY : startHeight;

      setCanvasSize({ width: nextWidth, height: nextHeight });
    };

    const handleUp = () => {
      setActiveResizeHandle(null);
      window.removeEventListener("pointermove", handleMove);
      window.removeEventListener("pointerup", handleUp);
    };

    window.addEventListener("pointermove", handleMove);
    window.addEventListener("pointerup", handleUp);
  };

  const beginElementResize = (
    event: ReactPointerEvent<HTMLDivElement>,
    element: EditorElement,
    handle: ResizeHandle,
  ) => {
    event.stopPropagation();
    event.preventDefault();
    selectElement(element.id);

    const startX = event.clientX;
    const startY = event.clientY;
    const startLeft = element.style.left;
    const startTop = element.style.top;
    const startWidth = element.style.width;
    const startHeight = element.style.height;

    const handleMove = (moveEvent: PointerEvent) => {
      const deltaX = moveEvent.clientX - startX;
      const deltaY = moveEvent.clientY - startY;
      const affectsLeft = handle === "left" || handle === "top-left" || handle === "bottom-left";
      const affectsRight =
        handle === "right" || handle === "top-right" || handle === "bottom-right";
      const affectsTop = handle === "top" || handle === "top-left" || handle === "top-right";
      const affectsBottom =
        handle === "bottom" || handle === "bottom-left" || handle === "bottom-right";

      const nextWidth =
        affectsRight ? startWidth + deltaX : affectsLeft ? startWidth - deltaX : startWidth;
      const nextHeight =
        affectsBottom ? startHeight + deltaY : affectsTop ? startHeight - deltaY : startHeight;
      const nextLeft = affectsLeft ? startLeft + deltaX : startLeft;
      const nextTop = affectsTop ? startTop + deltaY : startTop;

      resizeElement(element.id, {
        left: nextLeft,
        top: nextTop,
        width: nextWidth,
        height: nextHeight,
      });
    };

    const handleUp = () => {
      window.removeEventListener("pointermove", handleMove);
      window.removeEventListener("pointerup", handleUp);
    };

    window.addEventListener("pointermove", handleMove);
    window.addEventListener("pointerup", handleUp);
  };

  const applyCustomSize = () => {
    const width = Number(customWidth);
    const height = Number(customHeight);

    if (Number.isFinite(width) && Number.isFinite(height)) {
      setCanvasSize({ width, height });
      setIsSizeMenuOpen(false);
    }
  };

  return (
    <section className="workspace">
      <div className="workspace__topbar">
        <div>
          <strong>预览画布</strong>
          <span> 直接拖动页面元素，像画图工具一样调整布局</span>
        </div>
        <div ref={dropdownRef} className="workspace__meta workspace__meta--menu">
          <button
            type="button"
            className={`workspace__size-button${isSizeMenuOpen ? " workspace__size-button--active" : ""}`}
            onClick={() => setIsSizeMenuOpen((value) => !value)}
          >
            <span>{activeTab.project.canvas.width}px</span>
            <span>{activeTab.project.canvas.height}px</span>
            <ChevronDown size={14} />
          </button>

          {isSizeMenuOpen ? (
            <div className="workspace-size-menu">
              <div className="workspace-size-menu__section">
                <span className="workspace-size-menu__title">自定义画布</span>
                <div className="workspace-size-menu__custom">
                  <input
                    type="number"
                    min={320}
                    value={customWidth}
                    onChange={(event) => setCustomWidth(event.target.value)}
                    placeholder="1280"
                  />
                  <span>×</span>
                  <input
                    type="number"
                    min={240}
                    value={customHeight}
                    onChange={(event) => setCustomHeight(event.target.value)}
                    placeholder="820"
                  />
                  <button type="button" onClick={applyCustomSize}>
                    应用
                  </button>
                </div>
              </div>

              <div className="workspace-size-menu__section">
                <span className="workspace-size-menu__title">常用画布</span>
                <div className="workspace-size-menu__presets">
                  {canvasPresets.map((preset) => (
                    <button
                      key={preset.label}
                      type="button"
                      className="workspace-size-menu__preset"
                      onClick={() => {
                        setCanvasSize({ width: preset.width, height: preset.height });
                        setCustomWidth(String(preset.width));
                        setCustomHeight(String(preset.height));
                        setIsSizeMenuOpen(false);
                      }}
                    >
                      <span>{preset.label}</span>
                      <strong>{`${preset.width} × ${preset.height}`}</strong>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>

      <div className="workspace__surface" onClick={() => selectElement(null)}>
        <div ref={canvasRef} className="canvas" style={canvasStyle}>
          {activeTab.project.elements.map((element) => {
            const isSelected = activeTab.selectedElementId === element.id;

            return (
              <div
                key={element.id}
                className={`canvas-element canvas-element--${element.kind}${
                  isSelected ? " canvas-element--selected" : ""
                }`}
                style={element.style}
                onClick={(event) => {
                  event.stopPropagation();
                  selectElement(element.id);
                }}
                onPointerDown={(event) => beginDrag(event, element)}
              >
                {renderElementContent(element)}
                {isSelected ? (
                  <>
                    <div className="canvas-element__badge">
                      {Math.round(element.style.left)} , {Math.round(element.style.top)}
                    </div>
                    {resizeHandles.map((handle) => (
                      <div
                        key={handle}
                        className={`element-resize-handle element-resize-handle--${handle}`}
                        onPointerDown={(resizeEvent) =>
                          beginElementResize(resizeEvent, element, handle)
                        }
                      />
                    ))}
                  </>
                ) : null}
              </div>
            );
          })}

          {selectedElement && floatingToolbarStyle ? (
            <div
              className="element-toolbar"
              style={floatingToolbarStyle}
              onPointerDown={(event) => event.stopPropagation()}
              onClick={(event) => event.stopPropagation()}
            >
              <div className="element-toolbar__grid">
                <label className="element-toolbar__field">
                  <span>文字颜色</span>
                  <input
                    type="color"
                    value={selectedElement.style.color}
                    onChange={(event) =>
                      updateElement(selectedElement.id, { style: { color: event.target.value } })
                    }
                  />
                </label>
                <label className="element-toolbar__field">
                  <span>背景颜色</span>
                  <input
                    type="color"
                    value={selectedElement.style.background}
                    onChange={(event) =>
                      updateElement(selectedElement.id, {
                        style: { background: event.target.value },
                      })
                    }
                  />
                </label>
                <label className="element-toolbar__field">
                  <span>边框颜色</span>
                  <input
                    type="color"
                    value={selectedElement.style.borderColor}
                    onChange={(event) =>
                      updateElement(selectedElement.id, {
                        style: { borderColor: event.target.value },
                      })
                    }
                  />
                </label>
                <label className="element-toolbar__field">
                  <span>字体大小</span>
                  <input
                    type="number"
                    min={8}
                    max={96}
                    value={selectedElement.style.fontSize}
                    onChange={(event) =>
                      updateElement(selectedElement.id, {
                        style: { fontSize: Number(event.target.value) || 16 },
                      })
                    }
                  />
                </label>
              </div>

              <label className="element-toolbar__field element-toolbar__field--full">
                <span>字体</span>
                <select
                  value={selectedElement.style.fontFamily}
                  onChange={(event) =>
                    updateElement(selectedElement.id, {
                      style: { fontFamily: event.target.value },
                    })
                  }
                >
                  {fontFamilies.map((font) => (
                    <option key={font.label} value={font.value}>
                      {font.label}
                    </option>
                  ))}
                </select>
              </label>

              <div className="element-toolbar__section">
                <span className="element-toolbar__section-title">层级</span>
                <div className="element-toolbar__actions">
                  <button
                    type="button"
                    className="element-toolbar__action"
                    onClick={() => bringToFront(selectedElement.id)}
                  >
                    置于上层
                  </button>
                  <button
                    type="button"
                    className="element-toolbar__action"
                    onClick={() => bringForward(selectedElement.id)}
                  >
                    上移一层
                  </button>
                  <button
                    type="button"
                    className="element-toolbar__action"
                    onClick={() => sendBackward(selectedElement.id)}
                  >
                    下移一层
                  </button>
                  <button
                    type="button"
                    className="element-toolbar__action"
                    onClick={() => sendToBack(selectedElement.id)}
                  >
                    置于下层
                  </button>
                </div>
              </div>

              <button
                type="button"
                className="element-toolbar__delete"
                onClick={() => removeSelected()}
              >
                <Trash2 size={14} />
                <span>删除元素</span>
              </button>
            </div>
          ) : null}

          {resizeHandles.map((handle) => (
            <div
              key={handle}
              className={`canvas-resize-handle canvas-resize-handle--${handle}${
                activeResizeHandle === handle ? " canvas-resize-handle--active" : ""
              }`}
              onPointerDown={(event) => beginCanvasResize(event, handle)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

