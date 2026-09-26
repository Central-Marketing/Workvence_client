"use client";

import React, { useState, useRef, useEffect, useId } from 'react';
import { FiChevronDown, FiCheck } from 'react-icons/fi';

export interface CustomSelectOption {
  value: string | number;
  label: string;
  icon?: React.ReactNode;
  disabled?: boolean;
}

export interface CustomSelectProps<T extends string | number = any> {
  options: CustomSelectOption[];
  value?: T;
  onChange: (value: T) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "filled";
  leftIcon?: React.ReactNode;
  name?: string;
  required?: boolean;
  error?: boolean | string;
  ariaLabel?: string;
  menuClassName?: string;
}

const sizeConfig = {
  sm: {
    button: "h-[34px] sm:h-[36px] px-3 py-1.5 text-xs",
    icon: "w-3.5 h-3.5",
    option: "px-3 py-2 text-xs",
    check: "w-3.5 h-3.5",
  },
  md: {
    button: "h-[40px] px-3.5 py-2 text-[13px] sm:text-sm",
    icon: "w-4 h-4",
    option: "px-3.5 py-2.5 text-[13px] sm:text-sm",
    check: "w-4 h-4",
  },
  lg: {
    button: "h-[46px] px-4 py-2.5 text-sm",
    icon: "w-4 h-4",
    option: "px-4 py-3 text-sm",
    check: "w-4 h-4",
  },
};

export function CustomSelect<T extends string | number = any>({
  options,
  value,
  onChange,
  placeholder = "Select...",
  className = "",
  disabled = false,
  size = "md",
  variant = "default",
  leftIcon,
  name,
  required = false,
  error,
  ariaLabel,
  menuClassName = "",
}: CustomSelectProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const id = useId();

  const normalizeStr = (v: any) =>
    v !== undefined && v !== null
      ? String(v).trim().toLowerCase().replace(/&/g, 'and').replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
      : '';

  const rawStr = (v: any) =>
    v !== undefined && v !== null ? String(v).trim().toLowerCase() : '';

  const targetVal = rawStr(value);
  const targetNorm = normalizeStr(value);

  const selectedOption = options.find((opt) => {
    if (opt.value === value || opt.label === value) return true;
    const optValRaw = rawStr(opt.value);
    const optLabelRaw = rawStr(opt.label);
    if (targetVal && (optValRaw === targetVal || optLabelRaw === targetVal)) return true;

    const optValNorm = normalizeStr(opt.value);
    const optLabelNorm = normalizeStr(opt.label);
    return (
      Boolean(targetNorm) && (optValNorm === targetNorm || optLabelNorm === targetNorm)
    );
  });

  // Handle outside click & escape key
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isOpen) {
        setIsOpen(false);
        buttonRef.current?.focus();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const cfg = sizeConfig[size] || sizeConfig.md;

  const variantClass =
    variant === "filled"
      ? error
        ? "bg-[#F0F0F0] border-red-400 focus:bg-white focus:border-red-500 focus:ring-1 focus:ring-red-400/40"
        : "bg-[#F0F0F0] border-[rgba(0,0,0,0.10)] hover:border-gray-300 focus:bg-white focus:border-[#0D6D5F] focus:ring-1 focus:ring-[#0D6D5F]/20"
      : error
      ? "bg-white border-red-400 focus:border-red-500 focus:ring-1 focus:ring-red-400/40"
      : "bg-white border-gray-200 hover:border-gray-300 focus:border-[#0D6D5F] focus:ring-1 focus:ring-[#0D6D5F]/20";

  return (
    <div className={`relative w-full ${className}`} ref={dropdownRef}>
      {name && (
        <input
          type="hidden"
          name={name}
          value={value !== undefined ? String(value) : ""}
          required={required}
        />
      )}

      <button
        ref={buttonRef}
        id={id}
        type="button"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={ariaLabel || placeholder}
        className={`w-full flex items-center justify-between border rounded-[6px] text-gray-800 transition-all duration-150 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-2xs ${cfg.button} ${variantClass}`}
        onClick={() => !disabled && setIsOpen((prev) => !prev)}
      >
        <div className="flex items-center gap-2 min-w-0 flex-1 mr-2 text-left">
          {leftIcon && <span className="shrink-0 text-gray-400 flex items-center">{leftIcon}</span>}
          {selectedOption?.icon && (
            <span className="shrink-0 flex items-center">{selectedOption.icon}</span>
          )}
          <span
            className={`text-[13px] font-medium truncate ${
              selectedOption ? "text-gray-900" : "text-[#868686] font-normal"
            }`}
          >
            {selectedOption ? selectedOption.label : placeholder}
          </span>
        </div>

        <FiChevronDown
          className={`${cfg.icon} text-gray-400 transition-transform duration-200 shrink-0 ml-1.5 ${
            isOpen ? "rotate-180 text-gray-700" : ""
          }`}
          aria-hidden="true"
        />
      </button>

      {isOpen && (
        <div
          role="listbox"
          tabIndex={-1}
          className={`absolute left-0 right-0 z-50 w-full mt-1.5 bg-white border border-gray-100 rounded-[6px] shadow-xl overflow-hidden py-1 animate-in fade-in slide-in-from-top-1 duration-150 ${menuClassName}`}
        >
          <ul className="max-h-60 overflow-y-auto divide-y divide-gray-50/50">
            {options.map((option) => {
              const isSelected = selectedOption
                ? option.value === selectedOption.value || option.label === selectedOption.label
                : option.value === value;

              return (
                <li key={String(option.value)}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    disabled={option.disabled}
                    className={`w-full flex items-center justify-between text-left transition-colors cursor-pointer select-none disabled:opacity-40 disabled:cursor-not-allowed ${cfg.option} ${
                      isSelected
                        ? "bg-teal-50/70 text-[#0D6D5F] font-semibold hover:bg-teal-50"
                        : "text-gray-700 hover:bg-gray-50/90 font-medium"
                    }`}
                    onClick={() => {
                      if (!option.disabled) {
                        onChange(option.value as T);
                        setIsOpen(false);
                        buttonRef.current?.focus();
                      }
                    }}
                  >
                    <div className="flex items-center gap-2 min-w-0 flex-1 mr-2">
                      {option.icon && <span className="shrink-0">{option.icon}</span>}
                      <span className="truncate">{option.label}</span>
                    </div>
                    {isSelected && (
                      <FiCheck
                        className={`${cfg.check} text-[#0D6D5F] shrink-0 ml-2`}
                        aria-hidden="true"
                      />
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {typeof error === "string" && (
        <p className="mt-1 text-xs text-red-500 font-medium">{error}</p>
      )}
    </div>
  );
}

export default CustomSelect;
