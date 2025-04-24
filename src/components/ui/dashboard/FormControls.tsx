import React from "react";
import { Check, ChevronsUpDown } from "lucide-react";

// Input Component
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  icon,
  className,
  ...props
}) => {
  return (
    <div className="mb-4">
      {label && (
        <label className="block text-sm font-medium mb-1.5">{label}</label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            {icon}
          </div>
        )}
        <input
          className={`w-full rounded-md border border-input px-3 py-2 text-sm placeholder-muted-foreground hover:border-primary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-20 transition-all duration-200 ${
            icon ? "pl-10" : ""
          } ${error ? "border-destructive focus:border-destructive focus:ring-destructive focus:ring-opacity-20" : ""} ${className || ""}`}
          {...props}
        />
      </div>
      {error && <p className="text-destructive text-xs mt-1">{error}</p>}
    </div>
  );
};

// Textarea Component
interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea: React.FC<TextareaProps> = ({
  label,
  error,
  className,
  ...props
}) => {
  return (
    <div className="mb-4">
      {label && (
        <label className="block text-sm font-medium mb-1.5">{label}</label>
      )}
      <textarea
        className={`w-full rounded-md border border-input px-3 py-2 text-sm placeholder-muted-foreground hover:border-primary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-20 transition-all duration-200 ${
          error ? "border-destructive focus:border-destructive focus:ring-destructive focus:ring-opacity-20" : ""
        } ${className || ""}`}
        rows={4}
        {...props}
      />
      {error && <p className="text-destructive text-xs mt-1">{error}</p>}
    </div>
  );
};

// Select Component
interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
}

export const Select: React.FC<SelectProps> = ({
  label,
  error,
  options,
  className,
  ...props
}) => {
  return (
    <div className="mb-4">
      {label && (
        <label className="block text-sm font-medium mb-1.5">{label}</label>
      )}
      <div className="relative">
        <select
          className={`w-full appearance-none rounded-md border border-input px-3 py-2 text-sm placeholder-muted-foreground hover:border-primary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-20 transition-all duration-200 pr-10 ${
            error ? "border-destructive focus:border-destructive focus:ring-destructive focus:ring-opacity-20" : ""
          } ${className || ""}`}
          {...props}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-muted-foreground">
          <ChevronsUpDown className="h-4 w-4" />
        </div>
      </div>
      {error && <p className="text-destructive text-xs mt-1">{error}</p>}
    </div>
  );
};

// Checkbox Component
interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  label: string;
  error?: string;
}

export const Checkbox: React.FC<CheckboxProps> = ({
  label,
  error,
  className,
  ...props
}) => {
  return (
    <div className="flex items-start space-x-2 mb-4">
      <div className="relative flex items-center h-5">
        <input
          type="checkbox"
          className="h-4 w-4 rounded border border-input focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-20 transition-all duration-200"
          {...props}
        />
      </div>
      <div>
        <label className="text-sm font-medium">{label}</label>
        {error && <p className="text-destructive text-xs">{error}</p>}
      </div>
    </div>
  );
};

// Button Component
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "destructive" | "outline";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = "primary",
  size = "md",
  isLoading = false,
  leftIcon,
  rightIcon,
  className,
  disabled,
  ...props
}) => {
  const variantClasses = {
    primary: "btn-primary",
    secondary: "btn-secondary",
    destructive: "btn-destructive",
    outline: "border border-input hover:bg-accent/50 text-foreground"
  };

  const sizeClasses = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-2.5 text-base"
  };

  return (
    <button
      className={`btn ${variantClasses[variant]} ${sizeClasses[size]} ${className || ""}`}
      disabled={isLoading || disabled}
      {...props}
    >
      {isLoading && (
        <div className={`spinner border-current ${variant === 'primary' ? 'border-primary-foreground' : 'border-primary'} mr-2`}></div>
      )}
      {!isLoading && leftIcon && <span className="mr-2">{leftIcon}</span>}
      {children}
      {!isLoading && rightIcon && <span className="ml-2">{rightIcon}</span>}
    </button>
  );
};

// Toggle/Switch Component
interface ToggleProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: string;
  description?: string;
}

export const Toggle: React.FC<ToggleProps> = ({
  label,
  description,
  checked,
  onChange,
  className,
  ...props
}) => {
  return (
    <div className="flex items-start space-x-3 mb-4">
      <label className="relative inline-flex items-center cursor-pointer">
        <input
          type="checkbox"
          className="sr-only"
          checked={checked}
          onChange={onChange}
          {...props}
        />
        <div className={`w-11 h-6 bg-muted rounded-full peer ${checked ? 'bg-primary' : ''} transition-colors duration-200`}>
          <div className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform duration-200 ${checked ? 'translate-x-5' : 'translate-x-1'}`}></div>
        </div>
      </label>
      {(label || description) && (
        <div className="flex flex-col">
          {label && <span className="text-sm font-medium">{label}</span>}
          {description && <span className="text-xs text-muted-foreground">{description}</span>}
        </div>
      )}
    </div>
  );
};

// Tab Component
interface TabProps {
  tabs: { id: string; label: string; icon?: React.ReactNode }[]; // Added optional icon
  activeTab: string;
  onChange: (id: string) => void;
  className?: string;
}

export const Tabs: React.FC<TabProps> = ({
  tabs,
  activeTab,
  onChange,
  className,
}) => {
  return (
    <div className={`border-b border-border mb-6 ${className || ""}`}>
      <div className="flex space-x-8">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={`flex items-center gap-2 py-3 px-1 text-sm font-medium border-b-2 -mb-px transition-colors duration-200 ${ // Added flex and gap
              activeTab === tab.id
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-primary"
            }`}
          >
            {tab.icon && <span className="h-4 w-4">{tab.icon}</span>} {/* Render icon */}
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
};

// Slider Component
interface SliderProps {
  min: number;
  max: number;
  value: number;
  onChange: (value: number) => void;
  label?: string;
  step?: number;
  suffix?: string; // Added optional suffix
  description?: string; // Added optional description
}

export const Slider: React.FC<SliderProps> = ({
  min,
  max,
  value,
  onChange,
  label,
  step = 1,
  suffix, // Destructure new props
  description, // Destructure new props
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(parseInt(e.target.value));
  };

  const percentage = ((value - min) / (max - min)) * 100;

  return (
    <div className="mb-4">
      {label && (
        <div className="flex justify-between items-center mb-1.5">
          <label className="block text-sm font-medium">{label}</label>
          <span className="text-xs font-medium bg-muted py-0.5 px-2 rounded">
            {value}{suffix} {/* Append suffix */}
          </span>
        </div>
      )}
      <div className="relative">
        <input
          type="range"
          min={min}
          max={max}
          value={value}
          step={step}
          onChange={handleChange}
          className="w-full h-2 bg-muted rounded-md appearance-none cursor-pointer"
          style={{
            background: `linear-gradient(to right, #6941C6 0%, #6941C6 ${percentage}%, #F3F4F6 ${percentage}%, #F3F4F6 100%)`,
          }}
        />
      </div>
      {description && <p className="text-xs text-muted-foreground mt-1">{description}</p>} {/* Display description */}
    </div>
  );
};
