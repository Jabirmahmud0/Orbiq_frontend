import React from "react";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  description?: string;
  action?: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = "",
  title,
  description,
  action,
}) => {
  return (
    <div
      className={`bg-surface rounded-card shadow-sm border border-border ${className}`}
    >
      {(title || description || action) && (
        <div className="px-6 py-4 border-b border-border flex items-center justify-between">
          <div>
            {title && (
              <h3 className="text-section font-semibold text-text-primary">
                {title}
              </h3>
            )}
            {description && (
              <p className="mt-1 text-sm text-text-secondary">{description}</p>
            )}
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      <div className="p-6">{children}</div>
    </div>
  );
};
