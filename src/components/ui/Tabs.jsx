import React from 'react';
import { motion } from 'framer-motion';

export const Tabs = ({
  tabs = [],
  activeTab,
  onChange,
  variant = 'pills', // 'pills' | 'underline'
  className = '',
}) => {
  if (variant === 'underline') {
    return (
      <div className={`flex items-center gap-6 border-b border-slate-200 dark:border-slate-800 ${className}`}>
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onChange(tab.id)}
              className={`relative flex items-center gap-2 py-3 text-sm font-semibold transition select-none ${
                isActive
                  ? 'text-indigo-600 dark:text-indigo-400'
                  : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              {Icon && <Icon className="w-4 h-4 stroke-[2]" />}
              <span>{tab.label}</span>
              {tab.badge !== undefined && (
                <span
                  className={`text-[11px] px-1.5 py-0.5 rounded-full font-bold ${
                    isActive
                      ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300'
                      : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                  }`}
                >
                  {tab.badge}
                </span>
              )}
              {isActive && (
                <motion.div
                  layoutId="underline-tab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 dark:bg-indigo-400 rounded-full"
                  transition={{ type: 'spring', stiffness: 450, damping: 30 }}
                />
              )}
            </button>
          );
        })}
      </div>
    );
  }

  // Pills variant
  return (
    <div
      className={`inline-flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl ${className}`}
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        const Icon = tab.icon;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={`relative flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition select-none ${
              isActive
                ? 'text-slate-900 dark:text-white bg-white dark:bg-slate-900 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            {Icon && <Icon className="w-3.5 h-3.5 stroke-[2]" />}
            <span>{tab.label}</span>
            {tab.badge !== undefined && (
              <span className="text-[10px] px-1.5 py-0.2 rounded-full font-bold bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                {tab.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};

export default Tabs;
