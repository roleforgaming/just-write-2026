import React, { useState, useRef, useEffect } from 'react';
import { useAppStore } from '../store';
import { ItemType } from '../types';
import { 
    StickyNote, 
    Move, 
    Maximize, 
    ZoomIn, 
    ZoomOut, 
    Save,
    Bold,
    Italic,
    Underline,
    AlignLeft,
    AlignCenter,
    AlignRight,
    List,
    Type,
    Heading1,
    Heading2,
    Quote
} from 'lucide-react';

/* --- EDITOR VIEW --- */
export const EditorView = () => {
  const { selectedItemId, items, updateItem } = useAppStore();
  const item = selectedItemId ? items[selectedItemId] : null;
  const editorRef = useRef<HTMLDivElement>(null);
  
  // Ref to track if the update is coming from local input
  const isLocalUpdate = useRef(false);

  useEffect(() => {
    if (editorRef.current && item) {
        // Only update DOM if the content is different and we didn't just type it
        if (editorRef.current.innerHTML !== item.content) {
             // If local update flag is true, it means we just typed, so don't overwrite (though condition above usually handles this)
             // However, for safety, we only overwrite from store if it's external change or initial load
             if (!isLocalUpdate.current) {
                editorRef.current.innerHTML = item.content || '';
             }
        }
        // Reset local update flag after render cycle
        isLocalUpdate.current = false;
    }
  }, [item?.content, item?.id]);

  if (!item) return <div className="p-10 text-center text-gray-400">No selection</div>;

  const execCmd = (command: string, value: string | undefined = undefined) => {
      document.execCommand(command, false, value);
      if (editorRef.current) {
          isLocalUpdate.current = true;
          updateItem(item.id, { content: editorRef.current.innerHTML });
      }
      editorRef.current?.focus();
  };

  const ToolbarBtn = ({ icon: Icon, cmd, arg, active }: { icon: any, cmd: string, arg?: string, active?: boolean }) => (
      <button 
        onMouseDown={(e) => { e.preventDefault(); execCmd(cmd, arg); }}
        className={`p-1.5 rounded hover:bg-gray-200 dark:hover:bg-[#444] text-gray-600 dark:text-gray-300 transition-colors ${active ? 'bg-gray-200 dark:bg-[#444]' : ''}`}
      >
          <Icon size={16} />
      </button>
  );

  return (
    <div className="h-full flex flex-col bg-white dark:bg-[#1e1e1e] shadow-sm mx-auto max-w-4xl w-full border-x border-gray-100 dark:border-gray-800">
      <div className="p-8 pb-2">
        <input 
            type="text" 
            value={item.title} 
            onChange={(e) => updateItem(item.id, { title: e.target.value })}
            className="text-3xl font-bold w-full outline-none bg-transparent dark:text-gray-100 placeholder-gray-300 mb-4"
            placeholder="Title"
        />
        
        {/* Rich Text Toolbar - Word-like */}
        <div className="flex items-center gap-1 p-1 bg-gray-50 dark:bg-[#252525] border border-gray-200 dark:border-gray-700 rounded-lg w-max mb-4">
            <div className="flex items-center gap-0.5 px-2 border-r border-gray-200 dark:border-gray-700">
                <ToolbarBtn icon={Heading1} cmd="formatBlock" arg="H1" />
                <ToolbarBtn icon={Heading2} cmd="formatBlock" arg="H2" />
                <ToolbarBtn icon={Type} cmd="formatBlock" arg="P" />
            </div>
            <div className="flex items-center gap-0.5 px-2 border-r border-gray-200 dark:border-gray-700">
                <ToolbarBtn icon={Bold} cmd="bold" />
                <ToolbarBtn icon={Italic} cmd="italic" />
                <ToolbarBtn icon={Underline} cmd="underline" />
            </div>
            <div className="flex items-center gap-0.5 px-2 border-r border-gray-200 dark:border-gray-700">
                <ToolbarBtn icon={AlignLeft} cmd="justifyLeft" />
                <ToolbarBtn icon={AlignCenter} cmd="justifyCenter" />
                <ToolbarBtn icon={AlignRight} cmd="justifyRight" />
            </div>
             <div className="flex items-center gap-0.5 px-2">
                <ToolbarBtn icon={List} cmd="insertUnorderedList" />
                <ToolbarBtn icon={Quote} cmd="formatBlock" arg="BLOCKQUOTE" />
            </div>
        </div>
      </div>

      <div className="flex-1 px-8 pb-8 overflow-y-auto cursor-text" onClick={() => editorRef.current?.focus()}>
        <div
            ref={editorRef}
            contentEditable
            className="outline-none text-lg leading-relaxed text-gray-800 dark:text-gray-300 font-serif min-h-[500px] empty:before:content-[attr(data-placeholder)] empty:before:text-gray-300"
            data-placeholder="Start writing..."
            onInput={() => {
                if (editorRef.current) {
                    isLocalUpdate.current = true;
                    updateItem(item.id, { content: editorRef.current.innerHTML });
                }
            }}
            style={{ minHeight: '100%' }}
        />
      </div>
    </div>
  );
};

/* --- CORKBOARD VIEW --- */
export const CorkboardView = () => {
  const { selectedItemId, items } = useAppStore();
  const parent = selectedItemId ? items[selectedItemId] : null;
  const children = parent?.children?.map(id => items[id]).filter(Boolean) || [];

  return (
    <div className="h-full bg-stone-100 dark:bg-[#252525] p-6 overflow-y-auto">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {children.length === 0 && (
           <div className="col-span-full flex flex-col items-center justify-center h-64 text-gray-400">
               <StickyNote size={48} className="mb-2 opacity-50"/>
               <p>This folder is empty.</p>
           </div>
        )}
        {children.map(child => (
          <div key={child.id} className="bg-white dark:bg-[#333] shadow-md border border-gray-200 dark:border-gray-700 rounded-lg h-48 flex flex-col group hover:shadow-lg transition-shadow cursor-pointer">
            <div className="p-3 border-b border-gray-100 dark:border-gray-600 font-semibold text-sm truncate flex justify-between items-center text-gray-800 dark:text-gray-200">
                <span className="truncate">{child.title}</span>
                <div className={`w-3 h-3 rounded-full ${child.status === 'Done' ? 'bg-green-400' : child.status === 'In Progress' ? 'bg-yellow-400' : 'bg-gray-300'}`} />
            </div>
            <div className="p-3 text-xs text-gray-500 dark:text-gray-400 flex-1 overflow-hidden leading-relaxed">
              {child.synopsis || child.content?.substring(0, 100).replace(/<[^>]*>?/gm, '') || "No synopsis..."}
            </div>
            <div className="p-2 bg-gray-50 dark:bg-[#2a2a2a] text-xs text-gray-400 rounded-b-lg border-t border-gray-100 dark:border-gray-600 flex justify-between">
                <span>{child.label || 'Document'}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

/* --- OUTLINER VIEW --- */
export const OutlinerView = () => {
  const { selectedItemId, items } = useAppStore();
  const parent = selectedItemId ? items[selectedItemId] : null;
  const children = parent?.children?.map(id => items[id]).filter(Boolean) || [];

  return (
    <div className="h-full bg-white dark:bg-[#1e1e1e] flex flex-col">
        <div className="grid grid-cols-12 gap-4 p-3 border-b border-gray-200 dark:border-gray-700 font-semibold text-xs text-gray-500 uppercase tracking-wider bg-gray-50 dark:bg-[#252525]">
            <div className="col-span-6 pl-4">Title</div>
            <div className="col-span-2">Label</div>
            <div className="col-span-2">Status</div>
            <div className="col-span-2">Target Word Count</div>
        </div>
        <div className="flex-1 overflow-y-auto">
            {children.map((child, idx) => (
                <div key={child.id} className={`grid grid-cols-12 gap-4 p-3 border-b border-gray-100 dark:border-gray-800 text-sm hover:bg-blue-50 dark:hover:bg-blue-900/10 items-center ${idx % 2 === 0 ? 'bg-white dark:bg-[#1e1e1e]' : 'bg-gray-50/50 dark:bg-[#222]'}`}>
                    <div className="col-span-6 pl-4 font-medium text-gray-800 dark:text-gray-200 flex items-center gap-2">
                        {child.type === ItemType.FOLDER ? <span className="text-blue-400">📁</span> : <span className="text-gray-400">📄</span>}
                        {child.title}
                    </div>
                    <div className="col-span-2">
                         <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs text-gray-600 dark:text-gray-300">{child.label || '-'}</span>
                    </div>
                    <div className="col-span-2">
                        <span className={`px-2 py-0.5 rounded text-xs ${child.status === 'Done' ? 'bg-green-100 text-green-700' : 'bg-yellow-50 text-yellow-700'}`}>
                            {child.status || 'No Status'}
                        </span>
                    </div>
                    <div className="col-span-2 text-gray-400">
                        0 / 1000
                    </div>
                </div>
            ))}
        </div>
    </div>
  );
};

/* --- MIND MAP VIEW (Scapple-like) --- */
export const MindMapView = () => {
    const { selectedItemId, items, updateItem } = useAppStore();
    const parent = selectedItemId ? items[selectedItemId] : null;
    const children = parent?.children?.map(id => items[id]).filter(Boolean) || [];
    
    // Drag state
    const [draggingId, setDraggingId] = useState<string | null>(null);
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

    const handleMouseDown = (e: React.MouseEvent, id: string) => {
        e.stopPropagation(); // Prevent container click
        const item = items[id];
        if (!item) return;
        
        const currentX = item.meta?.x || 100;
        const currentY = item.meta?.y || 100;

        setDraggingId(id);
        setDragOffset({
            x: e.clientX - currentX,
            y: e.clientY - currentY
        });
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (draggingId) {
            e.preventDefault();
            const newX = e.clientX - dragOffset.x;
            const newY = e.clientY - dragOffset.y;
            
            // Direct update to store - might need optimization in large apps but fine here
            updateItem(draggingId, { 
                meta: { ...items[draggingId].meta, x: newX, y: newY } 
            });
        }
    };

    const handleMouseUp = () => {
        setDraggingId(null);
    };

    return (
        <div 
            className="h-full w-full bg-[#f8f9fa] dark:bg-[#181818] relative overflow-hidden"
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
        >
            <div className="absolute inset-0 opacity-10 pointer-events-none" 
                 style={{backgroundImage: 'radial-gradient(#999 1px, transparent 1px)', backgroundSize: '20px 20px'}}>
            </div>
            
            {/* SVG Layer for connectors would go here */}

            {children.map(node => (
                <div 
                    key={node.id}
                    className={`absolute shadow-lg rounded-lg border border-gray-200 dark:border-gray-700 p-3 min-w-[150px] bg-white dark:bg-[#2d2d2d] flex flex-col gap-2 cursor-move ${draggingId === node.id ? 'z-50 shadow-xl scale-105' : 'z-10'} transition-transform duration-75`}
                    style={{
                        left: node.meta?.x || 100,
                        top: node.meta?.y || 100,
                        borderColor: node.meta?.color ? node.meta.color : undefined,
                        borderLeftWidth: '4px'
                    }}
                    onMouseDown={(e) => handleMouseDown(e, node.id)}
                >
                    <input 
                        className="font-bold text-sm bg-transparent outline-none dark:text-gray-200 cursor-text" 
                        value={node.title} 
                        onChange={(e) => updateItem(node.id, { title: e.target.value })}
                        onMouseDown={(e) => e.stopPropagation()} // Allow text selection without drag start
                    />
                     <textarea 
                        className="text-xs text-gray-500 dark:text-gray-400 bg-transparent outline-none resize-none h-12 cursor-text"
                        placeholder="Note..."
                        value={node.synopsis || ''}
                        onChange={(e) => updateItem(node.id, { synopsis: e.target.value })}
                        onMouseDown={(e) => e.stopPropagation()} // Allow text selection without drag start
                     />
                </div>
            ))}

            <div className="absolute bottom-4 right-4 bg-white dark:bg-[#2d2d2d] shadow rounded p-2 flex gap-2 z-50">
                <ZoomIn size={16} className="text-gray-500 hover:text-gray-700 cursor-pointer" />
                <ZoomOut size={16} className="text-gray-500 hover:text-gray-700 cursor-pointer" />
            </div>
        </div>
    );
};

/* --- TIMELINE VIEW (Plottr-like) --- */
export const TimelineView = () => {
    // Simplified horizontal scroll view
    return (
        <div className="h-full bg-white dark:bg-[#1e1e1e] overflow-x-auto overflow-y-hidden flex flex-col p-4">
             <div className="flex gap-4 mb-4 border-b border-gray-200 dark:border-gray-700 pb-2 min-w-max">
                 <div className="w-32 font-bold text-gray-400 uppercase text-xs">Plot Lines</div>
                 {[1, 2, 3, 4, 5, 6].map(i => (
                     <div key={i} className="w-64 font-semibold text-gray-600 dark:text-gray-400 text-center">Scene {i}</div>
                 ))}
             </div>
             
             {/* Main Plot Lane */}
             <div className="flex gap-4 mb-4 min-w-max">
                 <div className="w-32 flex items-center justify-end pr-4 font-bold text-blue-500">Main Plot</div>
                 {[1, 2, 3].map(i => (
                     <div key={i} className="w-64 h-32 bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-400 rounded p-3 shadow-sm hover:shadow-md transition-shadow relative">
                         <div className="text-sm font-bold text-blue-900 dark:text-blue-100 mb-1">Plot Point {i}</div>
                         <div className="text-xs text-gray-600 dark:text-gray-400 leading-tight">Key event description happens here...</div>
                         <div className="absolute bottom-2 right-2 text-[10px] text-gray-400">Chapter {i}</div>
                     </div>
                 ))}
             </div>

              {/* Sub Plot Lane */}
              <div className="flex gap-4 min-w-max">
                 <div className="w-32 flex items-center justify-end pr-4 font-bold text-purple-500">Sub Plot</div>
                 <div className="w-64"></div> {/* Spacer */}
                 <div className="w-64 h-32 bg-purple-50 dark:bg-purple-900/20 border-l-4 border-purple-400 rounded p-3 shadow-sm hover:shadow-md transition-shadow">
                     <div className="text-sm font-bold text-purple-900 dark:text-purple-100 mb-1">Romantic Tension</div>
                     <div className="text-xs text-gray-600 dark:text-gray-400 leading-tight">They meet in the rain...</div>
                 </div>
             </div>
        </div>
    );
};