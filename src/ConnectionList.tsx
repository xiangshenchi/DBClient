import React, { useState, useMemo } from 'react';
import { Database, Plus, Server, Clock, Trash2, Edit2, Play, Cloud, Sun, Moon, Search, Languages, Menu } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { DBConnection } from './types';
import { pingConnection } from './api';
import { DndContext, closestCenter, MouseSensor, TouchSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { SortableContext, arrayMove, rectSortingStrategy } from '@dnd-kit/sortable';
import { SortableConnectionItem } from './SortableConnectionItem';

const globalPingStates: Record<string, { resolving: boolean, success?: boolean, ms?: number }> = {};

export default function ConnectionList({ 
  connections, 
  onSelect, 
  onEdit, 
  onDelete,
  onBackupConfig,
  onReorder,
  theme,
  onToggleTheme,
  onToggleLanguage,
  onToggleFavorite
}: { 
  connections: DBConnection[], 
  onSelect: (c: DBConnection) => void, 
  onEdit: (c?: DBConnection) => void,
  onDelete: (id: string) => void,
  onBackupConfig: () => void,
  onReorder: (connections: DBConnection[]) => void,
  theme: 'light' | 'dark',
  onToggleTheme: () => void,
  onToggleLanguage: () => void,
  onToggleFavorite: (id: string) => void
}) {
  const { t } = useTranslation();
  const [pingStates, setPingStates] = useState<Record<string, { resolving: boolean, success?: boolean, ms?: number }>>(globalPingStates);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const searchInputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'f') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const filteredConnections = useMemo(() => {
    return connections.filter(c => {
      const matchSearch = !searchTerm.trim() || c.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchType = filterType === 'all' || c.type === filterType;
      return matchSearch && matchType;
    });
  }, [connections, searchTerm, filterType]);

  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250,
        tolerance: 10,
      },
    })
  );

  const handlePing = async (e: React.MouseEvent, conn: DBConnection) => {
    e.stopPropagation();
    setPingStates(prev => {
      const next = { ...prev, [conn.id]: { resolving: true } };
      Object.assign(globalPingStates, next);
      return next;
    });
    const res = await pingConnection(conn);
    setPingStates(prev => {
      const next = { ...prev, [conn.id]: { resolving: false, success: res.success, ms: res.ms } };
      Object.assign(globalPingStates, next);
      return next;
    });
  };

  React.useEffect(() => {
    // Attempt lightweight heartbeat ping on all connections when app loads/mounts
    // Only ping if not already pinged (e.g. tracking resolving or success state)
    connections.forEach(conn => {
      setPingStates(prev => {
        if (prev[conn.id]) return prev;
        
        // Kick off ping for this connection asynchronously
        const doPing = async () => {
          const res = await pingConnection(conn);
          setPingStates(p => {
            const next = { ...p, [conn.id]: { resolving: false, success: res.success, ms: res.ms } };
            Object.assign(globalPingStates, next);
            return next;
          });
        };
        doPing();
        
        const next = { ...prev, [conn.id]: { resolving: true } };
        Object.assign(globalPingStates, next);
        return next;
      });
    });
  }, [connections]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = connections.findIndex(c => c.id === active.id);
      const newIndex = connections.findIndex(c => c.id === over.id);
      const newOrder = arrayMove(connections, oldIndex, newIndex);
      onReorder(newOrder);
    }
  };

  return (
    <div className="h-full overflow-y-auto bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      <div className="flex items-center justify-between px-6 py-5 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/50 backdrop-blur-sm sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <img src="https://b2.chix.pp.ua/Imghub/Services/1781414486188.webp" alt="App Icon" className="w-8 h-8 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700" />
          <h1 className="text-xl font-medium tracking-tight">DBClient</h1>
        </div>
        <div className="flex gap-2 sm:gap-3 items-center">
          <div className="hidden sm:flex gap-3">
            <button 
              onClick={onToggleLanguage}
              className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 flex items-center justify-center transition-colors shadow-sm"
              title={t('switch_language')}
            >
              <Languages className="w-5 h-5 text-slate-700 dark:text-slate-300" />
            </button>
            <button 
              onClick={onToggleTheme}
              className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 flex items-center justify-center transition-colors shadow-sm"
              title={t('toggle_theme')}
            >
              {theme === 'dark' ? <Sun className="w-5 h-5 text-slate-700 dark:text-slate-300" /> : <Moon className="w-5 h-5 text-slate-700 dark:text-slate-300" />}
            </button>
            <button 
              onClick={() => onBackupConfig()}
              className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 flex items-center justify-center transition-colors shadow-sm"
              title={t('webdav_sync')}
            >
              <Cloud className="w-5 h-5 text-slate-700 dark:text-slate-300" />
            </button>
          </div>

          <div className="relative sm:hidden">
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 flex items-center justify-center transition-colors shadow-sm"
            >
              <Menu className="w-5 h-5 text-slate-700 dark:text-slate-300" />
            </button>
            
            {isMobileMenuOpen && (
              <>
                <div 
                  className="fixed inset-0 z-40"
                  onClick={() => setIsMobileMenuOpen(false)}
                />
                <div className="absolute right-0 top-12 w-48 py-2 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 z-50 flex flex-col">
                  <button 
                    onClick={() => { onToggleLanguage(); setIsMobileMenuOpen(false); }}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors w-full text-left"
                  >
                    <Languages className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                    <span className="text-sm font-medium">{t('switch_language')}</span>
                  </button>
                  <button 
                    onClick={() => { onToggleTheme(); setIsMobileMenuOpen(false); }}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors w-full text-left"
                  >
                    {theme === 'dark' ? <Sun className="w-4 h-4 text-slate-500 dark:text-slate-400" /> : <Moon className="w-4 h-4 text-slate-500 dark:text-slate-400" />}
                    <span className="text-sm font-medium">{t('toggle_theme')}</span>
                  </button>
                  <button 
                    onClick={() => { onBackupConfig(); setIsMobileMenuOpen(false); }}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors w-full text-left"
                  >
                    <Cloud className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                    <span className="text-sm font-medium">{t('webdav_sync')}</span>
                  </button>
                </div>
              </>
            )}
          </div>

          <button 
            onClick={() => onEdit()}
            className="w-10 h-10 shrink-0 rounded-full bg-blue-600 hover:bg-blue-500 flex items-center justify-center transition-colors shadow-lg shadow-blue-500/20"
            title={t('add_connection')}
          >
            <Plus className="w-5 h-5 text-white" />
          </button>
        </div>
      </div>

      <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/50 backdrop-blur-sm sticky top-[73px] z-10">
        <div className="flex gap-2 w-full">
          <div className="relative flex-1">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder={t('search_connections')}
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-lg pl-10 pr-4 py-2 outline-none focus:border-blue-500 transition-all text-sm"
            />
          </div>
          <select
            value={filterType}
            onChange={e => setFilterType(e.target.value)}
            className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-lg px-3 py-2 outline-none focus:border-blue-500 transition-all text-sm cursor-pointer"
          >
            <option value="all">{t('filter_all')}</option>
            <option value="mysql">MySQL</option>
            <option value="postgres">PostgreSQL</option>
            <option value="redis">Redis</option>
          </select>
        </div>
      </div>

      <div className="p-4 w-full">
        {filteredConnections.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-slate-400 dark:text-slate-500">
            <Database className="w-12 h-12 mb-4 opacity-20" />
            <p>{(searchTerm || filterType !== 'all') ? t('no_connections_found') : t('no_connections_found')}</p>
            {(!searchTerm && filterType === 'all') && <p className="text-sm mt-1">{t('get_started_add')}</p>}
          </div>
        ) : (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <SortableContext items={filteredConnections} strategy={rectSortingStrategy}>
                {filteredConnections.map(conn => (
                  <SortableConnectionItem
                    key={conn.id}
                    conn={conn}
                    ping={pingStates[conn.id]}
                    deleteConfirmId={deleteConfirmId}
                    onSelect={onSelect}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    onPing={handlePing}
                    onToggleFavorite={(e, id) => { e.stopPropagation(); onToggleFavorite(id); }}
                    setDeleteConfirmId={setDeleteConfirmId}
                  />
                ))}
              </SortableContext>
            </div>
          </DndContext>
        )}
      </div>
    </div>
  );
}
