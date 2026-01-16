import React, { useState, useRef, useEffect } from 'react';
import { useAppStore } from '../store';
import { ItemType, BinderItem } from '../types';
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
    Quote,
    GripVertical,
    Grip
} from 'lucide-react';

/* --- EDITOR VIEW --- */
export const EditorView = () => {
  const { selectedItemId, items, updateItem } = useAppStore();
  const item = selectedItemId ? items[selectedItemId] : null;
  const editorRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isLocalUpdate = useRef(false);

  useEffect(() => {
    if (editorRef.current && item) {
        if (editorRef.current.innerHTML !== item.content) {
             if (!isLocalUpdate.current) {
                editorRef.current.innerHTML = item.content || '';
             }
        }
        isLocalUpdate.current = false;
    }
  }, [item?.content, item?.id]);

  const handleInput = () => {
      if (editorRef.current) {
          isLocalUpdate.current = true;
          updateItem(item!.id, { content: editorRef.current.innerHTML });
          centerCaret();
      }
  };

  const centerCaret = () => {
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0 && containerRef.current) {
          const range = selection.getRangeAt(0);
          const rect = range.getBoundingClientRect();
          const containerRect = containerRef.current.getBoundingClientRect();
          
          const offsetTop = rect.top - containerRect.top;
          const targetY = containerRect.height / 2;
          
          if (Math.abs(offsetTop - targetY) > 20) {
             const scrollAmount = rect.top - (containerRect.top + containerRect.height / 2);
             containerRef.current.scrollBy({ top: scrollAmount, behavior: 'smooth' });
          }
      }
  };

  if (!item) return <div className="p-10 text-center text-gray-400">No selection</div>;

  const execCmd = (command: string, value: string | undefined = undefined) => {
      document.execCommand(command, false, value);
      handleInput(); 
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
    <div className="h-full flex flex-col bg-white dark:bg-[#1e1e1e] shadow-sm mx-auto w-full">
      <div className="flex items-center gap-1 p-2 bg-gray-50 dark:bg-[#252525] border-b border-gray-200 dark:border-gray-700 w-full sticky top-0 z-20">
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

      <div className="flex-1 overflow-y-auto cursor-text relative" ref={containerRef} onClick={() => editorRef.current?.focus()}>
        <div className="max-w-4xl mx-auto px-8 py-8 min-h-full pb-[50vh]">
            <input 
                type="text" 
                value={item.title} 
                onChange={(e) => updateItem(item.id, { title: e.target.value })}
                className="text-3xl font-bold w-full outline-none bg-transparent dark:text-gray-100 placeholder-gray-300 mb-6"
                placeholder="Title"
            />
            <div
                ref={editorRef}
                contentEditable
                className="outline-none text-lg leading-relaxed text-gray-800 dark:text-gray-300 font-serif empty:before:content-[attr(data-placeholder)] empty:before:text-gray-300"
                data-placeholder="Start writing..."
                onInput={handleInput}
                onKeyUp={centerCaret}
                onClick={centerCaret}
            />
        </div>
      </div>
    </div>
  );
};

/* --- CORKBOARD VIEW --- */
const CorkboardItem: React.FC<{ child: BinderItem }> = ({ child }) => {
    const { selectedItemId, selectItem, setViewMode, updateItem, moveItem } = useAppStore();
    const [dragPosition, setDragPosition] = useState<'before' | 'after' | null>(null);

    const handleDragStart = (e: React.DragEvent) => {
        e.dataTransfer.setData('application/json', JSON.stringify({ id: child.id }));
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        const rect = e.currentTarget.getBoundingClientRect();
        // Use X axis for flow layout or Y for grid? 
        // In a grid, it's usually about insertion order. We'll use simple Left/Right logic if same row, or just simple intersection.
        // Let's use generic "middle of box" logic.
        const midX = rect.left + rect.width / 2;
        if (e.clientX < midX) setDragPosition('before');
        else setDragPosition('after');
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setDragPosition(null);
        try {
            const data = JSON.parse(e.dataTransfer.getData('application/json'));
            if (data.id && data.id !== child.id && dragPosition) {
                moveItem(data.id, child.id, dragPosition);
            }
        } catch (err) {}
    };

    const getDropStyles = () => {
        if (dragPosition === 'before') return 'border-l-4 border-l-blue-500';
        if (dragPosition === 'after') return 'border-r-4 border-r-blue-500';
        return '';
    };

    return (
        <div 
            draggable
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragLeave={() => setDragPosition(null)}
            onDrop={handleDrop}
            onClick={() => selectItem(child.id, false)}
            onDoubleClick={() => { selectItem(child.id, true); setViewMode('editor'); }}
            className={`bg-white dark:bg-[#333] shadow-md border rounded-lg h-56 flex flex-col group hover:shadow-lg transition-shadow cursor-pointer relative ${selectedItemId === child.id ? 'ring-2 ring-blue-500 border-transparent' : 'border-gray-200 dark:border-gray-700'} ${getDropStyles()}`}
        >
            {/* Move Handle Icon */}
            <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 text-gray-400 cursor-move z-10">
                <Grip size={14} />
            </div>

            <div className="p-3 border-b border-gray-100 dark:border-gray-600 font-semibold text-sm flex justify-between items-center text-gray-800 dark:text-gray-200 gap-2 pl-8">
                <input 
                    className="truncate bg-transparent outline-none w-full"
                    value={child.title}
                    onChange={(e) => updateItem(child.id, { title: e.target.value })}
                    onClick={(e) => e.stopPropagation()} 
                />
                <div className={`w-3 h-3 rounded-full flex-shrink-0 ${child.status === 'Done' ? 'bg-green-400' : child.status === 'In Progress' ? 'bg-yellow-400' : 'bg-gray-300'}`} />
            </div>
            
            <div className="flex-1 p-3 overflow-hidden">
                <textarea 
                    className="w-full h-full resize-none text-xs text-gray-500 dark:text-gray-400 bg-transparent outline-none leading-relaxed"
                    placeholder="No synopsis..."
                    value={child.synopsis || ''}
                    onChange={(e) => updateItem(child.id, { synopsis: e.target.value })}
                    onClick={(e) => e.stopPropagation()}
                />
            </div>
            
            <div className="p-2 bg-gray-50 dark:bg-[#2a2a2a] text-xs text-gray-400 rounded-b-lg border-t border-gray-100 dark:border-gray-600 flex justify-between items-center">
                <select 
                    className="bg-transparent outline-none cursor-pointer hover:text-gray-600 dark:hover:text-gray-300"
                    value={child.label || ''}
                    onChange={(e) => updateItem(child.id, { label: e.target.value as any })}
                    onClick={(e) => e.stopPropagation()}
                >
                    <option value="">No Label</option>
                    <option value="Chapter">Chapter</option>
                    <option value="Scene">Scene</option>
                    <option value="Character">Character</option>
                    <option value="Location">Location</option>
                    <option value="Idea">Idea</option>
                </select>
                
                <select 
                    className="bg-transparent outline-none cursor-pointer hover:text-gray-600 dark:hover:text-gray-300 text-right"
                    value={child.status || 'To Do'}
                    onChange={(e) => updateItem(child.id, { status: e.target.value as any })}
                    onClick={(e) => e.stopPropagation()}
                >
                    <option value="To Do">To Do</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Done">Done</option>
                </select>
            </div>
        </div>
    );
};

export const CorkboardView = () => {
  const { selectedItemId, items } = useAppStore();
  const parent = selectedItemId ? items[selectedItemId] : null;
  const children = parent?.children?.map(id => items[id]).filter(Boolean) || [];

  return (
    <div className="h-full bg-stone-100 dark:bg-[#252525] p-6 overflow-y-auto">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 pb-20">
        {children.length === 0 && (
           <div className="col-span-full flex flex-col items-center justify-center h-64 text-gray-400">
               <StickyNote size={48} className="mb-2 opacity-50"/>
               <p>This folder is empty.</p>
           </div>
        )}
        {children.map(child => (
            <CorkboardItem key={child.id} child={child} />
        ))}
      </div>
    </div>
  );
};

/* --- OUTLINER VIEW --- */
const OutlinerItemRow: React.FC<{ child: BinderItem, idx: number }> = ({ child, idx }) => {
    const { selectedItemId, selectItem, setViewMode, updateItem, moveItem } = useAppStore();
    const [dragPosition, setDragPosition] = useState<'before' | 'after' | null>(null);

    const handleDragStart = (e: React.DragEvent) => {
        e.dataTransfer.setData('application/json', JSON.stringify({ id: child.id }));
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        const rect = e.currentTarget.getBoundingClientRect();
        const midY = rect.top + rect.height / 2;
        if (e.clientY < midY) setDragPosition('before');
        else setDragPosition('after');
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setDragPosition(null);
        try {
            const data = JSON.parse(e.dataTransfer.getData('application/json'));
            if (data.id && data.id !== child.id && dragPosition) {
                moveItem(data.id, child.id, dragPosition);
            }
        } catch (err) {}
    };

    const getDropStyles = () => {
        if (dragPosition === 'before') return 'border-t-2 border-t-blue-500';
        if (dragPosition === 'after') return 'border-b-2 border-b-blue-500';
        return 'border-b border-gray-100 dark:border-gray-800';
    };

    return (
        <div 
            draggable
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragLeave={() => setDragPosition(null)}
            onDrop={handleDrop}
            onClick={() => selectItem(child.id, false)}
            onDoubleClick={() => { selectItem(child.id, true); setViewMode('editor'); }}
            className={`grid grid-cols-12 gap-4 p-2 text-sm hover:bg-blue-50 dark:hover:bg-blue-900/10 items-center transition-colors cursor-pointer group relative ${idx % 2 === 0 ? 'bg-white dark:bg-[#1e1e1e]' : 'bg-gray-50/50 dark:bg-[#222]'} ${selectedItemId === child.id ? 'bg-blue-100 dark:bg-blue-900/30' : ''} ${getDropStyles()}`}
        >
             {/* Move Handle Icon */}
             <div className="absolute left-1 opacity-0 group-hover:opacity-100 text-gray-400 cursor-move">
                <GripVertical size={14} />
            </div>

            <div className="col-span-5 pl-6 font-medium text-gray-800 dark:text-gray-200 flex items-center gap-2">
                {child.type === ItemType.FOLDER ? <span className="text-blue-400">📁</span> : <span className="text-gray-400">📄</span>}
                <input 
                    className="bg-transparent outline-none w-full"
                    value={child.title}
                    onChange={(e) => updateItem(child.id, { title: e.target.value })}
                    onClick={(e) => e.stopPropagation()}
                />
            </div>
            <div className="col-span-2">
                    <select 
                    className="bg-transparent outline-none w-full px-2 py-0.5 rounded text-xs text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700"
                    value={child.label || ''}
                    onChange={(e) => updateItem(child.id, { label: e.target.value as any })}
                    onClick={(e) => e.stopPropagation()}
                >
                    <option value="">-</option>
                    <option value="Chapter">Chapter</option>
                    <option value="Scene">Scene</option>
                    <option value="Character">Character</option>
                    <option value="Location">Location</option>
                    <option value="Idea">Idea</option>
                </select>
            </div>
            <div className="col-span-2">
                <select 
                    className={`w-full px-2 py-0.5 rounded text-xs outline-none ${child.status === 'Done' ? 'bg-green-100 text-green-700' : 'bg-yellow-50 text-yellow-700'}`}
                    value={child.status || 'To Do'}
                    onChange={(e) => updateItem(child.id, { status: e.target.value as any })}
                    onClick={(e) => e.stopPropagation()}
                >
                    <option value="To Do">To Do</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Done">Done</option>
                </select>
            </div>
            <div className="col-span-3 text-gray-400 flex items-center gap-2">
                <span>0 / </span>
                <input 
                    type="number"
                    className="bg-transparent outline-none w-16 border-b border-dashed border-gray-300 text-gray-600 dark:text-gray-400 focus:border-blue-500"
                    value={child.wordCountTarget || 0}
                    onChange={(e) => updateItem(child.id, { wordCountTarget: parseInt(e.target.value) || 0 })}
                    onClick={(e) => e.stopPropagation()}
                />
            </div>
        </div>
    );
};

export const OutlinerView = () => {
  const { selectedItemId, items } = useAppStore();
  const parent = selectedItemId ? items[selectedItemId] : null;
  const children = parent?.children?.map(id => items[id]).filter(Boolean) || [];

  return (
    <div className="h-full bg-white dark:bg-[#1e1e1e] flex flex-col">
        <div className="grid grid-cols-12 gap-4 p-3 border-b border-gray-200 dark:border-gray-700 font-semibold text-xs text-gray-500 uppercase tracking-wider bg-gray-50 dark:bg-[#252525]">
            <div className="col-span-5 pl-4">Title</div>
            <div className="col-span-2">Label</div>
            <div className="col-span-2">Status</div>
            <div className="col-span-3">Target Word Count</div>
        </div>
        <div className="flex-1 overflow-y-auto pb-10">
            {children.map((child, idx) => (
                <OutlinerItemRow key={child.id} child={child} idx={idx} />
            ))}
        </div>
    </div>
  );
};

/* --- MIND MAP VIEW (Scapple-like) --- */
export const MindMapView = () => {
    const { selectedItemId, items, updateItem, selectItem, setViewMode } = useAppStore();
    const parent = selectedItemId ? items[selectedItemId] : null;
    const children = parent?.children?.map(id => items[id]).filter(Boolean) || [];
    
    // Drag state
    const [draggingId, setDraggingId] = useState<string | null>(null);
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
    const hasMoved = useRef(false);

    const handleMouseDown = (e: React.MouseEvent, id: string) => {
        e.stopPropagation(); 
        const item = items[id];
        if (!item) return;

        hasMoved.current = false;
        
        // Removed selectItem here so it doesn't select on drag start

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
            hasMoved.current = true;
            const newX = e.clientX - dragOffset.x;
            const newY = e.clientY - dragOffset.y;
            
            updateItem(draggingId, { 
                meta: { ...items[draggingId].meta, x: newX, y: newY } 
            });
        }
    };

    const handleMouseUp = () => {
        setDraggingId(null);
    };

    const handleCardClick = (e: React.MouseEvent, id: string) => {
        // If we dragged, don't trigger selection click
        if (!hasMoved.current) {
            selectItem(id, false);
        }
        hasMoved.current = false;
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
                    className={`absolute shadow-lg rounded-lg border border-gray-200 dark:border-gray-700 p-3 min-w-[150px] bg-white dark:bg-[#2d2d2d] flex flex-col gap-2 group ${draggingId === node.id ? 'z-50 shadow-xl scale-105' : 'z-10'} ${selectedItemId === node.id ? 'ring-2 ring-blue-500 border-transparent' : ''} transition-transform duration-75`}
                    style={{
                        left: node.meta?.x || 100,
                        top: node.meta?.y || 100,
                        borderColor: node.meta?.color ? node.meta.color : undefined,
                        borderLeftWidth: '4px'
                    }}
                    onMouseDown={(e) => handleMouseDown(e, node.id)}
                    onClick={(e) => handleCardClick(e, node.id)}
                    onDoubleClick={(e) => { e.stopPropagation(); selectItem(node.id, true); setViewMode('editor'); }}
                >
                     {/* Move Handle Icon */}
                    <div className="absolute -top-2 -left-2 bg-white dark:bg-[#333] p-1 rounded-full shadow border border-gray-200 dark:border-gray-600 opacity-0 group-hover:opacity-100 cursor-move text-gray-400 z-20">
                        <Move size={12} />
                    </div>

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