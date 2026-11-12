import * as Yup from "yup";

const workSchema = Yup.object().shape({
  clientName: Yup.string()
    .trim()
    .min(3, "Debe tener al menos 3 caracteres")
    .max(50, "Máximo 50 caracteres")
    .required("El nombre del cliente es obligatorio"),
  description: Yup.string().max(500, "Máximo 500 caracteres"),
  status: Yup.string()
    .oneOf(["pendiente", "en_progreso", "completada"], "Seleccioná un estado")
    .required("El estado es obligatorio"),
  categoryId: Yup.string().required("Seleccioná una categoría"),
  startDate: Yup.string().required("La fecha de inicio es obligatoria"),
  endDate: Yup.string()
    .test(
      "fin-despues-de-inicio",
      "La fecha de fin no puede ser anterior a la de inicio",
      function (value) {
        const { startDate } = this.parent;
        if (!value || !startDate) return true;
        return value >= startDate; // "YYYY-MM-DD" se compara bien como texto
      },
    )
    .required("La fecha de fin es obligatoria"),
});

export const createWorkSchema = workSchema.shape({
  enteredAddress: Yup.string()
    .trim()
    .min(5, "Debe tener al menos 5 caracteres")
    .max(100, "Máximo 100 caracteres")
    .required("La dirección es obligatoria"),
});

export default workSchema;
