import React from "react";
import GetIcon from "./icons/GetIcon";

function InformationCard({ name, icon, data }) {
  return (
    <div className="w-full h-30 p-5 border bg-white hover:shadow-md hover:scale-101 border-black/10 rounded-md transition-all">
      <span className="flex w-full justify-between">
        <p className="text-(--inactive)">{name}</p>
        <span className="border p-3 rounded-md border-black/25">
          <GetIcon icon={icon} />
        </span>
      </span>
      <p className="font-bold text-2xl">{data}</p>
    </div>
  );
}

export default InformationCard;
