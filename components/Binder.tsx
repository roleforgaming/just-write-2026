import React from 'react';
import { useAppStore } from '../store';
import { BinderItem, ItemType } from '../types';
import { ChevronRight, ChevronDown, Folder, FileText, Map, Clock, MoreHorizontal } from 'lucide-react';

interface BinderItemRowProps {
  item: BinderItem;
  level: number;
}

const BinderItemRow: React.FC<BinderItemRowProps> = ({ item, level }) => {
  const { selectedItemId, selectItem, setBinderItemExpanded, items } = useAppStore();
  const isSelected = selectedItemId === item.id;
  const hasChildren = item.children && item.children.length > 0;

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setBinderItemExpanded(item.id, !item.expanded);
  };

  const Icon = () => {
    if (item.type === ItemType.FOLDER) return <Folder size={16} className="text-blue-400" />;
    if (item.type === ItemType.MINDMAP) return <Map size={16} className="text-purple-400" />;
    if (item.type === ItemType.TIMELINE) return <Clock size={16} className="text-orange-400" />;
    return <FileText size={16} className="text-gray-500" />;
  };

  return (
    <div>
      <div
        className={`flex items-center py-1 px-2 cursor-pointer select-none group transition-colors ${
          isSelected ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-100' : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
        }`}
        style={{ paddingLeft: `${level * 12 + 8}px` }}
        onClick={() => selectItem(item.id)}
      >
        <div className="w-4 h-4 mr-1 flex items-center justify-center text-gray-400 hover:text-gray-600">
          {hasChildren && (
            <div onClick={handleToggle}>
              {item.expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            </div>
          )}
        </div>
        <div className="mr-2">
          <Icon />
        </div>
        <span className="text-sm truncate flex-1">{item.title}</span>
        <div className="opacity-0 group-hover:opacity-100">
             <MoreHorizontal size={14} className="text-gray-400" />
        </div>
      </div>
      {item.expanded && item.children && (
        <div>
          {item.children.map((childId) => {
            const child = items[childId];
            return child ? <BinderItemRow key={childId} item={child} level={level + 1} /> : null;
          })}
        </div>
      )}
    </div>
  );
};

export const Binder = () => {
  const { items, rootItems } = useAppStore();

  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-[#202020] border-r border-gray-200 dark:border-gray-800">
      <div className="p-3 border-b border-gray-200 dark:border-gray-800 font-semibold text-xs text-gray-500 uppercase tracking-wider">
        Binder
      </div>
      <div className="flex-1 overflow-y-auto py-2 custom-scrollbar">
        {rootItems.map((rootId) => {
            const rootItem = items[rootId];
            return rootItem ? <BinderItemRow key={rootId} item={rootItem} level={0} /> : null;
        })}
      </div>
      <div className="p-2 border-t border-gray-200 dark:border-gray-800 flex gap-2 justify-end">
          {/* Toolbar for quick adds could go here */}
      </div>
    </div>
  );
};