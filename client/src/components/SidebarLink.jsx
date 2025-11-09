import { NavLink } from "react-router-dom";
import GetIcon from "./icons/GetIcon";

function SidebarLink({ name, to, icon }) {
  return (
    <NavLink
      to={to}
      className="flex items-center gap-2 px-3 py-2 rounded-sm font-medium transition-colors text-(--inactive) hover:text-(--text) [&.active]:border-l-5 border-(--accent) [&.active]:text-white"
      end
    >
      {icon ? <GetIcon icon={icon} /> : ""}
      {name}
    </NavLink>
  );
}

export default SidebarLink;
