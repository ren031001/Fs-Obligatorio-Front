import * as Yup from "yup";

const categorySchema = Yup.object().shape({
  name: Yup.string()
    .trim()
    .min(3, "Debe tener al menos 3 caracteres")
    .max(50, "Máximo 50 caracteres")
    .required("El nombre es obligatorio"),
  description: Yup.string().max(200, "Máximo 200 caracteres"),
});

export default categorySchema;
