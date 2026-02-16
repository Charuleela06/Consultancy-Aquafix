import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children, requiredRole }) => {
  const token = localStorage.getItem("token");
  const role = (localStorage.getItem("role") || "").toLowerCase();

  if (!token) {
    return <Navigate to="/" replace />;
  }

  if (requiredRole) {
    const allowedRoles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
    const normalizedAllowedRoles = allowedRoles.map((r) => String(r).toLowerCase());
    if (!normalizedAllowedRoles.includes(role)) {
      return <Navigate to={role === "admin" ? "/dashboard" : "/home"} replace />;
    }
  }

  return children;
};

export default ProtectedRoute;
