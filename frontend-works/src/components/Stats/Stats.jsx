import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  Chart as ChartJS,
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from "chart.js";
import { Doughnut, Bar } from "react-chartjs-2";
import { axiosConfig } from "../../utils/axiosConfig";
import { STATES } from "../../utils/workStates";
import "./Stats.css";

ChartJS.register(
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
);

const Stats = () => {
  const [obras, setObras] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [cargado, setCargado] = useState(false);

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const token = localStorage.getItem("token");
        const headers = { Authorization: token };

        const [resObras, resCategorias] = await Promise.all([
          axiosConfig.get("/works", {
            params: { page: 1, limit: 1000 },
            headers,
          }),
          axiosConfig.get("/categories", { headers }),
        ]);

        setObras(resObras.data.data);
        setCategorias(resCategorias.data);
      } catch (error) {
        toast.error("No se pudieron cargar las estadísticas");
      } finally {
        setCargado(true);
      }
    };
    cargarDatos();
  }, []);

  if (!cargado) return <p className="stats-mensaje">Cargando ...</p>;

  if (obras.length === 0) {
    return (
      <p className="stats-mensaje">
        Todavía no tenés obras. Creá algunas para ver los gráficos.
      </p>
    );
  }

  // Cantidad de obras por estado, en el mismo orden que STATES
  const cantidadPorEstado = STATES.map(
    (estado) => obras.filter((obra) => obra.status === estado.value).length,
  );

  // Cantidad de obras por categoría (solo las categorías que tienen obras)
  const categoriasConObras = categorias
    .map((categoria) => ({
      nombre: categoria.name,
      cantidad: obras.filter((obra) => obra.categoryId === categoria._id)
        .length,
    }))
    .filter((categoria) => categoria.cantidad > 0);

  const datosEstado = {
    labels: STATES.map((estado) => estado.label),
    datasets: [
      {
        data: cantidadPorEstado,
        backgroundColor: ["#f59e0b", "#3b82f6", "#10b981"],
      },
    ],
  };

  const datosCategoria = {
    labels: categoriasConObras.map((categoria) => categoria.nombre),
    datasets: [
      {
        label: "Obras",
        data: categoriasConObras.map((categoria) => categoria.cantidad),
        backgroundColor: "#3b82f6",
      },
    ],
  };

  const opcionesBarras = {
    plugins: { legend: { display: false } },
    scales: { y: { beginAtZero: true, ticks: { precision: 0 } } },
  };

  return (
    <div className="stats-page">
      <h1 className="stats-titulo">Estadísticas de mis obras</h1>
      <p className="stats-subtitulo">{obras.length} obras en total</p>

      <div className="stats-grilla">
        <div className="stats-card">
          <h2 className="stats-card-titulo">Obras por estado</h2>
          <Doughnut data={datosEstado} />
        </div>

        <div className="stats-card">
          <h2 className="stats-card-titulo">Obras por categoría</h2>
          <Bar data={datosCategoria} options={opcionesBarras} />
        </div>
      </div>
    </div>
  );
};

export default Stats;
