import React, { useEffect, useState } from 'react';
import { useAppStore } from './store';
import { Binder } from './components/Binder';
import { EditorView, CorkboardView, OutlinerView, MindMapView, TimelineView } from './components/Views';
import { Inspector } from './components/Inspector';
import { TitleBar, Toolbar, StatusBar, TopDrawer } from './components/Layout';
import { Plus, Book, FileText } from 'lucide-react';

/* --- DASHBOARD VIEW --- */
const Dashboard = () => {
    const { openProject, createProject } = useAppStore();
    const [isCreating, setIsCreating] = useState(false);

    return (
        <div className="h-screen w-screen bg-[#f3f3f3] dark:bg-[#181818] flex items-center justify-center p-10">
            <div className="w-full max-w-5xl h-full grid grid-cols-12 bg-white dark:bg-[#202020] rounded-xl shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-700">
                {/* Left Panel */}
                <div className="col-span-4 bg-gray-50 dark:bg-[#252525] p-8 border-r border-gray-200 dark:border-gray-700 flex flex-col">
                    <div className="flex items-center gap-3 mb-10">
                        <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center text-white font-serif font-bold text-lg shadow-lg">J</div>
                        <span className="font-semibold text-xl text-gray-700 dark:text-gray-200">Just Write</span>
                    </div>
                    
                    <div className="space-y-2">
                        <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Projects</div>
                        <button className="w-full text-left p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-200 rounded font-medium">Recent Projects</button>
                        <button className="w-full text-left p-2 hover:bg-gray-200 dark:hover:bg-[#333] text-gray-600 dark:text-gray-400 rounded transition-colors">Templates</button>
                        <button className="w-full text-left p-2 hover:bg-gray-200 dark:hover:bg-[#333] text-gray-600 dark:text-gray-400 rounded transition-colors">Tutorials</button>
                    </div>

                    <div className="mt-auto">
                        <div className="text-xs text-gray-400">Version 1.0.0</div>
                    </div>
                </div>

                {/* Right Panel */}
                <div className="col-span-8 p-8 flex flex-col">
                     <div className="flex justify-between items-center mb-6">
                         <h2 className="text-2xl font-light text-gray-800 dark:text-gray-100">Recent Projects</h2>
                         <div className="flex gap-2">
                             <button className="px-4 py-2 bg-gray-200 dark:bg-[#333] rounded-lg text-sm font-medium hover:bg-gray-300 dark:hover:bg-[#444] transition-colors text-gray-700 dark:text-gray-200">Open...</button>
                             <button 
                                onClick={() => createProject("New Novel")}
                                className="px-4 py-2 bg-blue-600 rounded-lg text-sm font-medium text-white shadow-lg shadow-blue-500/30 hover:bg-blue-700 transition-colors flex items-center gap-2"
                             >
                                 <Plus size={16} /> New Project
                             </button>
                         </div>
                     </div>

                     <div className="grid grid-cols-2 gap-4">
                         {/* Mock Project Card */}
                         <div 
                            onClick={() => openProject('mock-id')}
                            className="group cursor-pointer border border-gray-200 dark:border-gray-700 rounded-xl p-4 hover:border-blue-400 dark:hover:border-blue-500 transition-all hover:shadow-md bg-gray-50 dark:bg-[#2a2a2a]"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className="p-3 bg-white dark:bg-[#333] rounded-lg shadow-sm group-hover:scale-105 transition-transform">
                                    <Book size={24} className="text-blue-500" />
                                </div>
                                <span className="text-xs text-gray-400">Edited 2h ago</span>
                            </div>
                            <h3 className="font-bold text-gray-800 dark:text-gray-100 mb-1">The Midnight Library</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">A story about a library between life and death...</p>
                         </div>
                         
                         <div className="border border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-4 flex flex-col items-center justify-center text-gray-400 hover:bg-gray-50 dark:hover:bg-[#252525] cursor-pointer transition-colors" onClick={() => createProject("New")}>
                             <Plus size={32} className="mb-2 opacity-50" />
                             <span className="text-sm">Create Blank Project</span>
                         </div>
                     </div>
                </div>
            </div>
        </div>
    );
};

/* --- MAIN WORKSPACE --- */
const Workspace = () => {
    const { viewMode } = useAppStore();

    const renderMainView = () => {
        switch (viewMode) {
            case 'editor': return <EditorView />;
            case 'corkboard': return <CorkboardView />;
            case 'outliner': return <OutlinerView />;
            case 'mindmap': return <MindMapView />;
            case 'timeline': return <TimelineView />;
            default: return <CorkboardView />;
        }
    };

    return (
        <div className="h-screen w-screen flex flex-col bg-white dark:bg-[#121212] overflow-hidden">
            <TitleBar />
            <Toolbar />
            <TopDrawer />
            
            <div className="flex-1 flex overflow-hidden relative">
                {/* Binder Sidebar */}
                <div className="w-64 flex-shrink-0 z-10">
                    <Binder />
                </div>
                
                {/* Main Content Area */}
                <div className="flex-1 relative flex flex-col min-w-0 bg-[#f8f9fa] dark:bg-[#181818] shadow-inner">
                    {renderMainView()}
                </div>

                {/* Inspector Sidebar */}
                <div className="flex-shrink-0 z-10">
                    <Inspector />
                </div>
            </div>

            <StatusBar />
        </div>
    );
};

const App = () => {
  const { currentView } = useAppStore();
  const [darkMode, setDarkMode] = useState(false);

  // Hacky simple theme toggle effect for demo purposes (usually handled by system preference or context)
  useEffect(() => {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
       // Optional: Auto detect
       // setDarkMode(true);
    }
  }, []);

  return (
    <div className={darkMode ? 'dark' : ''}>
        {currentView === 'dashboard' ? <Dashboard /> : <Workspace />}
    </div>
  );
};

export default App;
