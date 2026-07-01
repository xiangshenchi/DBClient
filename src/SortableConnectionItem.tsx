import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Database, Server, Clock, Trash2, Edit2, Play, GripVertical, Star } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { DBConnection } from './types';

export function SortableConnectionItem({
  conn,
  ping,
  deleteConfirmId,
  onSelect,
  onEdit,
  onDelete,
  onPing,
  onToggleFavorite,
  setDeleteConfirmId
}: {
  conn: DBConnection;
  ping?: { resolving: boolean; success?: boolean; ms?: number };
  deleteConfirmId: string | null;
  onSelect: (conn: DBConnection) => void;
  onEdit: (conn: DBConnection) => void;
  onDelete: (id: string) => void;
  onPing: (e: React.MouseEvent, conn: DBConnection) => Promise<void> | void;
  onToggleFavorite: (e: React.MouseEvent, id: string) => void;
  setDeleteConfirmId: React.Dispatch<React.SetStateAction<string | null>>;
  key?: React.Key;
}) {
  const { t } = useTranslation();
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: conn.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-white dark:bg-slate-900 border ${isDragging ? 'border-blue-500 shadow-xl opacity-90 scale-[1.02]' : 'border-slate-200 dark:border-slate-800'} rounded-xl overflow-hidden hover:border-slate-300 dark:hover:border-slate-700 transition-all flex flex-col`}
    >
      <div 
        className="flex-1 p-4 flex gap-4 items-center cursor-pointer select-none"
        onClick={() => onSelect(conn)}
        onContextMenu={(e) => isDragging && e.preventDefault()}
        style={{ WebkitTouchCallout: 'none', WebkitUserSelect: 'none' } as any}
        {...attributes}
        {...listeners}
      >
        <div className="w-12 h-12 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center shrink-0 relative">
          {isDragging ? (
            <GripVertical className="w-6 h-6 text-blue-500 animate-in fade-in zoom-in duration-200" />
          ) : (
            <Database className={`w-8 h-8 shrink-0 ${
              conn.type === 'mysql' ? 'text-orange-500 dark:text-orange-400' :
              conn.type === 'redis' ? 'text-red-500 dark:text-red-400' :
              'text-blue-500 dark:text-blue-400'
            }`} />
          )}
        </div>
        
        <div className="flex-1 min-w-0 pointer-events-none">
          <h3 className="font-medium text-base truncate">{conn.name}</h3>
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-1 truncate">
            <Server className="w-4 h-4 shrink-0" />
            <span className="truncate">{conn.host}:{conn.port}</span>
          </div>
        </div>

        <div className="flex flex-col items-end gap-2 shrink-0 pointer-events-none">
          {ping?.resolving ? (
            <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
              <div className="w-2.5 h-2.5 rounded-full bg-slate-300 dark:bg-slate-600 animate-pulse" />
              <span>{t('pinging')}</span>
            </div>
          ) : ping?.success !== undefined ? (
            <div className={`flex items-center gap-1.5 text-xs ${ping.success ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500 dark:text-red-400'}`}>
              <div className={`w-2.5 h-2.5 rounded-full ${ping.success ? 'bg-emerald-500 dark:bg-emerald-400' : 'bg-red-500 dark:bg-red-400'}`} />
              <span>{ping.success ? t('online') : t('offline')}</span>
              {ping.success && <span className="text-[10px] opacity-70 ml-1">({ping.ms}ms)</span>}
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-500">
              <div className="w-2.5 h-2.5 rounded-full bg-slate-300 dark:bg-slate-600" />
              <span>{t('unknown')}</span>
            </div>
          )}
        </div>
      </div>
      
      <div className="bg-slate-50 dark:bg-slate-950/50 px-4 py-3 flex justify-between border-t border-slate-200 dark:border-slate-800/50">
        <div className="flex gap-2">
          <button 
            onClick={(e) => onToggleFavorite(e, conn.id)}
            className={`p-2 transition-colors rounded-lg ${conn.isFavorite ? 'text-amber-500 hover:bg-slate-200 dark:hover:bg-slate-800' : 'text-slate-500 dark:text-slate-400 hover:text-amber-500 hover:bg-slate-200 dark:hover:bg-slate-800'}`}
            title={conn.isFavorite ? t('unfavorite') : t('favorite')}
          >
            <Star className="w-4 h-4" fill={conn.isFavorite ? "currentColor" : "none"} />
          </button>
          <button 
            onClick={(e) => onPing(e, conn)}
            className="p-2 text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800"
            title={t('test_connection')}
          >
            <Play className="w-4 h-4" />
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); onEdit(conn); }}
            className="p-2 text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800"
            title={t('edit')}
          >
            <Edit2 className="w-4 h-4" />
          </button>
        </div>
        <button 
          onClick={(e) => {
            e.stopPropagation();
            if (deleteConfirmId === conn.id) {
              onDelete(conn.id);
              setDeleteConfirmId(null);
            } else {
              setDeleteConfirmId(conn.id);
              setTimeout(() => {
                setDeleteConfirmId(current => current === conn.id ? null : current);
              }, 3000);
            }
          }}
          className={`px-3 py-2 text-sm font-medium transition-colors rounded-lg flex items-center gap-2 ${deleteConfirmId === conn.id ? 'bg-red-500 hover:bg-red-600 text-white' : 'text-slate-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-slate-200 dark:hover:bg-slate-800'}`}
          title={t('delete')}
        >
          <Trash2 className="w-4 h-4 shrink-0" />
          {deleteConfirmId === conn.id && <span>{t('confirm')}</span>}
        </button>
      </div>
    </div>
  );
}
