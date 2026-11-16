import { Navigate, Outlet } from "react-router";
import { useSelector } from "react-redux";

const UserRoute = () => {
  const usuario = useSelector((state) => state.usuario.datos);

  // Con F5 el usuario tarda un instante en llegar: esperamos antes de decidir
  if (!usuario) return <p>Cargando ...</p>;

  // El admin solo gestiona categorías
  if (usuario.role === "admin") {
    return <Navigate to="/categories" replace />;
  }

  return <Outlet />;
};

export default UserRoute;
