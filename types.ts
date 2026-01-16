export type ViewMode = 'editor' | 'corkboard' | 'outliner' | 'mindmap' | 'timeline';

export enum ItemType {
  FOLDER = 'FOLDER',
  TEXT = 'TEXT',
  MINDMAP = 'MINDMAP',
  TIMELINE = 'TIMELINE',
  TRASH = 'TRASH'
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
  wordCountTarget?: number;
  icon?: string; // Custom icon name
  
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
  
  children?: string[]; // IDs of children (denormalized for easier tree rendering, but source of truth is parentId)
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
  selectedItemId: string | null;
  
  // Binder View State
  binderSearchTerm: string;
  hoistedItemId: string | null;
  
  // UI State
  inspectorOpen: boolean;
  topDrawerOpen: boolean;
  viewMode: ViewMode;

  // Actions
  createProject: (name: string) => void;
  openProject: (id: string) => void;
  selectItem: (id: string, autoSwitchView?: boolean) => void;
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
}