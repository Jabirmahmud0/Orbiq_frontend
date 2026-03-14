import React from "react";

interface BadgeProps {
  variant?: "success" | "warning" | "error" | "info";
  children: React.ReactNode;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  variant = "info",
  children,
  className = "",
}) => {
  const variantStyles = {
    success: "bg-success text-white",
    warning: "bg-warning text-white",
    error: "bg-error text-white",
    info: "bg-gray-200 text-gray-800",
  };

  return (
    <span
      className={`
        inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
        ${variantStyles[variant]}
        ${className}
      `}
    >
      {children}
    </span>
  );
};
