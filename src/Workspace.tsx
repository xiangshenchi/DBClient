import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Play, LayoutPanelLeft, Table2, Key, AlertTriangle, Download, X, Loader2, History } from 'lucide-react';
import { DBConnection, TableStructure, QueryResult } from './types';
import { getDatabaseStructure, executeQuery } from './api';

const ResizableHeader = ({ children }: { children: React.ReactNode }) => {
  const [width, setWidth] = useState(80);
  const [isResizing, setIsResizing] = useState(false);
  const startXRef = useRef(0);
  const startWidthRef = useRef(0);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsResizing(true);
    startXRef.current = e.clientX;
    startWidthRef.current = width;
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;
      const diff = e.clientX - startXRef.current;
      setWidth(Math.max(50, startWidthRef.current + diff));
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      document.body.style.userSelect = 'none';
      document.body.style.cursor = 'col-resize';
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    } else {
      document.body.style.userSelect = '';
      document.body.style.cursor = '';
    }

    return () => {
      document.body.style.userSelect = '';
      document.body.style.cursor = '';
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing]);

  return (
    <th 
      style={{ width, minWidth: width, maxWidth: width }} 
      className="p-3 font-medium text-slate-700 dark:text-slate-300 border-r border-slate-200 dark:border-slate-800 last:border-0 relative select-none truncate group"
    >
      {children}
      <div 
        onMouseDown={handleMouseDown}
        className={`absolute top-0 right-0 bottom-0 w-1.5 cursor-col-resize z-10 transition-colors ${isResizing ? 'bg-blue-500' : 'bg-transparent group-hover:bg-slate-300 dark:group-hover:bg-slate-700 hover:!bg-blue-400'}`}
      />
    </th>
  );
};

export default function Workspace({
  connection,
  onBack
}: {
  connection: DBConnection,
  onBack: () => void
}) {
  const [drawerOpen, setDrawerOpen] = useState(true);
  const [structure, setStructure] = useState<TableStructure>({});
  const [isStructureLoading, setIsStructureLoading] = useState(true);
  const [sql, setSql] = useState('SHOW TABLES;');
  const [isRunning, setIsRunning] = useState(false);
  const [result, setResult] = useState<QueryResult | null>(null);
  const [sidebarWidth, setSidebarWidth] = useState(256);
  const [isResizing, setIsResizing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const historyKey = `dbclient_history_${connection.id}`;
  const [queryHistory, setQueryHistory] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem(historyKey);
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      return [];
    }
  });
  const [sidebarTab, setSidebarTab] = useState<'tables' | 'history'>('tables');

  useEffect(() => {
    try {
      localStorage.setItem(historyKey, JSON.stringify(queryHistory));
    } catch (e) {
      // ignore
    }
  }, [queryHistory, historyKey]);

  useEffect(() => {
    const handleMove = (e: MouseEvent | TouchEvent) => {
      if (!isResizing) return;
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      let newWidth = clientX;
      const minWidth = 100;
      const maxWidth = window.innerWidth - 50; // Leave some space for editor
      if (newWidth < minWidth) newWidth = minWidth;
      if (newWidth > maxWidth) newWidth = maxWidth;
      setSidebarWidth(newWidth);
    };

    const handleUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      document.addEventListener('mousemove', handleMove);
      document.addEventListener('mouseup', handleUp);
      document.addEventListener('touchmove', handleMove);
      document.addEventListener('touchend', handleUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMove);
      document.removeEventListener('mouseup', handleUp);
      document.removeEventListener('touchmove', handleMove);
      document.removeEventListener('touchend', handleUp);
    };
  }, [isResizing]);

  useEffect(() => {
    setIsStructureLoading(true);
    getDatabaseStructure(connection).then(res => {
      if (res.success && res.structure) {
        setStructure(res.structure);
      }
    }).finally(() => {
      setIsStructureLoading(false);
    });
  }, [connection]);

  const runQuery = async () => {
    if (!sql.trim() || isRunning) return;
    setIsRunning(true);
    setResult(null);
    try {
      const res = await executeQuery(connection, sql);
      setResult(res);
      setQueryHistory(prev => {
        const filteredHistory = prev.filter(q => q !== sql);
        const newHistory = [...filteredHistory, sql];
        return newHistory.length > 200 ? newHistory.slice(-200) : newHistory;
      });
    } catch(e: any) {
      setResult({ success: false, error: e.message });
    }
    setIsRunning(false);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        runQuery();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [sql, isRunning, connection]);

  const handleTableClick = (tableName: string) => {
    setSql(`SELECT * FROM ${tableName} LIMIT 100;`);
  };

  const handleDownloadCsv = () => {
    if (!result || !result.rows || result.rows.length === 0) return;
    const header = Object.keys(result.rows[0]);
    const csvContent = [
      header.join(','),
      ...result.rows.map(r => header.map(k => {
        let val = r[k];
        if (val === null) return '';
        val = String(val).replace(/"/g, '""');
        return `"${val}"`;
      }).join(','))
    ].join('\n');
    
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'query_result.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 relative">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 z-20">
        <button onClick={onBack} className="p-2 -ml-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="font-medium truncate text-sm">{connection.name}</h1>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">{connection.host}</p>
        </div>
        <button 
          onClick={() => setDrawerOpen(!drawerOpen)}
          className={`p-2 rounded-lg transition-colors ${drawerOpen ? 'bg-blue-600/20 text-blue-600 dark:text-blue-400' : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300'}`}
        >
          <LayoutPanelLeft className="w-5 h-5" />
        </button>
      </div>

      {/* Body Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        {drawerOpen && (
          <div 
            style={{ width: sidebarWidth }}
            className="bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col flex-shrink-0 relative"
          >
            {/* Drag Handle */}
            <div 
              onMouseDown={(e) => { e.preventDefault(); setIsResizing(true); }}
              onTouchStart={(e) => { setIsResizing(true); }}
              className={`absolute top-0 -right-3 w-6 h-full cursor-col-resize z-50 transition-colors ${isResizing ? 'bg-blue-500' : 'hover:bg-blue-500/50'}`}
            />
            <div className="p-3 border-b border-slate-200 dark:border-slate-800 flex flex-col gap-2">
              <div className="flex items-center gap-4 text-xs font-semibold uppercase tracking-wider">
                <button 
                  onClick={() => setSidebarTab('tables')}
                  className={`transition-colors ${sidebarTab === 'tables' ? 'text-blue-600 dark:text-blue-400 font-bold' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'}`}
                >
                  Tables
                </button>
                <button 
                  onClick={() => setSidebarTab('history')}
                  className={`flex items-center gap-1 transition-colors ${sidebarTab === 'history' ? 'text-blue-600 dark:text-blue-400 font-bold' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'}`}
                >
                  <History className="w-3 h-3" /> History
                </button>
              </div>
              {sidebarTab === 'tables' && (
                <input 
                  type="text" 
                  placeholder="Search tables..." 
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="w-full bg-slate-100 dark:bg-slate-800 border border-transparent focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900 outline-none rounded-md px-2 py-1 text-xs text-slate-700 dark:text-slate-300 placeholder-slate-400 transition-all"
                />
              )}
            </div>
            <div className="flex-1 overflow-y-auto overflow-x-hidden p-2 relative">
              {sidebarTab === 'history' ? (
                <div className="flex flex-col gap-2">
                  {queryHistory.length === 0 ? (
                    <div className="p-4 text-center text-slate-500 text-xs text-balance">
                      <span className="block mb-1">No history yet</span>
                      <span className="text-[10px]">Queries run in this session will appear here</span>
                    </div>
                  ) : (
                    queryHistory.slice().reverse().map((q, i) => (
                      <div 
                        key={i} 
                        onClick={() => setSql(q)}
                        className="p-2 bg-slate-100 dark:bg-slate-800/50 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-md cursor-pointer text-[10px] font-mono text-slate-700 dark:text-slate-300 break-all border border-slate-200 dark:border-slate-800/50 transition-colors line-clamp-4"
                        title={q}
                      >
                        {q}
                      </div>
                    ))
                  )}
                </div>
              ) : isStructureLoading ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500 gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span className="text-xs">Loading...</span>
                </div>
              ) : Object.keys(structure).length === 0 ? (
                <div className="p-4 text-center text-slate-500 text-xs text-balance">
                  <span className="block mb-1">No tables found</span>
                  <span className="text-[10px]">or failed to connect</span>
                </div>
              ) : Object.entries(structure).filter(([tableName]) => tableName.toLowerCase().includes(searchTerm.toLowerCase())).length === 0 ? (
                <div className="p-4 text-center text-slate-500 text-xs text-balance">
                  <span className="block mb-1">No matching tables</span>
                </div>
              ) : (
                Object.entries(structure)
                  .filter(([tableName]) => tableName.toLowerCase().includes(searchTerm.toLowerCase()))
                  .map(([tableName, cols]) => (
                  <details key={tableName} className="group min-w-0" open={searchTerm.length > 0}>
                  <summary className="cursor-pointer p-2 rounded hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center text-sm select-none list-none [&::-webkit-details-marker]:hidden min-w-0" title={tableName} onClick={(e) => {
                    handleTableClick(tableName);
                  }}>
                    <Table2 className="w-4 h-4 text-slate-400 shrink-0 mr-2" />
                    <span className="flex-1 truncate text-left text-slate-700 dark:text-slate-200 font-medium">{tableName}</span>
                  </summary>
                  <div className="pl-6 pb-2 min-w-0">
                    {(cols as any[]).map(c => (
                      <div key={c.name} className="flex items-center py-1 text-xs px-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded group/col cursor-pointer min-w-0" title={`${c.name} (${c.type})`} onClick={() => setSql(prev => prev + ` ${c.name}`)}>
                        {c.primaryKey ? <Key className="w-3 h-3 text-yellow-500 shrink-0 mr-1.5" /> : <div className="w-3 h-3 shrink-0 mr-1.5" />}
                        <span className="text-slate-600 dark:text-slate-300 truncate min-w-0 text-left mr-1">{c.name}</span>
                        <span className="text-slate-500 shrink ml-auto text-[10px] truncate max-w-[40%] text-right">{c.type}</span>
                      </div>
                    ))}
                  </div>
                </details>
              )))}
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Editor Space */}
          <div className="flex-shrink-0 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 p-2 relative h-[180px] flex flex-col">
        <textarea
          value={sql}
          onChange={e => setSql(e.target.value)}
          className="flex-1 w-full bg-transparent resize-none outline-none font-mono text-sm p-2 text-blue-600 dark:text-blue-300 placeholder-slate-400 dark:placeholder-slate-600"
          placeholder="ENTER SQL HERE... (SELECT, SHOW, DESCRIBE)"
          spellCheck={false}
        />
        <div className="flex justify-between items-center px-2 pb-2">
           <span className="text-[10px] text-slate-500 font-mono flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" /> Read-only (LIMIT auto-applied)
          </span>
          <div className="flex items-center gap-3">
            <span className="text-[10px] text-slate-400 hidden sm:inline-flex items-center gap-1.5 opacity-70">
              <kbd className="font-sans font-medium px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm text-[9px]">Ctrl</kbd>
              <span>+</span>
              <kbd className="font-sans font-medium px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm text-[9px]">Enter</kbd>
            </span>
            <button 
              disabled={isRunning || !sql.trim()}
              onClick={runQuery}
            className="bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-200 dark:disabled:bg-slate-800 disabled:text-slate-400 dark:disabled:text-slate-500 text-white px-4 py-1.5 rounded-lg text-sm font-medium flex items-center gap-2 transition-all"
          >
            {isRunning ? (
              <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            ) : (
              <Play className="w-4 h-4 fill-current" />
            )}
            Run
          </button>
          </div>
        </div>
      </div>

      {/* Results Space */}
      <div className="flex-1 overflow-hidden flex flex-col bg-slate-50 dark:bg-slate-950">
        {result ? (
          result.success ? (
            <>
              <div className="flex justify-between items-center px-4 py-2 border-b border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900/30 text-xs text-slate-500 dark:text-slate-400">
                <span>{result.count} rows in {result.ms}ms</span>
                {result.rows && result.rows.length > 0 && (
                  <button onClick={handleDownloadCsv} className="hover:text-slate-900 dark:hover:text-white flex items-center gap-1 transition-colors">
                    <Download className="w-3 h-3" /> CSV
                  </button>
                )}
              </div>
              <div className="flex-1 overflow-auto">
                {result.rows && result.rows.length > 0 ? (
                  <table className="w-max min-w-full text-left border-collapse text-sm whitespace-nowrap" style={{ tableLayout: 'fixed' }}>
                    <thead className="bg-slate-100 dark:bg-slate-900 sticky top-0 z-10 shadow-sm border-b border-slate-200 dark:border-slate-800">
                      <tr>
                        {Object.keys(result.rows[0]).map(key => (
                          <ResizableHeader key={key}>{key}</ResizableHeader>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-800/50 font-mono">
                      {result.rows.map((row, i) => (
                        <tr key={i} className="hover:bg-white dark:hover:bg-slate-900/50">
                          {Object.values(row).map((val: any, j) => (
                            <td key={j} className="p-3 border-r border-slate-200 dark:border-slate-800/50 last:border-0 truncate">
                              {val === null ? <span className="text-slate-400 dark:text-slate-600 italic">NULL</span> : String(val)}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="p-6 text-center text-slate-500 font-mono text-sm">Query returned 0 rows.</div>
                )}
              </div>
            </>
          ) : (
            <div className="p-4 m-4 rounded border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 text-sm font-mono break-words">
              {result.error}
            </div>
          )
        ) : (
          <div className="flex-1 flex items-center justify-center text-slate-400 dark:text-slate-600 text-sm flex-col gap-2">
            <Table2 className="w-8 h-8 opacity-20" />
            No results
          </div>
        )}
      </div>
        </div>
      </div>
    </div>
  );
}
