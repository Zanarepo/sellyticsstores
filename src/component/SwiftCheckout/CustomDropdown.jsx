/**
 * SwiftCheckout - Custom Dropdown Component
 * Accessible, keyboard-navigable dropdown using pure React + CSS
 */
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function CustomDropdown({ 
  trigger, 
  children, 
  align = 'right',
  className = '' 
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const dropdownRef = useRef(null);
  const triggerRef = useRef(null);
  const itemsRef = useRef([]);
  
  // Close dropdown
  const closeDropdown = useCallback(() => {
    setIsOpen(false);
    setFocusedIndex(-1);
  }, []);
  
  // Toggle dropdown
  const toggleDropdown = useCallback(() => {
    setIsOpen(prev => !prev);
    setFocusedIndex(-1);
  }, []);
  
  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        closeDropdown();
      }
    };
    
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, closeDropdown]);
  
  // Handle escape key
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape' && isOpen) {
        closeDropdown();
        triggerRef.current?.focus();
      }
    };
    
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }
    
    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, closeDropdown]);
  
  // Handle keyboard navigation
  const handleKeyDown = useCallback((event) => {
    const items = itemsRef.current.filter(Boolean);
    
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
          setFocusedIndex(0);
        } else {
          setFocusedIndex(prev => 
            prev < items.length - 1 ? prev + 1 : 0
          );
        }
        break;
        
      case 'ArrowUp':
        event.preventDefault();
        if (isOpen) {
          setFocusedIndex(prev => 
            prev > 0 ? prev - 1 : items.length - 1
          );
        }
        break;
        
      case 'Enter':
      case ' ':
        event.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
        } else if (focusedIndex >= 0 && items[focusedIndex]) {
          items[focusedIndex].click();
        }
        break;
        
      case 'Tab':
        if (isOpen) {
          closeDropdown();
        }
        break;
        
      default:
        break;
    }
  }, [isOpen, focusedIndex, closeDropdown]);
  
  // Focus management
  useEffect(() => {
    if (isOpen && focusedIndex >= 0) {
      itemsRef.current[focusedIndex]?.focus();
    }
  }, [isOpen, focusedIndex]);
  
  // Clone trigger with proper props
  const enhancedTrigger = React.cloneElement(trigger, {
    ref: triggerRef,
    onClick: (e) => {
      e.stopPropagation();
      toggleDropdown();
      trigger.props.onClick?.(e);
    },
    onKeyDown: handleKeyDown,
    'aria-expanded': isOpen,
    'aria-haspopup': 'menu'
  });
  
  return (
    <div 
      ref={dropdownRef} 
      className={`relative inline-block ${className}`}
    >
      {enhancedTrigger}
      
      {isOpen && (
        <div 
          role="menu"
          aria-orientation="vertical"
          className={`
            absolute z-50 mt-2 min-w-[180px] py-1
            bg-white dark:bg-slate-800 
            border border-slate-200 dark:border-slate-700 
            rounded-lg shadow-lg
            animate-in fade-in slide-in-from-top-2 duration-150
            ${align === 'right' ? 'right-0' : 'left-0'}
          `}
          style={{
            animation: 'fadeIn 0.15s ease-out'
          }}
        >
          {typeof children === 'function' 
            ? children({ 
                close: closeDropdown,
                registerItem: (el, index) => {
                  itemsRef.current[index] = el;
                },
                focusedIndex
              })
            : React.Children.map(children, (child, index) => {
                if (!React.isValidElement(child)) return child;
                
                return React.cloneElement(child, {
                  ref: (el) => {
                    itemsRef.current[index] = el;
                  },
                  role: 'menuitem',
                  tabIndex: focusedIndex === index ? 0 : -1,
                  onClick: (e) => {
                    child.props.onClick?.(e);
                    closeDropdown();
                  },
                  className: `
                    ${child.props.className || ''}
                    ${focusedIndex === index ? 'bg-slate-100 dark:bg-slate-700' : ''}
                  `
                });
              })
          }
        </div>
      )}
      
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-4px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}

// Dropdown Item component
export function DropdownItem({ 
  children, 
  onClick, 
  icon: Icon, 
  variant = 'default',
  disabled = false,
  className = '' 
}) {
  const variantClasses = {
    default: 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700',
    danger: 'text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20',
    success: 'text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20'
  };
  
  return (
    <button
      type="button"
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      className={`
        w-full flex items-center gap-2 px-3 py-2 text-sm
        transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-inset
        ${variantClasses[variant]}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        ${className}
      `}
    >
      {Icon && <Icon className="w-4 h-4 flex-shrink-0" />}
      <span className="flex-1 text-left">{children}</span>
    </button>
  );
}

// Dropdown Separator
export function DropdownSeparator() {
  return <div className="my-1 border-t border-slate-200 dark:border-slate-700" />;
}