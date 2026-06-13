import React, { useState, useEffect } from 'react';
import { Database, Delete, AlertTriangle } from 'lucide-react';

export default function LockScreen({ onUnlock }: { onUnlock: () => void }) {
  const [pin, setPin] = useState('');
  const [setupMode, setSetupMode] = useState(false);
  const [error, setError] = useState(false);
  const [showConfirmReset, setShowConfirmReset] = useState(false);

  useEffect(() => {
    const savedPin = localStorage.getItem('dbclient_pin');
    if (!savedPin) setSetupMode(true);
  }, []);

  const handleKey = (num: string) => {
    if (pin.length < 4) {
      setPin(p => p + num);
      setError(false);
    }
  };

  const handleBackspace = () => setPin(p => p.slice(0, -1));

  const handleReset = () => {
    localStorage.removeItem('dbclient_pin');
    localStorage.removeItem('dbclient_connections');
    window.location.reload();
  };

  useEffect(() => {
    if (pin.length === 4) {
      const savedPin = localStorage.getItem('dbclient_pin');
      if (setupMode) {
        localStorage.setItem('dbclient_pin', pin);
        onUnlock();
      } else {
        if (pin === savedPin) {
          onUnlock();
        } else {
          setError(true);
          setTimeout(() => setPin(''), 500);
        }
      }
    }
  }, [pin, setupMode, onUnlock]);

  return (
    <div className="flex flex-col items-center justify-center h-full bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 p-6">
      <div className="mb-8 flex flex-col items-center">
        <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mb-4">
          <Database className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-2xl font-semibold tracking-tight">DBClient</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm">
          {setupMode ? 'Set up a 4-digit PIN' : 'Enter your PIN to unlock'}
        </p>
      </div>

      <div className="flex gap-4 mb-8">
        {[0, 1, 2, 3].map(i => (
          <div 
            key={i} 
            className={`w-4 h-4 rounded-full transition-colors duration-200 ${pin.length > i ? 'bg-blue-500' : 'bg-slate-200 dark:bg-slate-800'} ${error ? 'bg-red-500' : ''}`}
          />
        ))}
      </div>

      <div className="grid grid-cols-3 gap-6 max-w-[280px]">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
          <button 
            key={num} 
            onClick={() => handleKey(num.toString())}
            className="w-16 h-16 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center text-2xl font-light hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors active:bg-slate-100 dark:active:bg-slate-700"
          >
            {num}
          </button>
        ))}
        <div />
        <button 
          onClick={() => handleKey('0')}
          className="w-16 h-16 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center text-2xl font-light hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors active:bg-slate-100 dark:active:bg-slate-700"
        >
          0
        </button>
        <button 
          onClick={handleBackspace}
          className="w-16 h-16 rounded-full flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
        >
          <Delete className="w-6 h-6" />
        </button>
      </div>

      {!setupMode && (
        <button 
          onClick={() => setShowConfirmReset(true)}
          className="mt-8 text-sm text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
        >
          Forgot PIN?
        </button>
      )}

      {showConfirmReset && (
        <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-6 z-50">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center gap-4 text-amber-500 mb-4">
              <AlertTriangle className="w-8 h-8 shrink-0" />
              <h2 className="text-xl font-medium text-slate-900 dark:text-slate-100">Reset App?</h2>
            </div>
            <p className="text-slate-600 dark:text-slate-400 mb-6 text-sm leading-relaxed">
              This will clear your PIN and permanently delete all your local connections. If you have a WebDAV backup, you can restore them after resetting.
            </p>
            <div className="flex gap-3">
              <button 
                onClick={() => setShowConfirmReset(false)}
                className="flex-1 px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg transition-colors font-medium text-sm"
              >
                Cancel
              </button>
              <button 
                onClick={handleReset}
                className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors font-medium text-sm"
              >
                Reset App
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
