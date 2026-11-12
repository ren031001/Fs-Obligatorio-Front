import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { NavLink, useNavigate } from "react-router";
import signupSchema from "../validations/signupSchema";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { axiosConfig } from "../../utils/axiosConfig";
import toast from "react-hot-toast";

import "./Signup.css";

const Signup = () => {
  const navigate = useNavigate();
  const [error, setError] = useState("");

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isValid, isSubmitting },
  } = useForm({
    resolver: yupResolver(signupSchema),
    mode: "onChange",
    defaultValues: {
      name: "",
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
      terms: false,
    },
  });

  const [showPassword, setShowPassword] = useState(false);

  const onSubmit = async ({ confirmPassword, terms, ...data }) => {
    try {
      setError("");
      const response = await axiosConfig.post("/auth/signup", data);
      console.log(response);

      if (response.data?.token) {
        localStorage.setItem("token", response.data.token);
        toast.success("Bienvenido");
        await navigate("/Works");
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
    <div className="signup-page">
      <div className="signup-card">
        <h1 className="signup-title">Registro de usuario</h1>
        <p className="signup-subtitle">
          Creá tu cuenta para gestionar tus obras
        </p>

        <div className="signup-group">
          <label className="signup-label">Nombre:</label>
          <Controller
            control={control}
            name="name"
            render={({ field }) => (
              <input
                {...field}
                type="text"
                placeholder="Nombre completo"
                className={`signup-input ${errors.name ? "signup-input-error" : ""}`}
              />
            )}
          />
          {errors.name && <p className="signup-error">{errors.name.message}</p>}
        </div>

        <div className="signup-group">
          <label className="signup-label">Usuario:</label>
          <Controller
            control={control}
            name="username"
            render={({ field }) => (
              <input
                {...field}
                type="text"
                placeholder="Nombre de usuario"
                className={`signup-input ${errors.username ? "signup-input-error" : ""}`}
              />
            )}
          />
          {errors.username && (
            <p className="signup-error">{errors.username.message}</p>
          )}
        </div>

        <div className="signup-group">
          <label className="signup-label">Email:</label>
          <Controller
            control={control}
            name="email"
            render={({ field }) => (
              <input
                {...field}
                type="email"
                placeholder="Escriba su email"
                className={`signup-input ${errors.email ? "signup-input-error" : ""}`}
              />
            )}
          />
          {errors.email && (
            <p className="signup-error">{errors.email.message}</p>
          )}
        </div>

        <div className="signup-group">
          <label className="signup-label">Contraseña:</label>
          <div className="signup-password-wrapper">
            <Controller
              control={control}
              name="password"
              render={({ field }) => (
                <input
                  {...field}
                  type={showPassword ? "text" : "password"}
                  placeholder="Escriba su contraseña"
                  className={`signup-input signup-input-password ${errors.password ? "signup-input-error" : ""}`}
                />
              )}
            />
            <button
              type="button"
              className="signup-eye-button"
              aria-label={
                showPassword ? "Ocultar contraseña" : "Mostrar contraseña"
              }
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>
          {errors.password && (
            <p className="signup-error">{errors.password.message}</p>
          )}
        </div>

        <div className="signup-group">
          <label className="signup-label">Confirmar contraseña:</label>
          <Controller
            control={control}
            name="confirmPassword"
            render={({ field }) => (
              <input
                {...field}
                type="password"
                placeholder="Confirmá tu contraseña"
                className={`signup-input ${errors.confirmPassword ? "signup-input-error" : ""}`}
              />
            )}
          />
          {errors.confirmPassword && (
            <p className="signup-error">{errors.confirmPassword.message}</p>
          )}
        </div>

        <div className="signup-group">
          <div className="signup-terms">
            <Controller
              control={control}
              name="terms"
              render={({ field: { value, onChange } }) => (
                <input
                  id="terms"
                  type="checkbox"
                  checked={value}
                  onChange={(e) => onChange(e.target.checked)}
                />
              )}
            />
            <label htmlFor="terms" className="signup-terms-label">
              Acepto los términos y condiciones
            </label>
          </div>
          {errors.terms && (
            <p className="signup-error">{errors.terms.message}</p>
          )}
        </div>

        {error && <div className="signup-error">{error}</div>}

        <button
          type="button"
          className="signup-button"
          onClick={handleSubmit(onSubmit)}
          disabled={!isValid || isSubmitting}
        >
          Registrarme
        </button>

        <p className="signup-footer">
          ¿Ya tenés cuenta? <NavLink to="/">Iniciá sesión</NavLink>
        </p>
      </div>
    </div>
  );
};

export default Signup;
