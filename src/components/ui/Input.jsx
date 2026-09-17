import React, { forwardRef } from 'react';

export const Input = forwardRef(
  (
    {
      label,
      error,
      helperText,
      leftIcon: LeftIcon,
      rightIcon: RightIcon,
      className = '',
      wrapperClassName = '',
      type = 'text',
      ...props
    },
    ref
  ) => {
    return (
      <div className={`w-full ${wrapperClassName}`}>
        {label && (
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 select-none">
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {LeftIcon && (
            <div className="absolute left-3 text-slate-400 dark:text-slate-500 pointer-events-none flex items-center">
              <LeftIcon className="w-4 h-4 stroke-[1.8]" />
            </div>
          )}
          <input
            ref={ref}
            type={type}
            className={`w-full text-sm bg-white dark:bg-slate-900/60 border rounded-xl px-3.5 py-2 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 transition duration-150 outline-none
              ${
                LeftIcon ? 'pl-9' : ''
              } ${RightIcon ? 'pr-9' : ''}
              ${
                error
                  ? 'border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-500/20'
                  : 'border-slate-200 dark:border-slate-800 focus:border-indigo-600 dark:focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/15'
              }
              ${className}
            `}
            {...props}
          />
          {RightIcon && (
            <div className="absolute right-3 text-slate-400 dark:text-slate-500 flex items-center">
              <RightIcon className="w-4 h-4 stroke-[1.8]" />
            </div>
          )}
        </div>
        {error && (
          <p className="mt-1 text-xs text-red-500 font-medium">{error}</p>
        )}
        {!error && helperText && (
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
export default Input;
