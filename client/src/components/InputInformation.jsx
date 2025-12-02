import React from "react";

function InputInformation({ id, type, name, value }) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="text-(--inactive)">
        {name}
      </label>
      <input
        type={type}
        id={id}
        value={value}
        className="focus:outline-0 font-medium"
        disabled
      />
    </div>
  );
}

export default InputInformation;
