"use client";

import React, { forwardRef, useId } from "react";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: React.ReactNode;
  labelRight?: React.ReactNode;
  error?: string | boolean;
  helperText?: React.ReactNode;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  containerClassName?: string;
  labelClassName?: string;
  variant?: "standard" | "white";
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      id,
      label,
      labelRight,
      error,
      helperText,
      leftIcon,
      rightIcon,
      containerClassName = "",
      labelClassName = "",
      className = "",
      variant = "standard",
      disabled,
      required,
      ...props
    },
    ref
  ) => {
    const generatedId = useId();
    const inputId = id || generatedId;

    const baseInputStyles =
      "w-full h-10 rounded-[6px] text-sm text-gray-900 placeholder:text-[#868686] placeholder:font-normal outline-none transition-colors";

    const variantStyles =
      variant === "white"
        ? "bg-white border border-gray-200 focus:border-gray-300"
        : "bg-[#F0F0F0] border border-[rgba(0,0,0,0.10)] focus:border-gray-300 focus:bg-white";

    const errorStyles = error
      ? "!border-red-400 !bg-red-50/20 focus:!border-red-500"
      : "";

    const paddingStyles = `${leftIcon ? "pl-10" : "px-3.5"} ${
      rightIcon ? "pr-10" : "px-3.5"
    }`;

    const disabledStyles = disabled
      ? "opacity-60 cursor-not-allowed bg-gray-100"
      : "";

    return (
      <div className={`flex flex-col gap-1.5 w-full ${containerClassName}`}>
        {(label || labelRight) && (
          <div className="flex items-center justify-between">
            {label && (
              <label
                htmlFor={inputId}
                className={`text-xs sm:text-[13px] font-medium text-gray-700 select-none ${labelClassName}`}
              >
                {label}
                {required && <span className="text-red-500 ml-1">*</span>}
              </label>
            )}
            {labelRight && <div className="text-xs">{labelRight}</div>}
          </div>
        )}

        <div className="relative flex items-center w-full">
          {leftIcon && (
            <div className="absolute left-3.5 flex items-center justify-center text-gray-400 pointer-events-none z-10 shrink-0">
              {leftIcon}
            </div>
          )}

          <input
            ref={ref}
            id={inputId}
            disabled={disabled}
            required={required}
            className={`${baseInputStyles} ${variantStyles} ${paddingStyles} ${errorStyles} ${disabledStyles} ${className}`}
            {...props}
          />

          {rightIcon && (
            <div className="absolute right-3.5 flex items-center justify-center text-gray-400 z-10 shrink-0">
              {rightIcon}
            </div>
          )}
        </div>

        {typeof error === "string" && error && (
          <p className="text-[11px] font-medium text-red-500 mt-0.5">{error}</p>
        )}

        {helperText && !error && (
          <div className="text-[11px] text-gray-500 mt-0.5">{helperText}</div>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export default Input;
