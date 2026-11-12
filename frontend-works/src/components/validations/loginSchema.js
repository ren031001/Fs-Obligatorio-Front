import * as Yup from "yup";

const loginSchema = Yup.object().shape({
  username: Yup.string().min(3).max(20).required("Ingresar usuario"),
  password: Yup.string()
    .min(3)
    .max(20)
    .matches(/^[a-zA-Z0-9]+$/, "Solo se permiten letras y números")
    .required("Ingresar contraseña"),
});

export default loginSchema;
