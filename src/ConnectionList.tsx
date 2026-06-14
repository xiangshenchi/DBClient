import React, { useState } from 'react';
import { Database, Plus, Server, Clock, Trash2, Edit2, Play, Cloud, Sun, Moon } from 'lucide-react';
import { DBConnection } from './types';
import { pingConnection } from './api';
import { DndContext, closestCenter, MouseSensor, TouchSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { SortableContext, arrayMove, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { SortableConnectionItem } from './SortableConnectionItem';

export default function ConnectionList({ 
  connections, 
  onSelect, 
  onEdit, 
  onDelete,
  onBackupConfig,
  onReorder,
  theme,
  onToggleTheme,
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
  onToggleFavorite: (id: string) => void
}) {
  const [pingStates, setPingStates] = useState<Record<string, { resolving: boolean, success?: boolean, ms?: number }>>({});
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

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
    setPingStates(prev => ({ ...prev, [conn.id]: { resolving: true } }));
    const res = await pingConnection(conn);
    setPingStates(prev => ({ ...prev, [conn.id]: { resolving: false, success: res.success, ms: res.ms } }));
  };

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
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      <div className="flex items-center justify-between px-6 py-5 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <img src="https://b2.chix.pp.ua/1781414486188.webp" alt="App Icon" className="w-8 h-8 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700" />
          <h1 className="text-xl font-medium tracking-tight">Connections</h1>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={onToggleTheme}
            className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 flex items-center justify-center transition-colors shadow-sm"
            title="Toggle Theme"
          >
            {theme === 'dark' ? <Sun className="w-5 h-5 text-slate-700 dark:text-slate-300" /> : <Moon className="w-5 h-5 text-slate-700 dark:text-slate-300" />}
          </button>
          <button 
            onClick={() => onBackupConfig()}
            className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 flex items-center justify-center transition-colors shadow-sm"
            title="Configure WebDAV Backup"
          >
            <Cloud className="w-5 h-5 text-slate-700 dark:text-slate-300" />
          </button>
          <button 
            onClick={() => onEdit()}
            className="w-10 h-10 rounded-full bg-blue-600 hover:bg-blue-500 flex items-center justify-center transition-colors shadow-lg shadow-blue-500/20"
            title="Add Connection"
          >
            <Plus className="w-5 h-5 text-white" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {connections.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-slate-400 dark:text-slate-500">
            <Database className="w-12 h-12 mb-4 opacity-20" />
            <p>No connections found.</p>
            <p className="text-sm">Click + to add a new database.</p>
          </div>
        ) : (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={connections} strategy={verticalListSortingStrategy}>
              {connections.map(conn => (
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
          </DndContext>
        )}
      </div>
    </div>
  );
}
