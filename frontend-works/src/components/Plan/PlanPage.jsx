import InformeUso from "./InformeUso";
import CambioPlan from "./CambioPlan";
import "./Plan.css";

const PlanPage = () => {
  return (
    <div className="plan-page">
      <h1 className="plan-pagina-titulo">Mi plan y uso</h1>
      <div className="plan-grilla">
        <InformeUso />
        <CambioPlan />
      </div>
    </div>
  );
};

export default PlanPage;
