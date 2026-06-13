import React, { useState, useEffect } from 'react';
import { Database, Delete } from 'lucide-react';

export default function LockScreen({ onUnlock }: { onUnlock: () => void }) {
  const [pin, setPin] = useState('');
  const [setupMode, setSetupMode] = useState(false);
  const [error, setError] = useState(false);

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
    </div>
  );
}
