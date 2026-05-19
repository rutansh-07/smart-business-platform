import { Navigate } from "react-router-dom";

export function PublicRoute({ children }) {
  const token = localStorage.getItem("smartbiz_token");

  // If user is already logged in, prevent them from going back to login/register
  if (token) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
