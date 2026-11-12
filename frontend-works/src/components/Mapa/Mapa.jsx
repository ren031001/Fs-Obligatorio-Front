import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import toast from "react-hot-toast";
import "leaflet/dist/leaflet.css";
import { axiosConfig } from "../../utils/axiosConfig";
import { STATES } from "../../utils/workStates";
import { iconoPorDefecto } from "./iconoMarcador";
import VolarA from "./VolarA";
import "./Mapa.css";

const CENTRO_INICIAL = [-34.9011, -56.1645]; // Montevideo

const Mapa = () => {
  const [obras, setObras] = useState([]);
  const [cargado, setCargado] = useState(false);
  const [destino, setDestino] = useState(null);

  useEffect(() => {
    const cargarObras = async () => {
      try {
        const token = localStorage.getItem("token");
        const respuesta = await axiosConfig.get("/works", {
          params: { page: 1, limit: 1000 },
          headers: { Authorization: token },
        });
        setObras(respuesta.data.data);
      } catch (error) {
        toast.error("No se pudieron cargar las obras");
      } finally {
        setCargado(true);
      }
    };
    cargarObras();
  }, []);

  if (!cargado) return <p className="mapa-mensaje">Cargando ...</p>;

  // MongoDB guarda [longitud, latitud]; Leaflet usa [latitud, longitud]
  const obrasConUbicacion = obras
    .filter((obra) => obra.location?.coordinates?.length === 2)
    .map((obra) => ({
      ...obra,
      posicion: [obra.location.coordinates[1], obra.location.coordinates[0]],
    }));

  const etiquetaEstado = (status) =>
    STATES.find((e) => e.value === status)?.label || status;

  return (
    <div className="mapa-pagina">
      <h1 className="mapa-titulo">Mapa de obras</h1>

      {obrasConUbicacion.length === 0 && (
        <p className="mapa-mensaje">
          Todavía no tenés obras con ubicación para mostrar.
        </p>
      )}

      <div className="mapa-lista">
        {obrasConUbicacion.map((obra) => (
          <button
            key={obra._id}
            type="button"
            className="mapa-boton"
            onClick={() => setDestino([...obra.posicion])}
          >
            {obra.clientName}
          </button>
        ))}
      </div>

      <MapContainer
        center={CENTRO_INICIAL}
        zoom={11}
        bounds={
          obrasConUbicacion.length > 0
            ? obrasConUbicacion.map((obra) => obra.posicion)
            : undefined
        }
        boundsOptions={{ padding: [40, 40], maxZoom: 15 }}
        className="mapa-contenedor"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {obrasConUbicacion.map((obra) => (
          <Marker
            key={obra._id}
            position={obra.posicion}
            icon={iconoPorDefecto}
          >
            <Popup>
              <strong>{obra.clientName}</strong>
              <br />
              {etiquetaEstado(obra.status)}
              <br />
              <small>{obra.officialAddress}</small>
              {obra.images?.[0] && (
                <img
                  className="mapa-popup-imagen"
                  src={obra.images[0]}
                  alt={`Obra de ${obra.clientName}`}
                />
              )}
            </Popup>
          </Marker>
        ))}

        <VolarA destino={destino} />
      </MapContainer>
    </div>
  );
};

export default Mapa;
