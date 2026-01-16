import React from 'react';
import { useAppStore } from '../store';
import { 
  Layout, 
  Settings, 
  Sidebar, 
  PanelRight, 
  Grid, 
  FileText, 
  List, 
  Search,
  PenTool,
  BrainCircuit,
  Calendar,
  Sparkles,
  Construction
} from 'lucide-react';
import { ViewMode } from '../types';

export const TitleBar = () => {
    return (
        <div className="h-10 bg-white dark:bg-[#202020] border-b border-gray-200 dark:border-gray-800 flex items-center px-4 justify-between select-none app-region-drag">
            <div className="flex items-center gap-3">
                <div className="w-5 h-5 bg-blue-600 rounded flex items-center justify-center text-white font-serif font-bold text-xs shadow-lg shadow-blue-500/30">J</div>
                <span className="font-semibold text-sm text-gray-700 dark:text-gray-200">Just Write</span>
                <span className="text-gray-300 dark:text-gray-600 mx-2">|</span>
                <span className="text-sm text-gray-500 dark:text-gray-400">My Novel Project</span>
            </div>
            <div className="flex items-center gap-4 text-gray-500 dark:text-gray-400">
                <div className="flex items-center bg-gray-100 dark:bg-[#2a2a2a] rounded px-2 py-1 gap-2">
                    <Search size={14} />
                    <span className="text-xs pr-10">Search...</span>
                </div>
            </div>
        </div>
    );
};

export const Toolbar = () => {
    const { viewMode, setViewMode, toggleTopDrawer, toggleInspector, inspectorOpen } = useAppStore();

    const ViewBtn = ({ mode, icon: Icon, label }: { mode: ViewMode, icon: any, label: string }) => (
        <button 
            onClick={() => setViewMode(mode)}
            className={`p-2 rounded-md flex items-center gap-2 transition-all ${viewMode === mode ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#2a2a2a]'}`}
            title={label}
        >
            <Icon size={18} />
        </button>
    );

    return (
        <div className="h-14 bg-white/80 dark:bg-[#202020]/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 flex items-center px-4 justify-between z-20 relative">
             <div className="flex items-center gap-1">
                <button className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-[#2a2a2a] rounded">
                    <Sidebar size={18} />
                </button>
                <div className="w-px h-6 bg-gray-200 dark:bg-gray-700 mx-2" />
                
                {/* View Modes Group */}
                <div className="flex bg-gray-100 dark:bg-[#1a1a1a] p-1 rounded-lg">
                    <ViewBtn mode="editor" icon={FileText} label="Editor" />
                    <ViewBtn mode="corkboard" icon={Grid} label="Corkboard" />
                    <ViewBtn mode="outliner" icon={List} label="Outliner" />
                    <ViewBtn mode="mindmap" icon={BrainCircuit} label="Mind Map" />
                    <ViewBtn mode="timeline" icon={Calendar} label="Timeline" />
                </div>
             </div>

             <div className="flex items-center gap-2">
                 <button 
                    onClick={toggleTopDrawer}
                    className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 dark:bg-[#2a2a2a] text-gray-600 dark:text-gray-300 rounded-lg text-xs font-medium hover:bg-gray-200 dark:hover:bg-[#333] transition-all"
                 >
                     <Sparkles size={14} />
                     <span>Tools</span>
                 </button>
                 <div className="w-px h-6 bg-gray-200 dark:bg-gray-700 mx-2" />
                 <button 
                    onClick={toggleInspector}
                    className={`p-2 rounded ${inspectorOpen ? 'text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-900/20' : 'text-gray-500'}`}
                >
                    <PanelRight size={18} />
                </button>
             </div>
        </div>
    );
};

export const TopDrawer = () => {
    const { topDrawerOpen } = useAppStore();
    
    if (!topDrawerOpen) return null;

    return (
        <div className="absolute top-[96px] left-0 w-full h-48 bg-white dark:bg-[#1e1e1e] border-b border-gray-200 dark:border-gray-800 shadow-2xl z-30 flex animate-in slide-in-from-top-4 duration-200">
            <div className="flex-1 p-6 flex flex-col items-center justify-center text-gray-400">
                <Construction size={48} className="mb-4 text-blue-200 dark:text-blue-900" />
                <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-300">Tools Coming Soon</h3>
                <p className="text-sm text-gray-400 mt-2">This drawer will house advanced writing tools and utilities in a future update.</p>
            </div>
        </div>
    );
};

export const StatusBar = () => {
    return (
        <div className="h-8 bg-gray-50 dark:bg-[#202020] border-t border-gray-200 dark:border-gray-800 flex items-center px-4 justify-between text-xs text-gray-500 dark:text-gray-400 select-none">
            <div className="flex gap-4">
                <span>Words: 12,403</span>
                <span>Target: 50,000</span>
            </div>
            <div className="flex gap-4">
                <span className="hover:text-gray-800 dark:hover:text-gray-200 cursor-pointer">Focus Mode</span>
                <span>Auto-saved 2m ago</span>
            </div>
        </div>
    );
};