import { useEffect, useState } from "react";
import Modal from "react-modal";
import toast from "react-hot-toast";
import { axiosConfig } from "../../utils/axiosConfig";
import "./EditWorkModal.css";
import "./InvoiceModal.css";

Modal.setAppElement("#root");

const InvoiceModal = ({ obra, onClose, onSaved }) => {
  const [archivo, setArchivo] = useState(null);
  const [items, setItems] = useState([]);
  const [errorArchivo, setErrorArchivo] = useState("");
  const [errorItems, setErrorItems] = useState("");
  const [analizando, setAnalizando] = useState(false);
  const [guardando, setGuardando] = useState(false);

  // Cada vez que se abre con otra obra, se limpia todo
  useEffect(() => {
    setArchivo(null);
    setItems([]);
    setErrorArchivo("");
    setErrorItems("");
  }, [obra]);

  const mensajeDeError = (error) => {
    const errorData = error.response?.data;
    return errorData?.details?.length
      ? errorData.details.join(". ")
      : errorData?.message ||
          errorData?.error ||
          "No se pudo conectar con el servidor";
  };

  const elegirArchivo = (e) => {
    const elegido = e.target.files[0];
    setErrorArchivo("");
    setArchivo(null);

    if (!elegido) return;

    if (!elegido.type.startsWith("image/")) {
      setErrorArchivo("El archivo debe ser una imagen");
      e.target.value = "";
      return;
    }
    if (elegido.size > 5 * 1024 * 1024) {
      setErrorArchivo("La imagen no puede superar los 5MB");
      e.target.value = "";
      return;
    }
    setArchivo(elegido);
  };

  const analizarFactura = async () => {
    setAnalizando(true);
    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();
      formData.append("image", archivo);

      const respuesta = await axiosConfig.post(
        `/works/${obra._id}/extract-invoice-items`,
        formData,
        {
          headers: {
            Authorization: token,
            "Content-Type": "multipart/form-data",
          },

          timeout: 45000, // la IA puede tardar más que el resto de las peticiones
        },
      );

      const extraidos = respuesta.data.data.items;
      setItems(extraidos.map((i) => ({ name: i.name, amount: i.amount })));
      toast(respuesta.data.message); // "Artículos extraídos..." o "cargalos manualmente"
    } catch (error) {
      console.error(
        "Error al analizar factura:",
        error.response?.data ?? error,
      );
      toast.error(mensajeDeError(error));
    } finally {
      setAnalizando(false);
    }
  };

  const cambiarItem = (indice, campo, valor) => {
    setItems((prev) =>
      prev.map((item, i) =>
        i === indice ? { ...item, [campo]: valor } : item,
      ),
    );
  };

  const agregarItem = () => {
    setItems((prev) => [...prev, { name: "", amount: "" }]);
  };

  const quitarItem = (indice) => {
    setItems((prev) => prev.filter((_, i) => i !== indice));
  };

  const confirmar = async () => {
    if (items.length === 0) {
      setErrorItems("Agregá al menos un artículo");
      return;
    }
    const hayInvalido = items.some(
      (item) =>
        !String(item.name).trim() ||
        item.amount === "" ||
        Number.isNaN(Number(item.amount)) ||
        Number(item.amount) < 0,
    );
    if (hayInvalido) {
      setErrorItems("Cada artículo necesita un nombre y un monto de 0 o más");
      return;
    }
    setErrorItems("");

    setGuardando(true);
    try {
      const token = localStorage.getItem("token");
      await axiosConfig.post(
        `/works/${obra._id}/confirm-invoice-items`,
        {
          items: items.map((item) => ({
            name: String(item.name).trim(),
            amount: Number(item.amount),
          })),
        },
        { headers: { Authorization: token } },
      );
      toast.success("Factura guardada");
      onSaved();
    } catch (error) {
      toast.error(mensajeDeError(error));
    } finally {
      setGuardando(false);
    }
  };

  const yaGuardados = obra?.invoiceItems || [];
  const totalGuardado = yaGuardados.reduce(
    (total, item) => total + (item.amount || 0),
    0,
  );

  return (
    <Modal
      isOpen={!!obra}
      onRequestClose={onClose}
      contentLabel="Factura de la obra"
      className="editar-obra-modal"
      overlayClassName="editar-obra-overlay"
    >
      <h2 className="editar-obra-title">Factura de {obra?.clientName}</h2>
      <p className="editar-obra-direccion">
        Subí una foto de la factura: la IA propone los artículos y vos los
        revisás antes de guardar.
      </p>

      {yaGuardados.length > 0 && (
        <div className="factura-guardados">
          <strong>Ya cargados</strong>
          <ul>
            {yaGuardados.map((item, i) => (
              <li key={item._id || i}>
                {item.name} — $ {item.amount}
              </li>
            ))}
          </ul>
          <p className="factura-total">Total: $ {totalGuardado}</p>
        </div>
      )}

      <div className="editar-obra-group">
        <label className="editar-obra-label">Foto de la factura:</label>
        <div className="editar-obra-subida">
          <input
            type="file"
            accept="image/*"
            className="editar-obra-input"
            onChange={elegirArchivo}
          />
          <button
            type="button"
            className="editar-obra-cancelar"
            onClick={analizarFactura}
            disabled={!archivo || analizando}
          >
            {analizando ? "Analizando..." : "Analizar con IA"}
          </button>
        </div>
        {errorArchivo && <p className="editar-obra-error">{errorArchivo}</p>}
      </div>

      <div className="editar-obra-group">
        <label className="editar-obra-label">Artículos a agregar:</label>

        {items.length === 0 && (
          <p className="editar-obra-direccion">
            Todavía no hay artículos. Analizá una factura o agregalos a mano.
          </p>
        )}

        {items.map((item, i) => (
          <div key={i} className="factura-fila">
            <input
              type="text"
              placeholder="Artículo"
              className="editar-obra-input"
              value={item.name}
              onChange={(e) => cambiarItem(i, "name", e.target.value)}
            />
            <input
              type="number"
              min="0"
              step="0.01"
              placeholder="Monto"
              className="editar-obra-input factura-monto"
              value={item.amount}
              onChange={(e) => cambiarItem(i, "amount", e.target.value)}
            />
            <button
              type="button"
              className="editar-obra-cancelar"
              onClick={() => quitarItem(i)}
            >
              ✕
            </button>
          </div>
        ))}

        <button
          type="button"
          className="editar-obra-cancelar"
          onClick={agregarItem}
        >
          + Agregar artículo
        </button>

        {errorItems && <p className="editar-obra-error">{errorItems}</p>}
      </div>

      <div className="editar-obra-acciones">
        <button
          type="button"
          className="editar-obra-cancelar"
          onClick={onClose}
        >
          Cerrar
        </button>
        <button
          type="button"
          className="editar-obra-guardar"
          onClick={confirmar}
          disabled={items.length === 0 || guardando}
        >
          {guardando ? "Guardando..." : "Confirmar y guardar"}
        </button>
      </div>
    </Modal>
  );
};

export default InvoiceModal;
