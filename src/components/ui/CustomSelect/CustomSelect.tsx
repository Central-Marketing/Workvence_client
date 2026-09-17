"use client";

import React, { useState, useRef, useEffect } from 'react';
import { AiOutlineDown } from 'react-icons/ai';

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
        className="w-full flex items-center justify-between p-3.5 border border-slate-200 rounded-lg text-slate-800 bg-slate-50 transition-all duration-300 hover:bg-slate-100 focus:outline-none focus:border-brand-green focus:bg-white focus:ring-4 focus:ring-brand-green/10 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-slate-50"
        onClick={() => !disabled && setIsOpen(!isOpen)}
      >
        <span className={`text-[15px] ${selectedOption ? "text-slate-800" : "text-slate-400"}`}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <AiOutlineDown className={`text-slate-500 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-white border border-slate-200 rounded-lg shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          <ul className="max-h-60 overflow-y-auto">
            {options.map((option) => {
              const isSelected = selectedOption
                ? option.value === selectedOption.value || option.label === selectedOption.label
                : option.value === value;
              return (
                <li key={option.value}>
                  <button
                    type="button"
                    className={`w-full text-left px-4 py-3 text-sm transition-colors duration-150 ${
                      isSelected
                        ? "bg-green-50 text-brand-green font-semibold"
                        : "text-slate-700 hover:bg-slate-50"
                    }`}
                    onClick={() => {
                      onChange(option.value);
                      setIsOpen(false);
                    }}
                  >
                    {option.label}
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
