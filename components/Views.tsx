
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useAppStore } from '../store';
import { ItemType, BinderItem, CorkboardMode, OutlinerColumn } from '../types';
import { 
    StickyNote, Move, ZoomIn, ZoomOut, Bold, Italic, Underline, List, Type,
    Heading1, Heading2, Quote, GripVertical, Scissors, LayoutGrid, LayoutDashboard,
    Columns, Maximize, Minimize, CheckCircle, Tags, Image as ImageIcon,
    ChevronDown, ChevronRight, FileText, Folder, Eye, Download, Plus, ArrowUp, ArrowDown
} from 'lucide-react';

/* --- SHARED UTILS --- */
const getColorClass = (label?: string) => {
    switch(label) {
        case 'Chapter': return 'bg-blue-500';
        case 'Scene': return 'bg-green-500';
        case 'Character': return 'bg-purple-500';
        case 'Location': return 'bg-orange-500';
        case 'Idea': return 'bg-yellow-500';
        default: return 'bg-gray-300';
    }
};

const formatDate = (date?: Date) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString();
};

/* --- EDITOR COMPONENT (Single Instance) --- */
const SingleEditor = ({ item, isScrivenings = false }: { item: BinderItem, isScrivenings?: boolean }) => {
    const { updateItem } = useAppStore();
    const editorRef = useRef<HTMLDivElement>(null);
    const isLocalUpdate = useRef(false);

    useEffect(() => {
        if (editorRef.current) {
            if (editorRef.current.innerHTML !== item.content) {
                if (!isLocalUpdate.current) {
                    editorRef.current.innerHTML = item.content || '';
                }
            }
            isLocalUpdate.current = false;
        }
    }, [item.content, item.id]);

    const handleInput = () => {
        if (editorRef.current) {
            isLocalUpdate.current = true;
            // Rough word count update
            const text = editorRef.current.innerText || "";
            const words = text.split(/\s+/).filter(w => w.length > 0).length;
            updateItem(item.id, { content: editorRef.current.innerHTML, wordCount: words });
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        try {
            const data = JSON.parse(e.dataTransfer.getData('application/json'));
            if (data.id) {
                const title = data.title || "Linked Item";
                const linkHTML = `&nbsp;<a href="#${data.id}" contenteditable="false" class="text-blue-600 dark:text-blue-400 hover:underline cursor-pointer">[${title}]</a>&nbsp;`;
                
                if (document.caretRangeFromPoint) {
                    const range = document.caretRangeFromPoint(e.clientX, e.clientY);
                    if (range) {
                        const sel = window.getSelection();
                        sel?.removeAllRanges();
                        sel?.addRange(range);
                        document.execCommand('insertHTML', false, linkHTML);
                    }
                } else {
                     document.execCommand('insertHTML', false, linkHTML);
                }
                handleInput();
            }
        } catch (err) {}
    };

    return (
        <div className={`max-w-4xl mx-auto px-8 ${isScrivenings ? 'py-4' : 'py-8 min-h-full pb-[50vh]'}`}>
            {!isScrivenings && (
                <input 
                    type="text" 
                    value={item.title} 
                    onChange={(e) => updateItem(item.id, { title: e.target.value })}
                    className="text-3xl font-bold w-full outline-none bg-transparent dark:text-gray-100 placeholder-gray-300 mb-6"
                    placeholder="Title"
                />
            )}
            <div
                id={`editor-${item.id}`} // Helper ID for split logic
                ref={editorRef}
                contentEditable
                className="outline-none text-lg leading-relaxed text-gray-800 dark:text-gray-300 font-serif empty:before:content-[attr(data-placeholder)] empty:before:text-gray-300"
                data-placeholder={isScrivenings ? "Start writing section..." : "Start writing..."}
                onInput={handleInput}
                onDrop={handleDrop}
            />
        </div>
    );
};

/* --- EDITOR VIEW (Manages Single vs Scrivenings) --- */
export const EditorView = () => {
  const { selectedItemIds, items, splitItem } = useAppStore();
  
  if (selectedItemIds.length === 0) return <div className="p-10 text-center text-gray-400">No selection</div>;

  const activeItems = selectedItemIds.map(id => items[id]).filter(Boolean);

  const execCmd = (command: string, value: string | undefined = undefined) => {
      document.execCommand(command, false, value);
  };

  const handleSplit = () => {
      const primaryId = selectedItemIds[0];
      const editorEl = document.getElementById(`editor-${primaryId}`);
      
      if (!editorEl) return;

      const selection = window.getSelection();
      if (!selection || selection.rangeCount === 0) return;

      const markerId = "split-marker-" + Date.now();
      const markerHtml = `<span id="${markerId}"></span>`;
      document.execCommand('insertHTML', false, markerHtml);

      const fullHtml = editorEl.innerHTML;
      const [before, after] = fullHtml.split(markerHtml);

      if (after !== undefined) {
          splitItem(primaryId, before, after, "New Split Item");
      }
  };

  const ToolbarBtn = ({ icon: Icon, cmd, arg, active, onClick }: { icon: any, cmd?: string, arg?: string, active?: boolean, onClick?: () => void }) => (
      <button 
        onMouseDown={(e) => { 
            e.preventDefault(); 
            if (onClick) onClick();
            else if (cmd) execCmd(cmd, arg); 
        }}
        className={`p-1.5 rounded hover:bg-gray-200 dark:hover:bg-[#444] text-gray-600 dark:text-gray-300 transition-colors ${active ? 'bg-gray-200 dark:bg-[#444]' : ''}`}
        title={cmd || "Action"}
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
                <ToolbarBtn icon={List} cmd="insertUnorderedList" />
                <ToolbarBtn icon={Quote} cmd="formatBlock" arg="BLOCKQUOTE" />
            </div>
            <div className="flex items-center gap-0.5 px-2">
                <ToolbarBtn icon={Scissors} onClick={handleSplit} cmd="" />
            </div>
      </div>

      <div className="flex-1 overflow-y-auto cursor-text relative">
          {activeItems.map((item, idx) => (
              <React.Fragment key={item.id}>
                  {idx > 0 && (
                      <div className="max-w-4xl mx-auto flex items-center gap-4 py-8 opacity-50 select-none">
                          <div className="h-px flex-1 bg-gray-300 dark:bg-gray-700"></div>
                          <span className="text-xs text-gray-400 uppercase tracking-widest">Section Break</span>
                          <div className="h-px flex-1 bg-gray-300 dark:bg-gray-700"></div>
                      </div>
                  )}
                  {activeItems.length > 1 && (
                      <div className="max-w-4xl mx-auto px-8 pt-4">
                          <div className="text-2xl font-bold text-gray-700 dark:text-gray-200">{item.title}</div>
                      </div>
                  )}
                  <SingleEditor item={item} isScrivenings={activeItems.length > 1} />
              </React.Fragment>
          ))}
          <div className="h-[50vh]"></div>
      </div>
    </div>
  );
};

/* --- CORKBOARD VIEW --- */
interface CorkboardItemProps {
    child: BinderItem;
    size: number;
    ratio: string;
    onMouseDown?: (e: React.MouseEvent) => void;
    dragPosition?: 'before' | 'after' | null;
    settings: any;
}

const CorkboardItem: React.FC<CorkboardItemProps> = ({ child, size, ratio, onMouseDown, dragPosition, settings }) => {
    const { selectedItemIds, selectItem, setViewMode, updateItem, moveItem, setViewRoot } = useAppStore();
    
    // Determine dimensions
    const width = 180 + (size * 40);
    let height = width * 0.6; // default 3:5
    if (ratio === '4:6') height = width * 0.66;
    if (ratio === '1:1') height = width;

    const isStack = child.children && child.children.length > 0;

    const handleDragStart = (e: React.DragEvent) => {
        e.dataTransfer.setData('application/json', JSON.stringify({ id: child.id }));
    };

    const getDropStyles = () => {
        if (dragPosition === 'before') return 'border-l-4 border-l-blue-500';
        if (dragPosition === 'after') return 'border-r-4 border-r-blue-500';
        return '';
    };

    const labelColor = getColorClass(child.label);

    return (
        <div 
            draggable
            onDragStart={handleDragStart}
            onMouseDown={onMouseDown}
            onClick={(e) => { 
                e.stopPropagation(); 
                // Single click selects, but does NOT auto switch view
                selectItem(child.id, e.shiftKey || e.ctrlKey || e.metaKey, false, false); 
            }}
            onDoubleClick={(e) => { 
                e.stopPropagation(); 
                if (child.type === ItemType.TEXT) {
                     // Open editor for text
                     selectItem(child.id, false, false, true); 
                } else {
                     // Drill down for folder
                     selectItem(child.id, false, false, false);
                     setViewRoot(child.id);
                }
            }}
            style={{ width: `${width}px`, height: `${height}px` }}
            className={`
                bg-white dark:bg-[#333] shadow-md rounded-lg flex flex-col group hover:shadow-xl transition-all cursor-pointer relative select-none
                ${selectedItemIds.includes(child.id) ? 'ring-2 ring-blue-500 z-10' : 'border border-gray-200 dark:border-gray-700'} 
                ${getDropStyles()}
                ${isStack ? 'translate-x-1 translate-y-1' : ''}
            `}
        >
            {isStack && (
                <>
                    <div className="absolute top-0.5 left-0.5 right-[-4px] bottom-[-4px] bg-gray-100 dark:bg-[#282828] border border-gray-300 dark:border-gray-600 rounded-lg -z-10 shadow-sm" />
                    <div className="absolute top-1 left-1 right-[-8px] bottom-[-8px] bg-gray-200 dark:bg-[#222] border border-gray-300 dark:border-gray-600 rounded-lg -z-20 shadow-sm" />
                </>
            )}
            {settings.showLabel && (
                <div className={`absolute left-0 top-3 bottom-3 w-1.5 rounded-r ${labelColor}`} />
            )}
            <div className="px-3 pt-3 pb-2 border-b border-gray-100 dark:border-gray-600 flex justify-between items-center gap-2 pl-4">
                <input 
                    className="font-bold text-sm bg-transparent outline-none w-full text-gray-800 dark:text-gray-100 truncate"
                    value={child.title}
                    onChange={(e) => updateItem(child.id, { title: e.target.value })}
                    onClick={(e) => e.stopPropagation()} 
                />
            </div>
            <div className="flex-1 overflow-hidden relative group">
                {child.cardImage ? (
                    <div className="w-full h-full relative">
                         <img src={child.cardImage} alt="Card" className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity" />
                         <div className="absolute inset-0 bg-black/60 p-3 opacity-0 group-hover:opacity-100 transition-opacity text-white text-xs overflow-auto">
                             {child.synopsis || "No Synopsis"}
                         </div>
                    </div>
                ) : (
                    <textarea 
                        className="w-full h-full p-3 resize-none text-xs text-gray-500 dark:text-gray-300 bg-transparent outline-none leading-relaxed font-serif"
                        placeholder="Type synopsis..."
                        value={child.synopsis || ''}
                        onChange={(e) => updateItem(child.id, { synopsis: e.target.value })}
                        onClick={(e) => e.stopPropagation()}
                    />
                )}
            </div>
            {(settings.showKeywords && child.keywords && child.keywords.length > 0) && (
                <div className="px-3 pb-2 flex flex-wrap gap-1">
                    {child.keywords.map((k, i) => (
                        <span key={i} className="text-[10px] px-1.5 py-0.5 bg-gray-100 dark:bg-[#444] rounded text-gray-600 dark:text-gray-300 truncate max-w-[80px]">
                            {k}
                        </span>
                    ))}
                </div>
            )}
            {settings.showStatus && child.status && child.status !== 'To Do' && (
                <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-lg flex items-center justify-center opacity-10">
                    <span className="text-3xl font-black uppercase text-gray-900 -rotate-12 select-none border-4 border-gray-900 p-2 rounded transform scale-150">
                        {child.status}
                    </span>
                </div>
            )}
        </div>
    );
};

export const CorkboardView = () => {
  const { viewRootId, items, corkboardSettings, updateCorkboardSettings, moveItem, setCorkboardPosition, commitFreeformOrder } = useAppStore();
  const parent = viewRootId ? items[viewRootId] : null;
  const children = parent?.children?.map(id => items[id]).filter(Boolean) || [];

  const [dragTarget, setDragTarget] = useState<{id: string, pos: 'before'|'after'} | null>(null);
  const [draggingFreeformId, setDraggingFreeformId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({x: 0, y: 0});
  
  const handleGridDragOver = (e: React.DragEvent, id: string) => {
      e.preventDefault();
      const rect = e.currentTarget.getBoundingClientRect();
      const midX = rect.left + rect.width / 2;
      setDragTarget({ id, pos: e.clientX < midX ? 'before' : 'after' });
  };
  const handleGridDrop = (e: React.DragEvent, targetId: string) => {
      e.preventDefault();
      try {
          const data = JSON.parse(e.dataTransfer.getData('application/json'));
          if (data.id && data.id !== targetId && dragTarget) {
              moveItem(data.id, targetId, dragTarget.pos);
          }
      } catch (err) {}
      setDragTarget(null);
  };

  const handleFreeformMouseDown = (e: React.MouseEvent, id: string) => {
      e.stopPropagation();
      const item = items[id];
      const startX = item.corkboard?.x ?? (Math.random() * 200);
      const startY = item.corkboard?.y ?? (Math.random() * 200);
      setDraggingFreeformId(id);
      setDragOffset({ x: e.clientX - startX, y: e.clientY - startY });
  };
  const handleFreeformMouseMove = (e: React.MouseEvent) => {
      if (draggingFreeformId) {
          e.preventDefault();
          setCorkboardPosition(draggingFreeformId, e.clientX - dragOffset.x, e.clientY - dragOffset.y);
      }
  };
  const handleFreeformMouseUp = () => {
      setDraggingFreeformId(null);
  };

  const renderGridMode = () => (
      <div className="flex flex-wrap gap-6 p-10 pb-40 justify-center content-start">
          {children.length === 0 && <div className="text-gray-400 mt-20">Folder is empty.</div>}
          {children.map(child => (
              <div 
                  key={child.id} 
                  onDragOver={(e) => handleGridDragOver(e, child.id)} 
                  onDrop={(e) => handleGridDrop(e, child.id)}
                  onDragLeave={() => setDragTarget(null)}
              >
                  <CorkboardItem 
                    child={child} 
                    size={corkboardSettings.cardSize} 
                    ratio={corkboardSettings.ratio}
                    settings={corkboardSettings}
                    dragPosition={dragTarget?.id === child.id ? dragTarget.pos : null}
                  />
              </div>
          ))}
      </div>
  );

  const renderFreeformMode = () => (
      <div 
        className="relative w-[2000px] h-[2000px] bg-[#f0f0f0] dark:bg-[#1a1a1a]" 
        style={{backgroundImage: 'radial-gradient(#ccc 1px, transparent 1px)', backgroundSize: '40px 40px'}}
        onMouseMove={handleFreeformMouseMove}
        onMouseUp={handleFreeformMouseUp}
        onMouseLeave={handleFreeformMouseUp}
      >
          {children.map(child => (
              <div 
                key={child.id} 
                className="absolute transition-shadow duration-150"
                style={{ 
                    left: child.corkboard?.x ?? 50, 
                    top: child.corkboard?.y ?? 50,
                    zIndex: draggingFreeformId === child.id ? 50 : 10
                }}
              >
                  <CorkboardItem 
                    child={child} 
                    size={corkboardSettings.cardSize} 
                    ratio={corkboardSettings.ratio} 
                    onMouseDown={(e) => handleFreeformMouseDown(e, child.id)}
                    settings={corkboardSettings}
                  />
              </div>
          ))}
      </div>
  );

  const renderLabelMode = () => {
      const labels = ['Chapter', 'Scene', 'Character', 'Location', 'Idea', 'None'];
      const grouped: Record<string, BinderItem[]> = {};
      labels.forEach(l => grouped[l] = []);
      children.forEach(c => {
          const l = c.label || 'None';
          if (grouped[l]) grouped[l].push(c);
          else grouped['None'].push(c);
      });

      return (
          <div className="flex gap-4 p-6 overflow-x-auto h-full pb-20">
              {labels.map(label => (
                  <div key={label} className="min-w-[280px] w-[300px] flex flex-col bg-gray-50 dark:bg-[#222] rounded-xl border border-gray-200 dark:border-gray-700 h-full">
                      <div className={`p-3 font-bold text-sm text-gray-700 dark:text-gray-200 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between`}>
                          <span>{label}</span>
                          <span className="text-xs bg-gray-200 dark:bg-[#333] px-2 py-0.5 rounded-full">{grouped[label].length}</span>
                      </div>
                      <div className="flex-1 p-3 overflow-y-auto space-y-4">
                          {grouped[label].map(child => (
                               <div key={child.id} className="relative">
                                   <CorkboardItem 
                                        child={child} 
                                        size={0} 
                                        ratio="3:5"
                                        settings={corkboardSettings}
                                    />
                               </div>
                          ))}
                      </div>
                  </div>
              ))}
          </div>
      );
  };

  return (
    <div className="h-full flex flex-col bg-stone-100 dark:bg-[#181818] overflow-hidden">
        <div className="h-10 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-[#202020] flex items-center px-4 justify-between select-none z-10">
            <div className="flex items-center gap-2">
                <div className="flex bg-gray-100 dark:bg-[#2a2a2a] p-0.5 rounded-md">
                    <button onClick={() => updateCorkboardSettings({ mode: 'grid' })} className={`p-1 rounded ${corkboardSettings.mode === 'grid' ? 'bg-white dark:bg-[#333] shadow text-blue-600' : 'text-gray-500'}`}><LayoutGrid size={14}/></button>
                    <button onClick={() => updateCorkboardSettings({ mode: 'freeform' })} className={`p-1 rounded ${corkboardSettings.mode === 'freeform' ? 'bg-white dark:bg-[#333] shadow text-blue-600' : 'text-gray-500'}`}><LayoutDashboard size={14}/></button>
                     <button onClick={() => updateCorkboardSettings({ mode: 'label' })} className={`p-1 rounded ${corkboardSettings.mode === 'label' ? 'bg-white dark:bg-[#333] shadow text-blue-600' : 'text-gray-500'}`}><Columns size={14}/></button>
                </div>
                <div className="h-4 w-px bg-gray-300 dark:bg-gray-600 mx-1"></div>
                <div className="flex items-center gap-2 text-gray-500">
                    <Minimize size={12} />
                    <input type="range" min="0" max="4" step="1" value={corkboardSettings.cardSize} onChange={(e) => updateCorkboardSettings({ cardSize: parseInt(e.target.value) })} className="w-24 h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600" />
                    <Maximize size={12} />
                </div>
                 <div className="h-4 w-px bg-gray-300 dark:bg-gray-600 mx-1"></div>
                 <select className="text-xs bg-transparent outline-none text-gray-600 dark:text-gray-300" value={corkboardSettings.ratio} onChange={(e) => updateCorkboardSettings({ ratio: e.target.value as any })}>
                    <option value="3:5">3:5</option>
                    <option value="4:6">4:6</option>
                    <option value="1:1">Square</option>
                 </select>
            </div>
            <div className="flex items-center gap-3">
                {corkboardSettings.mode === 'freeform' && (
                    <button onClick={() => viewRootId && commitFreeformOrder(viewRootId)} className="text-xs px-2 py-1 bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400 rounded hover:bg-blue-100">Commit Order</button>
                )}
                 <button onClick={() => updateCorkboardSettings({ showKeywords: !corkboardSettings.showKeywords })} className={`p-1 rounded ${corkboardSettings.showKeywords ? 'text-blue-500' : 'text-gray-400'}`}><Tags size={14} /></button>
                 <button onClick={() => updateCorkboardSettings({ showStatus: !corkboardSettings.showStatus })} className={`p-1 rounded ${corkboardSettings.showStatus ? 'text-blue-500' : 'text-gray-400'}`}><CheckCircle size={14} /></button>
            </div>
        </div>
        <div className="flex-1 overflow-auto relative custom-scrollbar">
            {corkboardSettings.mode === 'grid' && renderGridMode()}
            {corkboardSettings.mode === 'freeform' && renderFreeformMode()}
            {corkboardSettings.mode === 'label' && renderLabelMode()}
        </div>
    </div>
  );
};

/* --- OUTLINER VIEW --- */
export const OutlinerView = () => {
    const { 
        viewRootId, items, outlinerSettings, 
        toggleOutlinerColumn, setOutlinerSort, 
        addCustomMetadataField, updateOutlinerSettings 
    } = useAppStore();
    
    // Determine root items to display (subtree of selection)
    const rootItem = viewRootId ? items[viewRootId] : null;
    const itemsToRender = useMemo(() => {
        if (!rootItem || !rootItem.children) return [];
        let children = rootItem.children.map(id => items[id]).filter(Boolean);
        return children;
    }, [rootItem, items, outlinerSettings.sortBy, outlinerSettings.sortDirection]);

    const visibleColumns = outlinerSettings.columns.filter(c => c.visible);

    // Helper to calculate total words of visible tree
    const totalWords = useMemo(() => {
        let count = 0;
        const traverse = (itemId: string) => {
            const item = items[itemId];
            if (!item) return;
            count += item.wordCount || 0;
            if (item.children) item.children.forEach(traverse);
        };
        if (rootItem && rootItem.children) {
            rootItem.children.forEach(traverse);
        }
        return count;
    }, [items, rootItem]);

    const handleExportCSV = () => {
        // Flatten tree
        const rows: string[] = [];
        // Header
        rows.push(visibleColumns.map(c => c.label).join(','));

        const traverse = (itemId: string, depth: number) => {
            const item = items[itemId];
            if(!item) return;
            
            const rowData = visibleColumns.map(col => {
                let val: any = '';
                if(col.id === 'title') val = '  '.repeat(depth) + item.title;
                else if(col.id === 'label') val = item.label;
                else if(col.id === 'status') val = item.status;
                else if(col.id === 'wordCount') val = item.wordCount;
                else if(col.id === 'synopsis') val = item.synopsis;
                else if(col.id === 'modifiedDate') val = item.modifiedDate?.toISOString();
                else if(col.isCustom) val = item.customMetadata?.[col.id];
                
                // Escape quotes
                return `"${String(val || '').replace(/"/g, '""')}"`;
            });
            rows.push(rowData.join(','));

            if(item.children) item.children.forEach(c => traverse(c, depth + 1));
        };

        if (rootItem && rootItem.children) {
            rootItem.children.forEach(c => traverse(c, 0));
        }

        const csvContent = "data:text/csv;charset=utf-8," + rows.join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "outline_export.csv");
        document.body.appendChild(link);
        link.click();
    };

    const [colMenuOpen, setColMenuOpen] = useState(false);
    const [newColName, setNewColName] = useState('');

    const handleAddColumn = () => {
        if (newColName) {
            addCustomMetadataField({ id: newColName.toLowerCase().replace(/\s/g, '_'), name: newColName, type: 'text' });
            setNewColName('');
        }
    };

    /* RE-DEFINING OUTLINER ROW FOR SORT SUPPORT inside the View */
    const SortedOutlinerRow = ({ item, depth }: { item: BinderItem, depth: number }) => {
        const { items, outlinerSettings, updateItem, setBinderItemExpanded, selectItem, selectedItemIds, moveItem, setViewRoot } = useAppStore();
        const isSelected = selectedItemIds.includes(item.id);
        const hasChildren = item.children && item.children.length > 0;
        
        let children = item.children ? item.children.map(id => items[id]).filter(Boolean) : [];
        if (outlinerSettings.sortBy) {
             const { sortBy, sortDirection } = outlinerSettings;
             children.sort((a: any, b: any) => {
                let valA = sortBy === 'progress' ? ((a.wordCount||0)/(a.wordCountTarget||1)) : (outlinerSettings.columns.find(c=>c.id===sortBy)?.isCustom ? a.customMetadata?.[sortBy] : a[sortBy]);
                let valB = sortBy === 'progress' ? ((b.wordCount||0)/(b.wordCountTarget||1)) : (outlinerSettings.columns.find(c=>c.id===sortBy)?.isCustom ? b.customMetadata?.[sortBy] : b[sortBy]);
                if(!valA) valA = 0; if(!valB) valB = 0; // simplistic fallback
                if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
                if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
                return 0;
             });
        }

        // --- Same Render Logic as before for the Row itself ---
         const [dragOver, setDragOver] = useState<'top' | 'bottom' | 'inside' | null>(null);

        const handleDragStart = (e: React.DragEvent) => {
            e.dataTransfer.setData('application/json', JSON.stringify({ id: item.id }));
        };

        const handleDragOver = (e: React.DragEvent) => {
            e.preventDefault();
            e.stopPropagation();
            const rect = e.currentTarget.getBoundingClientRect();
            const y = e.clientY - rect.top;
            if (y < 8) setDragOver('top');
            else if (y > rect.height - 8) setDragOver('bottom');
            else setDragOver('inside');
        };

        const handleDrop = (e: React.DragEvent) => {
            e.preventDefault();
            e.stopPropagation();
            setDragOver(null);
            try {
                const data = JSON.parse(e.dataTransfer.getData('application/json'));
                if (data.id && data.id !== item.id && dragOver) {
                    if (dragOver === 'inside') moveItem(data.id, item.id, 'inside');
                    else moveItem(data.id, item.id, dragOver === 'top' ? 'before' : 'after');
                }
            } catch(err) {}
        };

         const renderCell = (col: OutlinerColumn) => {
             if(col.id === 'title') return (
                <div className="flex items-center gap-2 h-full pl-2">
                    <div style={{ width: `${depth * 20}px` }} className="flex-shrink-0" />
                    <div className="w-4 h-4 flex items-center justify-center cursor-pointer text-gray-400 hover:text-gray-600" onClick={(e) => { e.stopPropagation(); setBinderItemExpanded(item.id, !item.expanded); }}>
                        {hasChildren && (item.expanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />)}
                    </div>
                    {item.type === ItemType.FOLDER ? <Folder size={14} className="text-blue-400 flex-shrink-0" /> : <FileText size={14} className="text-gray-400 flex-shrink-0" />}
                    <input className="bg-transparent outline-none w-full text-sm font-medium text-gray-700 dark:text-gray-200" value={item.title} onChange={(e) => updateItem(item.id, { title: e.target.value })} />
                </div>
             );
             if(col.id === 'wordCount') return <div className="flex items-center h-full px-2 text-xs text-gray-500">{item.wordCount || 0}</div>;
             if(col.id === 'status') return <div className="flex items-center h-full px-2"><select className="bg-transparent outline-none w-full text-xs text-gray-600 dark:text-gray-300 cursor-pointer" value={item.status || 'To Do'} onChange={(e) => updateItem(item.id, { status: e.target.value as any })}><option value="To Do">To Do</option><option value="In Progress">In Progress</option><option value="Done">Done</option></select></div>;
             if(col.id === 'label') return <div className="flex items-center h-full px-2"><div className={`w-2 h-2 rounded-full mr-2 ${getColorClass(item.label)} flex-shrink-0`} /><select className="bg-transparent outline-none w-full text-xs text-gray-600 dark:text-gray-300 cursor-pointer" value={item.label || ''} onChange={(e) => updateItem(item.id, { label: e.target.value as any })}><option value="">None</option><option value="Chapter">Chapter</option><option value="Scene">Scene</option><option value="Character">Character</option><option value="Location">Location</option><option value="Idea">Idea</option></select></div>;
             if(col.id === 'synopsis') return <div className="h-full py-1"><textarea className="w-full h-full bg-transparent outline-none text-xs text-gray-500 dark:text-gray-400 resize-none leading-tight" value={item.synopsis || ''} onChange={(e) => updateItem(item.id, { synopsis: e.target.value })} placeholder="..." /></div>;
             if(col.id === 'progress') {
                const target = item.wordCountTarget || 0; const current = item.wordCount || 0; const percent = target > 0 ? Math.min(100, (current / target) * 100) : 0;
                let barColor = 'bg-blue-500'; if (percent > 100) barColor = 'bg-red-500'; else if (percent === 100) barColor = 'bg-green-500';
                return <div className="flex flex-col justify-center h-full px-2 w-full gap-1"><div className="flex justify-between text-[10px] text-gray-400"><span>{current}/{target}</span><span>{Math.round(percent)}%</span></div><div className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden"><div className={`h-full ${barColor}`} style={{ width: `${percent}%` }} /></div><input className="opacity-0 absolute inset-0 w-full h-full cursor-text" type="number" onChange={(e) => updateItem(item.id, { wordCountTarget: parseInt(e.target.value) })} /></div>;
             }
             if(col.id === 'modifiedDate') return <div className="flex items-center h-full px-2 text-xs text-gray-500">{formatDate(item.modifiedDate)}</div>;
             if(col.isCustom) return <div className="flex items-center h-full px-2"><input className="bg-transparent outline-none w-full text-xs text-gray-600 dark:text-gray-300" value={String(item.customMetadata?.[col.id] || '')} onChange={(e) => updateItem(item.id, { customMetadata: { ...item.customMetadata, [col.id]: e.target.value } })} /></div>;
             return null;
         };

        return (
            <React.Fragment>
                <div 
                    draggable onDragStart={handleDragStart} onDragOver={handleDragOver} onDrop={handleDrop} onDragLeave={() => setDragOver(null)}
                    onClick={() => selectItem(item.id, false, false, false)} // No auto-switch on single click
                    onDoubleClick={(e) => {
                        e.stopPropagation();
                        if (item.type === ItemType.TEXT) {
                             selectItem(item.id, false, false, true); // Switch to editor
                        } else {
                             selectItem(item.id, false, false, false);
                             setViewRoot(item.id); // Drill down
                        }
                    }}
                    className={`grid items-stretch min-h-[40px] hover:bg-blue-50 dark:hover:bg-blue-900/10 group relative border-b border-gray-100 dark:border-gray-800 ${isSelected ? 'bg-blue-100 dark:bg-blue-900/30' : 'bg-white dark:bg-[#1e1e1e]'} ${dragOver === 'top' ? 'border-t-2 border-t-blue-500' : ''} ${dragOver === 'bottom' ? 'border-b-2 border-b-blue-500' : ''} ${dragOver === 'inside' ? '!bg-blue-50' : ''}`}
                    style={{ gridTemplateColumns: visibleColumns.map(c => c.width).join(' ') }}
                >
                     <div className="absolute left-0 top-0 bottom-0 w-4 flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-move z-10"><GripVertical size={12} className="text-gray-400" /></div>
                     {visibleColumns.map(col => (<div key={col.id} className="border-r border-gray-100 dark:border-gray-800 last:border-r-0 relative overflow-hidden">{renderCell(col)}</div>))}
                </div>
                {item.expanded && children.map(child => <SortedOutlinerRow key={child.id} item={child} depth={depth + 1} />)}
            </React.Fragment>
        );
    };


    return (
        <div className="h-full bg-white dark:bg-[#1e1e1e] flex flex-col">
            {/* Toolbar */}
            <div className="h-10 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#252525] flex items-center justify-between px-3">
                 <div className="flex gap-2">
                     <button onClick={() => setColMenuOpen(!colMenuOpen)} className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-[#333] px-2 py-1 rounded">
                         <Columns size={14} /> Columns
                     </button>
                     <button onClick={handleExportCSV} className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-[#333] px-2 py-1 rounded">
                         <Download size={14} /> Export CSV
                     </button>
                 </div>
                 <div className="text-xs text-gray-400">
                     {rootItem ? `Viewing: ${rootItem.title}` : 'Select a folder to outline'}
                 </div>
            </div>

            {/* Column Menu */}
            {colMenuOpen && (
                <div className="absolute top-24 left-4 z-50 w-64 bg-white dark:bg-[#252525] shadow-xl border border-gray-200 dark:border-gray-700 rounded-lg p-3">
                    <div className="text-xs font-bold text-gray-400 uppercase mb-2">Toggle Columns</div>
                    <div className="space-y-1 mb-3 max-h-48 overflow-y-auto">
                        {outlinerSettings.columns.map(col => (
                            <label key={col.id} className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-200 cursor-pointer hover:bg-gray-50 dark:hover:bg-[#333] p-1 rounded">
                                <input type="checkbox" checked={col.visible} onChange={() => toggleOutlinerColumn(col.id)} />
                                {col.label}
                            </label>
                        ))}
                    </div>
                    <div className="border-t border-gray-100 dark:border-gray-700 pt-2">
                        <div className="text-xs font-bold text-gray-400 uppercase mb-2">New Custom Column</div>
                        <div className="flex gap-2">
                            <input 
                                className="flex-1 bg-gray-100 dark:bg-[#333] border-none rounded px-2 py-1 text-xs outline-none"
                                placeholder="Col Name..."
                                value={newColName}
                                onChange={e => setNewColName(e.target.value)}
                            />
                            <button onClick={handleAddColumn} className="bg-blue-500 text-white rounded p-1"><Plus size={14} /></button>
                        </div>
                    </div>
                    <div className="mt-2 text-right">
                        <button onClick={() => setColMenuOpen(false)} className="text-xs text-blue-500">Done</button>
                    </div>
                </div>
            )}

            {/* Header */}
            <div 
                className="grid bg-gray-100 dark:bg-[#252525] border-b border-gray-200 dark:border-gray-700 text-xs font-bold text-gray-500 uppercase select-none sticky top-0 z-20"
                style={{ gridTemplateColumns: visibleColumns.map(c => c.width).join(' ') }}
            >
                {visibleColumns.map(col => (
                    <div 
                        key={col.id} 
                        className="px-3 py-2 border-r border-gray-200 dark:border-gray-700 hover:bg-gray-200 dark:hover:bg-[#333] cursor-pointer flex items-center justify-between"
                        onClick={() => setOutlinerSort(col.id)}
                    >
                        {col.label}
                        {outlinerSettings.sortBy === col.id && (
                            outlinerSettings.sortDirection === 'asc' ? <ArrowUp size={10} /> : <ArrowDown size={10} />
                        )}
                    </div>
                ))}
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto pb-20">
                {itemsToRender.map(child => {
                     // We manually sort the top level here to match visual expectation if sort is on
                     // But actually SortedOutlinerRow sorts children. We just need to render the roots here.
                     // To properly sort roots, we need to sort `itemsToRender`.
                     // Let's sort `itemsToRender` in place (memoized above actually does it).
                     return <SortedOutlinerRow key={child.id} item={child} depth={0} />;
                })}
                {itemsToRender.length === 0 && (
                    <div className="p-10 text-center text-gray-400">
                        Folder is empty.
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="h-8 bg-gray-50 dark:bg-[#252525] border-t border-gray-200 dark:border-gray-700 flex items-center justify-between px-4 text-xs text-gray-500">
                <span>{itemsToRender.length} Top Level Items</span>
                <span className="font-semibold">Total Visible Words: {totalWords}</span>
            </div>
        </div>
    );
};

/* --- MIND MAP VIEW --- */
export const MindMapView = () => {
    const { selectedItemIds, items, updateItem, selectItem, setViewMode, viewRootId } = useAppStore();
    // Use viewRootId for context
    const parent = viewRootId ? items[viewRootId] : null;
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
            
            {children.map(node => (
                <div 
                    key={node.id}
                    className={`absolute shadow-lg rounded-lg border border-gray-200 dark:border-gray-700 p-3 min-w-[150px] bg-white dark:bg-[#2d2d2d] flex flex-col gap-2 group ${draggingId === node.id ? 'z-50 shadow-xl scale-105' : 'z-10'} ${selectedItemIds.includes(node.id) ? 'ring-2 ring-blue-500 border-transparent' : ''} transition-transform duration-75`}
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
                    <div className="absolute -top-2 -left-2 bg-white dark:bg-[#333] p-1 rounded-full shadow border border-gray-200 dark:border-gray-600 opacity-0 group-hover:opacity-100 cursor-move text-gray-400 z-20">
                        <Move size={12} />
                    </div>

                    <input 
                        className="font-bold text-sm bg-transparent outline-none dark:text-gray-200 cursor-text" 
                        value={node.title} 
                        onChange={(e) => updateItem(node.id, { title: e.target.value })}
                        onMouseDown={(e) => e.stopPropagation()}
                    />
                     <textarea 
                        className="text-xs text-gray-500 dark:text-gray-400 bg-transparent outline-none resize-none h-12 cursor-text"
                        placeholder="Note..."
                        value={node.synopsis || ''}
                        onChange={(e) => updateItem(node.id, { synopsis: e.target.value })}
                        onMouseDown={(e) => e.stopPropagation()}
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

/* --- TIMELINE VIEW --- */
export const TimelineView = () => {
    return (
        <div className="h-full bg-white dark:bg-[#1e1e1e] overflow-x-auto overflow-y-hidden flex flex-col p-4">
             <div className="flex gap-4 mb-4 border-b border-gray-200 dark:border-gray-700 pb-2 min-w-max">
                 <div className="w-32 font-bold text-gray-400 uppercase text-xs">Plot Lines</div>
                 {[1, 2, 3, 4, 5, 6].map(i => (
                     <div key={i} className="w-64 font-semibold text-gray-600 dark:text-gray-400 text-center">Scene {i}</div>
                 ))}
             </div>
             
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

              <div className="flex gap-4 min-w-max">
                 <div className="w-32 flex items-center justify-end pr-4 font-bold text-purple-500">Sub Plot</div>
                 <div className="w-64"></div> 
                 <div className="w-64 h-32 bg-purple-50 dark:bg-purple-900/20 border-l-4 border-purple-400 rounded p-3 shadow-sm hover:shadow-md transition-shadow">
                     <div className="text-sm font-bold text-purple-900 dark:text-purple-100 mb-1">Romantic Tension</div>
                     <div className="text-xs text-gray-600 dark:text-gray-400 leading-tight">They meet in the rain...</div>
                 </div>
             </div>
        </div>
    );
};
