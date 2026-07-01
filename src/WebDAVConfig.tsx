import React, { useState, useEffect } from 'react';
import { ArrowLeft, CloudUpload, CloudDownload, Server, User, Lock, Loader2, CheckCircle2, AlertTriangle, FileJson } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { DBConnection } from './types';

export default function WebDAVConfig({ 
  connections, 
  onSaveConnections,
  onBack 
}: { 
  connections: DBConnection[], 
  onSaveConnections: (connections: DBConnection[]) => void,
  onBack: () => void 
}) {
  const { t } = useTranslation();
  const [url, setUrl] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [path, setPath] = useState('/dbclient_connections.json');
  const [isProcessing, setIsProcessing] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error' | null, message: string }>({ type: null, message: '' });
  const [confirmRestore, setConfirmRestore] = useState(false);

  useEffect(() => {
    // Load saved config if any
    const savedConfig = localStorage.getItem('dbclient_webdav');
    if (savedConfig) {
      try {
        const { url: storedUrl, username: storedUsername, password: storedPassword, path: storedPath } = JSON.parse(savedConfig);
        if (storedUrl) setUrl(storedUrl);
        if (storedUsername) setUsername(storedUsername);
        if (storedPassword) setPassword(storedPassword);
        if (storedPath) setPath(storedPath);
      } catch (e) {}
    }
  }, []);

  const saveConfigLocal = () => {
    localStorage.setItem('dbclient_webdav', JSON.stringify({ url, username, password, path }));
  };

  const handleBackup = async () => {
    if (!url || !username || !password) {
      setStatus({ type: 'error', message: t('webdav_fill_all') });
      return;
    }
    setIsProcessing(true);
    setStatus({ type: null, message: '' });
    
    try {
      const res = await fetch('/api/webdav/backup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, username, password, path, data: connections })
      });
      const result = await res.json();
      if (result.success) {
        setStatus({ type: 'success', message: t('webdav_backup_success') });
        saveConfigLocal();
      } else {
        setStatus({ type: 'error', message: result.error || t('webdav_backup_failed') });
      }
    } catch (e: any) {
      setStatus({ type: 'error', message: e.message || t('webdav_backup_failed') });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRestore = async () => {
    if (!url || !username || !password) {
      setStatus({ type: 'error', message: t('webdav_fill_all') });
      return;
    }
    
    if (!confirmRestore) {
      setConfirmRestore(true);
      setTimeout(() => setConfirmRestore(false), 3000);
      return;
    }

    setIsProcessing(true);
    setStatus({ type: null, message: '' });
    
    try {
      const res = await fetch('/api/webdav/restore', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, username, password, path })
      });
      const result = await res.json();
      if (result.success && result.data && Array.isArray(result.data)) {
        onSaveConnections(result.data);
        setStatus({ type: 'success', message: t('webdav_restore_success') });
        saveConfigLocal();
      } else {
        setStatus({ type: 'error', message: result.error || t('webdav_restore_failed') });
      }
    } catch (e: any) {
      setStatus({ type: 'error', message: e.message || t('webdav_restore_failed') });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 pb-10 overflow-y-auto">
      <div className="flex items-center gap-4 px-4 py-4 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/50 backdrop-blur-sm sticky top-0 z-10">
        <button onClick={onBack} className="p-2 -ml-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-medium tracking-tight">{t('webdav_sync')}</h1>
      </div>

      <div className="max-w-md mx-auto w-full px-6 py-8 space-y-6">
        <div className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-4">
          {t('webdav_desc')}
        </div>

        {status.type && (
          <div className={`p-4 rounded-lg flex gap-3 text-sm border ${status.type === 'success' ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400' : 'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400'}`}>
            {status.type === 'success' ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <AlertTriangle className="w-5 h-5 shrink-0" />}
            <div>{status.message}</div>
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">{t('server_url')}</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Server className="w-4 h-4" />
              </div>
              <input 
                type="url" 
                value={url} 
                onChange={e => setUrl(e.target.value)}
                className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-lg pl-10 pr-4 py-2.5 outline-none focus:border-blue-500 transition-all text-sm"
                placeholder="https://example.com/remote.php/webdav"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">{t('username')}</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <User className="w-4 h-4" />
              </div>
              <input 
                type="text" 
                value={username} 
                onChange={e => setUsername(e.target.value)}
                className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-lg pl-10 pr-4 py-2.5 outline-none focus:border-blue-500 transition-all text-sm"
                placeholder={t('username')}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">{t('password_app_password')}</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-4 h-4" />
              </div>
              <input 
                type="password" 
                value={password} 
                onChange={e => setPassword(e.target.value)}
                autoComplete="new-password"
                className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-lg pl-10 pr-4 py-2.5 outline-none focus:border-blue-500 transition-all text-sm"
                placeholder="••••••••"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">{t('backup_file_path')}</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <FileJson className="w-4 h-4" />
              </div>
              <input 
                type="text" 
                value={path} 
                onChange={e => setPath(e.target.value)}
                className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-lg pl-10 pr-4 py-2.5 outline-none focus:border-blue-500 transition-all text-sm"
                placeholder="/dbclient_connections.json"
              />
            </div>
          </div>
        </div>

        <div className="pt-4 grid grid-cols-2 gap-4">
          <button
            onClick={handleRestore}
            disabled={isProcessing}
            className={`w-full py-3 px-4 border text-slate-700 dark:text-slate-200 rounded-lg font-medium text-sm transition-all focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2 ${confirmRestore ? 'bg-amber-100 dark:bg-amber-900/50 border-amber-300 dark:border-amber-700 hover:border-amber-400 text-amber-700 dark:text-amber-400' : 'bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-500'}`}
          >
            {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <CloudDownload className="w-4 h-4" />}
            {confirmRestore ? t('confirm_restore') : t('restore')}
          </button>
          
          <button
            onClick={handleBackup}
            disabled={isProcessing}
            className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium text-sm shadow-lg shadow-blue-500/20 transition-all focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2"
          >
            {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <CloudUpload className="w-4 h-4" />}
            {t('backup')}
          </button>
        </div>
      </div>
    </div>
  );
}
