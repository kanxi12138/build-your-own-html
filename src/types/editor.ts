export type InsertCategoryId =
  | "buttons"
  | "text-inputs"
  | "selections"
  | "date-time"
  | "range-values"
  | "functional";

export type EditorElementKind =
  | "text"
  | "image"
  | "container"
  | "button"
  | "submit"
  | "reset"
  | "image-button"
  | "file"
  | "text-input"
  | "password"
  | "textarea"
  | "search"
  | "email"
  | "number"
  | "tel"
  | "url"
  | "checkbox"
  | "radio"
  | "select"
  | "multi-select"
  | "switch"
  | "date"
  | "time"
  | "week"
  | "month"
  | "datetime-local"
  | "range"
  | "progress"
  | "meter"
  | "color"
  | "hidden"
  | "label"
  | "fieldset";

export type ElementStyle = {
  left: number;
  top: number;
  width: number;
  height: number;
  color: string;
  background: string;
  borderColor: string;
  borderRadius: number;
  fontSize: number;
  fontFamily: string;
  zIndex: number;
};

export type EditorElement = {
  id: string;
  kind: EditorElementKind;
  category?: InsertCategoryId;
  label?: string;
  content: string;
  imageSrc?: string;
  placeholder?: string;
  inputType?: string;
  value?: string;
  checked?: boolean;
  options?: string[];
  multiple?: boolean;
  min?: number;
  max?: number;
  step?: number;
  role?: string;
  hiddenValue?: string;
  legend?: string;
  style: ElementStyle;
};

export type EditorProject = {
  name: string;
  canvas: {
    width: number;
    height: number;
    background: string;
  };
  elements: EditorElement[];
};

export type EditorTab = {
  id: string;
  title: string;
  project: EditorProject;
  selectedElementId: string | null;
};

export type PartialElementPatch = Partial<Omit<EditorElement, "style">> & {
  style?: Partial<ElementStyle>;
};
