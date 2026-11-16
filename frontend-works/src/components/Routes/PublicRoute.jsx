import { Navigate, Outlet } from "react-router";

const PublicRoute = () => {
  const token = localStorage.getItem("token");

  // Si ya hay sesión iniciada, no tiene sentido mostrar el login
  if (token) {
    return <Navigate to="/works" replace />;
  }

  return <Outlet />;
};

export default PublicRoute;
