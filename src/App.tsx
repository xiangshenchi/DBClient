/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Moon, Sun, Github, Languages } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import LockScreen from './LockScreen';
import ConnectionList from './ConnectionList';
import ConnectionEdit from './ConnectionEdit';
import Workspace from './Workspace';
import WebDAVConfig from './WebDAVConfig';
import { DBConnection } from './types';

export default function App() {
  const { t, i18n } = useTranslation();
  const [screen, setScreen] = useState<'lock' | 'connections' | 'edit' | 'workspace' | 'webdav'>('lock');
  const [connections, setConnections] = useState<DBConnection[]>([]);
  const [activeConnection, setActiveConnection] = useState<DBConnection | undefined>(undefined);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  useEffect(() => {
    const saved = localStorage.getItem('dbclient_connections');
    if (saved) {
      try { setConnections(JSON.parse(saved)); } catch (e) {}
    }
    
    const savedTheme = localStorage.getItem('dbclient_theme');
    if (savedTheme === 'light') {
      setTheme('light');
      document.documentElement.classList.remove('dark');
    } else {
      setTheme('dark');
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleTheme = () => {
    if (theme === 'dark') {
      setTheme('light');
      document.documentElement.classList.remove('dark');
      localStorage.setItem('dbclient_theme', 'light');
    } else {
      setTheme('dark');
      document.documentElement.classList.add('dark');
      localStorage.setItem('dbclient_theme', 'dark');
    }
  };

  const toggleLanguage = () => {
    const nextLang = i18n.language.startsWith('zh') ? 'en' : 'zh';
    i18n.changeLanguage(nextLang);
  };

  const saveConnections = (conns: DBConnection[]) => {
    setConnections(conns);
    localStorage.setItem('dbclient_connections', JSON.stringify(conns));
  };

  const handleToggleFavorite = (id: string) => {
    const updated = connections.map(c => c.id === id ? { ...c, isFavorite: !c.isFavorite } : c);
    
    const sorted = [...updated].sort((a, b) => {
      if (a.isFavorite && !b.isFavorite) return -1;
      if (!a.isFavorite && b.isFavorite) return 1;
      return 0;
    });
    
    saveConnections(sorted);
  };

  const handleEditSave = (conn: DBConnection) => {
    const idx = connections.findIndex(c => c.id === conn.id);
    let newConns;
    if (idx >= 0) {
       newConns = [...connections];
       newConns[idx] = conn;
    } else {
       newConns = [...connections, conn];
    }
    saveConnections(newConns);
    setScreen('connections');
  };

  const handleDelete = (id: string) => {
    saveConnections(connections.filter(c => c.id !== id));
  };

  const handleSelect = (conn: DBConnection) => {
    const updatedConn = { ...conn, lastConnected: Date.now() };
    const newConns = connections.map(c => c.id === conn.id ? updatedConn : c);
    saveConnections(newConns);
    setActiveConnection(updatedConn);
    setScreen('workspace');
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+N or Cmd+N to create a new connection
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'n') {
        if (screen === 'connections') {
          e.preventDefault();
          setActiveConnection(undefined);
          setScreen('edit');
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [screen]);

  return (
    <div className="h-screen w-full bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-200 overflow-hidden font-sans relative flex flex-col">
      <div className="flex-1 relative overflow-hidden flex flex-col w-full">
        {screen === 'lock' && (
          <div className="absolute z-50 flex flex-col gap-2 top-6 right-6">
            <button 
              onClick={toggleLanguage} 
              className="p-3 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors shadow-lg"
              title={t('switch_language')}
            >
              <Languages className="w-5 h-5" />
            </button>
            <button 
              onClick={toggleTheme} 
              className="p-3 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors shadow-lg"
              title={t('toggle_theme')}
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
          </div>
        )}

        {screen === 'lock' && (
          <LockScreen onUnlock={() => setScreen('connections')} />
        )}
        {screen === 'connections' && (
          <ConnectionList 
            connections={connections} 
            onSelect={handleSelect}
            onEdit={(c) => { setActiveConnection(c); setScreen('edit'); }}
            onDelete={handleDelete}
            onBackupConfig={() => setScreen('webdav')}
            onReorder={(conns) => saveConnections(conns)}
            theme={theme}
            onToggleTheme={toggleTheme}
            onToggleLanguage={toggleLanguage}
            onToggleFavorite={handleToggleFavorite}
          />
        )}
        {screen === 'webdav' && (
          <WebDAVConfig 
            connections={connections}
            onSaveConnections={(conns) => { saveConnections(conns); setScreen('connections'); }}
            onBack={() => setScreen('connections')}
          />
        )}
        {screen === 'edit' && (
          <ConnectionEdit 
            connection={activeConnection}
            onSave={handleEditSave}
            onCancel={() => setScreen('connections')}
          />
        )}
        {screen === 'workspace' && activeConnection && (
          <Workspace 
            connection={activeConnection}
            onBack={() => setScreen('connections')}
          />
        )}
      </div>
      {screen !== 'workspace' && (
        <footer className="py-2 px-4 text-center text-xs text-slate-400 dark:text-slate-500 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center justify-center shrink-0">
          <a 
            href="https://github.com/xiangshenchi/DBClient" 
            target="_blank" 
            rel="noreferrer" 
            className="flex items-center gap-1.5 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
          >
            <Github className="w-3.5 h-3.5" />
            <span>{t('open_source_github')}</span>
          </a>
        </footer>
      )}
    </div>
  );
}
