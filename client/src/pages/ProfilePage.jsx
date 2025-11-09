import { Outlet } from "react-router-dom";
import SidebarLink from "../components/SidebarLink";

function ProfilePage() {
  return (
    <section className="flex h-full w-full">
      <div className="md:fixed md:left-0 md:top-20  mx-25 md:w-40 md:h-[calc(100vh-80px)] md:overflow-y-auto">
        <div className="flex flex-col gap-3 mt-3">
          <h1 className="text-2xl font-medium pt-3">Menu</h1>
          <div className="space-y-3">
            <SidebarLink name="Profile" to="/profile" icon="person" />
            <SidebarLink
              name="Transaction"
              to="/profile/transactions"
              icon="box"
            />
            <SidebarLink
              name="Settings"
              to="/profile/settings"
              icon="history"
            />
          </div>
        </div>
      </div>
      <div className="md:ml-45 flex flex-col h-full w-full">
        <Outlet />
      </div>
    </section>
  );
}

export default ProfilePage;
