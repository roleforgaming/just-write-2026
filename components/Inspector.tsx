import React, { useState } from 'react';
import { useAppStore } from '../store';
import { Tag, Calendar, AlertCircle, BookOpen, Layers, Bookmark, FileText } from 'lucide-react';

export const Inspector = () => {
  const { selectedItemIds, items, inspectorOpen, toggleInspector, updateItem, projectBookmarks, selectItem } = useAppStore();
  const [activeTab, setActiveTab] = useState<'info' | 'bookmarks'>('info');
  
  if (!inspectorOpen) return null;
  
  // If multiple items, showing summary or disabled
  const isMulti = selectedItemIds.length > 1;
  const item = selectedItemIds.length === 1 ? items[selectedItemIds[0]] : null;

  return (
    <div className="w-80 border-l border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#202020] flex flex-col h-full shadow-xl z-10 transition-all">
      <div className="p-3 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center bg-gray-100 dark:bg-[#252525]">
        <div className="flex gap-4">
            <button 
                onClick={() => setActiveTab('info')}
                className={`text-xs font-semibold uppercase tracking-wider flex items-center gap-1 ${activeTab === 'info' ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            >
               <Tag size={12} /> Inspector
            </button>
            <button 
                onClick={() => setActiveTab('bookmarks')}
                className={`text-xs font-semibold uppercase tracking-wider flex items-center gap-1 ${activeTab === 'bookmarks' ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            >
               <Bookmark size={12} /> Bookmarks
            </button>
        </div>
        <button onClick={toggleInspector} className="text-gray-400 hover:text-gray-600">✕</button>
      </div>
      
      {activeTab === 'bookmarks' ? (
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
              <div className="text-xs text-gray-400 uppercase font-bold mb-2">Project Bookmarks</div>
              {projectBookmarks.length === 0 && (
                  <div className="text-center text-gray-400 mt-10 text-sm">
                      <Bookmark size={32} className="mx-auto mb-2 opacity-30" />
                      <p>No bookmarks yet.</p>
                      <p className="text-xs mt-1">Right-click a binder item to bookmark it.</p>
                  </div>
              )}
              {projectBookmarks.map(id => {
                  const bItem = items[id];
                  if(!bItem) return null;
                  return (
                      <div key={id} className="bg-white dark:bg-[#2a2a2a] rounded border border-gray-200 dark:border-gray-700 p-3 shadow-sm hover:shadow-md transition-all cursor-pointer group" onClick={() => selectItem(id)}>
                          <div className="flex items-center gap-2 mb-2">
                             <FileText size={14} className="text-blue-500" />
                             <span className="font-semibold text-sm text-gray-700 dark:text-gray-200">{bItem.title}</span>
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 line-clamp-3 bg-gray-50 dark:bg-[#222] p-2 rounded">
                               {/* Simple preview of content text (stripping html roughly) */}
                               {bItem.content ? bItem.content.replace(/<[^>]*>?/gm, '') : 'No content...'}
                          </div>
                      </div>
                  );
              })}
          </div>
      ) : (
        <>
        {isMulti ? (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-400 p-6 text-center">
                <Layers size={48} className="mb-4 opacity-30" />
                <p className="font-semibold">{selectedItemIds.length} items selected</p>
                <p className="text-xs mt-2">Bulk editing is not yet supported in Inspector.</p>
            </div>
        ) : !item ? (
             <div className="flex-1 p-4 text-center text-gray-400 mt-10">
                 No item selected
             </div>
        ) : (
            <div className="flex-1 overflow-y-auto p-4 space-y-6">
                {/* Synopsis Section */}
                <div className="bg-white dark:bg-[#2a2a2a] p-3 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
                    <div className="flex items-center gap-2 mb-2 text-gray-700 dark:text-gray-200 font-medium text-sm">
                        <BookOpen size={14} /> Synopsis
                    </div>
                    <textarea 
                        className="w-full text-sm bg-transparent outline-none text-gray-600 dark:text-gray-300 resize-none h-24"
                        placeholder="Write a brief summary..."
                        value={item!.synopsis || ''}
                        onChange={(e) => updateItem(item!.id, { synopsis: e.target.value })}
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
                            value={item!.label || ''}
                            onChange={(e) => updateItem(item!.id, { label: e.target.value as any })}
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
                            value={item!.status || 'To Do'}
                            onChange={(e) => updateItem(item!.id, { status: e.target.value as any })}
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
        )}
        </>
      )}
      
      <div className="p-3 border-t border-gray-200 dark:border-gray-800 text-xs text-center text-gray-400 bg-gray-100 dark:bg-[#252525]">
          Last modified: {new Date().toLocaleDateString()}
      </div>
    </div>
  );
};