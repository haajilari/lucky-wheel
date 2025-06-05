// src/components/Input/Input.tsx
import React from "react";
import "./Input.scss";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  containerClassName?: string;
}

const Input: React.FC<InputProps> = ({
  label,
  id,
  error,
  className = "",
  containerClassName = "",
  ...rest
}) => {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

  return (
    <div className={`input-field-container ${containerClassName}`}>
      {label && (
        <label htmlFor={inputId} className="input-label">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={`input-field ${error ? "input-field--error" : ""} ${className}`}
        {...rest}
      />
      {error && <p className="input-error-message">{error}</p>}
    </div>
  );
};

export default Input;
