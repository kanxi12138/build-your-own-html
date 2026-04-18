import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type { KeyboardEvent } from "react";
import { createPortal } from "react-dom";
import {
  Copy,
  Download,
  FilePlus2,
  LayoutGrid,
  MousePointer2,
  Plus,
  X,
} from "lucide-react";
import { useEditorStore } from "../store/editorStore";
import { insertCategories, insertDefinitions } from "../utils/insertCatalog";

export function RibbonBar() {
  const [pendingCloseTabId, setPendingCloseTabId] = useState<string | null>(null);
  const [editingTabId, setEditingTabId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState("");
  const [activeInsertCategory, setActiveInsertCategory] = useState<string | null>(null);
  const [activeRibbonTab, setActiveRibbonTab] = useState<"file" | "start">("start");
  const [popoverStyle, setPopoverStyle] = useState<{ top: number; left: number; width: number } | null>(
    null,
  );
  const editInputRef = useRef<HTMLInputElement | null>(null);
  const activeCategoryButtonRef = useRef<HTMLButtonElement | null>(null);
  const popoverRef = useRef<HTMLDivElement | null>(null);

  const tabs = useEditorStore((state) => state.tabs);
  const activeTabId = useEditorStore((state) => state.activeTabId);
  const createTab = useEditorStore((state) => state.createTab);
  const switchTab = useEditorStore((state) => state.switchTab);
  const closeTab = useEditorStore((state) => state.closeTab);
  const renameTab = useEditorStore((state) => state.renameTab);
  const addElement = useEditorStore((state) => state.addElement);
  const duplicateSelected = useEditorStore((state) => state.duplicateSelected);
  const removeSelected = useEditorStore((state) => state.removeSelected);
  const exportProject = useEditorStore((state) => state.exportProject);

  const pendingCloseTab = tabs.find((tab) => tab.id === pendingCloseTabId) ?? null;
  const editingTab = tabs.find((tab) => tab.id === editingTabId) ?? null;

  useEffect(() => {
    if (editingTabId) {
      editInputRef.current?.focus();
      editInputRef.current?.select();
    }
  }, [editingTabId]);

  useLayoutEffect(() => {
    if (!activeInsertCategory || !activeCategoryButtonRef.current) {
      setPopoverStyle(null);
      return;
    }

    const updatePosition = () => {
      const rect = activeCategoryButtonRef.current?.getBoundingClientRect();
      if (!rect) {
        return;
      }

      setPopoverStyle({
        top: rect.bottom + window.scrollY + 8,
        left: rect.left + window.scrollX,
        width: Math.max(340, rect.width + 160),
      });
    };

    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);

    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [activeInsertCategory]);

  useEffect(() => {
    if (!activeInsertCategory) {
      return;
    }

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as Node;

      if (popoverRef.current?.contains(target)) {
        return;
      }

      if (activeCategoryButtonRef.current?.contains(target)) {
        return;
      }

      setActiveInsertCategory(null);
    };

    window.addEventListener("pointerdown", handlePointerDown);
    return () => window.removeEventListener("pointerdown", handlePointerDown);
  }, [activeInsertCategory]);

  const beginRename = (tabId: string, currentTitle: string) => {
    setEditingTabId(tabId);
    setEditingTitle(currentTitle);
  };

  const commitRename = () => {
    if (!editingTabId || !editingTab) {
      setEditingTabId(null);
      setEditingTitle("");
      return;
    }

    const nextTitle = editingTitle.trim();
    if (nextTitle) {
      renameTab(editingTabId, nextTitle);
    }

    setEditingTabId(null);
    setEditingTitle("");
  };

  const cancelRename = () => {
    setEditingTabId(null);
    setEditingTitle("");
  };

  const handleRenameKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      commitRename();
      return;
    }

    if (event.key === "Escape") {
      cancelRename();
    }
  };

  return (
    <>
      <section className="ribbon">
        <div className="ribbon__tabstrip">
          <div className="editor-tabs">
            {tabs.map((tab) => (
              <div
                key={tab.id}
                className={`editor-tab${tab.id === activeTabId ? " editor-tab--active" : ""}`}
              >
                {editingTabId === tab.id ? (
                  <input
                    ref={editInputRef}
                    type="text"
                    className="editor-tab__input"
                    value={editingTitle}
                    onChange={(event) => setEditingTitle(event.target.value)}
                    onBlur={commitRename}
                    onKeyDown={handleRenameKeyDown}
                  />
                ) : (
                  <button
                    type="button"
                    className="editor-tab__main"
                    onClick={() => switchTab(tab.id)}
                    onDoubleClick={() => beginRename(tab.id, tab.title)}
                  >
                    {tab.title}
                  </button>
                )}
                <button
                  type="button"
                  className="editor-tab__close"
                  aria-label={`close-${tab.title}`}
                  onClick={(event) => {
                    event.stopPropagation();
                    setPendingCloseTabId(tab.id);
                  }}
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
          <button type="button" className="editor-tab-add" onClick={() => createTab()}>
            <Plus size={16} />
            <span>{"\u65b0\u5efa\u6807\u7b7e\u9875"}</span>
          </button>
        </div>

        <div className="ribbon__tabs">
          {[
            { key: "file" as const, label: "\u6587\u4ef6" },
            { key: "start" as const, label: "\u4fee\u6539" },
          ].map((tab) => (
            <button
              key={tab.key}
              type="button"
              className={`ribbon__tab${activeRibbonTab === tab.key ? " ribbon__tab--active" : ""}`}
              onClick={() => setActiveRibbonTab(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="ribbon__content">
          <div className="ribbon__content-viewport">
            <div
              className={`ribbon__panel${
                activeRibbonTab === "file" ? " ribbon__panel--active" : ""
              }`}
              aria-hidden={activeRibbonTab !== "file"}
            >
              <div className="ribbon-group ribbon-group--grow">
              <span className="ribbon-group__label">{"\u6587\u4ef6"}</span>
              <div className="ribbon-group__buttons ribbon-group__buttons--compact">
                <button type="button" className="tool-button" onClick={() => createTab()}>
                  <FilePlus2 size={18} />
                  <span>{"\u65b0\u5efa"}</span>
                </button>
                <button type="button" className="tool-button" onClick={() => exportProject()}>
                  <Download size={18} />
                  <span>{"\u5bfc\u51fa HTML"}</span>
                </button>
              </div>
              </div>
            </div>

            <div
              className={`ribbon__panel${
                activeRibbonTab === "start" ? " ribbon__panel--active" : ""
              }`}
              aria-hidden={activeRibbonTab !== "start"}
            >
              <div className="ribbon-group">
                <span className="ribbon-group__label">{"\u5de5\u5177"}</span>
                <div className="ribbon-group__buttons ribbon-group__buttons--compact">
                  <button type="button" className="tool-button tool-button--active">
                    <MousePointer2 size={18} />
                    <span>{"\u9009\u62e9"}</span>
                  </button>
                  <button type="button" className="tool-button" onClick={() => duplicateSelected()}>
                    <Copy size={18} />
                    <span>{"\u590d\u5236"}</span>
                  </button>
                  <button type="button" className="tool-button" onClick={() => removeSelected()}>
                    <LayoutGrid size={18} />
                    <span>{"\u5220\u9664"}</span>
                  </button>
                </div>
              </div>

              <div className="ribbon-group ribbon-group--grow">
                <span className="ribbon-group__label">{"\u63d2\u5165\u5143\u7d20"}</span>
                <div className="insert-panel insert-panel--floating">
                  {insertCategories.map((category) => {
                    const isActive = category.id === activeInsertCategory;

                    return (
                      <div key={category.id} className="insert-category-wrap">
                        <button
                          ref={isActive ? activeCategoryButtonRef : null}
                          type="button"
                          className={`insert-category insert-category--horizontal${
                            isActive ? " insert-category--active" : ""
                          }`}
                          onClick={() =>
                            setActiveInsertCategory((current) =>
                              current === category.id ? null : category.id,
                            )
                          }
                        >
                          <strong>{category.label}</strong>
                          <span>{category.description}</span>
                        </button>

                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {activeInsertCategory && popoverStyle
        ? createPortal(
            <div
              ref={popoverRef}
              className="insert-category-popover insert-category-popover--portal"
              style={{
                top: `${popoverStyle.top}px`,
                left: `${popoverStyle.left}px`,
                width: `${popoverStyle.width}px`,
              }}
            >
              <div className="insert-panel__options">
                {insertDefinitions
                  .filter((item) => item.category === activeInsertCategory)
                  .map((item) => (
                    <button
                      key={item.kind}
                      type="button"
                      className="insert-option"
                      onClick={() => addElement(item.kind)}
                    >
                      <strong>{item.label}</strong>
                      <span>{item.description}</span>
                    </button>
                  ))}
              </div>
            </div>,
            document.body,
          )
        : null}

      {pendingCloseTab ? (
        <div className="confirm-overlay" role="dialog" aria-modal="true">
          <div className="confirm-dialog">
            <h3 className="confirm-dialog__title">{"\u5220\u9664\u6807\u7b7e\u9875"}</h3>
            <p className="confirm-dialog__body">
              {`\u786e\u5b9a\u8981\u5220\u9664\u300c${pendingCloseTab.title}\u300d\u5417\uff1f`}
            </p>
            <div className="confirm-dialog__actions">
              <button
                type="button"
                className="confirm-button"
                onClick={() => setPendingCloseTabId(null)}
              >
                {"\u53d6\u6d88"}
              </button>
              <button
                type="button"
                className="confirm-button confirm-button--danger"
                onClick={() => {
                  closeTab(pendingCloseTab.id);
                  setPendingCloseTabId(null);
                  if (editingTabId === pendingCloseTab.id) {
                    cancelRename();
                  }
                }}
              >
                {"\u786e\u8ba4\u5220\u9664"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
