import { Navigate, Outlet } from "react-router"; 
import { useAuth } from "../context/AuthContext";

const AdminRoute = () => {
  const { user, loading } = useAuth();

  // Data ashte somoy lagle ekti loader dekhabe
  if (loading) return <div className="mt-32 text-center text-xl font-bold">Checking Authorization...</div>;

  // Jodi user login thake ebong tar role Admin (isAdmin: true) hoy, tobei vitorer page dekhabe
  if (user && user.isAdmin) {
    return <Outlet />; // Outlet = /admin/dashboard ba onnanyo admin children
  }

  // Admin na hole Login page-e redirect korbe
  return <Navigate to="/login" replace />;
};

export default AdminRoute;