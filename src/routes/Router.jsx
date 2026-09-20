import { createBrowserRouter } from "react-router";
import MainLayout from "../layouts/MainLayout";
import Home from "../components/Home/Home";

// Kono dummy const Home = ... thakbe na

const Shop = () => <div>Shop Page</div>; // Eta pore change korbo

const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
    children: [
      {
        path: "/",
        element: <Home />, 
      },
      // {
      //   path: "/shop",
      //   element: <Shop />,
      // },
    ],
  },
]);

export default router;