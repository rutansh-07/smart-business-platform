import { Navigate } from "react-router-dom";

export function ProtectedRoute({ children }) {
  const token = localStorage.getItem("smartbiz_token");

  // If there is no token, redirect to login page immediately
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
