import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import { axiosConfig } from "../../utils/axiosConfig";
import "./Plan.css";

const InformeUso = () => {
  const usuario = useSelector((state) => state.usuario.datos);
  const [totalObras, setTotalObras] = useState(null);

  useEffect(() => {
    const cargarTotal = async () => {
      try {
        const token = localStorage.getItem("token");
        const respuesta = await axiosConfig.get("/works", {
          params: { page: 1, limit: 1 },
          headers: { Authorization: token },
        });
        setTotalObras(respuesta.data.total);
      } catch (error) {
        toast.error("No se pudo calcular el uso");
      }
    };
    cargarTotal();
  }, []);

  if (!usuario || totalObras === null) {
    return <p className="plan-mensaje">Cargando ...</p>;
  }

  const esPlus = usuario.plan === "plus";
  const limite = usuario.plusWorksLimit;
  const porcentaje = Math.min(100, Math.round((totalObras / limite) * 100));

  return (
    <div className="plan-card">
      <h2 className="plan-titulo">Informe de uso</h2>

      {esPlus ? (
        <>
          <p className="plan-numero">{porcentaje}%</p>
          <p className="plan-texto">
            Usaste {totalObras} de {limite} obras de tu plan plus.
          </p>
          <div className="plan-barra">
            <div
              className="plan-barra-relleno"
              style={{ width: `${porcentaje}%` }}
            />
          </div>
        </>
      ) : (
        <>
          <p className="plan-numero">{totalObras}</p>
          <p className="plan-texto">
            {totalObras === 1 ? "obra registrada" : "obras registradas"} (plan
            premium, sin límite)
          </p>
        </>
      )}
    </div>
  );
};

export default InformeUso;
