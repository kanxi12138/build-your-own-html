import type { ChangeEvent } from "react";
import { useEditorStore } from "../store/editorStore";
import type { EditorElement } from "../types/editor";

type PropertiesPanelProps = {
  element: EditorElement | null;
};

function NumberField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (nextValue: number) => void;
}) {
  return (
    <label className="properties-field">
      <span>{label}</span>
      <input
        type="number"
        value={Math.round(value)}
        onChange={(event) => onChange(Number(event.target.value))}
      />
    </label>
  );
}

export function PropertiesPanel({ element }: PropertiesPanelProps) {
  const updateElement = useEditorStore((state) => state.updateElement);

  const updatePrimaryText = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (!element) {
      return;
    }

    if (element.kind === "image" || element.kind === "image-button") {
      updateElement(element.id, { imageSrc: event.target.value });
      return;
    }

    if (element.kind === "hidden") {
      updateElement(element.id, { hiddenValue: event.target.value });
      return;
    }

    if (element.kind === "fieldset") {
      updateElement(element.id, { legend: event.target.value });
      return;
    }

    updateElement(element.id, { content: event.target.value });
  };

  return (
    <aside className="properties-panel">
      <div className="properties-panel__header">
        <strong>属性</strong>
        <span>单独设置当前元素</span>
      </div>

      {element ? (
        <div className="properties-panel__content">
          <div className="properties-card">
            <span className="properties-card__title">基础</span>
            <div className="properties-grid">
              <NumberField
                label="X"
                value={element.style.left}
                onChange={(value) => updateElement(element.id, { style: { left: value } })}
              />
              <NumberField
                label="Y"
                value={element.style.top}
                onChange={(value) => updateElement(element.id, { style: { top: value } })}
              />
              <NumberField
                label="宽"
                value={element.style.width}
                onChange={(value) => updateElement(element.id, { style: { width: value } })}
              />
              <NumberField
                label="高"
                value={element.style.height}
                onChange={(value) => updateElement(element.id, { style: { height: value } })}
              />
            </div>
          </div>

          <div className="properties-card">
            <span className="properties-card__title">内容与行为</span>
            <label className="properties-field">
              <span>
                {element.kind === "image" || element.kind === "image-button"
                  ? "图片地址"
                  : element.kind === "hidden"
                    ? "隐藏值"
                    : element.kind === "fieldset"
                      ? "分组标题"
                      : "内容"}
              </span>
              <input
                type="text"
                value={
                  element.kind === "image" || element.kind === "image-button"
                    ? element.imageSrc ?? ""
                    : element.kind === "hidden"
                      ? element.hiddenValue ?? ""
                      : element.kind === "fieldset"
                        ? element.legend ?? ""
                        : element.content
                }
                onChange={updatePrimaryText}
              />
            </label>

            {"placeholder" in element ? (
              <label className="properties-field">
                <span>占位提示</span>
                <input
                  type="text"
                  value={element.placeholder ?? ""}
                  onChange={(event) =>
                    updateElement(element.id, { placeholder: event.target.value })
                  }
                />
              </label>
            ) : null}

            {element.inputType && element.inputType !== "file" ? (
              <label className="properties-field">
                <span>默认值</span>
                <input
                  type="text"
                  value={element.value ?? ""}
                  onChange={(event) => updateElement(element.id, { value: event.target.value })}
                />
              </label>
            ) : null}

            {element.options && element.options.length > 0 ? (
              <label className="properties-field">
                <span>选项列表（每行一个）</span>
                <textarea
                  rows={4}
                  value={element.options.join("\n")}
                  onChange={(event) =>
                    updateElement(element.id, {
                      options: event.target.value
                        .split("\n")
                        .map((item) => item.trim())
                        .filter(Boolean),
                    })
                  }
                />
              </label>
            ) : null}
          </div>

          <div className="properties-card">
            <span className="properties-card__title">外观</span>
            <div className="properties-grid">
              <label className="properties-field">
                <span>文字颜色</span>
                <input
                  type="color"
                  value={element.style.color}
                  onChange={(event) =>
                    updateElement(element.id, { style: { color: event.target.value } })
                  }
                />
              </label>
              <label className="properties-field">
                <span>背景色</span>
                <input
                  type="color"
                  value={element.style.background}
                  onChange={(event) =>
                    updateElement(element.id, { style: { background: event.target.value } })
                  }
                />
              </label>
            </div>
          </div>
        </div>
      ) : (
        <div className="properties-empty">
          <p>先在画布里选择一个元素。</p>
          <p>右侧会显示位置、尺寸、颜色和内容配置。</p>
        </div>
      )}
    </aside>
  );
}

