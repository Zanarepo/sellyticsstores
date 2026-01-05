/**
 * SwiftCheckout - Custom Dropdown Component
 * Accessible, keyboard-navigable dropdown menu
 * @version 1.0.0
 */
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { MoreVertical } from 'lucide-react';

export function DropdownItem({ 
  children, 
  icon: Icon, 
  onClick, 
  variant = 'default',
  disabled = false 
}) {
  const variantClasses = {
    default: 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700',
    danger: 'text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20'
  };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`
        w-full flex items-center gap-2 px-3 py-2 text-sm text-left
        transition-colors focus:outline-none focus:bg-slate-100 dark:focus:bg-slate-700
        disabled:opacity-50 disabled:cursor-not-allowed
        ${variantClasses[variant]}
      `}
    >
      {Icon && <Icon className="w-4 h-4 flex-shrink-0" />}
      <span className="flex-1">{children}</span>
    </button>
  );
}

export function DropdownSeparator() {
  return <div className="h-px bg-slate-200 dark:bg-slate-700 my-1" />;
}

export default function CustomDropdown({ 
  children, 
  trigger,
  align = 'right',
  className = '' 
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const triggerRef = useRef(null);
  const menuRef = useRef(null);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  // Close on escape
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
        triggerRef.current?.focus();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen || !menuRef.current) return;

    const handleKeyDown = (event) => {
      const items = menuRef.current.querySelectorAll('button:not([disabled])');
      const currentIndex = Array.from(items).indexOf(document.activeElement);

      switch (event.key) {
        case 'ArrowDown':
          event.preventDefault();
          if (currentIndex < items.length - 1) {
            items[currentIndex + 1]?.focus();
          } else {
            items[0]?.focus();
          }
          break;
        case 'ArrowUp':
          event.preventDefault();
          if (currentIndex > 0) {
            items[currentIndex - 1]?.focus();
          } else {
            items[items.length - 1]?.focus();
          }
          break;
        case 'Home':
          event.preventDefault();
          items[0]?.focus();
          break;
        case 'End':
          event.preventDefault();
          items[items.length - 1]?.focus();
          break;
      }
    };

    menuRef.current.addEventListener('keydown', handleKeyDown);
    return () => menuRef.current?.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Focus first item when opening
  useEffect(() => {
    if (isOpen && menuRef.current) {
      const firstItem = menuRef.current.querySelector('button:not([disabled])');
      firstItem?.focus();
    }
  }, [isOpen]);

  const close = useCallback(() => {
    setIsOpen(false);
    triggerRef.current?.focus();
  }, []);

  const toggle = useCallback(() => {
    setIsOpen(prev => !prev);
  }, []);

  const alignClasses = {
    left: 'left-0',
    right: 'right-0',
    center: 'left-1/2 -translate-x-1/2'
  };

  return (
    <div ref={dropdownRef} className={`relative inline-block ${className}`}>
      {/* Trigger */}
      {trigger ? (
        <div 
          ref={triggerRef}
          onClick={toggle}
          onKeyDown={(e) => e.key === 'Enter' && toggle()}
          tabIndex={0}
          role="button"
          aria-haspopup="true"
          aria-expanded={isOpen}
        >
          {trigger}
        </div>
      ) : (
        <button
          ref={triggerRef}
          type="button"
          onClick={toggle}
          aria-haspopup="true"
          aria-expanded={isOpen}
          className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <MoreVertical className="w-4 h-4 text-slate-500" />
        </button>
      )}

      {/* Menu */}
      {isOpen && (
        <div
          ref={menuRef}
          role="menu"
          aria-orientation="vertical"
          className={`
            absolute z-50 mt-1 min-w-[180px] py-1
            bg-white dark:bg-slate-800 rounded-lg shadow-lg
            border border-slate-200 dark:border-slate-700
            ${alignClasses[align]}
          `}
          style={{ maxHeight: '300px', overflowY: 'auto' }}
        >
          {typeof children === 'function' 
            ? children({ close, isOpen }) 
            : children
          }
        </div>
      )}
    </div>
  );
}