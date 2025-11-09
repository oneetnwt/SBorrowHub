import React from "react";
import { NavLink } from "react-router-dom";
import GetIcon from "./icons/GetIcon";

function TopbarLink({ name, to, icon }) {
  return (
    <NavLink
      to={to}
      className="flex items-center gap-2 not-[.active]:text-(--inactive) hover:text-(--text) font-medium"
    >
      {icon ? <GetIcon icon={icon} /> : ""}
      {name}
    </NavLink>
  );
}

export default TopbarLink;
