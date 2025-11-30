import { Outlet } from "react-router-dom";
import Topbar from "./components/Topbar";
import { Toaster } from "react-hot-toast";

function App() {
  return (
    <>
      <Toaster position="top-center" />
      <div className="fixed top-0 left-0 w-full px-25 py-3 z-50 bg-(--background)">
        <Topbar />
      </div>
      <main className="pt-20 px-25 h-screen w-full fadeIn">
        <Outlet />
      </main>
    </>
  );
}

export default App;
