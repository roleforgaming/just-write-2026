
import React, { useState, useMemo, useEffect } from 'react';
import { useAppStore } from '../store';
import { BinderItem, ItemType } from '../types';
import { 
    ChevronRight, 
    ChevronDown, 
    Folder, 
    FileText, 
    Map, 
    Clock, 
    Search,
    Trash2,
    ArrowUpFromLine,
    ArrowLeft,
    Lightbulb,
    User,
    MapPin,
    Flag,
    CheckCircle,
    CircleDot,
    Settings,
    Layers,
    History,
    MessageSquare,
    Bookmark,
    Combine,
    Plus,
    Upload,
    RefreshCw,
    FolderInput
} from 'lucide-react';

/* --- ICONS MAP --- */
const IconsMap: Record<string, any> = {
    'folder': Folder,
    'file-text': FileText,
    'map': Map,
    'clock': Clock,
    'lightbulb': Lightbulb,
    'user': User,
    'map-pin': MapPin,
    'flag': Flag
};

/* --- COLOR UTILS --- */
const getLabelColor = (label?: string, opacity: 'bg' | 'text' | 'dot' = 'bg') => {
    if (!label) return '';
    
    // Map labels to base tailwind colors
    const map: Record<string, string> = {
        'Chapter': 'blue',
        'Scene': 'green',
        'Character': 'purple',
        'Location': 'orange',
        'Idea': 'yellow'
    };
    
    const color = map[label];
    if (!color) return '';

    if (opacity === 'bg') return `bg-${color}-100 dark:bg-${color}-900/30`;
    if (opacity === 'text') return `text-${color}-600 dark:text-${color}-400`;
    if (opacity === 'dot') return `bg-${color}-500`;
    
    return '';
};

const getStatusIcon = (status?: string) => {
    switch(status) {
        case 'Done': return <CheckCircle size={10} className="text-green-500" />;
        case 'In Progress': return <CircleDot size={10} className="text-yellow-500" />;
        default: return null;
    }
};

/* --- DIALOGS --- */
const ImportModal = ({ parentId, onClose }: { parentId: string, onClose: () => void }) => {
    const { importAndSplit } = useAppStore();
    const [content, setContent] = useState('');
    const [separator, setSeparator] = useState('#');

    const handleImport = () => {
        if (!content) return;
        importAndSplit(parentId, content, separator);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[100] bg-black/50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-[#202020] rounded-xl shadow-2xl w-full max-w-lg border border-gray-200 dark:border-gray-700 flex flex-col max-h-[90vh]">
                <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
                    <h3 className="font-semibold text-gray-800 dark:text-gray-100">Import & Split</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">✕</button>
                </div>
                <div className="p-4 flex-1 flex flex-col gap-4 overflow-hidden">
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                        Paste your document below. We will split it into separate documents based on the separator you define.
                    </div>
                    <div className="flex gap-2 items-center">
                        <label className="text-xs font-bold uppercase text-gray-400">Split At Symbol:</label>
                        <input 
                            className="bg-gray-100 dark:bg-[#333] border border-gray-200 dark:border-gray-600 rounded px-2 py-1 text-sm w-24 outline-none focus:border-blue-500"
                            value={separator}
                            onChange={(e) => setSeparator(e.target.value)}
                        />
                    </div>
                    <textarea 
                        className="flex-1 bg-gray-50 dark:bg-[#2a2a2a] border border-gray-200 dark:border-gray-600 rounded p-3 text-sm outline-none resize-none focus:border-blue-500"
                        placeholder="Paste text here..."
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                    />
                </div>
                <div className="p-4 border-t border-gray-100 dark:border-gray-700 flex justify-end gap-2">
                    <button onClick={onClose} className="px-4 py-2 rounded text-sm text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-[#333]">Cancel</button>
                    <button onClick={handleImport} className="px-4 py-2 rounded text-sm bg-blue-600 text-white hover:bg-blue-700 shadow">Import</button>
                </div>
            </div>
        </div>
    );
};

const SyncModal = ({ item, onClose }: { item: BinderItem, onClose: () => void }) => {
    const { setSyncSettings } = useAppStore();
    const [path, setPath] = useState(item.externalSync?.path || 'C:\\Users\\Documents\\My Novel\\Draft');
    const [enabled, setEnabled] = useState<boolean>(item.externalSync?.enabled ?? true);

    const handleSave = () => {
        setSyncSettings(item.id, {
            enabled,
            path,
            lastSync: new Date()
        });
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[100] bg-black/50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-[#202020] rounded-xl shadow-2xl w-full max-w-md border border-gray-200 dark:border-gray-700">
                <div className="p-4 border-b border-gray-100 dark:border-gray-700">
                    <h3 className="font-semibold text-gray-800 dark:text-gray-100">Sync with External Folder</h3>
                </div>
                <div className="p-4 gap-4 flex flex-col">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Map this folder to a location on your hard drive. Files will be exported as text files, and changes made externally will sync back.
                    </p>
                    <div className="flex flex-col gap-1">
                        <label className="text-xs font-bold uppercase text-gray-400">Folder Path</label>
                        <div className="flex gap-2">
                             <input 
                                className="flex-1 bg-gray-100 dark:bg-[#333] border border-gray-200 dark:border-gray-600 rounded px-2 py-1 text-sm outline-none focus:border-blue-500 text-gray-600 dark:text-gray-300"
                                value={path}
                                onChange={(e) => setPath(e.target.value)}
                            />
                            <button className="p-1 bg-gray-200 dark:bg-[#444] rounded text-gray-500"><FolderInput size={16} /></button>
                        </div>
                    </div>
                    <label className="flex items-center gap-2 cursor-pointer mt-2">
                        <input type="checkbox" checked={enabled} onChange={e => setEnabled(e.target.checked)} />
                        <span className="text-sm text-gray-700 dark:text-gray-300">Enable Sync</span>
                    </label>
                </div>
                <div className="p-4 border-t border-gray-100 dark:border-gray-700 flex justify-end gap-2">
                    <button onClick={onClose} className="px-4 py-2 rounded text-sm text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-[#333]">Cancel</button>
                    <button onClick={handleSave} className="px-4 py-2 rounded text-sm bg-blue-600 text-white hover:bg-blue-700 shadow">Save Settings</button>
                </div>
            </div>
        </div>
    );
};

/* --- CONTEXT MENU --- */
interface ContextMenuProps {
    x: number;
    y: number;
    itemId: string;
    onClose: () => void;
    onImport: () => void;
    onSync: () => void;
}

const ContextMenu: React.FC<ContextMenuProps> = ({ x, y, itemId, onClose, onImport, onSync }) => {
    const { updateItem, setHoistedItemId, deleteItem, selectedItemIds, mergeItems, toggleBookmark, projectBookmarks, addItem, items } = useAppStore();
    const isMultiSelect = selectedItemIds.length > 1;
    const isBookmarked = projectBookmarks.includes(itemId);
    const item = items[itemId];

    const handleAction = (action: () => void) => {
        action();
        onClose();
    };

    return (
        <div 
            className="fixed z-50 w-52 bg-white dark:bg-[#252525] border border-gray-200 dark:border-gray-700 shadow-xl rounded-lg py-1 text-sm text-gray-700 dark:text-gray-200"
            style={{ top: y, left: x }}
        >
            <div className="px-2 py-1 text-xs text-gray-400 font-semibold uppercase">Actions</div>
            
            <button onClick={() => handleAction(() => addItem(itemId, ItemType.TEXT, 'New Text'))} className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-[#333] flex items-center gap-2">
                <Plus size={14} /> Add New Item
            </button>

            {!isMultiSelect && (
                <>
                <button onClick={() => handleAction(onImport)} className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-[#333] flex items-center gap-2">
                    <Upload size={14} /> Import & Split...
                </button>
                {item.type === ItemType.FOLDER && (
                    <button onClick={() => handleAction(onSync)} className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-[#333] flex items-center gap-2">
                        <RefreshCw size={14} /> Sync with External...
                    </button>
                )}
                <div className="border-t border-gray-100 dark:border-gray-700 my-1"></div>
                <button onClick={() => handleAction(() => setHoistedItemId(itemId))} className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-[#333] flex items-center gap-2">
                    <ArrowUpFromLine size={14} /> Hoist Binder
                </button>
                <button onClick={() => handleAction(() => toggleBookmark(itemId))} className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-[#333] flex items-center gap-2">
                    <Bookmark size={14} className={isBookmarked ? 'fill-current' : ''} /> {isBookmarked ? 'Remove Bookmark' : 'Bookmark'}
                </button>
                </>
            )}

            {isMultiSelect && (
                 <button onClick={() => handleAction(() => mergeItems(selectedItemIds[0], selectedItemIds))} className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-[#333] flex items-center gap-2">
                    <Combine size={14} /> Merge Selected
                </button>
            )}

            <div className="border-t border-gray-100 dark:border-gray-700 my-1"></div>
            <div className="px-2 py-1 text-xs text-gray-400 font-semibold uppercase">Status</div>
            <button onClick={() => handleAction(() => updateItem(itemId, { status: 'To Do' }))} className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-[#333]">To Do</button>
            <button onClick={() => handleAction(() => updateItem(itemId, { status: 'In Progress' }))} className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-[#333]">In Progress</button>
            <button onClick={() => handleAction(() => updateItem(itemId, { status: 'Done' }))} className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-[#333]">Done</button>
            <div className="border-t border-gray-100 dark:border-gray-700 my-1"></div>
            <button onClick={() => handleAction(() => deleteItem(itemId))} className="w-full text-left px-4 py-2 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 flex items-center gap-2">
                <Trash2 size={14} /> Move to Trash
            </button>
        </div>
    );
};

/* --- BINDER SETTINGS MENU --- */
const BinderSettingsMenu = ({ onClose }: { onClose: () => void }) => {
    const { binderSettings, updateBinderSettings } = useAppStore();
    
    return (
        <div className="absolute top-10 right-2 z-50 w-56 bg-white dark:bg-[#252525] border border-gray-200 dark:border-gray-700 shadow-xl rounded-lg p-3 text-sm animate-in fade-in zoom-in-95 duration-100">
             <div className="font-semibold text-gray-700 dark:text-gray-200 mb-2 border-b border-gray-100 dark:border-gray-700 pb-1">Visual Options</div>
             
             <div className="mb-3">
                 <div className="text-xs text-gray-500 mb-1">Label Tinting</div>
                 <select 
                    className="w-full text-xs bg-gray-100 dark:bg-[#333] border-none rounded p-1"
                    value={binderSettings.labelTint}
                    onChange={(e) => updateBinderSettings({ labelTint: e.target.value as any })}
                 >
                     <option value="none">None</option>
                     <option value="row">Full Row</option>
                     <option value="icon">Icon Only</option>
                     <option value="dot">Dot Indicator</option>
                 </select>
             </div>
             
             <div className="space-y-2">
                 <label className="flex items-center gap-2 cursor-pointer">
                     <input 
                        type="checkbox" 
                        checked={binderSettings.showIcons} 
                        onChange={(e) => updateBinderSettings({ showIcons: e.target.checked })}
                    />
                     <span>Show Icons</span>
                 </label>
                 <label className="flex items-center gap-2 cursor-pointer">
                     <input 
                        type="checkbox" 
                        checked={binderSettings.showStatus} 
                        onChange={(e) => updateBinderSettings({ showStatus: e.target.checked })}
                    />
                     <span>Show Status Stamps</span>
                 </label>
             </div>
             
             <button onClick={onClose} className="mt-3 w-full bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 py-1 rounded text-xs">Close</button>
        </div>
    );
};

/* --- BINDER ITEM ROW --- */
interface BinderItemRowProps {
  item: BinderItem;
  level: number;
  onContextMenu: (e: React.MouseEvent, itemId: string) => void;
}

const BinderItemRow: React.FC<BinderItemRowProps> = ({ item, level, onContextMenu }) => {
  const { selectedItemIds, selectItem, setBinderItemExpanded, items, moveItem, binderSearchTerm, binderSettings, setViewRoot } = useAppStore();
  const isSelected = selectedItemIds.includes(item.id);
  const hasChildren = item.children && item.children.length > 0;
  
  const [dragOverPosition, setDragOverPosition] = useState<'before' | 'inside' | 'after' | null>(null);

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setBinderItemExpanded(item.id, !item.expanded);
  };

  const handleClick = (e: React.MouseEvent) => {
      if (e.ctrlKey || e.metaKey) {
          selectItem(item.id, true, false);
      } else if (e.shiftKey) {
          selectItem(item.id, true, true);
      } else {
          selectItem(item.id, false, false, true); // Auto switch view
          // Also set as the View Root for navigation
          setViewRoot(item.id);
      }
  };

  const IconComponent = item.icon ? IconsMap[item.icon] : (
      item.type === ItemType.FOLDER ? Folder : 
      item.type === ItemType.MINDMAP ? Map : 
      item.type === ItemType.TIMELINE ? Clock : 
      item.type === ItemType.TRASH ? Trash2 : FileText
  );

  // Drag Handlers
  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('application/json', JSON.stringify({ id: item.id, title: item.title }));
    e.dataTransfer.effectAllowed = 'all';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (item.id.startsWith('root') && item.type !== ItemType.FOLDER && item.type !== ItemType.TRASH) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const y = e.clientY - rect.top;
    const height = rect.height;

    if (y < height * 0.25) setDragOverPosition('before');
    else if (y > height * 0.75) setDragOverPosition('after');
    else setDragOverPosition('inside');
  };

  const handleDragLeave = () => {
    setDragOverPosition(null);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverPosition(null);
    try {
        const data = JSON.parse(e.dataTransfer.getData('application/json'));
        if (data.id && dragOverPosition) {
            moveItem(data.id, item.id, dragOverPosition);
        }
    } catch (err) {}
  };

  const getDropStyle = () => {
      if (dragOverPosition === 'before') return 'border-t-2 border-blue-500';
      if (dragOverPosition === 'after') return 'border-b-2 border-blue-500';
      if (dragOverPosition === 'inside') return 'bg-blue-50 dark:bg-blue-900/40 ring-2 ring-inset ring-blue-500';
      return 'border-transparent border-y-2'; 
  };

  // Visual Customization Logic
  let rowClass = `flex items-center py-1 px-2 cursor-pointer select-none group transition-colors ${getDropStyle()} `;
  let iconClass = item.type === ItemType.FOLDER ? 'text-blue-400' : 'text-gray-500 dark:text-gray-400';
  
  if (isSelected) {
      rowClass += 'bg-blue-600 text-white ';
      iconClass = 'text-white';
  } else {
      if (binderSettings.labelTint === 'row') {
          const tint = getLabelColor(item.label, 'bg');
          if (tint) rowClass += `${tint} `;
          else rowClass += 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 ';
      } else {
          rowClass += 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 ';
      }

      if (binderSettings.labelTint === 'icon') {
          const tint = getLabelColor(item.label, 'text');
          if (tint) iconClass = tint;
      }
  }

  return (
    <div>
      <div
        draggable
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onContextMenu={(e) => onContextMenu(e, item.id)}
        className={rowClass}
        style={{ paddingLeft: `${level * 12 + 8}px` }}
        onClick={handleClick}
      >
        <div className="w-4 h-4 mr-1 flex items-center justify-center opacity-70 hover:opacity-100">
          {hasChildren && (
            <div onClick={handleToggle}>
              {item.expanded || binderSearchTerm ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
            </div>
          )}
        </div>
        
        {binderSettings.showIcons && (
            <div className="mr-2 relative flex-shrink-0">
            <IconComponent size={14} className={iconClass} />
            {binderSettings.showStatus && (
                <div className="absolute -bottom-1 -right-1 bg-white dark:bg-[#202020] rounded-full">
                    {getStatusIcon(item.status)}
                </div>
            )}
            </div>
        )}

        {binderSettings.labelTint === 'dot' && !isSelected && item.label && (
             <div className={`w-2 h-2 rounded-full mr-2 ${getLabelColor(item.label, 'dot')}`} />
        )}

        <span className="text-sm truncate flex-1">{item.title}</span>
        
        {/* Indicators: Snapshots, Comments, etc */}
        <div className="flex items-center gap-1 ml-2 opacity-60">
            {item.externalSync?.enabled && <RefreshCw size={10} className={isSelected ? 'text-white' : 'text-blue-500'} />}
            {item.hasSnapshots && <History size={10} className={isSelected ? 'text-white' : 'text-gray-400'} />}
            {item.hasComments && <MessageSquare size={10} className={isSelected ? 'text-white' : 'text-gray-400'} />}
        </div>
      </div>
      {(item.expanded || binderSearchTerm) && item.children && (
        <div>
          {item.children.map((childId) => {
            const child = items[childId];
            return child ? <BinderItemRow key={childId} item={child} level={level + 1} onContextMenu={onContextMenu} /> : null;
          })}
        </div>
      )}
    </div>
  );
};

/* --- MAIN BINDER COMPONENT --- */
export const Binder = () => {
  const { items, rootItems, binderSearchTerm, setBinderSearchTerm, hoistedItemId, setHoistedItemId, binderTab, setBinderTab } = useAppStore();
  const [contextMenu, setContextMenu] = useState<{x: number, y: number, itemId: string} | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [syncModalOpen, setSyncModalOpen] = useState(false);
  const [activeActionItemId, setActiveActionItemId] = useState<string | null>(null);

  const filterTree = (itemId: string): boolean => {
      if (!binderSearchTerm) return true;
      const item = items[itemId];
      if (!item) return false;
      if (item.title.toLowerCase().includes(binderSearchTerm.toLowerCase())) return true;
      if (item.children) {
          return item.children.some(childId => filterTree(childId));
      }
      return false;
  };

  const visibleRootIds = useMemo(() => {
      if (hoistedItemId) return [hoistedItemId];
      if (binderSearchTerm) {
          return rootItems.filter(id => filterTree(id));
      }
      return rootItems;
  }, [items, rootItems, binderSearchTerm, hoistedItemId]);

  const handleContextMenu = (e: React.MouseEvent, itemId: string) => {
      e.preventDefault();
      setContextMenu({ x: e.clientX, y: e.clientY, itemId });
  };

  const handleImportTrigger = () => {
      if (contextMenu) {
          setActiveActionItemId(contextMenu.itemId);
          setImportModalOpen(true);
      }
  };

  const handleSyncTrigger = () => {
      if (contextMenu) {
          setActiveActionItemId(contextMenu.itemId);
          setSyncModalOpen(true);
      }
  };

  useEffect(() => {
      const handleClick = () => {
          setContextMenu(null);
      };
      window.addEventListener('click', handleClick);
      return () => window.removeEventListener('click', handleClick);
  }, []);

  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-[#202020] border-r border-gray-200 dark:border-gray-800">
      {/* Tabs */}
      <div className="flex border-b border-gray-200 dark:border-gray-800">
          <button 
            onClick={() => setBinderTab('binder')}
            className={`flex-1 py-2 text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-2 ${binderTab === 'binder' ? 'bg-white dark:bg-[#2a2a2a] text-blue-600 dark:text-blue-400 border-b-2 border-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
          >
              <Folder size={12} /> Binder
          </button>
          <button 
            onClick={() => setBinderTab('collections')}
            className={`flex-1 py-2 text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-2 ${binderTab === 'collections' ? 'bg-white dark:bg-[#2a2a2a] text-purple-600 dark:text-purple-400 border-b-2 border-purple-600' : 'text-gray-400 hover:text-gray-600'}`}
          >
              <Layers size={12} /> Collections
          </button>
      </div>

      {binderTab === 'binder' ? (
      <>
        <div className="p-3 border-b border-gray-200 dark:border-gray-800 flex flex-col gap-2 relative">
            <div className="flex justify-between items-center">
                 <div className="flex gap-2">
                    {hoistedItemId && (
                        <button onClick={() => setHoistedItemId(null)} className="text-blue-500 flex items-center gap-1 hover:underline text-xs">
                            <ArrowLeft size={10} /> Unhoist
                        </button>
                    )}
                 </div>
                 <button onClick={() => setSettingsOpen(!settingsOpen)} className="text-gray-400 hover:text-gray-600">
                     <Settings size={14} />
                 </button>
            </div>
            
            {settingsOpen && <BinderSettingsMenu onClose={() => setSettingsOpen(false)} />}

            <div className="relative">
                <Search size={12} className="absolute left-2 top-2 text-gray-400" />
                <input 
                    className="w-full bg-white dark:bg-[#2a2a2a] border border-gray-200 dark:border-gray-700 rounded py-1 pl-7 pr-2 text-xs outline-none focus:border-blue-500"
                    placeholder="Filter..."
                    value={binderSearchTerm}
                    onChange={(e) => setBinderSearchTerm(e.target.value)}
                />
            </div>
        </div>

        <div className="flex-1 overflow-y-auto py-2 custom-scrollbar">
            {visibleRootIds.map((rootId) => {
                const rootItem = items[rootId];
                if (rootItem && (binderSearchTerm ? filterTree(rootId) : true)) {
                    return <BinderItemRow key={rootId} item={rootItem} level={0} onContextMenu={handleContextMenu} />;
                }
                return null;
            })}
        </div>
        
        {contextMenu && (
            <ContextMenu 
                x={contextMenu.x} 
                y={contextMenu.y} 
                itemId={contextMenu.itemId} 
                onClose={() => setContextMenu(null)} 
                onImport={handleImportTrigger}
                onSync={handleSyncTrigger}
            />
        )}

        {importModalOpen && activeActionItemId && (
            <ImportModal parentId={activeActionItemId} onClose={() => setImportModalOpen(false)} />
        )}
        
        {syncModalOpen && activeActionItemId && items[activeActionItemId] && (
            <SyncModal item={items[activeActionItemId]} onClose={() => setSyncModalOpen(false)} />
        )}
      </>
      ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-400 p-6 text-center">
              <Layers size={32} className="mb-2 opacity-30" />
              <p className="text-sm">Collections allow you to create alternate lists of documents based on search results or manual organization.</p>
              <button className="mt-4 px-3 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">Create Collection</button>
          </div>
      )}
    </div>
  );
};
