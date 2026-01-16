import { create } from 'zustand';
import { AppState, BinderItem, ItemType, ViewMode } from './types';
import { v4 as uuidv4 } from 'uuid'; // Assuming uuid is available or using a simple polyfill

// Simple ID generator if uuid not available in environment
const generateId = () => Math.random().toString(36).substr(2, 9);

const INITIAL_ITEMS: Record<string, BinderItem> = {
  'root-draft': { id: 'root-draft', parentId: null, title: 'Draft', type: ItemType.FOLDER, expanded: true, children: ['ch-1', 'ch-2'] },
  'ch-1': { id: 'ch-1', parentId: 'root-draft', title: 'Chapter 1: The Beginning', type: ItemType.FOLDER, expanded: false, children: ['scene-1-1'], status: 'Done', label: 'Chapter' },
  'scene-1-1': { id: 'scene-1-1', parentId: 'ch-1', title: 'The Incident', type: ItemType.TEXT, content: '<p>It was a dark and stormy night...</p>', synopsis: 'Hero meets the villain.', status: 'Done', label: 'Scene' },
  'ch-2': { id: 'ch-2', parentId: 'root-draft', title: 'Chapter 2: The Journey', type: ItemType.FOLDER, expanded: false, children: [], status: 'In Progress', label: 'Chapter' },
  
  'root-research': { id: 'root-research', parentId: null, title: 'Research', type: ItemType.FOLDER, expanded: true, children: ['res-1'] },
  'res-1': { id: 'res-1', parentId: 'root-research', title: 'Historical Context', type: ItemType.TEXT, content: 'Notes on 1920s architecture.', status: 'To Do' },
  
  'root-planning': { id: 'root-planning', parentId: null, title: 'Planning', type: ItemType.FOLDER, expanded: true, children: ['mind-1', 'time-1'] },
  'mind-1': { id: 'mind-1', parentId: 'root-planning', title: 'Character Map', type: ItemType.MINDMAP, content: '', children: ['node-1', 'node-2'] },
  'node-1': { id: 'node-1', parentId: 'mind-1', title: 'Protagonist', type: ItemType.TEXT, meta: { x: 100, y: 100, color: '#e0f2fe' } },
  'node-2': { id: 'node-2', parentId: 'mind-1', title: 'Antagonist', type: ItemType.TEXT, meta: { x: 400, y: 150, color: '#fee2e2' } },
  
  'time-1': { id: 'time-1', parentId: 'root-planning', title: 'Main Plot Timeline', type: ItemType.TIMELINE, content: '', children: [] },
};

const INITIAL_ROOTS = ['root-draft', 'root-research', 'root-planning'];

export const useAppStore = create<AppState>((set, get) => ({
  currentView: 'dashboard',
  activeProjectId: null,
  items: INITIAL_ITEMS,
  rootItems: INITIAL_ROOTS,
  selectedItemId: 'root-draft',
  inspectorOpen: true,
  topDrawerOpen: false,
  viewMode: 'corkboard', // Default since Draft folder is selected

  createProject: (name) => {
    // In a real app, this would modify a projects list.
    // For this prototype, we just switch view.
    set({ currentView: 'workspace', activeProjectId: generateId() });
  },

  openProject: (id) => {
    set({ currentView: 'workspace', activeProjectId: id });
  },

  selectItem: (id) => {
    const item = get().items[id];
    let mode = get().viewMode;
    
    // Auto-switch view based on type if needed
    if (item.type === ItemType.MINDMAP) mode = 'mindmap';
    else if (item.type === ItemType.TIMELINE) mode = 'timeline';
    else if (item.type === ItemType.FOLDER && mode === 'editor') mode = 'corkboard'; // Folders default to corkboard if we were in editor
    else if (item.type === ItemType.TEXT) mode = 'editor';

    set({ selectedItemId: id, viewMode: mode });
  },

  toggleInspector: () => set((state) => ({ inspectorOpen: !state.inspectorOpen })),
  toggleTopDrawer: () => set((state) => ({ topDrawerOpen: !state.topDrawerOpen })),

  setBinderItemExpanded: (id, expanded) => {
    set((state) => ({
      items: {
        ...state.items,
        [id]: { ...state.items[id], expanded },
      },
    }));
  },

  updateItem: (id, updates) => {
    set((state) => ({
      items: {
        ...state.items,
        [id]: { ...state.items[id], ...updates },
      },
    }));
  },

  addItem: (parentId, type, title) => {
    const newId = generateId();
    const newItem: BinderItem = {
      id: newId,
      parentId,
      title,
      type,
      children: [],
      expanded: true,
      status: 'To Do'
    };

    set((state) => {
      const items = { ...state.items, [newId]: newItem };
      
      // Add to parent's children list or root
      if (parentId && items[parentId]) {
        items[parentId] = {
          ...items[parentId],
          children: [...(items[parentId].children || []), newId]
        };
      } else if (!parentId) {
         // Handle root add logic if we supported adding roots
      }

      return { items };
    });
  },

  moveItem: (draggedId, targetId, position) => {
    // Simplified move logic for prototype
    console.log(`Move ${draggedId} ${position} ${targetId}`);
    // Implementation would involve complex tree manipulation
  },

  setViewMode: (mode) => set({ viewMode: mode }),
}));
