/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Moon, Sun } from 'lucide-react';
import LockScreen from './LockScreen';
import ConnectionList from './ConnectionList';
import ConnectionEdit from './ConnectionEdit';
import Workspace from './Workspace';
import WebDAVConfig from './WebDAVConfig';
import { DBConnection } from './types';

export default function App() {
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

  const saveConnections = (conns: DBConnection[]) => {
    setConnections(conns);
    localStorage.setItem('dbclient_connections', JSON.stringify(conns));
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

  return (
    <div className="h-screen w-full bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-200 overflow-hidden font-sans relative">
      {screen !== 'connections' && (
        <button 
          onClick={toggleTheme} 
          className={`absolute z-50 p-3 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors shadow-lg ${screen === 'lock' ? 'top-6 right-6' : 'bottom-6 right-6'}`}
          title="Toggle Theme"
        >
          {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>
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
  );
}
