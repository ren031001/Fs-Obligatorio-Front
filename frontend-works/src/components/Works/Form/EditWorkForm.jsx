import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useSelector } from "react-redux";
import workSchema from "./validations/workSchema";
import { STATES } from "../../../utils/workStates";

const EditWorkForm = ({ obra, onSave, onUploadImage, onCancel }) => {
  const categories = useSelector((state) => state.categories.lista);
  const [archivo, setArchivo] = useState(null);
  const [errorImagen, setErrorImagen] = useState("");
  const [subiendo, setSubiendo] = useState(false);

  const {
    control,
    handleSubmit,
    trigger,
    formState: { errors, isValid, isDirty, isSubmitting },
  } = useForm({
    resolver: yupResolver(workSchema),
    mode: "onChange",
    // El Modal desmonta este formulario al cerrarse, así que cada vez que
    // se abre arranca de nuevo con los datos de la obra (no hace falta reset)
    defaultValues: {
      clientName: obra.clientName,
      description: obra.description || "",
      status: obra.status,
      categoryId: obra.categoryId,
      startDate: obra.startDate ? obra.startDate.slice(0, 10) : "",
      endDate: obra.endDate ? obra.endDate.slice(0, 10) : "",
    },
  });

  const onSubmit = async (data) => {
    const cambios = {
      clientName: data.clientName.trim(),
      description: data.description.trim(),
      status: data.status,
      categoryId: data.categoryId,
    };
    if (data.startDate) cambios.startDate = data.startDate;
    if (data.endDate) cambios.endDate = data.endDate;
    await onSave(cambios);
  };

  const elegirArchivo = (e) => {
    const elegido = e.target.files[0];
    setErrorImagen("");
    setArchivo(null);

    if (!elegido) return;

    if (!elegido.type.startsWith("image/")) {
      setErrorImagen("El archivo debe ser una imagen");
      e.target.value = "";
      return;
    }
    if (elegido.size > 5 * 1024 * 1024) {
      setErrorImagen("La imagen no puede superar los 5MB");
      e.target.value = "";
      return;
    }
    setArchivo(elegido);
  };

  const subirImagen = async () => {
    setSubiendo(true);
    try {
      const subida = await onUploadImage(archivo);
      if (subida) setArchivo(null);
    } finally {
      setSubiendo(false);
    }
  };

  const imagenes = obra.images || [];

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <h2 className="editar-obra-title">Editar obra</h2>
      <p className="editar-obra-direccion">
        <strong>Dirección:</strong> {obra.officialAddress}
        <span> (no se puede modificar)</span>
      </p>

      <div className="editar-obra-group">
        <label className="editar-obra-label">Cliente:</label>
        <Controller
          control={control}
          name="clientName"
          render={({ field }) => (
            <input
              {...field}
              type="text"
              className={`editar-obra-input ${errors.clientName ? "editar-obra-input-error" : ""}`}
            />
          )}
        />
        {errors.clientName && (
          <p className="editar-obra-error">{errors.clientName.message}</p>
        )}
      </div>

      <div className="editar-obra-group">
        <label className="editar-obra-label">Descripción:</label>
        <Controller
          control={control}
          name="description"
          render={({ field }) => (
            <textarea
              {...field}
              rows={3}
              className={`editar-obra-input ${errors.description ? "editar-obra-input-error" : ""}`}
            />
          )}
        />
        {errors.description && (
          <p className="editar-obra-error">{errors.description.message}</p>
        )}
      </div>

      <div className="editar-obra-fila">
        <div className="editar-obra-group">
          <label className="editar-obra-label">Estado:</label>
          <Controller
            control={control}
            name="status"
            render={({ field }) => (
              <select {...field} className="editar-obra-input">
                {STATES.map((estado) => (
                  <option key={estado.value} value={estado.value}>
                    {estado.label}
                  </option>
                ))}
              </select>
            )}
          />
        </div>

        <div className="editar-obra-group">
          <label className="editar-obra-label">Categoría:</label>
          <Controller
            control={control}
            name="categoryId"
            render={({ field }) => (
              <select
                {...field}
                className={`editar-obra-input ${errors.categoryId ? "editar-obra-input-error" : ""}`}
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
            <p className="editar-obra-error">{errors.categoryId.message}</p>
          )}
        </div>
      </div>

      <div className="editar-obra-fila">
        <div className="editar-obra-group">
          <label className="editar-obra-label">Fecha de inicio:</label>
          <Controller
            control={control}
            name="startDate"
            render={({ field }) => (
              <input
                {...field}
                type="date"
                className="editar-obra-input"
                onChange={(e) => {
                  field.onChange(e);
                  trigger("endDate");
                }}
              />
            )}
          />
        </div>

        <div className="editar-obra-group">
          <label className="editar-obra-label">Fecha de fin:</label>
          <Controller
            control={control}
            name="endDate"
            render={({ field }) => (
              <input
                {...field}
                type="date"
                className={`editar-obra-input ${errors.endDate ? "editar-obra-input-error" : ""}`}
              />
            )}
          />
          {errors.endDate && (
            <p className="editar-obra-error">{errors.endDate.message}</p>
          )}
        </div>
      </div>

      <div className="editar-obra-group">
        <label className="editar-obra-label">Imágenes:</label>

        {imagenes.length > 0 ? (
          <div className="editar-obra-imagenes">
            {imagenes.map((url) => (
              <a key={url} href={url} target="_blank" rel="noreferrer">
                <img src={url} alt="Imagen de la obra" />
              </a>
            ))}
          </div>
        ) : (
          <p className="editar-obra-direccion">Esta obra no tiene imágenes.</p>
        )}

        <div className="editar-obra-subida">
          <input
            key={imagenes.length}
            type="file"
            accept="image/*"
            className="editar-obra-input"
            onChange={elegirArchivo}
          />
          <button
            type="button"
            className="editar-obra-cancelar"
            onClick={subirImagen}
            disabled={!archivo || subiendo}
          >
            {subiendo ? "Subiendo..." : "Subir"}
          </button>
        </div>

        {errorImagen && <p className="editar-obra-error">{errorImagen}</p>}
      </div>

      <div className="editar-obra-acciones">
        <button
          type="button"
          className="editar-obra-cancelar"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="editar-obra-guardar"
          disabled={!isValid || !isDirty || isSubmitting}
        >
          {isSubmitting ? "Guardando..." : "Guardar cambios"}
        </button>
      </div>
    </form>
  );
};

export default EditWorkForm;
