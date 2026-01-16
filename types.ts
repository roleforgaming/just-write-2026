export type ViewMode = 'editor' | 'corkboard' | 'outliner' | 'mindmap' | 'timeline';

export enum ItemType {
  FOLDER = 'FOLDER',
  TEXT = 'TEXT',
  MINDMAP = 'MINDMAP',
  TIMELINE = 'TIMELINE',
  TRASH = 'TRASH'
}

export type LabelTint = 'none' | 'icon' | 'dot' | 'row';

export interface BinderItem {
  id: string;
  parentId: string | null;
  title: string;
  type: ItemType;
  content?: string; // HTML/Rich text content
  synopsis?: string;
  status?: 'To Do' | 'In Progress' | 'Done';
  label?: 'Chapter' | 'Scene' | 'Character' | 'Location' | 'Idea';
  wordCountTarget?: number;
  icon?: string; // Custom icon name
  
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

export interface AppState {
  currentView: 'dashboard' | 'workspace';
  activeProjectId: string | null;
  
  // Binder Data
  items: Record<string, BinderItem>;
  rootItems: string[]; // Top level IDs

  // Selection
  selectedItemId: string | null; // The "active" or "focused" item
  selectedItemIds: string[]; // All selected items (for Group/Scrivenings mode)
  
  // Binder View State
  binderTab: 'binder' | 'collections';
  binderSearchTerm: string;
  hoistedItemId: string | null;
  binderSettings: {
      labelTint: LabelTint;
      showIcons: boolean;
      showStatus: boolean;
  };
  
  // Project Bookmarks (Pinned items)
  projectBookmarks: string[];

  // UI State
  inspectorOpen: boolean;
  topDrawerOpen: boolean;
  viewMode: ViewMode;

  // Actions
  createProject: (name: string) => void;
  openProject: (id: string) => void;
  selectItem: (id: string, multi?: boolean, range?: boolean) => void;
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

  // Advanced Features
  splitItem: (id: string, contentBefore: string, contentAfter: string, splitTitle: string) => void;
  mergeItems: (targetId: string, sourceIds: string[]) => void;
  toggleBookmark: (id: string) => void;
  importAndSplit: (parentId: string, content: string, separator: string) => void;
  setSyncSettings: (id: string, settings: BinderItem['externalSync']) => void;
}