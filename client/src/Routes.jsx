import { createBrowserRouter, Route, RouterProvider } from "react-router-dom";
import App from "./App";
import Signup from "./pages/Signup";

function Routes() {
	const routes = createBrowserRouter([
		{
			path: "/",
			element: <App />,
		},
		{
			path: "/signup",
			element: <Signup />,
		},
	]);

	return <RouterProvider router={routes} />;
}

export default Routes;
