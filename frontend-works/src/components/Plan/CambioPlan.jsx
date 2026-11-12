import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import { axiosConfig } from "../../utils/axiosConfig";
import { guardarUsuario } from "../../store/slices/usuarioSlice";
import "./Plan.css";

const CambioPlan = () => {
  const dispatch = useDispatch();
  const usuario = useSelector((state) => state.usuario.datos);
  const [cambiando, setCambiando] = useState(false);

  if (!usuario) return null;

  const pasarAPremium = async () => {
    setCambiando(true);
    try {
      const token = localStorage.getItem("token");
      await axiosConfig.put(
        "/users/plan",
        {},
        {
          headers: { Authorization: token },
        },
      );

      dispatch(guardarUsuario({ ...usuario, plan: "premium" }));
      toast.success("¡Ahora sos premium!");
    } catch (error) {
      const errorData = error.response?.data;
      toast.error(
        errorData?.message ||
          errorData?.error ||
          "No se pudo conectar con el servidor",
      );
    } finally {
      setCambiando(false);
    }
  };

  return (
    <div className="plan-card">
      <h2 className="plan-titulo">Mi plan</h2>
      <p className="plan-texto">
        Plan actual: <strong>{usuario.plan}</strong>
      </p>

      {usuario.plan === "plus" ? (
        <>
          <p className="plan-texto">
            Con el plan plus podés cargar hasta {usuario.plusWorksLimit} obras.
            El plan premium no tiene límite.
          </p>
          <button
            type="button"
            className="plan-boton"
            onClick={pasarAPremium}
            disabled={cambiando}
          >
            {cambiando ? "Cambiando..." : "Pasar a premium"}
          </button>
        </>
      ) : (
        <p className="plan-texto">
          Ya tenés el plan premium: podés cargar todas las obras que quieras.
        </p>
      )}
    </div>
  );
};

export default CambioPlan;
