import { Outlet } from "react-router-dom";
import Sidebar from "../../components/Sidebar";
import { useUserStore } from "../../store/user";
import useWebSocket from "../../hooks/useWebSocket";

function Admin() {
  const { user } = useUserStore();
  // Initialize WebSocket connection for the admin
  useWebSocket(user?._id);

  return (
    <main className="w-full h-screen bg-(--background) flex">
      {/* Fixed Sidebar */}
      <Sidebar role="admin" />

      {/* Main Content Area with left padding to account for fixed sidebar */}
      <div className="flex-1 ml-64 h-full overflow-auto">
        <Outlet />
      </div>
    </main>
  );
}

export default Admin;
