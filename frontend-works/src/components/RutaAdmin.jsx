import { Navigate, Outlet } from "react-router";
import { useSelector } from "react-redux";

const RutaAdmin = () => {
  const usuario = useSelector((state) => state.usuario.datos);

  // Con F5 el usuario tarda un instante en llegar: esperamos antes de decidir
  if (!usuario) return <p>Cargando ...</p>;

  if (usuario.role !== "admin") {
    return <Navigate to="/works" replace />;
  }

  return <Outlet />;
};

export default RutaAdmin;
