import React from "react";

interface AvatarProps {
  src?: string;
  alt?: string;
  size?: "sm" | "md" | "lg";
  fallback?: string;
}

export const Avatar: React.FC<AvatarProps> = ({
  src,
  alt = "",
  size = "md",
  fallback = "?",
}) => {
  const sizeStyles = {
    sm: "w-8 h-8 text-xs",
    md: "w-10 h-10 text-sm",
    lg: "w-12 h-12 text-base",
  };

  return (
    <div
      className={`${sizeStyles[size]} rounded-full bg-primary text-white flex items-center justify-center font-semibold overflow-hidden`}
    >
      {src ? (
        <img src={src} alt={alt} className="w-full h-full object-cover" />
      ) : (
        fallback
      )}
    </div>
  );
};
