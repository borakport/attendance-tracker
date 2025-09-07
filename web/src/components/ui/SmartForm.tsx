'use client';

import React, { useState, useCallback } from 'react';
import { Eye, EyeOff, Check, X, AlertCircle } from 'lucide-react';

interface FormFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  warning?: string;
  success?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  showPasswordToggle?: boolean;
  isLoading?: boolean;
  onValidationChange?: (isValid: boolean) => void;
}

export function FormField({
  label,
  error,
  warning,
  success,
  helperText,
  leftIcon,
  rightIcon,
  showPasswordToggle = false,
  isLoading = false,
  onValidationChange,
  type = 'text',
  className = '',
  ...props
}: FormFieldProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  
  const hasValue = Boolean(props.value);
  const inputType = showPasswordToggle && showPassword ? 'text' : type;
  
  const getStatusIcon = () => {
    if (isLoading) {
      return <div className="animate-spin w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full" />;
    }
    if (error) return <X className="w-4 h-4 text-red-500" />;
    if (warning) return <AlertCircle className="w-4 h-4 text-yellow-500" />;
    if (success) return <Check className="w-4 h-4 text-green-500" />;
    return null;
  };

  const getFieldClasses = () => {
    let classes = `
      w-full px-4 py-3 border rounded-lg transition-all duration-200 ease-in-out
      placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2
      ${leftIcon ? 'pl-11' : ''}
      ${(rightIcon || showPasswordToggle || getStatusIcon()) ? 'pr-11' : ''}
    `;

    if (error) {
      classes += ' border-red-300 focus:border-red-500 focus:ring-red-500 bg-red-50';
    } else if (warning) {
      classes += ' border-yellow-300 focus:border-yellow-500 focus:ring-yellow-500 bg-yellow-50';
    } else if (success) {
      classes += ' border-green-300 focus:border-green-500 focus:ring-green-500 bg-green-50';
    } else if (isFocused) {
      classes += ' border-blue-500 focus:border-blue-500 focus:ring-blue-500 bg-blue-50';
    } else {
      classes += ' border-gray-300 focus:border-blue-500 focus:ring-blue-500 bg-white hover:border-gray-400';
    }

    return classes + ' ' + className;
  };

  return (
    <div className="relative">
      {/* Floating Label */}
      <div className="relative">
        <input
          {...props}
          type={inputType}
          className={getFieldClasses()}
          placeholder=" "
          onFocus={(e) => {
            setIsFocused(true);
            props.onFocus?.(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            props.onBlur?.(e);
          }}
        />
        
        {/* Floating label */}
        <label 
          className={`
            absolute left-4 transition-all duration-200 ease-in-out pointer-events-none
            ${hasValue || isFocused 
              ? 'top-2 text-xs font-medium' 
              : 'top-1/2 -translate-y-1/2 text-base'
            }
            ${error ? 'text-red-600' : 
              warning ? 'text-yellow-600' : 
              success ? 'text-green-600' : 
              isFocused ? 'text-blue-600' : 'text-gray-500'
            }
            ${leftIcon && !hasValue && !isFocused ? 'left-11' : 'left-4'}
          `}
        >
          {label}
        </label>

        {/* Left Icon */}
        {leftIcon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            {leftIcon}
          </div>
        )}

        {/* Right Icon / Status / Password Toggle */}
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center space-x-2">
          {showPasswordToggle && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-gray-400 hover:text-gray-600 focus:outline-none"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          )}
          {rightIcon && <div className="text-gray-400">{rightIcon}</div>}
          {getStatusIcon()}
        </div>
      </div>

      {/* Helper/Error Text */}
      {(error || warning || success || helperText) && (
        <div className="mt-2 text-sm">
          {error && (
            <p className="text-red-600 flex items-center">
              <X className="w-4 h-4 mr-1" />
              {error}
            </p>
          )}
          {warning && !error && (
            <p className="text-yellow-600 flex items-center">
              <AlertCircle className="w-4 h-4 mr-1" />
              {warning}
            </p>
          )}
          {success && !error && !warning && (
            <p className="text-green-600 flex items-center">
              <Check className="w-4 h-4 mr-1" />
              {success}
            </p>
          )}
          {helperText && !error && !warning && !success && (
            <p className="text-gray-500">{helperText}</p>
          )}
        </div>
      )}
    </div>
  );
}

interface SmartButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

export function SmartButton({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  children,
  className = '',
  disabled,
  ...props
}: SmartButtonProps) {
  const baseClasses = `
    inline-flex items-center justify-center font-medium rounded-lg
    transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2
    disabled:opacity-50 disabled:cursor-not-allowed
    ${fullWidth ? 'w-full' : ''}
  `;

  const sizeClasses = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-2.5 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  const variantClasses = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 shadow-sm hover:shadow-md',
    secondary: 'bg-gray-100 text-gray-700 hover:bg-gray-200 focus:ring-gray-500 shadow-sm hover:shadow-md',
    success: 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500 shadow-sm hover:shadow-md',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 shadow-sm hover:shadow-md',
    ghost: 'text-gray-700 hover:bg-gray-100 focus:ring-gray-500',
  };

  return (
    <button
      className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <>
          <div className="animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full mr-2" />
          Loading...
        </>
      ) : (
        <>
          {leftIcon && <span className="mr-2">{leftIcon}</span>}
          {children}
          {rightIcon && <span className="ml-2">{rightIcon}</span>}
        </>
      )}
    </button>
  );
}
