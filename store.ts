import { create } from 'zustand';
import { AppState, BinderItem, ItemType, ViewMode } from './types';
import { v4 as uuidv4 } from 'uuid'; 

const generateId = () => Math.random().toString(36).substr(2, 9);

const INITIAL_ITEMS: Record<string, BinderItem> = {
  'root-draft': { id: 'root-draft', parentId: null, title: 'Draft', type: ItemType.FOLDER, expanded: true, children: ['ch-1', 'ch-2'] },
  'ch-1': { id: 'ch-1', parentId: 'root-draft', title: 'Chapter 1: The Beginning', type: ItemType.FOLDER, expanded: false, children: ['scene-1-1'], status: 'Done', label: 'Chapter', hasSnapshots: true },
  'scene-1-1': { id: 'scene-1-1', parentId: 'ch-1', title: 'The Incident', type: ItemType.TEXT, content: '<p>It was a dark and stormy night...</p>', synopsis: 'Hero meets the villain.', status: 'Done', label: 'Scene', wordCountTarget: 1500, hasComments: true },
  'ch-2': { id: 'ch-2', parentId: 'root-draft', title: 'Chapter 2: The Journey', type: ItemType.FOLDER, expanded: false, children: [], status: 'In Progress', label: 'Chapter' },
  
  'root-research': { id: 'root-research', parentId: null, title: 'Research', type: ItemType.FOLDER, expanded: true, children: ['res-1'] },
  'res-1': { id: 'res-1', parentId: 'root-research', title: 'Historical Context', type: ItemType.TEXT, content: 'Notes on 1920s architecture.', status: 'To Do', label: 'Idea', icon: 'lightbulb' },
  
  'root-trash': { id: 'root-trash', parentId: null, title: 'Trash', type: ItemType.TRASH, expanded: false, children: [] },
};

const INITIAL_ROOTS = ['root-draft', 'root-research', 'root-trash'];

export const useAppStore = create<AppState>((set, get) => ({
  currentView: 'dashboard',
  activeProjectId: null,
  items: INITIAL_ITEMS,
  rootItems: INITIAL_ROOTS,
  
  selectedItemId: 'root-draft',
  selectedItemIds: ['root-draft'],
  
  inspectorOpen: true,
  topDrawerOpen: false,
  viewMode: 'corkboard',
  
  binderTab: 'binder',
  binderSearchTerm: '',
  hoistedItemId: null,
  binderSettings: {
      labelTint: 'row',
      showIcons: true,
      showStatus: true
  },

  projectBookmarks: [],

  createProject: (name) => {
    set({ currentView: 'workspace', activeProjectId: generateId() });
  },

  openProject: (id) => {
    set({ currentView: 'workspace', activeProjectId: id });
  },

  selectItem: (id, multi = false, range = false) => {
    const state = get();
    const item = state.items[id];
    if (!item) return;

    let newSelectedIds = [...state.selectedItemIds];
    
    if (multi) {
        if (newSelectedIds.includes(id)) {
            // Deselect if already selected (unless it's the only one)
            if (newSelectedIds.length > 1) {
                newSelectedIds = newSelectedIds.filter(itemId => itemId !== id);
            }
        } else {
            newSelectedIds.push(id);
        }
    } else if (range) {
        if (!newSelectedIds.includes(id)) newSelectedIds.push(id);
    } else {
        newSelectedIds = [id];
    }

    // Determine view mode based on selection
    let mode = state.viewMode;
    // Auto-switch view only on single selection
    if (!multi && !range && newSelectedIds.length === 1) {
        if (item.type === ItemType.MINDMAP) mode = 'mindmap';
        else if (item.type === ItemType.TIMELINE) mode = 'timeline';
        else if (item.type === ItemType.FOLDER && mode === 'editor') mode = 'corkboard'; 
        else if (item.type === ItemType.TEXT) mode = 'editor';
    }

    set({ 
        selectedItemId: id, 
        selectedItemIds: newSelectedIds,
        viewMode: mode 
    });
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
      get().moveItem(id, 'root-trash', 'inside');
  },

  moveItem: (draggedId, targetId, position) => {
    set((state) => {
        const items = { ...state.items };
        const draggedItem = items[draggedId];
        const targetItem = items[targetId];

        if (draggedId === targetId) return state;
        if (state.rootItems.includes(draggedId)) return state;

        // Remove from old parent
        const oldParentId = draggedItem.parentId;
        if (oldParentId && items[oldParentId]) {
            items[oldParentId] = {
                ...items[oldParentId],
                children: items[oldParentId].children?.filter(id => id !== draggedId) || []
            };
        }

        // Add to new location
        if (position === 'inside') {
            items[targetId] = {
                ...items[targetId],
                children: [...(items[targetId].children || []), draggedId],
                expanded: true 
            };
            items[draggedId] = { ...draggedItem, parentId: targetId };
        } else {
            const newParentId = targetItem.parentId;
            if (newParentId && items[newParentId]) {
                const siblings = [...(items[newParentId].children || [])];
                const existingIndex = siblings.indexOf(draggedId);
                if (existingIndex > -1) siblings.splice(existingIndex, 1);

                const adjustedTargetIndex = siblings.indexOf(targetId);
                const insertIndex = position === 'before' ? adjustedTargetIndex : adjustedTargetIndex + 1;
                siblings.splice(insertIndex, 0, draggedId);
                
                items[newParentId] = { ...items[newParentId], children: siblings };
                items[draggedId] = { ...draggedItem, parentId: newParentId };
            }
        }
        return { items };
    });
  },

  setViewMode: (mode) => set({ viewMode: mode }),
  setBinderSearchTerm: (term) => set({ binderSearchTerm: term }),
  setHoistedItemId: (id) => set({ hoistedItemId: id }),
  setBinderTab: (tab) => set({ binderTab: tab }),
  updateBinderSettings: (settings) => set((state) => ({ binderSettings: { ...state.binderSettings, ...settings } })),
  
  toggleBookmark: (id) => set(state => {
      const bookmarks = state.projectBookmarks.includes(id)
          ? state.projectBookmarks.filter(b => b !== id)
          : [...state.projectBookmarks, id];
      return { projectBookmarks: bookmarks };
  }),

  mergeItems: (targetId, sourceIds) => set(state => {
      const items = { ...state.items };
      const target = items[targetId];
      if (!target) return state;

      let newContent = target.content || '';

      sourceIds.forEach(id => {
          if (id === targetId) return;
          const source = items[id];
          if (source && source.content) {
              newContent += `<br/><div class="merge-separator" style="text-align:center; color:#ccc; margin: 20px 0;">***</div><br/>` + source.content;
          }
          if (source.parentId && items[source.parentId]) {
               items[source.parentId] = {
                   ...items[source.parentId],
                   children: items[source.parentId].children?.filter(childId => childId !== id)
               };
          }
          delete items[id];
      });

      items[targetId] = { ...target, content: newContent };
      
      return { items, selectedItemIds: [targetId], selectedItemId: targetId };
  }),

  splitItem: (id, contentBefore, contentAfter, splitTitle) => set(state => {
      const items = { ...state.items };
      const original = items[id];
      if (!original || !original.parentId) return state;

      items[id] = { ...original, content: contentBefore };

      const newId = generateId();
      const newItem: BinderItem = {
          ...original,
          id: newId,
          title: splitTitle,
          content: contentAfter,
          children: [] 
      };

      items[newId] = newItem;

      const parent = items[original.parentId];
      const siblings = [...(parent.children || [])];
      const idx = siblings.indexOf(id);
      if (idx !== -1) {
          siblings.splice(idx + 1, 0, newId);
          items[original.parentId] = { ...parent, children: siblings };
      }

      return { items, selectedItemId: newId, selectedItemIds: [newId] };
  }),

  importAndSplit: (parentId, content, separator) => set(state => {
      const items = { ...state.items };
      // Regex split based on separator. If separator is '#', split by it.
      // Use capture groups to keep delimiter if needed, but for now simple split.
      const parts = content.split(separator).filter(p => p.trim().length > 0);
      
      const newIds: string[] = [];

      parts.forEach((part, index) => {
          const lines = part.trim().split('\n');
          const title = lines[0] || `Imported Section ${index + 1}`;
          const body = lines.slice(1).join('\n') || ''; // Content is rest
          const htmlContent = body.split('\n').map(l => `<p>${l}</p>`).join('');

          const newId = generateId();
          items[newId] = {
              id: newId,
              parentId: parentId,
              title: title.length > 50 ? title.substring(0, 50) + '...' : title,
              type: ItemType.TEXT,
              content: htmlContent,
              status: 'To Do',
              children: []
          };
          newIds.push(newId);
      });

      // Update parent
      if (items[parentId]) {
          items[parentId] = {
              ...items[parentId],
              children: [...(items[parentId].children || []), ...newIds],
              expanded: true
          };
      }

      return { items };
  }),

  setSyncSettings: (id, settings) => set(state => {
      const items = { ...state.items };
      if (items[id]) {
          items[id] = { ...items[id], externalSync: settings };
      }
      return { items };
  })
}));