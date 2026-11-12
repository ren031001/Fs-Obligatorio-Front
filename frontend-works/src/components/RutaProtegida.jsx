import { Navigate, Outlet } from "react-router";

const RutaProtegida = () => {
  const token = localStorage.getItem("token");

  if (!token) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default RutaProtegida;
