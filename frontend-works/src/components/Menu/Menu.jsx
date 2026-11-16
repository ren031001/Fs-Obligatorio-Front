import { Outlet, NavLink, useNavigate } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { limpiarObras } from "../../store/slices/worksSlice";
import { useEffect } from "react";
import toast from "react-hot-toast";
import { axiosConfig } from "../../utils/axiosConfig";
import {
  guardarUsuario,
  limpiarUsuario,
} from "../../store/slices/usuarioSlice";
import "./Menu.css";

const Menu = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const usuario = useSelector((state) => state.usuario.datos);
  useEffect(() => {
    const cargarUsuario = async () => {
      try {
        const token = localStorage.getItem("token");
        const respuesta = await axiosConfig.get("/users/me", {
          headers: { Authorization: token },
        });
        dispatch(guardarUsuario(respuesta.data.user));
      } catch (error) {
        toast.error("No se pudieron cargar los datos del usuario");
      }
    };
    cargarUsuario();
  }, [dispatch]);

  const cerrarSesion = () => {
    localStorage.clear();
    dispatch(limpiarObras());
    dispatch(limpiarUsuario());
    navigate("/");
  };

  return (
    <div>
      <nav className="menu-barra">
        <NavLink
          className="menu-marca"
          to={usuario?.role === "admin" ? "/categories" : "/works"}
        >
          Control de obras
        </NavLink>

        <div className="menu-links">
          {usuario &&
            (usuario.role === "admin" ? (
              <NavLink className="menu-link" to="/categories">
                Categorías
              </NavLink>
            ) : (
              <>
                <NavLink className="menu-link" to="/works" end>
                  Mis obras
                </NavLink>
                <NavLink className="menu-link" to="/works/new">
                  Nueva obra
                </NavLink>
                <NavLink className="menu-link" to="/plan">
                  Mi plan
                </NavLink>
                <NavLink className="menu-link" to="/stats">
                  Estadísticas
                </NavLink>
                <NavLink className="menu-link" to="/map">
                  Mapa
                </NavLink>
              </>
            ))}
        </div>

        <button
          type="button"
          className="menu-boton-salir"
          onClick={cerrarSesion}
        >
          Cerrar sesión
        </button>
      </nav>

      <Outlet />
    </div>
  );
};

export default Menu;
