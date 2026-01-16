import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useAppStore } from '../store';
import { BinderItem, ItemType } from '../types';
import { 
    ChevronRight, 
    ChevronDown, 
    Folder, 
    FileText, 
    Map, 
    Clock, 
    MoreHorizontal,
    Search,
    Trash2,
    ArrowUpFromLine,
    ArrowLeft,
    Lightbulb,
    User,
    MapPin,
    Flag,
    CheckCircle,
    Circle,
    CircleDot
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
const getLabelColor = (label?: string) => {
    switch(label) {
        case 'Chapter': return 'bg-blue-100 dark:bg-blue-900/40 text-blue-900 dark:text-blue-100';
        case 'Scene': return 'bg-green-100 dark:bg-green-900/40 text-green-900 dark:text-green-100';
        case 'Character': return 'bg-purple-100 dark:bg-purple-900/40 text-purple-900 dark:text-purple-100';
        case 'Location': return 'bg-orange-100 dark:bg-orange-900/40 text-orange-900 dark:text-orange-100';
        case 'Idea': return 'bg-yellow-100 dark:bg-yellow-900/40 text-yellow-900 dark:text-yellow-100';
        default: return 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300';
    }
};

const getStatusIcon = (status?: string) => {
    switch(status) {
        case 'Done': return <CheckCircle size={10} className="text-green-500" />;
        case 'In Progress': return <CircleDot size={10} className="text-yellow-500" />;
        default: return null;
    }
};

/* --- CONTEXT MENU --- */
interface ContextMenuProps {
    x: number;
    y: number;
    itemId: string;
    onClose: () => void;
}

const ContextMenu: React.FC<ContextMenuProps> = ({ x, y, itemId, onClose }) => {
    const { updateItem, setHoistedItemId, deleteItem } = useAppStore();

    const handleAction = (action: () => void) => {
        action();
        onClose();
    };

    return (
        <div 
            className="fixed z-50 w-48 bg-white dark:bg-[#252525] border border-gray-200 dark:border-gray-700 shadow-xl rounded-lg py-1 text-sm"
            style={{ top: y, left: x }}
        >
            <div className="px-2 py-1 text-xs text-gray-400 font-semibold uppercase">Actions</div>
            <button onClick={() => handleAction(() => setHoistedItemId(itemId))} className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-[#333] flex items-center gap-2">
                <ArrowUpFromLine size={14} /> Hoist Binder
            </button>
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

/* --- BINDER ITEM ROW --- */
interface BinderItemRowProps {
  item: BinderItem;
  level: number;
  onContextMenu: (e: React.MouseEvent, itemId: string) => void;
}

const BinderItemRow: React.FC<BinderItemRowProps> = ({ item, level, onContextMenu }) => {
  const { selectedItemId, selectItem, setBinderItemExpanded, items, moveItem, binderSearchTerm } = useAppStore();
  const isSelected = selectedItemId === item.id;
  const hasChildren = item.children && item.children.length > 0;
  
  const [dragOverPosition, setDragOverPosition] = useState<'before' | 'inside' | 'after' | null>(null);

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setBinderItemExpanded(item.id, !item.expanded);
  };

  const IconComponent = item.icon ? IconsMap[item.icon] : (
      item.type === ItemType.FOLDER ? Folder : 
      item.type === ItemType.MINDMAP ? Map : 
      item.type === ItemType.TIMELINE ? Clock : 
      item.type === ItemType.TRASH ? Trash2 : FileText
  );

  // Drag Handlers
  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('application/json', JSON.stringify({ id: item.id }));
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Don't allow dropping into trash or root items easily unless specific logic
    if (item.id.startsWith('root') && item.type !== ItemType.FOLDER && item.type !== ItemType.TRASH) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const y = e.clientY - rect.top;
    const height = rect.height;

    // Logic: Top 25% -> Before, Bottom 25% -> After, Middle -> Inside
    if (item.type === ItemType.FOLDER || item.type === ItemType.MINDMAP || item.type === ItemType.TRASH) {
        if (y < height * 0.25) setDragOverPosition('before');
        else if (y > height * 0.75) setDragOverPosition('after');
        else setDragOverPosition('inside');
    } else {
        if (y < height * 0.5) setDragOverPosition('before');
        else setDragOverPosition('after');
    }
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
    } catch (err) {
        console.error("Drop failed", err);
    }
  };

  const getDropStyle = () => {
      if (dragOverPosition === 'before') return 'border-t-2 border-blue-500';
      if (dragOverPosition === 'after') return 'border-b-2 border-blue-500';
      if (dragOverPosition === 'inside') return 'bg-blue-50 dark:bg-blue-900/40 ring-2 ring-inset ring-blue-500';
      return 'border-transparent border-y-2'; 
  };

  const labelColorClass = getLabelColor(item.label);

  return (
    <div>
      <div
        draggable
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onContextMenu={(e) => onContextMenu(e, item.id)}
        className={`flex items-center py-1 px-2 cursor-pointer select-none group transition-colors ${getDropStyle()} ${
          isSelected ? 'bg-blue-600 text-white' : labelColorClass
        }`}
        style={{ paddingLeft: `${level * 12 + 8}px` }}
        onClick={() => selectItem(item.id, true)}
      >
        <div className="w-4 h-4 mr-1 flex items-center justify-center opacity-70 hover:opacity-100">
          {hasChildren && (
            <div onClick={handleToggle}>
              {item.expanded || binderSearchTerm ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
            </div>
          )}
        </div>
        <div className="mr-2 relative">
          <IconComponent size={14} className={item.type === ItemType.FOLDER ? 'text-blue-400' : ''} />
          {/* Status Stamp Overlay */}
          <div className="absolute -bottom-1 -right-1 bg-white dark:bg-[#202020] rounded-full">
             {getStatusIcon(item.status)}
          </div>
        </div>
        <span className="text-sm truncate flex-1">{item.title}</span>
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
  const { items, rootItems, binderSearchTerm, setBinderSearchTerm, hoistedItemId, setHoistedItemId } = useAppStore();
  const [contextMenu, setContextMenu] = useState<{x: number, y: number, itemId: string} | null>(null);

  // Filter Logic:
  // If searching, show all items that match OR have a matching descendant.
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
      // If hoisted, only show hoisted item
      if (hoistedItemId) return [hoistedItemId];
      
      // If searching, filter roots
      if (binderSearchTerm) {
          return rootItems.filter(id => filterTree(id));
      }
      
      return rootItems;
  }, [items, rootItems, binderSearchTerm, hoistedItemId]);

  const handleContextMenu = (e: React.MouseEvent, itemId: string) => {
      e.preventDefault();
      setContextMenu({ x: e.clientX, y: e.clientY, itemId });
  };

  useEffect(() => {
      const handleClick = () => setContextMenu(null);
      window.addEventListener('click', handleClick);
      return () => window.removeEventListener('click', handleClick);
  }, []);

  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-[#202020] border-r border-gray-200 dark:border-gray-800">
      <div className="p-3 border-b border-gray-200 dark:border-gray-800 flex flex-col gap-2">
        <div className="font-semibold text-xs text-gray-500 uppercase tracking-wider flex justify-between items-center">
            <span>Binder</span>
            {hoistedItemId && (
                <button onClick={() => setHoistedItemId(null)} className="text-blue-500 flex items-center gap-1 hover:underline">
                    <ArrowLeft size={10} /> Unhoist
                </button>
            )}
        </div>
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
            // If searching and root matches filter (or children match), render it.
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
          />
      )}
    </div>
  );
};