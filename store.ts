
import { create } from 'zustand';
import { AppState, BinderItem, ItemType, ViewMode } from './types';
import { v4 as uuidv4 } from 'uuid'; 

const generateId = () => Math.random().toString(36).substr(2, 9);

const INITIAL_ITEMS: Record<string, BinderItem> = {
  'root-draft': { id: 'root-draft', parentId: null, title: 'Draft', type: ItemType.FOLDER, expanded: true, children: ['ch-1', 'ch-2'] },
  'ch-1': { 
      id: 'ch-1', 
      parentId: 'root-draft', 
      title: 'Chapter 1: The Beginning', 
      type: ItemType.FOLDER, 
      expanded: true, 
      children: ['scene-1-1'], 
      status: 'Done', 
      label: 'Chapter', 
      hasSnapshots: true,
      keywords: ['Protagonist', 'Inciting Incident'],
      wordCount: 1250,
      wordCountTarget: 3000,
      modifiedDate: new Date('2023-10-01')
  },
  'scene-1-1': { 
      id: 'scene-1-1', 
      parentId: 'ch-1', 
      title: 'The Incident', 
      type: ItemType.TEXT, 
      content: '<p>It was a dark and stormy night...</p>', 
      synopsis: 'Hero meets the villain in a dimly lit tavern. Sparks fly, literally and metaphorically.', 
      status: 'Done', 
      label: 'Scene', 
      wordCount: 1250,
      wordCountTarget: 1500, 
      hasComments: true,
      keywords: ['Action', 'Rain'],
      modifiedDate: new Date('2023-10-01'),
      customMetadata: { 'pov': 'Hero' }
  },
  'ch-2': { 
      id: 'ch-2', 
      parentId: 'root-draft', 
      title: 'Chapter 2: The Journey', 
      type: ItemType.FOLDER, 
      expanded: false, 
      children: [], 
      status: 'In Progress', 
      label: 'Chapter',
      wordCount: 0,
      wordCountTarget: 3000,
      modifiedDate: new Date('2023-10-02')
  },
  
  'root-research': { id: 'root-research', parentId: null, title: 'Research', type: ItemType.FOLDER, expanded: true, children: ['res-1'] },
  'res-1': { id: 'res-1', parentId: 'root-research', title: 'Historical Context', type: ItemType.TEXT, content: 'Notes on 1920s architecture.', status: 'To Do', label: 'Idea', icon: 'lightbulb', modifiedDate: new Date() },
  
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
  viewRootId: 'root-draft', // Initial view root matches selection
  
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
  
  corkboardSettings: {
      mode: 'grid',
      cardSize: 2,
      ratio: '3:5',
      showStatus: true,
      showKeywords: true,
      showLabel: true
  },

  outlinerSettings: {
      columns: [
          { id: 'title', label: 'Title', visible: true, width: '3fr' },
          { id: 'synopsis', label: 'Synopsis', visible: true, width: '4fr' },
          { id: 'label', label: 'Label', visible: true, width: '120px' },
          { id: 'status', label: 'Status', visible: true, width: '120px' },
          { id: 'wordCount', label: 'Words', visible: true, width: '80px' },
          { id: 'progress', label: 'Target', visible: true, width: '140px' },
          { id: 'modifiedDate', label: 'Modified', visible: false, width: '120px' },
          { id: 'pov', label: 'POV', visible: true, width: '100px', isCustom: true }
      ],
      sortBy: null,
      sortDirection: 'asc'
  },
  
  customMetadataFields: [
      { id: 'pov', name: 'POV', type: 'text' }
  ],

  projectBookmarks: [],

  createProject: (name) => {
    set({ currentView: 'workspace', activeProjectId: generateId() });
  },

  openProject: (id) => {
    set({ currentView: 'workspace', activeProjectId: id });
  },

  selectItem: (id, multi = false, range = false, autoSwitchView = true) => {
    const state = get();
    const item = state.items[id];
    if (!item) return;

    let newSelectedIds = [...state.selectedItemIds];
    
    if (multi) {
        if (newSelectedIds.includes(id)) {
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

    let mode = state.viewMode;
    // Don't auto-switch if we are already in outliner, unless autoSwitchView forces logic
    if (autoSwitchView) {
        if (mode !== 'outliner') {
            if (!multi && !range && newSelectedIds.length === 1) {
                if (item.type === ItemType.MINDMAP) mode = 'mindmap';
                else if (item.type === ItemType.TIMELINE) mode = 'timeline';
                else if (item.type === ItemType.FOLDER && mode === 'editor') mode = 'corkboard'; 
                else if (item.type === ItemType.TEXT) mode = 'editor';
            }
        }
    }

    set({ 
        selectedItemId: id, 
        selectedItemIds: newSelectedIds,
        viewMode: mode 
    });
  },

  setViewRoot: (id) => set({ viewRootId: id }),

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
        [id]: { 
            ...state.items[id], 
            ...updates,
            modifiedDate: new Date()
        },
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
      status: 'To Do',
      createdDate: new Date(),
      modifiedDate: new Date(),
      wordCount: 0,
      corkboard: { x: Math.random() * 400, y: Math.random() * 400 } // Random pos for freeform
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

        const oldParentId = draggedItem.parentId;
        if (oldParentId && items[oldParentId]) {
            items[oldParentId] = {
                ...items[oldParentId],
                children: items[oldParentId].children?.filter(id => id !== draggedId) || []
            };
        }

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
      let mergedWordCount = target.wordCount || 0;

      sourceIds.forEach(id => {
          if (id === targetId) return;
          const source = items[id];
          if (source && source.content) {
              newContent += `<br/><div class="merge-separator" style="text-align:center; color:#ccc; margin: 20px 0;">***</div><br/>` + source.content;
              mergedWordCount += (source.wordCount || 0);
          }
          if (source.parentId && items[source.parentId]) {
               items[source.parentId] = {
                   ...items[source.parentId],
                   children: items[source.parentId].children?.filter(childId => childId !== id)
               };
          }
          delete items[id];
      });

      items[targetId] = { ...target, content: newContent, wordCount: mergedWordCount, modifiedDate: new Date() };
      
      return { items, selectedItemIds: [targetId], selectedItemId: targetId };
  }),

  splitItem: (id, contentBefore, contentAfter, splitTitle) => set(state => {
      const items = { ...state.items };
      const original = items[id];
      if (!original || !original.parentId) return state;

      const countBefore = contentBefore.replace(/<[^>]*>/g, '').split(/\s+/).filter(w => w.length > 0).length;
      const countAfter = contentAfter.replace(/<[^>]*>/g, '').split(/\s+/).filter(w => w.length > 0).length;

      items[id] = { ...original, content: contentBefore, wordCount: countBefore, modifiedDate: new Date() };

      const newId = generateId();
      const newItem: BinderItem = {
          ...original,
          id: newId,
          title: splitTitle,
          content: contentAfter,
          children: [],
          wordCount: countAfter,
          modifiedDate: new Date()
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
      const parts = content.split(separator).filter(p => p.trim().length > 0);
      const newIds: string[] = [];

      parts.forEach((part, index) => {
          const lines = part.trim().split('\n');
          const title = lines[0] || `Imported Section ${index + 1}`;
          const body = lines.slice(1).join('\n') || '';
          const htmlContent = body.split('\n').map(l => `<p>${l}</p>`).join('');
          const wordCount = body.split(/\s+/).filter(w => w.length > 0).length;

          const newId = generateId();
          items[newId] = {
              id: newId,
              parentId: parentId,
              title: title.length > 50 ? title.substring(0, 50) + '...' : title,
              type: ItemType.TEXT,
              content: htmlContent,
              status: 'To Do',
              children: [],
              wordCount: wordCount,
              createdDate: new Date(),
              modifiedDate: new Date(),
              corkboard: { x: Math.random() * 400, y: Math.random() * 400 }
          };
          newIds.push(newId);
      });

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
  }),

  updateCorkboardSettings: (settings) => set(state => ({
      corkboardSettings: { ...state.corkboardSettings, ...settings }
  })),

  setCorkboardPosition: (id, x, y) => set(state => {
      const items = { ...state.items };
      if (items[id]) {
          items[id] = {
              ...items[id],
              corkboard: { x, y }
          };
      }
      return { items };
  }),

  commitFreeformOrder: (parentId) => set(state => {
      // Reorder children based on X, Y visual position
      const items = { ...state.items };
      const parent = items[parentId];
      if (!parent || !parent.children) return state;

      const sortedChildren = [...parent.children].sort((aId, bId) => {
          const a = items[aId].corkboard || { x: 0, y: 0 };
          const b = items[bId].corkboard || { x: 0, y: 0 };
          if (Math.abs(a.y - b.y) > 50) return a.y - b.y;
          return a.x - b.x;
      });

      items[parentId] = { ...parent, children: sortedChildren };
      return { items };
  }),

  updateOutlinerSettings: (settings) => set(state => ({
      outlinerSettings: { ...state.outlinerSettings, ...settings }
  })),

  toggleOutlinerColumn: (columnId) => set(state => {
      const columns = state.outlinerSettings.columns.map(col => {
          if (col.id === columnId) return { ...col, visible: !col.visible };
          return col;
      });
      return { outlinerSettings: { ...state.outlinerSettings, columns } };
  }),

  setOutlinerSort: (columnId) => set(state => {
      const currentSort = state.outlinerSettings.sortBy;
      const currentDir = state.outlinerSettings.sortDirection;
      
      let newDir: 'asc' | 'desc' = 'asc';
      if (currentSort === columnId) {
          if (currentDir === 'asc') newDir = 'desc';
          else {
              return { outlinerSettings: { ...state.outlinerSettings, sortBy: null } }; // Toggle off
          }
      }

      return { outlinerSettings: { ...state.outlinerSettings, sortBy: columnId, sortDirection: newDir } };
  }),

  addCustomMetadataField: (field) => set(state => {
      const fields = [...state.customMetadataFields, field];
      const newCol = { 
          id: field.id, 
          label: field.name, 
          visible: true, 
          width: '100px', 
          isCustom: true 
      };
      const columns = [...state.outlinerSettings.columns, newCol];
      return { customMetadataFields: fields, outlinerSettings: { ...state.outlinerSettings, columns } };
  })
}));
