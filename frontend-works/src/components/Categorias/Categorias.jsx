import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import categorySchema from "../validations/categorySchema";
import { axiosConfig } from "../../utils/axiosConfig";
import {
  guardarCategorias,
  agregarCategoria,
  actualizarCategoria,
  eliminarCategoria,
} from "../../store/slices/categoriesSlice";
import "./Categorias.css";

const valoresVacios = { name: "", description: "" };

const pedirCategorias = async (dispatch) => {
  const token = localStorage.getItem("token");
  const respuesta = await axiosConfig.get("/categories", {
    headers: { Authorization: token },
  });
  dispatch(guardarCategorias(respuesta.data));
};

const mensajeDeError = (error) => {
  const errorData = error.response?.data;
  return errorData?.details?.length
    ? errorData.details.join(". ")
    : errorData?.message ||
        errorData?.error ||
        "No se pudo conectar con el servidor";
};

const Categorias = () => {
  const dispatch = useDispatch();
  const categorias = useSelector((state) => state.categories.lista);
  const [cargado, setCargado] = useState(false);
  const [editando, setEditando] = useState(null);
  const [eliminandoCategoriaId, setEliminandoCategoriaId] = useState(null);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isValid, isSubmitting },
  } = useForm({
    resolver: yupResolver(categorySchema),
    mode: "onChange",
    defaultValues: valoresVacios,
  });

  useEffect(() => {
    const cargar = async () => {
      try {
        await pedirCategorias(dispatch);
      } catch (error) {
        toast.error("No se pudieron cargar las categorías");
      } finally {
        setCargado(true);
      }
    };
    cargar();
  }, [dispatch]);

  // Al elegir una categoría para editar, se cargan sus datos en el formulario
  useEffect(() => {
    reset(
      editando
        ? { name: editando.name, description: editando.description || "" }
        : valoresVacios,
    );
  }, [editando, reset]);

  const onSubmit = async (data) => {
    const headers = { Authorization: localStorage.getItem("token") };

    try {
      if (editando) {
        const respuesta = await axiosConfig.put(
          `/categories/${editando._id}`,
          { name: data.name.trim(), description: data.description.trim() },
          { headers },
        );
        dispatch(actualizarCategoria(respuesta.data));
        toast.success("Categoría actualizada");
      } else {
        // El backend rechaza una descripción vacía al crear
        const body = { name: data.name.trim() };
        if (data.description.trim()) body.description = data.description.trim();
        const respuesta = await axiosConfig.post("/categories", body, {
          headers,
        });
        dispatch(agregarCategoria(respuesta.data.data));
        toast.success("Categoría creada");
      }
      setEditando(null);
      reset(valoresVacios);
    } catch (error) {
      toast.error(mensajeDeError(error));
    }
  };
  const borrarCategoria = async (categoria) => {
    if (!window.confirm(`¿Eliminar la categoría "${categoria.name}"?`)) return;

    setEliminandoCategoriaId(categoria._id);
    try {
      const token = localStorage.getItem("token");
      await axiosConfig.delete(`/categories/${categoria._id}`, {
        headers: { Authorization: token },
      });
      dispatch(eliminarCategoria(categoria._id));

      toast.success("Categoría eliminada");
      if (editando?._id === categoria._id) setEditando(null);
    } catch (error) {
      // 409: la categoría tiene obras asociadas
      toast.error(mensajeDeError(error));
    } finally {
      setEliminandoCategoriaId(null);
    }
  };

  if (!cargado) return <p>Cargando ...</p>;

  return (
    <div className="categorias-page">
      <h1 className="categorias-title">Categorías</h1>

      <div className="categorias-card">
        <h2 className="categorias-subtitle">
          {editando ? `Editando "${editando.name}"` : "Nueva categoría"}
        </h2>

        <div className="categorias-group">
          <label className="categorias-label">Nombre:</label>
          <Controller
            control={control}
            name="name"
            render={({ field }) => (
              <input
                {...field}
                type="text"
                placeholder="Ej: Electricidad"
                className={`categorias-input ${errors.name ? "categorias-input-error" : ""}`}
              />
            )}
          />
          {errors.name && (
            <p className="categorias-error">{errors.name.message}</p>
          )}
        </div>

        <div className="categorias-group">
          <label className="categorias-label">Descripción:</label>
          <Controller
            control={control}
            name="description"
            render={({ field }) => (
              <input
                {...field}
                type="text"
                placeholder="Descripción (opcional)"
                className={`categorias-input ${errors.description ? "categorias-input-error" : ""}`}
              />
            )}
          />
          {errors.description && (
            <p className="categorias-error">{errors.description.message}</p>
          )}
        </div>

        <div className="categorias-acciones">
          {editando && (
            <button
              type="button"
              className="categorias-boton-secundario"
              onClick={() => setEditando(null)}
            >
              Cancelar
            </button>
          )}
          <button
            type="button"
            className="categorias-boton"
            onClick={handleSubmit(onSubmit)}
            disabled={!isValid || isSubmitting}
          >
            {editando ? "Guardar cambios" : "Crear categoría"}
          </button>
        </div>
      </div>

      <ul className="categorias-lista">
        {categorias.length === 0 && (
          <li className="categorias-vacio">No hay categorías.</li>
        )}
        {categorias.map((categoria) => (
          <li key={categoria._id} className="categorias-item">
            <div>
              <strong>{categoria.name}</strong>
              {categoria.description && (
                <p className="categorias-descripcion">
                  {categoria.description}
                </p>
              )}
            </div>
            <div className="categorias-item-acciones">
              <button
                type="button"
                className="categorias-boton-secundario"
                onClick={() => setEditando(categoria)}
              >
                Editar
              </button>
              <button
                type="button"
                className="categorias-boton-eliminar"
                onClick={() => borrarCategoria(categoria)}
                disabled={eliminandoCategoriaId !== null}
              >
                {eliminandoCategoriaId === categoria._id
                  ? "Eliminando..."
                  : "Eliminar"}
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Categorias;
