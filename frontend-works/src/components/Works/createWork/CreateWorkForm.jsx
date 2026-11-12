import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useNavigate } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import { createWorkSchema } from "../../validations/workSchema";
import { axiosConfig } from "../../../utils/axiosConfig";

import { guardarCategorias } from "../../../store/slices/categoriesSlice";
import "./CreateWorkForm.css";

const CreateWorkForm = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const categories = useSelector((state) => state.categories.lista);
  const [categoriasCargadas, setCategoriasCargadas] = useState(false);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isValid, isSubmitting },
  } = useForm({
    resolver: yupResolver(createWorkSchema),
    mode: "onChange",
    defaultValues: {
      categoryId: "",
      clientName: "",
      enteredAddress: "",
      description: "",
      status: "pendiente",
      startDate: "",
      endDate: "",
    },
  });

  // Si entran directo a esta pantalla (o recargan con F5) las categorías no están cargadas
  useEffect(() => {
    const cargarCategorias = async () => {
      try {
        const token = localStorage.getItem("token");
        const respuesta = await axiosConfig.get("/categories", {
          headers: { Authorization: token },
        });
        dispatch(guardarCategorias(respuesta.data));
      } catch (error) {
        toast.error("No se pudieron cargar las categorías");
      } finally {
        setCategoriasCargadas(true);
      }
    };
    cargarCategorias();
  }, [dispatch]);

  const onSubmit = async (data) => {
    // El backend rechaza strings vacíos en fechas y descripción,
    // por eso solo se envía lo que tiene valor
    const body = {
      categoryId: data.categoryId,
      clientName: data.clientName.trim(),
      enteredAddress: data.enteredAddress.trim(),
    };
    if (data.description.trim()) body.description = data.description.trim();
    if (data.startDate) body.startDate = data.startDate;
    if (data.endDate) body.endDate = data.endDate;

    try {
      const token = localStorage.getItem("token");
      await axiosConfig.post("/works", body, {
        headers: { Authorization: token },
      });
      toast.success("Obra creada correctamente");
      reset();
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

  if (!categoriasCargadas) return <p>Cargando ...</p>;

  return (
    <div className="create-work-page">
      <div className="create-work-card">
        <h1 className="create-work-title">Registro de obra</h1>
        <p className="create-work-subtitle">
          Completá los datos para agregar una nueva obra
        </p>

        <div className="create-work-group">
          <label className="create-work-label">Categoría:</label>
          <Controller
            control={control}
            name="categoryId"
            render={({ field }) => (
              <select
                {...field}
                className={`create-work-input ${errors.categoryId ? "create-work-input-error" : ""}`}
              >
                <option value="">Seleccioná una categoría</option>
                {categories.map((categoria) => (
                  <option key={categoria._id} value={categoria._id}>
                    {categoria.name}
                  </option>
                ))}
              </select>
            )}
          />
          {errors.categoryId && (
            <p className="create-work-error">{errors.categoryId.message}</p>
          )}
        </div>

        <div className="create-work-group">
          <label className="create-work-label">Nombre del cliente:</label>
          <Controller
            control={control}
            name="clientName"
            render={({ field }) => (
              <input
                {...field}
                type="text"
                placeholder="Ingrese el nombre del cliente"
                className={`create-work-input ${errors.clientName ? "create-work-input-error" : ""}`}
              />
            )}
          />
          {errors.clientName && (
            <p className="create-work-error">{errors.clientName.message}</p>
          )}
        </div>

        <div className="create-work-group">
          <label className="create-work-label">Dirección:</label>
          <Controller
            control={control}
            name="enteredAddress"
            render={({ field }) => (
              <input
                {...field}
                type="text"
                placeholder="Ingrese la dirección"
                className={`create-work-input ${errors.enteredAddress ? "create-work-input-error" : ""}`}
              />
            )}
          />
          {errors.enteredAddress && (
            <p className="create-work-error">{errors.enteredAddress.message}</p>
          )}
        </div>

        <div className="create-work-group">
          <label className="create-work-label">Descripción:</label>
          <Controller
            control={control}
            name="description"
            render={({ field }) => (
              <input
                {...field}
                type="text"
                placeholder="Ingrese la descripción"
                className={`create-work-input ${errors.description ? "create-work-input-error" : ""}`}
              />
            )}
          />
          {errors.description && (
            <p className="create-work-error">{errors.description.message}</p>
          )}
        </div>

        <div className="create-work-row">
          <div className="create-work-group">
            <label className="create-work-label">Fecha de inicio:</label>
            <Controller
              control={control}
              name="startDate"
              render={({ field }) => (
                <input
                  {...field}
                  type="date"
                  className={`create-work-input ${errors.startDate ? "create-work-input-error" : ""}`}
                />
              )}
            />
            {errors.startDate && (
              <p className="create-work-error">{errors.startDate.message}</p>
            )}
          </div>

          <div className="create-work-group">
            <label className="create-work-label">Fecha de fin:</label>
            <Controller
              control={control}
              name="endDate"
              render={({ field }) => (
                <input
                  {...field}
                  type="date"
                  className={`create-work-input ${errors.endDate ? "create-work-input-error" : ""}`}
                />
              )}
            />
            {errors.endDate && (
              <p className="create-work-error">{errors.endDate.message}</p>
            )}
          </div>
        </div>

        <button
          type="button"
          className="create-work-button"
          onClick={handleSubmit(onSubmit)}
          disabled={!isValid || isSubmitting}
        >
          Crear obra
        </button>
      </div>
    </div>
  );
};

export default CreateWorkForm;
