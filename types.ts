export type ViewMode = 'editor' | 'corkboard' | 'outliner' | 'mindmap' | 'timeline';

export enum ItemType {
  FOLDER = 'FOLDER',
  TEXT = 'TEXT',
  MINDMAP = 'MINDMAP',
  TIMELINE = 'TIMELINE'
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
  
  // Binder Data (Flat list is often easier for DND, but Tree is needed for UI. We'll use a hybrid or flat list with parent pointers)
  items: Record<string, BinderItem>;
  rootItems: string[]; // Top level IDs

  // Selection
  selectedItemId: string | null;
  
  // UI State
  inspectorOpen: boolean;
  topDrawerOpen: boolean;
  viewMode: ViewMode;

  // Actions
  createProject: (name: string) => void;
  openProject: (id: string) => void;
  selectItem: (id: string) => void;
  toggleInspector: () => void;
  toggleTopDrawer: () => void;
  setBinderItemExpanded: (id: string, expanded: boolean) => void;
  updateItem: (id: string, updates: Partial<BinderItem>) => void;
  moveItem: (draggedId: string, targetId: string, position: 'before' | 'inside' | 'after') => void;
  setViewMode: (mode: ViewMode) => void;
  addItem: (parentId: string | null, type: ItemType, title: string) => void;
}
