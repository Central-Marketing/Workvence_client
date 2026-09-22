"use client";

import React, { useState, useRef, useEffect } from 'react';
import { FiChevronDown, FiCheck } from 'react-icons/fi';

interface Option {
  value: string | number;
  label: string;
}

interface CustomSelectProps {
  options: Option[];
  value: string | number;
  onChange: (value: string | number) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

const CustomSelect: React.FC<CustomSelectProps> = ({ options, value, onChange, placeholder = "Select...", className = "", disabled = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className={`relative w-full ${className}`} ref={dropdownRef}>
      <button
        type="button"
        disabled={disabled}
        className="w-full h-[40px] flex items-center justify-between px-3.5 py-2 border border-gray-200 rounded-[6px] text-gray-800 bg-white transition-all duration-150 hover:border-gray-300 focus:outline-none focus:border-brand-green disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        onClick={() => !disabled && setIsOpen(!isOpen)}
      >
        <span className={`text-[14px] font-medium truncate ${selectedOption ? "text-gray-800" : "text-gray-400"}`}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <FiChevronDown className={`text-gray-500 text-sm transition-transform duration-200 shrink-0 ml-2 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-white border border-gray-100 rounded-[6px] shadow-xl overflow-hidden py-1.5 animate-in fade-in slide-in-from-top-2 duration-150">
          <ul className="max-h-60 overflow-y-auto">
            {options.map((option) => {
              const isSelected = selectedOption
                ? option.value === selectedOption.value || option.label === selectedOption.label
                : option.value === value;
              return (
                <li key={option.value}>
                  <button
                    type="button"
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 text-sm transition-colors cursor-pointer select-none text-left ${
                      isSelected
                        ? "bg-teal-50/70 text-teal-800 font-semibold hover:bg-teal-50"
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                    onClick={() => {
                      onChange(option.value);
                      setIsOpen(false);
                    }}
                  >
                    <span className="truncate">{option.label}</span>
                    {isSelected && <FiCheck className="w-4 h-4 text-teal-600 shrink-0 ml-2" />}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
};

export default CustomSelect;
