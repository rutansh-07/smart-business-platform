import { Navigate } from "react-router-dom";

export function AdminRoute({ children }) {
  const userStr = localStorage.getItem("smartbiz_user");
  let user = null;
  
  try {
    user = userStr ? JSON.parse(userStr) : null;
  } catch (error) {
    console.error("Error parsing user from localStorage:", error);
  }

  // If the user's role is not admin, redirect them back to /dashboard
  if (!user || user.role !== "admin") {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
