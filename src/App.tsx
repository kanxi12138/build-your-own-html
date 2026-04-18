import { useMemo } from "react";
import { CanvasViewport } from "./components/CanvasViewport";
import { PropertiesPanel } from "./components/PropertiesPanel";
import { RibbonBar } from "./components/RibbonBar";
import { useEditorStore } from "./store/editorStore";
import "./styles/editor.css";

function App() {
  const activeTab = useEditorStore((state) =>
    state.tabs.find((tab) => tab.id === state.activeTabId),
  );

  const selectedElement = useMemo(
    () =>
      activeTab?.project.elements.find(
        (element) => element.id === activeTab.selectedElementId,
      ) ?? null,
    [activeTab],
  );

  if (!activeTab) {
    return null;
  }

  return (
    <div className="editor-shell">
      <RibbonBar />
      <main className="editor-layout">
        <CanvasViewport />
        <PropertiesPanel element={selectedElement} />
      </main>
    </div>
  );
}

export default App;
