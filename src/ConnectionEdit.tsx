import React, { useState } from 'react';
import { ArrowLeft, Save } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { DBConnection, DBType } from './types';

export default function ConnectionEdit({
  connection,
  onSave,
  onCancel
}: {
  connection?: DBConnection,
  onSave: (c: DBConnection) => void,
  onCancel: () => void
}) {
  const { t } = useTranslation();
  const [formData, setFormData] = useState<Partial<DBConnection>>(
    connection || {
      id: crypto.randomUUID(),
      name: '',
      type: 'mysql',
      host: '',
      port: 3306,
      database: '',
      username: '',
      password: '',
      ssl: true
    }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData as DBConnection);
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 pb-10">
      <div className="flex items-center gap-4 px-4 py-4 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/50 backdrop-blur-sm sticky top-0 z-10">
        <button onClick={onCancel} className="p-2 -ml-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-medium tracking-tight">
          {connection ? t('edit_connection') : t('add_new_connection')}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">{t('connection_name')}</label>
            <input 
              required
              type="text" 
              value={formData.name || ''} 
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-lg px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-sm"
              placeholder={t('eg_production_mysql')}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">{t('database_type')}</label>
            <select
              value={formData.type}
              onChange={e => {
                const type = e.target.value as DBType;
                setFormData({ 
                  ...formData, 
                  type, 
                  port: type === 'mysql' ? 3306 : (type === 'postgres' ? 5432 : 6379)
                });
              }}
              className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-lg px-4 py-2.5 outline-none focus:border-blue-500 transition-all text-sm appearance-none"
            >
              <option value="mysql">MySQL</option>
              <option value="postgres">PostgreSQL</option>
              <option value="redis">Redis</option>
            </select>
          </div>

          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">{t('host')}</label>
              <input 
                required
                type="text" 
                value={formData.host || ''} 
                onChange={e => setFormData({ ...formData, host: e.target.value })}
                className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-lg px-4 py-2.5 outline-none focus:border-blue-500 transition-all text-sm"
                placeholder="127.0.0.1"
              />
            </div>
            <div className="w-24">
              <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">{t('port')}</label>
              <input 
                required
                type="number" 
                value={formData.port || ''} 
                onChange={e => setFormData({ ...formData, port: parseInt(e.target.value) || 0 })}
                className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-lg px-4 py-2.5 outline-none focus:border-blue-500 transition-all text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">
              {formData.type === 'redis' ? t('database_index') : t('database')}
            </label>
            <input 
              required={formData.type !== 'redis'}
              type={formData.type === 'redis' ? 'number' : 'text'}
              value={formData.database || ''} 
              onChange={e => setFormData({ ...formData, database: e.target.value })}
              className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-lg px-4 py-2.5 outline-none focus:border-blue-500 transition-all text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">
              {formData.type === 'redis' ? t('username_optional') : t('username')}
            </label>
            <input 
              required={formData.type !== 'redis'}
              type="text" 
              autoComplete="off"
              value={formData.username || ''} 
              onChange={e => setFormData({ ...formData, username: e.target.value })}
              className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-lg px-4 py-2.5 outline-none focus:border-blue-500 transition-all text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">{t('password')}</label>
            <input 
              type="password" 
              autoComplete="new-password"
              value={formData.password || ''} 
              onChange={e => setFormData({ ...formData, password: e.target.value })}
              className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-lg px-4 py-2.5 outline-none focus:border-blue-500 transition-all text-sm"
            />
          </div>

          <div className="flex items-center gap-3 pt-2">
            <input 
              type="checkbox" 
              id="ssl" 
              checked={!!formData.ssl} 
              onChange={e => setFormData({ ...formData, ssl: e.target.checked })}
              className="w-5 h-5 rounded border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="ssl" className="text-sm font-medium text-slate-700 dark:text-slate-300">
              {t('enable_ssl')}
            </label>
          </div>
        </div>

        <div className="pt-6">
          <button 
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-500 text-white rounded-lg py-3.5 font-medium flex items-center justify-center gap-2 transition-colors active:bg-blue-700"
          >
            <Save className="w-5 h-5" />
            {t('save_connection')}
          </button>
        </div>
      </form>
    </div>
  );
}
