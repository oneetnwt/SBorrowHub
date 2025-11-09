import { Outlet } from "react-router-dom";
import Topbar from "./components/Topbar";

function App() {
  return (
    <>
      <div className="fixed top-0 left-0 w-full px-25 py-3 z-10 bg-(--background)">
        <Topbar />
      </div>
      <main className="pt-20 px-25 h-screen w-full fadeIn">
        <Outlet />
      </main>
    </>
  );
}

export default App;
