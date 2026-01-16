import React from 'react';
import { useAppStore } from '../store';
import { Tag, Calendar, AlertCircle, BookOpen } from 'lucide-react';

export const Inspector = () => {
  const { selectedItemId, items, inspectorOpen, toggleInspector, updateItem } = useAppStore();
  
  if (!inspectorOpen) return null;
  
  const item = selectedItemId ? items[selectedItemId] : null;

  if (!item) return (
      <div className="w-72 border-l border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#202020] p-4">
          <p className="text-gray-400 text-sm text-center mt-10">No item selected</p>
      </div>
  );

  return (
    <div className="w-80 border-l border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#202020] flex flex-col h-full shadow-xl z-10 transition-all">
      <div className="p-3 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center bg-gray-100 dark:bg-[#252525]">
        <span className="font-semibold text-xs text-gray-500 uppercase tracking-wider">Inspector</span>
        <button onClick={toggleInspector} className="text-gray-400 hover:text-gray-600">✕</button>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Synopsis Section */}
        <div className="bg-white dark:bg-[#2a2a2a] p-3 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="flex items-center gap-2 mb-2 text-gray-700 dark:text-gray-200 font-medium text-sm">
                <BookOpen size={14} /> Synopsis
            </div>
            <textarea 
                className="w-full text-sm bg-transparent outline-none text-gray-600 dark:text-gray-300 resize-none h-24"
                placeholder="Write a brief summary..."
                value={item.synopsis || ''}
                onChange={(e) => updateItem(item.id, { synopsis: e.target.value })}
            />
        </div>

        {/* Metadata Section */}
        <div className="bg-white dark:bg-[#2a2a2a] p-3 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm space-y-4">
             <div className="flex items-center gap-2 mb-2 text-gray-700 dark:text-gray-200 font-medium text-sm border-b border-gray-100 dark:border-gray-600 pb-2">
                <Tag size={14} /> Metadata
            </div>
            
            <div className="space-y-1">
                <label className="text-xs text-gray-400 uppercase font-bold">Label</label>
                <select 
                    className="w-full text-sm bg-gray-50 dark:bg-[#333] border border-gray-200 dark:border-gray-600 rounded p-1.5 text-gray-700 dark:text-gray-300 outline-none focus:border-blue-500"
                    value={item.label || ''}
                    onChange={(e) => updateItem(item.id, { label: e.target.value as any })}
                >
                    <option value="">None</option>
                    <option value="Chapter">Chapter</option>
                    <option value="Scene">Scene</option>
                    <option value="Character">Character</option>
                    <option value="Location">Location</option>
                    <option value="Idea">Idea</option>
                </select>
            </div>

            <div className="space-y-1">
                <label className="text-xs text-gray-400 uppercase font-bold">Status</label>
                <select 
                    className="w-full text-sm bg-gray-50 dark:bg-[#333] border border-gray-200 dark:border-gray-600 rounded p-1.5 text-gray-700 dark:text-gray-300 outline-none focus:border-blue-500"
                    value={item.status || 'To Do'}
                    onChange={(e) => updateItem(item.id, { status: e.target.value as any })}
                >
                    <option value="To Do">To Do</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Done">Done</option>
                </select>
            </div>
        </div>

        {/* Notes Section */}
        <div className="bg-yellow-50 dark:bg-yellow-900/10 p-3 rounded-lg border border-yellow-200 dark:border-yellow-800/30 shadow-sm">
             <div className="flex items-center gap-2 mb-2 text-yellow-800 dark:text-yellow-500 font-medium text-sm">
                <AlertCircle size={14} /> Project Notes
            </div>
            <textarea 
                className="w-full text-sm bg-transparent outline-none text-gray-600 dark:text-gray-300 resize-none h-20 placeholder-yellow-800/50"
                placeholder="General notes for this item..."
            />
        </div>
      </div>
      
      <div className="p-3 border-t border-gray-200 dark:border-gray-800 text-xs text-center text-gray-400 bg-gray-100 dark:bg-[#252525]">
          Last modified: {new Date().toLocaleDateString()}
      </div>
    </div>
  );
};
