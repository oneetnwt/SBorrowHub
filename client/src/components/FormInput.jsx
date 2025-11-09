import React from "react";

function FormInput({
  label,
  type = "text",
  id,
  name,
  value,
  onChange,
  placeholder,
  required = false,
  icon: Icon,
  className = "",
  ...props
}) {
  return (
    <div className="space-y-2">
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-(--text)">
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Icon className="h-5 w-5 text-(--neutral-400)" />
          </div>
        )}
        <input
          type={type}
          id={id}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          className={`w-full ${
            Icon ? "pl-10" : "pl-4"
          } pr-4 py-3 border border-(--neutral-300) rounded-xl focus:outline-none focus:ring-2 focus:ring-(--primary) focus:border-transparent transition-all duration-200 bg-white/50 ${className}`}
          {...props}
        />
      </div>
    </div>
  );
}

export default FormInput;
