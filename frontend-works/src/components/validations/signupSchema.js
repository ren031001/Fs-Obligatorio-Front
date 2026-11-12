import * as Yup from "yup";

const signupSchema = Yup.object().shape({
  name: Yup.string().min(3).max(20).required("Ingresar nombre"),

  username: Yup.string().min(3).max(20).required("Ingresar usuario"),

  email: Yup.string()
    .min(3)
    .max(40)
    .email("Email inválido")
    .required("Ingresar email"),

  password: Yup.string()
    .min(3)
    .max(20)
    .matches(/^[a-zA-Z0-9]+$/, "Solo se permiten letras y números")
    .required("Ingresar contraseña"),

  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password")], "Las contrasena deben coincidir")
    .required("Confirmar contrasena es un campo requerido"),
  terms: Yup.bool().oneOf([true], "Debes aceptar los terminos y condiciones"),
});

export default signupSchema;
