import React from "react";
import { Link, useNavigate } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";
import { useUserStore } from "../store/user";

function Dropdown({ menu = [] }) {
  const setUser = useUserStore((state) => state.setUser);
  const navigate = useNavigate();
  const handleLogout = async () => {
    const res = await axiosInstance.post("/auth/logout");

    if (res.status === 200) {
      setUser(null);
      navigate("/auth/login");
    }
  };

  return (
    <div className="absolute right-0 mt-2 px-5 py-3 w-50 bg-white space-y-3 rounded-md shadow-md z-50">
      <nav className="flex flex-col">
        {Array.isArray(menu) &&
          menu.map((data, index) => (
            <Link key={index} to={data.to} className="hover:font-medium">
              {data.name}
            </Link>
          ))}
      </nav>
      <button
        className="border-t w-full text-left pt-3 transition-all"
        onClick={handleLogout}
      >
        Log out
      </button>
    </div>
  );
}

export default Dropdown;
