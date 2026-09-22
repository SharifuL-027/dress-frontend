import { Navigate, Outlet } from "react-router"; 
import { useAuth } from "../context/AuthContext";

const AdminRoute = () => {
  const { user, loading } = useAuth();

  if (loading) return <div className="mt-32 text-center text-xl font-bold">Checking Authorization...</div>;

  // Ekhane change kora hoyeche: user.isAdmin er jaygay user.role === 'admin'
  if (user && user.role === 'admin') {
    return <Outlet />; 
  }

  return <Navigate to="/login" replace />;
};

export default AdminRoute;