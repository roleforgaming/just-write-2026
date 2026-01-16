
export type ViewMode = 'editor' | 'corkboard' | 'outliner' | 'mindmap' | 'timeline';

export enum ItemType {
  FOLDER = 'FOLDER',
  TEXT = 'TEXT',
  MINDMAP = 'MINDMAP',
  TIMELINE = 'TIMELINE',
  TRASH = 'TRASH'
}

export type LabelTint = 'none' | 'icon' | 'dot' | 'row';
export type CorkboardMode = 'grid' | 'freeform' | 'label';

export interface CustomMetadataField {
    id: string;
    name: string;
    type: 'text' | 'date' | 'checkbox' | 'list';
    options?: string[]; // For list type
}

export interface BinderItem {
  id: string;
  parentId: string | null;
  title: string;
  type: ItemType;
  content?: string; // HTML/Rich text content
  synopsis?: string;
  status?: 'To Do' | 'In Progress' | 'Done';
  label?: 'Chapter' | 'Scene' | 'Character' | 'Location' | 'Idea';
  wordCount?: number; // Actual count
  wordCountTarget?: number;
  createdDate?: Date;
  modifiedDate?: Date;
  
  icon?: string; // Custom icon name
  
  // Corkboard Metadata
  keywords?: string[];
  cardImage?: string; // URL for the card face
  corkboard?: {
    x: number;
    y: number;
  };

  // Custom Metadata Values (Key = Field ID)
  customMetadata?: Record<string, string | boolean>;

  // Indicators
  hasSnapshots?: boolean;
  hasComments?: boolean;
  
  // External Sync
  externalSync?: {
      enabled: boolean;
      path: string;
      lastSync?: Date;
  };

  // Specific to MindMap/Timeline
  meta?: {
    x?: number;
    y?: number;
    width?: number;
    height?: number;
    color?: string;
    connections?: string[]; // IDs of connected nodes
    timelineLane?: string;
  };
  
  children?: string[]; // IDs of children
  expanded?: boolean;
}

export interface Project {
  id: string;
  name: string;
  lastModified: Date;
}

export interface OutlinerColumn {
    id: string;
    label: string;
    visible: boolean;
    width: string; // CSS Grid value
    isCustom?: boolean;
}

export interface AppState {
  currentView: 'dashboard' | 'workspace';
  activeProjectId: string | null;
  
  // Binder Data
  items: Record<string, BinderItem>;
  rootItems: string[]; // Top level IDs

  // Selection & Navigation
  selectedItemId: string | null; // The "active" or "focused" item (Inspector target)
  selectedItemIds: string[]; // All selected items
  viewRootId: string | null; // The container currently being viewed in Corkboard/Outliner
  
  // Binder View State
  binderTab: 'binder' | 'collections';
  binderSearchTerm: string;
  hoistedItemId: string | null;
  binderSettings: {
      labelTint: LabelTint;
      showIcons: boolean;
      showStatus: boolean;
  };
  
  // Corkboard Settings
  corkboardSettings: {
      mode: CorkboardMode;
      cardSize: number; // 1 to 4
      ratio: '3:5' | '4:6' | '1:1';
      showStatus: boolean;
      showKeywords: boolean;
      showLabel: boolean;
  };

  // Outliner Settings
  outlinerSettings: {
      columns: OutlinerColumn[];
      sortBy: string | null;
      sortDirection: 'asc' | 'desc';
  };
  customMetadataFields: CustomMetadataField[];

  // Project Bookmarks (Pinned items)
  projectBookmarks: string[];

  // UI State
  inspectorOpen: boolean;
  topDrawerOpen: boolean;
  viewMode: ViewMode;

  // Actions
  createProject: (name: string) => void;
  openProject: (id: string) => void;
  selectItem: (id: string, multi?: boolean, range?: boolean, autoSwitchView?: boolean) => void;
  setViewRoot: (id: string | null) => void;
  
  toggleInspector: () => void;
  toggleTopDrawer: () => void;
  setBinderItemExpanded: (id: string, expanded: boolean) => void;
  updateItem: (id: string, updates: Partial<BinderItem>) => void;
  moveItem: (draggedId: string, targetId: string, position: 'before' | 'inside' | 'after') => void;
  setViewMode: (mode: ViewMode) => void;
  addItem: (parentId: string | null, type: ItemType, title: string) => void;
  deleteItem: (id: string) => void;
  
  // Binder Actions
  setBinderSearchTerm: (term: string) => void;
  setHoistedItemId: (id: string | null) => void;
  setBinderTab: (tab: 'binder' | 'collections') => void;
  updateBinderSettings: (settings: Partial<AppState['binderSettings']>) => void;

  // Corkboard Actions
  updateCorkboardSettings: (settings: Partial<AppState['corkboardSettings']>) => void;
  setCorkboardPosition: (id: string, x: number, y: number) => void;
  commitFreeformOrder: (parentId: string) => void;

  // Outliner Actions
  updateOutlinerSettings: (settings: Partial<AppState['outlinerSettings']>) => void;
  toggleOutlinerColumn: (columnId: string) => void;
  setOutlinerSort: (columnId: string) => void;
  addCustomMetadataField: (field: CustomMetadataField) => void;

  // Advanced Features
  splitItem: (id: string, contentBefore: string, contentAfter: string, splitTitle: string) => void;
  mergeItems: (targetId: string, sourceIds: string[]) => void;
  toggleBookmark: (id: string) => void;
  importAndSplit: (parentId: string, content: string, separator: string) => void;
  setSyncSettings: (id: string, settings: BinderItem['externalSync']) => void;
}
