import { useState, useEffect, useRef } from "react";
import Logo from "./icons/Logo";
import TopbarLink from "./TopbarLink";
import Dropdown from "./Dropdown";
import Notification from "./icons/Notification";
import NotificationModal from "./modals/Notification";
import Box from "./icons/Box";
import { Link } from "react-router-dom";
import { useUserStore } from "../store/user";

function Topbar() {
  const { user } = useUserStore();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    }

    if (showDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showDropdown]);

  return (
    <header className="flex items-center justify-between z-40">
      <div>
        <Logo />
      </div>
      <div className="flex items-center gap-5">
        <nav className="space-x-5 py-1 px-5 rounded-full flex items-center">
          <TopbarLink name="Dashboard" to="" />
          <TopbarLink name="Item Catalog" to="/catalog" />
        </nav>
        <div className="relative">
          <Link to="/cart" className="cursor-pointer hover:text-(--text)/80">
            <Box />
          </Link>
        </div>
        <div className="relative">
          <button
            onClick={() => setShowNotification(!showNotification)}
            className="p-3 rounded-full bg-white hover:shadow hover:bg-black/10 transition-all cursor-pointer"
          >
            <Notification />
          </button>
          {showNotification && (
            <NotificationModal onClose={() => setShowNotification(false)} />
          )}
        </div>
        <div
          ref={dropdownRef}
          className="relative"
          onClick={() => setShowDropdown(!showDropdown)}
        >
          {user?.profilePicture ? (
            <img
              src={user.profilePicture}
              alt="Profile"
              className="rounded-full cursor-pointer max-h-12 w-12 h-12 object-cover"
            />
          ) : (
            <div className="rounded-full cursor-pointer w-12 h-12 bg-linear-to-br from-(--primary) to-(--accent) flex items-center justify-center text-white font-semibold">
              {user?.firstname?.[0]?.toUpperCase() || "U"}
            </div>
          )}
          {showDropdown && (
            <Dropdown
              menu={[
                { name: "View Profile", to: "/profile" },
                { name: "View Transaction", to: "/transaction" },
              ]}
            />
          )}
        </div>
      </div>
    </header>
  );
}

export default Topbar;
