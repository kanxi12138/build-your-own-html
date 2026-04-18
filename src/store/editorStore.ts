import { create } from "zustand";
import JSZip from "jszip";
import { createStarterProject } from "../utils/defaultProject";
import { buildExportFiles } from "../utils/exportHtml";
import { createElementFromKind } from "../utils/insertCatalog";
import type {
  EditorElement,
  EditorElementKind,
  EditorProject,
  EditorTab,
  PartialElementPatch,
} from "../types/editor";

type EditorStore = {
  tabs: EditorTab[];
  activeTabId: string;
  createTab: () => void;
  switchTab: (tabId: string) => void;
  closeTab: (tabId: string) => void;
  renameTab: (tabId: string, title: string) => void;
  setCanvasSize: (size: { width: number; height: number }) => void;
  selectElement: (elementId: string | null) => void;
  addElement: (kind: EditorElementKind) => void;
  updateElement: (elementId: string, patch: PartialElementPatch) => void;
  moveElement: (elementId: string, position: { left: number; top: number }) => void;
  resizeElement: (
    elementId: string,
    frame: { left: number; top: number; width: number; height: number },
  ) => void;
  bringToFront: (elementId: string) => void;
  sendToBack: (elementId: string) => void;
  bringForward: (elementId: string) => void;
  sendBackward: (elementId: string) => void;
  duplicateSelected: () => void;
  removeSelected: () => void;
  exportProject: () => void;
};

type CanvasSize = EditorProject["canvas"];

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function createId(prefix: string) {
  return `${prefix}-${crypto.randomUUID().slice(0, 8)}`;
}

function createElement(kind: EditorElementKind): EditorElement {
  return {
    id: createId(kind),
    ...createElementFromKind(kind),
  };
}

function createTab(tabNumber: number): EditorTab {
  return {
    id: createId("tab"),
    title: `\u9875\u9762 ${tabNumber}`,
    project: createStarterProject(tabNumber),
    selectedElementId: null,
  };
}

function mergeElement(element: EditorElement, patch: PartialElementPatch): EditorElement {
  return {
    ...element,
    ...patch,
    style: {
      ...element.style,
      ...patch.style,
    },
  };
}

function normalizeElementToCanvas(element: EditorElement, canvas: CanvasSize): EditorElement {
  const width = clamp(Math.round(element.style.width), 1, canvas.width);
  const height = clamp(Math.round(element.style.height), 1, canvas.height);
  const left = clamp(Math.round(element.style.left), 0, Math.max(0, canvas.width - width));
  const top = clamp(Math.round(element.style.top), 0, Math.max(0, canvas.height - height));

  return {
    ...element,
    style: {
      ...element.style,
      width,
      height,
      left,
      top,
    },
  };
}

function normalizeProjectToCanvas(project: EditorProject): EditorProject {
  return {
    ...project,
    elements: project.elements.map((element) => normalizeElementToCanvas(element, project.canvas)),
  };
}

function getZIndexBounds(elements: EditorElement[]) {
  const zIndexes = elements.map((element) => element.style.zIndex);
  return {
    min: zIndexes.length > 0 ? Math.min(...zIndexes) : 1,
    max: zIndexes.length > 0 ? Math.max(...zIndexes) : 1,
  };
}

function updateActiveTab(
  tabs: EditorTab[],
  activeTabId: string,
  updater: (tab: EditorTab) => EditorTab,
) {
  return tabs.map((tab) => (tab.id === activeTabId ? updater(tab) : tab));
}

function triggerDownload(filename: string, content: string) {
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const href = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = href;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(href);
}

function triggerBlobDownload(filename: string, blob: Blob) {
  const href = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = href;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(href);
}

function sanitizeFilename(name: string) {
  return name.trim().replace(/[<>:"/\\|?*\u0000-\u001F]/g, "_") || "page";
}

const initialTab = createTab(1);

export const useEditorStore = create<EditorStore>((set, get) => ({
  tabs: [initialTab],
  activeTabId: initialTab.id,
  createTab: () =>
    set((state) => {
      const nextTab = createTab(state.tabs.length + 1);
      return {
        tabs: [...state.tabs, nextTab],
        activeTabId: nextTab.id,
      };
    }),
  switchTab: (tabId) =>
    set((state) => ({
      activeTabId: tabId,
      tabs: state.tabs.map((tab) =>
        tab.id === tabId
          ? {
              ...tab,
              project: normalizeProjectToCanvas(tab.project),
            }
          : tab,
      ),
    })),
  closeTab: (tabId) =>
    set((state) => {
      const currentIndex = state.tabs.findIndex((tab) => tab.id === tabId);
      if (currentIndex === -1) {
        return state;
      }

      const remainingTabs = state.tabs.filter((tab) => tab.id !== tabId);
      if (remainingTabs.length === 0) {
        const fallbackTab = createTab(1);
        return {
          tabs: [fallbackTab],
          activeTabId: fallbackTab.id,
        };
      }

      const nextActiveTabId =
        state.activeTabId === tabId
          ? remainingTabs[Math.max(0, currentIndex - 1)]?.id ?? remainingTabs[0].id
          : state.activeTabId;

      return {
        tabs: remainingTabs,
        activeTabId: nextActiveTabId,
      };
    }),
  renameTab: (tabId, title) =>
    set((state) => ({
      tabs: state.tabs.map((tab) =>
        tab.id === tabId
          ? {
              ...tab,
              title,
            }
          : tab,
      ),
    })),
  setCanvasSize: (size) =>
    set((state) => {
      const nextCanvas = {
        width: Math.max(320, Math.round(size.width)),
        height: Math.max(240, Math.round(size.height)),
      };

      return {
        tabs: updateActiveTab(state.tabs, state.activeTabId, (tab) => {
          const project = normalizeProjectToCanvas({
            ...tab.project,
            canvas: {
              ...tab.project.canvas,
              ...nextCanvas,
            },
          });

          return {
            ...tab,
            project,
          };
        }),
      };
    }),
  selectElement: (elementId) =>
    set((state) => ({
      tabs: updateActiveTab(state.tabs, state.activeTabId, (tab) => ({
        ...tab,
        selectedElementId: elementId,
      })),
    })),
  addElement: (kind) =>
    set((state) => {
      return {
        tabs: updateActiveTab(state.tabs, state.activeTabId, (tab) => {
          const nextElement = normalizeElementToCanvas(createElement(kind), tab.project.canvas);

          return {
            ...tab,
            project: {
              ...tab.project,
              elements: [...tab.project.elements, nextElement],
            },
            selectedElementId: nextElement.id,
          };
        }),
      };
    }),
  updateElement: (elementId, patch) =>
    set((state) => ({
      tabs: updateActiveTab(state.tabs, state.activeTabId, (tab) => ({
        ...tab,
        project: {
          ...tab.project,
          elements: tab.project.elements.map((element) =>
            element.id === elementId
              ? normalizeElementToCanvas(mergeElement(element, patch), tab.project.canvas)
              : element,
          ),
        },
      })),
    })),
  moveElement: (elementId, position) =>
    set((state) => ({
      tabs: updateActiveTab(state.tabs, state.activeTabId, (tab) => ({
        ...tab,
        project: {
          ...tab.project,
          elements: tab.project.elements.map((element) =>
            element.id === elementId
              ? normalizeElementToCanvas(
                  mergeElement(element, {
                    style: {
                      left: position.left,
                      top: position.top,
                    },
                  }),
                  tab.project.canvas,
                )
              : element,
          ),
        },
      })),
    })),
  resizeElement: (elementId, frame) =>
    set((state) => ({
      tabs: updateActiveTab(state.tabs, state.activeTabId, (tab) => ({
        ...tab,
        project: {
          ...tab.project,
          elements: tab.project.elements.map((element) =>
            element.id === elementId
              ? normalizeElementToCanvas(
                  mergeElement(element, {
                    style: {
                      left: frame.left,
                      top: frame.top,
                      width: frame.width,
                      height: frame.height,
                    },
                  }),
                  tab.project.canvas,
                )
              : element,
          ),
        },
      })),
    })),
  bringToFront: (elementId) =>
    set((state) => ({
      tabs: updateActiveTab(state.tabs, state.activeTabId, (tab) => {
        const { max } = getZIndexBounds(tab.project.elements);
        return {
          ...tab,
          project: {
            ...tab.project,
            elements: tab.project.elements.map((element) =>
              element.id === elementId
                ? mergeElement(element, { style: { zIndex: max + 1 } })
                : element,
            ),
          },
        };
      }),
    })),
  sendToBack: (elementId) =>
    set((state) => ({
      tabs: updateActiveTab(state.tabs, state.activeTabId, (tab) => {
        const { min } = getZIndexBounds(tab.project.elements);
        return {
          ...tab,
          project: {
            ...tab.project,
            elements: tab.project.elements.map((element) =>
              element.id === elementId
                ? mergeElement(element, { style: { zIndex: min - 1 } })
                : element,
            ),
          },
        };
      }),
    })),
  bringForward: (elementId) =>
    set((state) => ({
      tabs: updateActiveTab(state.tabs, state.activeTabId, (tab) => ({
        ...tab,
        project: {
          ...tab.project,
          elements: tab.project.elements.map((element) =>
            element.id === elementId
              ? mergeElement(element, { style: { zIndex: element.style.zIndex + 1 } })
              : element,
          ),
        },
      })),
    })),
  sendBackward: (elementId) =>
    set((state) => ({
      tabs: updateActiveTab(state.tabs, state.activeTabId, (tab) => ({
        ...tab,
        project: {
          ...tab.project,
          elements: tab.project.elements.map((element) =>
            element.id === elementId
              ? mergeElement(element, { style: { zIndex: element.style.zIndex - 1 } })
              : element,
          ),
        },
      })),
    })),
  duplicateSelected: () =>
    set((state) => ({
      tabs: updateActiveTab(state.tabs, state.activeTabId, (tab) => {
        const selected = tab.project.elements.find(
          (element) => element.id === tab.selectedElementId,
        );

        if (!selected) {
          return tab;
        }

        const clone = mergeElement(selected, {
          id: createId(selected.kind),
          style: {
            left: selected.style.left + 28,
            top: selected.style.top + 28,
          },
        });

        return {
          ...tab,
          project: {
            ...tab.project,
            elements: [
              ...tab.project.elements,
              normalizeElementToCanvas(clone, tab.project.canvas),
            ],
          },
          selectedElementId: clone.id,
        };
      }),
    })),
  removeSelected: () =>
    set((state) => ({
      tabs: updateActiveTab(state.tabs, state.activeTabId, (tab) => {
        if (!tab.selectedElementId) {
          return tab;
        }

        const elements = tab.project.elements.filter(
          (element) => element.id !== tab.selectedElementId,
        );

        return {
          ...tab,
          project: {
            ...tab.project,
            elements,
          },
          selectedElementId: elements[0]?.id ?? null,
        };
      }),
    })),
  exportProject: () => {
    const activeTab = get().tabs.find((tab) => tab.id === get().activeTabId);
    if (!activeTab) {
      return;
    }

    const { html, css, json } = buildExportFiles(activeTab.project);
    const zip = new JSZip();
    zip.file("index.html", html);
    zip.file("styles.css", css);
    zip.file("project.json", JSON.stringify(json, null, 2));

    void zip.generateAsync({ type: "blob" }).then((blob: Blob) => {
      triggerBlobDownload(`${sanitizeFilename(activeTab.project.name)}.zip`, blob);
    });
  },
}));
