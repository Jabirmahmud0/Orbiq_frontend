import React from "react";

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  label?: string;
}

export const Toggle: React.FC<ToggleProps> = ({
  checked,
  onChange,
  disabled = false,
  label,
}) => {
  return (
    <label
      className={`flex items-center cursor-pointer ${disabled ? "opacity-50" : ""}`}
    >
      <div className="relative">
        <input
          type="checkbox"
          className="sr-only"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          disabled={disabled}
        />
        <div
          className={`block w-10 h-6 rounded-full transition-colors duration-200 ${checked ? "bg-primary" : "bg-gray-300"}`}
        />
        <div
          className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform duration-200 ${checked ? "transform translate-x-4" : ""}`}
        />
      </div>
      {label && (
        <span className="ml-3 text-body text-text-primary">{label}</span>
      )}
    </label>
  );
};
