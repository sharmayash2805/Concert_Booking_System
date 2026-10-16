import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

const AdminRoute = () => {
  const { user, loading } = useAuth();
  if (loading) return <div className="container mx-auto px-4 py-20 text-center">Loading account...</div>;
  if (!user) return <Navigate to="/login" replace />;
  return user.role === "ADMIN" ? <Outlet /> : <Navigate to="/" replace />;
};

export default AdminRoute;