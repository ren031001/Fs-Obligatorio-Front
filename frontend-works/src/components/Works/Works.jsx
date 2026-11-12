import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import { axiosConfig } from "../../utils/axiosConfig";
import {
  guardarObras,
  cambiarPagina,
  filtrarPorCategoria,
} from "../../store/slices/worksSlice";
import { guardarCategorias } from "../../store/slices/categoriesSlice";
import { STATES } from "../../utils/workStates";
import EditWorkModal from "./EditWorkModal";
import "./Works.css";
import InvoiceModal from "./InvoiceModal";

const LIMITE_POR_PAGINA = 5;

const Works = () => {
  const categories = useSelector((state) => state.categories.lista);
  const [cargando, setCargando] = useState(false);
  const [obraSeleccionada, setObraSeleccionada] = useState(null);
  const [obraFactura, setObraFactura] = useState(null);
  const [recarga, setRecarga] = useState(0);
  const [cargandoCategorias, setCargandoCategorias] = useState(true);
  const dispatch = useDispatch();

  const { lista, pagina, totalPaginas, total, categoriaFiltro } = useSelector(
    (state) => state.works,
  );

  useEffect(() => {
    const cargarCategorias = async () => {
      try {
        setCargandoCategorias(true);
        const token = localStorage.getItem("token");

        const respuesta = await axiosConfig.get("/categories", {
          headers: {
            Authorization: token,
          },
        });

        console.log("Categoría:", respuesta.data);

        dispatch(guardarCategorias(respuesta.data));
      } catch (error) {
        toast.error(
          error.response?.data?.message ||
            "No se pudieron cargar las categorías",
        );
      } finally {
        setCargandoCategorias(false);
      }
    };
    cargarCategorias();
  }, [dispatch]);

  // Carga las obras al entrar y cada vez que cambia la página, el filtro o "recarga"
  useEffect(() => {
    const cargarObras = async () => {
      setCargando(true);
      try {
        const params = { page: pagina, limit: LIMITE_POR_PAGINA };
        if (categoriaFiltro) params.categoryId = categoriaFiltro;

        const token = localStorage.getItem("token");

        const respuesta = await axiosConfig.get("/works", {
          params,
          headers: {
            Authorization: token,
          },
        });
        dispatch(guardarObras(respuesta.data));
      } catch (error) {
        toast.error(
          error.response?.data?.message || "No se pudieron cargar las obras",
        );
      } finally {
        setCargando(false);
      }
    };

    cargarObras();
  }, [dispatch, pagina, categoriaFiltro, recarga]);

  const eliminarObra = async (obra) => {
    try {
      const token = localStorage.getItem("token");

      await axiosConfig.delete(`/works/${obra._id}`, {
        headers: {
          Authorization: token,
        },
      });
      toast.success("Obra eliminada");

      if (lista.length === 1 && pagina > 1) {
        dispatch(cambiarPagina(pagina - 1));
      } else {
        setRecarga((valor) => valor + 1);
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || "No se pudo eliminar la obra",
      );
    }
  };

  const guardarCambios = () => {
    setObraSeleccionada(null);
    setRecarga((valor) => valor + 1);
  };
  const guardarFactura = () => {
    setObraFactura(null);
    setRecarga((valor) => valor + 1);
  };

  const nombreCategoria = (categoryId) =>
    categories.find((c) => c._id === categoryId)?.name || "Sin categoría";

  const etiquetaEstado = (status) =>
    STATES.find((e) => e.value === status)?.label || status;

  if (cargandoCategorias) {
    return <p className="obras-mensaje">Cargando ...</p>;
  }

  return (
    <div className="obras-page">
      <div className="obras-header">
        <div>
          <h1 className="obras-title">Mis obras</h1>
          <p className="obras-subtitle">
            {total} {total === 1 ? "obra registrada" : "obras registradas"}
          </p>
        </div>

        <div className="obras-filtro">
          <label className="obras-filtro-label">Categoría:</label>
          <select
            className="obras-filtro-select"
            value={categoriaFiltro}
            onChange={(e) => dispatch(filtrarPorCategoria(e.target.value))}
          >
            <option value="">Todas</option>
            {categories.map((categoria) => (
              <option key={categoria._id} value={categoria._id}>
                {categoria.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {cargando && lista.length === 0 && (
        <p className="obras-mensaje">Cargando obras...</p>
      )}

      {!cargando && lista.length === 0 && (
        <p className="obras-mensaje">No hay obras para mostrar.</p>
      )}

      <ul className="obras-lista">
        {lista.map((obra) => (
          <li key={obra._id} className="obras-item">
            {obra.images?.[0] && (
              <img
                className="obras-imagen"
                src={obra.images[0]}
                alt={`Obra de ${obra.clientName}`}
              />
            )}

            <div className="obras-info">
              <div className="obras-info-superior">
                <h2 className="obras-cliente">{obra.clientName}</h2>
                <span className={`obras-estado obras-estado-${obra.status}`}>
                  {etiquetaEstado(obra.status)}
                </span>
              </div>

              <p className="obras-detalle">
                <strong>Categoría:</strong> {nombreCategoria(obra.categoryId)}
              </p>
              <p className="obras-detalle">
                <strong>Dirección:</strong> {obra.officialAddress}
              </p>
              <p className="obras-detalle">
                <strong>Inicio:</strong> {obra.startDate} ·{" "}
                <strong>Fin:</strong> {obra.endDate}
              </p>
              {obra.invoiceItems?.length > 0 && (
                <p className="obras-detalle">
                  <strong>Facturado:</strong> ${" "}
                  {obra.invoiceItems.reduce(
                    (total, item) => total + (item.amount || 0),
                    0,
                  )}
                </p>
              )}
              {obra.description && (
                <p className="obras-descripcion">{obra.description}</p>
              )}
            </div>

            <div className="obras-acciones">
              <button
                type="button"
                className="obras-boton-editar"
                onClick={() => setObraSeleccionada(obra)}
              >
                Editar
              </button>
              <button
                type="button"
                className="obras-boton-editar"
                onClick={() => setObraFactura(obra)}
              >
                Factura IA
              </button>
              <button
                type="button"
                className="obras-boton-eliminar"
                onClick={() => eliminarObra(obra)}
              >
                Eliminar
              </button>
            </div>
          </li>
        ))}
      </ul>

      {totalPaginas > 1 && (
        <div className="obras-paginacion">
          <button
            type="button"
            className="obras-boton-pagina"
            onClick={() => dispatch(cambiarPagina(pagina - 1))}
            disabled={pagina === 1}
          >
            Anterior
          </button>
          <span className="obras-pagina-actual">
            Página {pagina} de {totalPaginas}
          </span>
          <button
            type="button"
            className="obras-boton-pagina"
            onClick={() => dispatch(cambiarPagina(pagina + 1))}
            disabled={pagina === totalPaginas}
          >
            Siguiente
          </button>
        </div>
      )}

      <EditWorkModal
        obra={obraSeleccionada}
        onClose={() => setObraSeleccionada(null)}
        onSaved={guardarCambios}
        onImageUploaded={() => setRecarga((valor) => valor + 1)}
      />
      <InvoiceModal
        obra={obraFactura}
        onClose={() => setObraFactura(null)}
        onSaved={guardarFactura}
      />
    </div>
  );
};

export default Works;
