import { Navigate, Outlet } from "react-router-dom";
import { getToken } from "../api";

export function ProtectedRoute() {
  return getToken() ? <Outlet /> : <Navigate to="/login" replace />;
}
