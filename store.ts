import { create } from 'zustand';
import { AppState, BinderItem, ItemType, ViewMode } from './types';
import { v4 as uuidv4 } from 'uuid'; // Assuming uuid is available or using a simple polyfill

// Simple ID generator if uuid not available in environment
const generateId = () => Math.random().toString(36).substr(2, 9);

const INITIAL_ITEMS: Record<string, BinderItem> = {
  'root-draft': { id: 'root-draft', parentId: null, title: 'Draft', type: ItemType.FOLDER, expanded: true, children: ['ch-1', 'ch-2'] },
  'ch-1': { id: 'ch-1', parentId: 'root-draft', title: 'Chapter 1: The Beginning', type: ItemType.FOLDER, expanded: false, children: ['scene-1-1'], status: 'Done', label: 'Chapter' },
  'scene-1-1': { id: 'scene-1-1', parentId: 'ch-1', title: 'The Incident', type: ItemType.TEXT, content: '<p>It was a dark and stormy night...</p>', synopsis: 'Hero meets the villain.', status: 'Done', label: 'Scene', wordCountTarget: 1500 },
  'ch-2': { id: 'ch-2', parentId: 'root-draft', title: 'Chapter 2: The Journey', type: ItemType.FOLDER, expanded: false, children: [], status: 'In Progress', label: 'Chapter' },
  
  'root-research': { id: 'root-research', parentId: null, title: 'Research', type: ItemType.FOLDER, expanded: true, children: ['res-1'] },
  'res-1': { id: 'res-1', parentId: 'root-research', title: 'Historical Context', type: ItemType.TEXT, content: 'Notes on 1920s architecture.', status: 'To Do' },
  
  'root-trash': { id: 'root-trash', parentId: null, title: 'Trash', type: ItemType.TRASH, expanded: false, children: [] },
};

const INITIAL_ROOTS = ['root-draft', 'root-research', 'root-trash'];

export const useAppStore = create<AppState>((set, get) => ({
  currentView: 'dashboard',
  activeProjectId: null,
  items: INITIAL_ITEMS,
  rootItems: INITIAL_ROOTS,
  selectedItemId: 'root-draft',
  inspectorOpen: true,
  topDrawerOpen: false,
  viewMode: 'corkboard', // Default since Draft folder is selected
  
  binderSearchTerm: '',
  hoistedItemId: null,

  createProject: (name) => {
    set({ currentView: 'workspace', activeProjectId: generateId() });
  },

  openProject: (id) => {
    set({ currentView: 'workspace', activeProjectId: id });
  },

  selectItem: (id, autoSwitchView = true) => {
    const item = get().items[id];
    if (!item) return;

    let mode = get().viewMode;
    
    // Only switch view if requested (default true)
    if (autoSwitchView) {
      if (item.type === ItemType.MINDMAP) mode = 'mindmap';
      else if (item.type === ItemType.TIMELINE) mode = 'timeline';
      else if (item.type === ItemType.FOLDER && mode === 'editor') mode = 'corkboard'; 
      else if (item.type === ItemType.TEXT) mode = 'editor';
    }

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
      
      if (parentId && items[parentId]) {
        items[parentId] = {
          ...items[parentId],
          children: [...(items[parentId].children || []), newId]
        };
      } 

      return { items };
    });
  },
  
  deleteItem: (id) => {
      // Soft delete: Move to Trash
      get().moveItem(id, 'root-trash', 'inside');
  },

  moveItem: (draggedId, targetId, position) => {
    set((state) => {
        const items = { ...state.items };
        const draggedItem = items[draggedId];
        const targetItem = items[targetId];

        // Guard against moving into self
        if (draggedId === targetId) return state;

        // Guard against moving roots
        if (state.rootItems.includes(draggedId)) return state;

        // 1. Remove from old parent
        const oldParentId = draggedItem.parentId;
        if (oldParentId && items[oldParentId]) {
            items[oldParentId] = {
                ...items[oldParentId],
                children: items[oldParentId].children?.filter(id => id !== draggedId) || []
            };
        }

        // 2. Add to new location
        if (position === 'inside') {
            // Add to end of target's children
            items[targetId] = {
                ...items[targetId],
                children: [...(items[targetId].children || []), draggedId],
                expanded: true 
            };
            items[draggedId] = { ...draggedItem, parentId: targetId };
        } else {
            // Sibling reorder
            const newParentId = targetItem.parentId;
            if (newParentId && items[newParentId]) {
                const siblings = [...(items[newParentId].children || [])];
                
                // Remove if it was already in this list (case of reordering same list)
                const existingIndex = siblings.indexOf(draggedId);
                if (existingIndex > -1) {
                    siblings.splice(existingIndex, 1);
                }

                // Recalculate index after potential removal
                const adjustedTargetIndex = siblings.indexOf(targetId);
                const insertIndex = position === 'before' ? adjustedTargetIndex : adjustedTargetIndex + 1;
                
                siblings.splice(insertIndex, 0, draggedId);
                
                items[newParentId] = {
                    ...items[newParentId],
                    children: siblings
                };
                items[draggedId] = { ...draggedItem, parentId: newParentId };
            }
        }

        return { items };
    });
  },

  setViewMode: (mode) => set({ viewMode: mode }),
  
  setBinderSearchTerm: (term) => set({ binderSearchTerm: term }),
  setHoistedItemId: (id) => set({ hoistedItemId: id }),
}));