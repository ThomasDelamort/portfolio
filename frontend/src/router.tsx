import { createBrowserRouter } from "react-router-dom";
import RootLayout from "./layouts/RootLayout";
import Home from "./pages/home/Home";
import ErrorPage from "./pages/error/ErrorPage";
import NotFound from "./pages/error/NotFound";

// The site is one continuous scrolling page, so every section route renders
// the same <Home />. React Router renders matched routes without a key, so
// swapping between these does not remount the page -- the path only decides
// which section useSectionSync scrolls to.
export const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    errorElement: <ErrorPage />,
    children: [
      { index: true, element: <Home /> },
      { path: "projects", element: <Home /> },
      { path: "skills", element: <Home /> },
      { path: "about", element: <Home /> },
      { path: "contact", element: <Home /> },
      { path: "*", element: <NotFound /> },
    ],
  },
]);
