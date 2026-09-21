import { createBrowserRouter } from "react-router";
import MainLayout from "../Layouts/MainLayout";
import Home from "../components/Home/Home";
import AdminRoute from "../components/AdminRoute"; 
import AdminDashboard from "../components/admin/AdminDashboard"; 
import Login from "../components/LogReg/Login";
import Register from "../components/LogReg/Register";
const Shop = () => <div>Shop Page</div>; // Eta pore change korbo

const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />, // MainLayout er vitore to Navbar ebong Outlet achei
    children: [
      {
        path: "/",
        element: <Home />, 
      },
      // {
      //   path: "/shop",
      //   element: <Shop />,
      // },

      // AUTHENTICATION ROUTES (Public)
      {
        path: "/login",
        element: <Login />,
      },
      {
        path: "/register",
        element: <Register />,
      },
      
      // ADMIN PRIVATE ROUTES
      {
        element: <AdminRoute />, // Ei protector er vitore joto page thakbe sob private hoye jabe
        children: [
          {
            path: "/admin/dashboard",
            element: <AdminDashboard />,
          },
          // Vobishshote ekhane aro route add kora jabe, jemon:
          // { path: "/admin/orders", element: <AdminOrders /> }
        ]
      }
    ],
  },
]);

export default router;