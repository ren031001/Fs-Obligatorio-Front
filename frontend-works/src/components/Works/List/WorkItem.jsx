const formatDate = (date) => {
  if (!date) return "";

  return new Date(date).toLocaleDateString("es-UY", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "UTC",
  });
};
const WorkItem = ({
  obra,
  categoria,
  estado,
  onEditar,
  onFactura,
  onEliminar,
}) => {
  const totalFacturado = (obra.invoiceItems || []).reduce(
    (total, item) => total + (item.amount || 0),
    0,
  );

  return (
    <li className="obras-item">
      {obra.images?.[0] && (
        <img
          className="obras-imagen"
          src={obra.images[0]}
          alt={`Obra de ${obra.clientName}`}
        />
      )}

      <div className="obras-info">
        <div className="obras-info-superior">
          <h2 className="obras-cliente">{obra.clientName}</h2>
          <span className={`obras-estado obras-estado-${obra.status}`}>
            {estado}
          </span>
        </div>

        <p className="obras-detalle">
          <strong>Categoría:</strong> {categoria}
        </p>
        <p className="obras-detalle">
          <strong>Dirección:</strong> {obra.officialAddress}
        </p>
        <p className="obras-detalle">
          <strong>Inicio:</strong> {formatDate(obra.startDate)} ·{" "}
          <strong>Fin:</strong> {formatDate(obra.endDate)}
        </p>
        {obra.invoiceItems?.length > 0 && (
          <p className="obras-detalle">
            <strong>Facturado:</strong> $ {totalFacturado}
          </p>
        )}
        {obra.description && (
          <p className="obras-descripcion">{obra.description}</p>
        )}
      </div>

      <div className="obras-acciones">
        <button type="button" className="obras-boton-editar" onClick={onEditar}>
          Editar
        </button>
        <button
          type="button"
          className="obras-boton-editar"
          onClick={onFactura}
        >
          Factura IA
        </button>
        <button
          type="button"
          className="obras-boton-eliminar"
          onClick={onEliminar}
        >
          Eliminar
        </button>
      </div>
    </li>
  );
};

export default WorkItem;
