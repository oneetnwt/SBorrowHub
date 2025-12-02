import React from "react";

function Checkbox({ label, id, handleChange, checked }) {
  return (
    <label
      htmlFor={id}
      className="flex items-center gap-2 text-sm cursor-pointer hover:bg-gray-50 px-2 rounded transition-colors"
    >
      <input
        type="checkbox"
        id={id}
        checked={checked}
        onChange={handleChange}
        className="appearance-none w-5 h-5 border-2 border-gray-400 rounded checked:bg-(--accent) checked:border-(--accent) cursor-pointer transition-colors hover:border-(--accent)"
      />
      <span>{label}</span>
    </label>
  );
}

export default Checkbox;
