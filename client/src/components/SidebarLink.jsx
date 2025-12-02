import { NavLink } from "react-router-dom";
import GetIcon from "./icons/GetIcon";

function SidebarLink({ name, to, icon }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-all ${
          isActive
            ? "bg-(--accent) text-white shadow-md"
            : "text-gray-600 hover:text-(--accent) hover:bg-(--accent)/5"
        }`
      }
      end
    >
      {({ isActive }) => (
        <>
          {icon && (
            <div className={isActive ? "scale-110" : ""}>
              <GetIcon icon={icon} />
            </div>
          )}
          <span>{name}</span>
        </>
      )}
    </NavLink>
  );
}

export default SidebarLink;
