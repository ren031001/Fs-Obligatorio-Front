import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { NavLink, useNavigate } from "react-router";
import toast from "react-hot-toast";
import loginSchema from "../validations/loginSchema";
import { axiosConfig } from "../../utils/axiosConfig";
import "./Login.css";
import { useEffect } from "react";

const Login = () => {
  const navigate = useNavigate();
  const [error, setError] = useState("");

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isValid, isSubmitting },
  } = useForm({
    resolver: yupResolver(loginSchema),
    mode: "onChange",
    defaultValues: {
      username: "",
      password: "",
    },
  });
  useEffect(() => {
    if (sessionStorage.getItem("sesionVencida")) {
      sessionStorage.removeItem("sesionVencida");
      toast.error("Tu sesión venció, volvé a iniciar sesión");
    }
  }, []);

  const onSubmit = async (data) => {
    try {
      setError("");
      const response = await axiosConfig.post("/auth/login", data);

      if (response.data?.token) {
        localStorage.setItem("token", response.data.token);
        toast.success("Bienvenido");
        await navigate("/works");
      }
    } catch (error) {
      console.log(error.response);
      const mensaje =
        error.response?.data?.message ||
        error.response?.data?.error ||
        (error.response
          ? "Usuario o contraseña incorrectos"
          : "No se pudo conectar con el servidor");

      setError(mensaje);

      reset();
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <h1 className="login-title">Iniciar sesión</h1>
        <p className="login-subtitle">Accedé a tu control de obras</p>

        <div className="login-group">
          <label className="login-label">Usuario:</label>
          <Controller
            control={control}
            name="username"
            render={({ field }) => (
              <input
                {...field}
                type="text"
                placeholder="Ingresar usuario"
                className={`login-input ${errors.username ? "login-input-error" : ""}`}
              />
            )}
          />
          {errors.username && (
            <p className="login-error">{errors.username.message}</p>
          )}
        </div>

        <div className="login-group">
          <label className="login-label">Contraseña:</label>
          <Controller
            control={control}
            name="password"
            render={({ field }) => (
              <input
                {...field}
                type="password"
                placeholder="Ingresar contraseña"
                className={`login-input ${errors.password ? "login-input-error" : ""}`}
              />
            )}
          />
          {errors.password && (
            <p className="login-error">{errors.password.message}</p>
          )}
        </div>

        {error && <div className="login-error">{error}</div>}

        <button
          type="button"
          className="login-button"
          onClick={handleSubmit(onSubmit)}
          disabled={!isValid || isSubmitting}
        >
          Iniciar sesión
        </button>

        <p className="login-footer">
          ¿No tenés cuenta?<NavLink to="/Signup">Registrate</NavLink>
        </p>
      </div>
    </div>
  );
};

export default Login;
