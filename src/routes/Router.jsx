import { createBrowserRouter } from "react-router";
import MainLayout from "../Layouts/MainLayout";
import Home from "../components/Home/Home";
import AdminRoute from "../components/AdminRoute"; 
import AdminDashboard from "../components/admin/AdminDashboard"; 
import Login from "../components/LogReg/Login";
import Register from "../components/LogReg/Register";
import Profile from "../components/user/Profile";
import AdminLayout from "../components/admin/AdminLayout";
import AdminAddProduct from "../components/admin/AdminAddProduct";
import AdminProducts from "../components/admin/AdminProducts";
import AdminEditProduct from "../components/admin/AdminEditProduct";
import AdminCategories from "../components/admin/AdminCategories";
import AdminOrders from "../components/admin/AdminOrders";
import AdminCustomers from './../components/admin/AdminCustomers';

const Shop = () => <div>Shop Page</div>;

const router = createBrowserRouter([
  // 1. PUBLIC & CUSTOMER ROUTES (Navbar ebong Footer soho)
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
      {
        path: "/login",
        element: <Login />,
      },
      {
        path: "/register",
        element: <Register />,
      },
      {
        path: "/profile",
        element: <Profile />,
      },
    ],
  },
  
  // 2. ADMIN PRIVATE ROUTES (Customer Navbar chara, shudhu Admin Sidebar soho)
  {
    element: <AdminRoute />, // Ei protector er vitore joto page thakbe sob private hoye jabe
    children: [ // <-- Ekhane third-bracket [] hobe
      {
        element: <AdminLayout />, // Notun Admin Layout (Sidebar soho)
        children: [
          {
            path: "/admin/dashboard",
            element: <AdminDashboard />,
          },
          
          { path: "/admin/add-product", element: <AdminAddProduct /> },
          { path: "/admin/products", element: <AdminProducts/> },
          { path: "/admin/edit-product/:id", element: <AdminEditProduct/> },
          { path: "/admin/categories", element: <AdminCategories/> },
          { path: "/admin/orders", element: <AdminOrders />, },
          { path: "/admin/users", element: <AdminCustomers />, }
        ]
      }
    ]
  }
]);

export default router;