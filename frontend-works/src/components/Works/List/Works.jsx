import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import { axiosConfig } from "../../../utils/axiosConfig";
import {
  guardarObras,
  cambiarPagina,
  filtrarPorCategoria,
} from "../../../store/slices/worksSlice";
import { guardarCategorias } from "../../../store/slices/categoriesSlice";
import { STATES } from "../../../utils/workStates";
import EditWorkModal from "../Modal/EditWorkModal";
import "./Works.css";
import InvoiceModal from "../Modal/InvoiceModal";
import WorkItem from "./WorkItem";
const LIMITE_POR_PAGINA = 5;

const Works = () => {
  const categories = useSelector((state) => state.categories.lista);
  const [cargando, setCargando] = useState(false);
  const [obraFactura, setObraFactura] = useState(null);
  const [recarga, setRecarga] = useState(0);
  const [cargandoCategorias, setCargandoCategorias] = useState(true);
  const dispatch = useDispatch();
  const [modalEdicionAbierto, setModalEdicionAbierto] = useState(false);
  const [modalFacturaAbierto, setModalFacturaAbierto] = useState(false);
  const [obraSeleccionada, setObraSeleccionada] = useState(null);

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
  const abrirModalEdicion = (obra) => {
    setObraSeleccionada(obra);
    setModalEdicionAbierto(true);
  };

  const cerrarModalEdicion = () => {
    setModalEdicionAbierto(false);
  };

  const guardarCambios = async (cambios) => {
    try {
      const token = localStorage.getItem("token");
      await axiosConfig.put(`/works/${obraSeleccionada._id}`, cambios, {
        headers: { Authorization: token },
      });
      toast.success("Obra actualizada");
      cerrarModalEdicion();
      setRecarga((valor) => valor + 1);
    } catch (error) {
      const errorData = error.response?.data;
      const mensaje = errorData?.details?.length
        ? errorData.details.join(". ")
        : errorData?.message ||
          errorData?.error ||
          "No se pudo conectar con el servidor";
      console.error("Respuesta del servidor:", error.response?.data);
      toast.error(mensaje);
    }
  };

  const subirImagen = async (archivo) => {
    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();
      formData.append("image", archivo);

      const respuesta = await axiosConfig.post(
        `/works/${obraSeleccionada._id}/images`,
        formData,
        {
          headers: {
            Authorization: token,
            "Content-Type": "multipart/form-data",
          },
        },
      );

      // Actualiza las imágenes de la obra que está abierta en el modal
      setObraSeleccionada((prev) => ({
        ...prev,
        images: respuesta.data.data.images,
      }));
      toast.success("Imagen subida");
      setRecarga((valor) => valor + 1);
      return true;
    } catch (error) {
      const errorData = error.response?.data;
      toast.error(
        errorData?.message ||
          errorData?.error ||
          "No se pudo conectar con el servidor",
      );
      return false;
    }
  };

  const abrirModalFactura = (obra) => {
    setObraFactura(obra);
    setModalFacturaAbierto(true);
  };

  const cerrarModalFactura = () => {
    setModalFacturaAbierto(false);
  };

  // Devuelve los artículos que propone la IA (o null si falló)
  const analizarFactura = async (archivo) => {
    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();
      formData.append("image", archivo);

      const respuesta = await axiosConfig.post(
        `/works/${obraFactura._id}/extract-invoice-items`,
        formData,
        {
          headers: {
            Authorization: token,
            "Content-Type": "multipart/form-data",
          },
          timeout: 45000, // la IA puede tardar más que el resto de las peticiones
        },
      );

      toast(respuesta.data.message); // "Artículos extraídos..." o "cargalos manualmente"
      return respuesta.data.data.items.map((i) => ({
        name: i.name,
        amount: i.amount,
      }));
    } catch (error) {
      console.error(
        "Error al analizar factura:",
        error.response?.data ?? error,
      );
      const errorData = error.response?.data;
      const mensaje = errorData?.details?.length
        ? errorData.details.join(". ")
        : errorData?.message ||
          errorData?.error ||
          "No se pudo conectar con el servidor";
      toast.error(mensaje);
      return null;
    }
  };

  const guardarFactura = async (items) => {
    try {
      const token = localStorage.getItem("token");
      await axiosConfig.post(
        `/works/${obraFactura._id}/confirm-invoice-items`,
        { items },
        { headers: { Authorization: token } },
      );
      toast.success("Factura guardada");
      cerrarModalFactura();
      setRecarga((valor) => valor + 1);
    } catch (error) {
      const errorData = error.response?.data;
      const mensaje = errorData?.details?.length
        ? errorData.details.join(". ")
        : errorData?.message ||
          errorData?.error ||
          "No se pudo conectar con el servidor";
      toast.error(mensaje);
    }
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
          <WorkItem
            key={obra._id}
            obra={obra}
            categoria={nombreCategoria(obra.categoryId)}
            estado={etiquetaEstado(obra.status)}
            onEditar={() => abrirModalEdicion(obra)}
            onFactura={() => abrirModalFactura(obra)}
            onEliminar={() => eliminarObra(obra)}
          />
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
        isOpen={modalEdicionAbierto}
        onRequestClose={cerrarModalEdicion}
        obra={obraSeleccionada}
        onSave={guardarCambios}
        onUploadImage={subirImagen}
      />
      <InvoiceModal
        isOpen={modalFacturaAbierto}
        onRequestClose={cerrarModalFactura}
        obra={obraFactura}
        onSave={guardarFactura}
        onAnalyze={analizarFactura}
      />
    </div>
  );
};

export default Works;
