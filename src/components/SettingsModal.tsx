"use client";

import { useState } from "react";
import { X, Moon, Sun } from "lucide-react";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl shadow-2xl shadow-gray-900/10 w-full max-w-sm overflow-hidden transform transition-all">
        <div className="flex justify-between items-center p-5 border-b border-gray-100">
          <h2 className="text-xl font-black text-gray-800 tracking-tight">Settings</h2>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-gray-800 transition-colors p-1.5 rounded-xl hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6 space-y-7 bg-gray-50/50">
          {/* Theme selection */}
          <div className="space-y-3">
            <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest pl-1">Appearance</h3>
            <div className="flex gap-3">
              <button 
                onClick={() => setTheme("light")}
                className={`flex-1 flex flex-col items-center gap-2.5 p-4 rounded-2xl border-2 transition-all ${
                  theme === 'light' 
                    ? 'border-indigo-600 bg-indigo-50/50 text-indigo-700 shadow-sm' 
                    : 'border-white bg-white text-gray-400 hover:border-gray-200 hover:text-gray-600 shadow-sm'
                }`}
              >
                <Sun className="w-6 h-6" />
                <span className="font-bold text-sm">Light</span>
              </button>
              <button 
                onClick={() => setTheme("dark")}
                className={`flex-1 flex flex-col items-center gap-2.5 p-4 rounded-2xl border-2 transition-all ${
                  theme === 'dark' 
                    ? 'border-indigo-600 bg-indigo-50/50 text-indigo-700 shadow-sm' 
                    : 'border-white bg-white text-gray-400 hover:border-gray-200 hover:text-gray-600 shadow-sm'
                }`}
              >
                <Moon className="w-6 h-6" />
                <span className="font-bold text-sm">Dark</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
